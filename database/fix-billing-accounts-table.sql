-- Correction de la table gcp_billing_accounts
-- À exécuter dans Supabase SQL Editor

-- Supprimer l'ancienne table si elle existe avec une mauvaise structure
DROP TABLE IF EXISTS gcp_billing_accounts CASCADE;

-- Recréer la table avec la bonne structure
CREATE TABLE gcp_billing_accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  billing_account_id TEXT NOT NULL,
  billing_account_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_open BOOLEAN DEFAULT true,
  currency TEXT DEFAULT 'EUR',
  projects_count INTEGER DEFAULT 0,
  monthly_cost DECIMAL(12,2) DEFAULT 0,
  monthly_carbon DECIMAL(10,3) DEFAULT 0,
  master_billing_account TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, billing_account_id)
);

-- Vérifier que la table est bien créée
SELECT 'Table gcp_billing_accounts créée avec succès! ✅' as status;

-- Lister les colonnes pour confirmation
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gcp_billing_accounts' 
ORDER BY ordinal_position;
