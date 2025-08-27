-- GCP OAuth Integration Schema for Supabase
-- This file contains the database schema for storing GCP OAuth connections and billing data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create gcp_connections table
CREATE TABLE IF NOT EXISTS public.gcp_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    connection_status VARCHAR(20) NOT NULL CHECK (connection_status IN ('connected', 'disconnected', 'error', 'expired')),
    account_info JSONB NOT NULL DEFAULT '{}',
    tokens_encrypted TEXT NOT NULL,
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure one connection per user
    CONSTRAINT unique_user_gcp_connection UNIQUE (user_id)
);

-- Create gcp_billing_data table
CREATE TABLE IF NOT EXISTS public.gcp_billing_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    billing_account_id VARCHAR(255) NOT NULL,
    cost DECIMAL(12,4) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    services JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Index for efficient querying
    CONSTRAINT unique_billing_record UNIQUE (user_id, project_id, billing_account_id, start_date, end_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gcp_connections_user_id ON public.gcp_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_gcp_connections_status ON public.gcp_connections(connection_status);
CREATE INDEX IF NOT EXISTS idx_gcp_connections_last_sync ON public.gcp_connections(last_sync);

CREATE INDEX IF NOT EXISTS idx_gcp_billing_data_user_id ON public.gcp_billing_data(user_id);
CREATE INDEX IF NOT EXISTS idx_gcp_billing_data_project_id ON public.gcp_billing_data(project_id);
CREATE INDEX IF NOT EXISTS idx_gcp_billing_data_billing_account ON public.gcp_billing_data(billing_account_id);
CREATE INDEX IF NOT EXISTS idx_gcp_billing_data_dates ON public.gcp_billing_data(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_gcp_billing_data_created_at ON public.gcp_billing_data(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for gcp_connections
DROP TRIGGER IF EXISTS update_gcp_connections_updated_at ON public.gcp_connections;
CREATE TRIGGER update_gcp_connections_updated_at
    BEFORE UPDATE ON public.gcp_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.gcp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcp_billing_data ENABLE ROW LEVEL SECURITY;

-- Policy for gcp_connections: users can only access their own connections
CREATE POLICY "Users can view their own GCP connections" ON public.gcp_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GCP connections" ON public.gcp_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GCP connections" ON public.gcp_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GCP connections" ON public.gcp_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Policy for gcp_billing_data: users can only access their own billing data
CREATE POLICY "Users can view their own GCP billing data" ON public.gcp_billing_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GCP billing data" ON public.gcp_billing_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GCP billing data" ON public.gcp_billing_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GCP billing data" ON public.gcp_billing_data
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.gcp_connections TO authenticated;
GRANT ALL ON public.gcp_billing_data TO authenticated;

-- Create a view for easier querying of connection status with account info
CREATE OR REPLACE VIEW public.gcp_connection_summary AS
SELECT 
    gc.id,
    gc.user_id,
    gc.connection_status,
    gc.account_info->>'email' as account_email,
    gc.account_info->>'name' as account_name,
    jsonb_array_length(COALESCE(gc.account_info->'projects', '[]'::jsonb)) as projects_count,
    jsonb_array_length(COALESCE(gc.account_info->'billingAccounts', '[]'::jsonb)) as billing_accounts_count,
    gc.last_sync,
    gc.created_at,
    gc.updated_at
FROM public.gcp_connections gc;

-- Grant access to the view
GRANT SELECT ON public.gcp_connection_summary TO authenticated;

-- Create a view for billing data summary
CREATE OR REPLACE VIEW public.gcp_billing_summary AS
SELECT 
    gbd.user_id,
    gbd.project_id,
    gbd.billing_account_id,
    SUM(gbd.cost) as total_cost,
    gbd.currency,
    MIN(gbd.start_date) as earliest_date,
    MAX(gbd.end_date) as latest_date,
    COUNT(*) as billing_records_count,
    jsonb_agg(DISTINCT jsonb_array_elements(gbd.services)) as all_services
FROM public.gcp_billing_data gbd
GROUP BY gbd.user_id, gbd.project_id, gbd.billing_account_id, gbd.currency;

-- Grant access to the billing summary view
GRANT SELECT ON public.gcp_billing_summary TO authenticated;

-- Create function to clean up old billing data (older than 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_gcp_billing_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.gcp_billing_data 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's GCP connection status
CREATE OR REPLACE FUNCTION public.get_user_gcp_status(user_uuid UUID)
RETURNS TABLE (
    is_connected BOOLEAN,
    connection_status TEXT,
    account_email TEXT,
    projects_count INTEGER,
    last_sync TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE WHEN gc.connection_status = 'connected' THEN TRUE ELSE FALSE END as is_connected,
        gc.connection_status::TEXT,
        (gc.account_info->>'email')::TEXT as account_email,
        jsonb_array_length(COALESCE(gc.account_info->'projects', '[]'::jsonb))::INTEGER as projects_count,
        gc.last_sync
    FROM public.gcp_connections gc
    WHERE gc.user_id = user_uuid;
    
    -- If no connection found, return default values
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'disconnected'::TEXT, NULL::TEXT, 0::INTEGER, NULL::TIMESTAMPTZ;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.gcp_connections IS 'Stores GCP OAuth connection information for users';
COMMENT ON TABLE public.gcp_billing_data IS 'Stores GCP billing and cost data fetched via OAuth';

COMMENT ON COLUMN public.gcp_connections.user_id IS 'Reference to the authenticated user';
COMMENT ON COLUMN public.gcp_connections.connection_status IS 'Current status of the GCP connection';
COMMENT ON COLUMN public.gcp_connections.account_info IS 'JSON containing GCP account details, projects, and billing accounts';
COMMENT ON COLUMN public.gcp_connections.tokens_encrypted IS 'Encrypted OAuth tokens for API access';
COMMENT ON COLUMN public.gcp_connections.last_sync IS 'Timestamp of last successful data synchronization';

COMMENT ON COLUMN public.gcp_billing_data.user_id IS 'Reference to the authenticated user';
COMMENT ON COLUMN public.gcp_billing_data.project_id IS 'GCP Project ID';
COMMENT ON COLUMN public.gcp_billing_data.billing_account_id IS 'GCP Billing Account ID';
COMMENT ON COLUMN public.gcp_billing_data.cost IS 'Cost amount in the specified currency';
COMMENT ON COLUMN public.gcp_billing_data.currency IS 'Currency code (e.g., USD, EUR)';
COMMENT ON COLUMN public.gcp_billing_data.services IS 'JSON array of service usage details';

-- Create a sample query for testing (commented out)
/*
-- Example queries to test the schema:

-- Check user's GCP connection status
SELECT * FROM public.get_user_gcp_status('your-user-uuid-here');

-- Get connection summary
SELECT * FROM public.gcp_connection_summary WHERE user_id = 'your-user-uuid-here';

-- Get billing summary
SELECT * FROM public.gcp_billing_summary WHERE user_id = 'your-user-uuid-here';

-- Clean up old billing data
SELECT public.cleanup_old_gcp_billing_data();
*/
