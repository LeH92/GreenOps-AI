-- =====================================================
-- SETUP COMPLET GCP - GreenOps AI
-- =====================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: gcp_connections
-- =====================================================
CREATE TABLE IF NOT EXISTS gcp_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  connection_status TEXT NOT NULL DEFAULT 'disconnected',
  account_info JSONB NOT NULL DEFAULT '{}',
  tokens_encrypted TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: gcp_projects
-- =====================================================
CREATE TABLE IF NOT EXISTS gcp_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_number TEXT,
  billing_account_id TEXT,
  billing_account_name TEXT,
  is_active BOOLEAN DEFAULT true,
  cost_estimate NUMERIC(10, 2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique par utilisateur et projet
  UNIQUE(user_id, project_id)
);

-- =====================================================
-- TABLE: gcp_billing_accounts
-- =====================================================
CREATE TABLE IF NOT EXISTS gcp_billing_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  billing_account_id TEXT NOT NULL,
  billing_account_name TEXT NOT NULL,
  is_open BOOLEAN DEFAULT true,
  currency_code TEXT DEFAULT 'USD',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique par utilisateur et compte de facturation
  UNIQUE(user_id, billing_account_id)
);

-- =====================================================
-- TABLE: gcp_billing_data
-- =====================================================
CREATE TABLE IF NOT EXISTS gcp_billing_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  billing_account_id TEXT,
  cost NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  services JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_gcp_connections_user_id ON gcp_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_gcp_projects_user_id ON gcp_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_gcp_projects_project_id ON gcp_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_gcp_billing_accounts_user_id ON gcp_billing_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_gcp_billing_data_user_id ON gcp_billing_data(user_id);
CREATE INDEX IF NOT EXISTS idx_gcp_billing_data_project_id ON gcp_billing_data(project_id);

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Insérer des données de test pour le développement
INSERT INTO gcp_connections (user_id, connection_status, account_info) 
VALUES 
  ('test@example.com', 'connected', '{"email": "test@example.com", "name": "Test User", "note": "Test data"}')
ON CONFLICT (user_id) DO NOTHING;

-- Insérer des projets de test
INSERT INTO gcp_projects (user_id, project_id, project_name, project_number, billing_account_id, billing_account_name, cost_estimate) 
VALUES 
  ('test@example.com', 'test-project-123', 'Projet Test GCP', '123456789', 'billing-account-123', 'Compte Facturation Principal', 125.50),
  ('test@example.com', 'demo-project-456', 'Projet Démo GCP', '987654321', 'billing-account-456', 'Compte Facturation Secondaire', 89.75)
ON CONFLICT (user_id, project_id) DO NOTHING;

-- Insérer des comptes de facturation de test
INSERT INTO gcp_billing_accounts (user_id, billing_account_id, billing_account_name, is_open, currency_code) 
VALUES 
  ('test@example.com', 'billing-account-123', 'Compte Facturation Principal', true, 'USD'),
  ('test@example.com', 'billing-account-456', 'Compte Facturation Secondaire', true, 'USD')
ON CONFLICT (user_id, billing_account_id) DO NOTHING;

-- =====================================================
-- VÉRIFICATION DES TABLES
-- =====================================================
SELECT 
  table_name, 
  table_type,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('gcp_connections', 'gcp_projects', 'gcp_billing_accounts', 'gcp_billing_data')
ORDER BY table_name;

-- =====================================================
-- VÉRIFICATION DES DONNÉES
-- =====================================================
SELECT 'gcp_connections' as table_name, count(*) as record_count FROM gcp_connections
UNION ALL
SELECT 'gcp_projects' as table_name, count(*) as record_count FROM gcp_projects
UNION ALL
SELECT 'gcp_billing_accounts' as table_name, count(*) as record_count FROM gcp_billing_accounts
UNION ALL
SELECT 'gcp_billing_data' as table_name, count(*) as record_count FROM gcp_billing_data;
