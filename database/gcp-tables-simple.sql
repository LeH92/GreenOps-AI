-- =====================================================
-- TABLES GCP ESSENTIELLES - Version Simplifiée
-- =====================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table pour les connexions GCP
CREATE TABLE IF NOT EXISTS gcp_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE, -- Email de l'utilisateur
  connection_status TEXT NOT NULL DEFAULT 'disconnected',
  account_info JSONB NOT NULL DEFAULT '{}',
  tokens_encrypted TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les données de facturation GCP
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

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_gcp_connections_user_id ON gcp_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_gcp_billing_data_user_id ON gcp_billing_data(user_id);
CREATE INDEX IF NOT EXISTS idx_gcp_billing_data_project_id ON gcp_billing_data(project_id);

-- RLS (Row Level Security) - Désactivé pour les tests
-- ALTER TABLE gcp_connections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gcp_billing_data ENABLE ROW LEVEL SECURITY;

-- Données de test
INSERT INTO gcp_connections (user_id, connection_status, account_info) 
VALUES 
  ('test@example.com', 'connected', '{"email": "test@example.com", "name": "Test User", "note": "Test data"}')
ON CONFLICT (user_id) DO NOTHING;

-- Vérifier que les tables sont créées
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('gcp_connections', 'gcp_billing_data')
ORDER BY table_name;
