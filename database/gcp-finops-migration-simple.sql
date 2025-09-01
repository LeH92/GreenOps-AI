-- Migration simple pour ajouter les colonnes manquantes
-- Sans politiques RLS pour éviter les erreurs de syntaxe

-- 1. Ajouter les colonnes manquantes dans gcp_projects
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS monthly_cost DECIMAL(12,2) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS cost_trend TEXT CHECK (cost_trend IN ('increasing', 'decreasing', 'stable')) DEFAULT 'stable';
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS cost_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS monthly_carbon DECIMAL(10,3) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS carbon_trend TEXT CHECK (carbon_trend IN ('increasing', 'decreasing', 'stable')) DEFAULT 'stable';
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS carbon_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS has_export_bigquery BOOLEAN DEFAULT false;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS has_carbon_export BOOLEAN DEFAULT false;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT false;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- 2. Ajouter les colonnes manquantes dans gcp_services_usage
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS monthly_cost DECIMAL(12,2) DEFAULT 0;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS cost_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS projects_count INTEGER DEFAULT 0;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS total_usage DECIMAL(15,3) DEFAULT 0;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS usage_unit TEXT;

-- 3. Ajouter les colonnes manquantes dans gcp_optimization_recommendations
ALTER TABLE gcp_optimization_recommendations ADD COLUMN IF NOT EXISTS effort TEXT CHECK (effort IN ('low', 'medium', 'high')) DEFAULT 'medium';
ALTER TABLE gcp_optimization_recommendations ADD COLUMN IF NOT EXISTS implementation TEXT NOT NULL DEFAULT 'À définir';

-- 4. Mettre à jour gcp_connections avec les nouveaux KPIs
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS total_monthly_cost DECIMAL(12,2) DEFAULT 0;
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS total_monthly_carbon DECIMAL(10,3) DEFAULT 0;
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS last_finops_sync TIMESTAMPTZ;
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS finops_sync_status TEXT DEFAULT 'pending';
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS projects_count INTEGER DEFAULT 0;
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS billing_accounts_count INTEGER DEFAULT 0;

-- 5. Créer les index pour optimiser les performances (s'ils n'existent pas déjà)
CREATE INDEX IF NOT EXISTS idx_gcp_projects_user_cost ON gcp_projects(user_id, monthly_cost DESC);
CREATE INDEX IF NOT EXISTS idx_gcp_projects_user_carbon ON gcp_projects(user_id, monthly_carbon DESC);
CREATE INDEX IF NOT EXISTS idx_gcp_services_usage_user_month ON gcp_services_usage(user_id, usage_month);
CREATE INDEX IF NOT EXISTS idx_gcp_services_usage_cost ON gcp_services_usage(user_id, monthly_cost DESC);

-- Message de confirmation
SELECT 'Migration des colonnes FinOps terminée avec succès!' as message;
