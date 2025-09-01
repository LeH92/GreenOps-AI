-- Ajouter les colonnes manquantes restantes
-- Basé sur les nouvelles erreurs détectées

-- 1. Ajouter monthly_cost à gcp_projects
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS monthly_cost DECIMAL(12,2) DEFAULT 0;

-- 2. Ajouter monthly_cost à gcp_services_usage
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS monthly_cost DECIMAL(12,2) DEFAULT 0;

-- 3. Ajouter potential_carbon_reduction à gcp_optimization_recommendations
ALTER TABLE gcp_optimization_recommendations ADD COLUMN IF NOT EXISTS potential_carbon_reduction DECIMAL(10,3) DEFAULT 0;

-- 4. Ajouter d'autres colonnes probablement nécessaires
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS monthly_carbon DECIMAL(10,3) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS cost_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS carbon_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS cost_trend TEXT DEFAULT 'stable';
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS carbon_trend TEXT DEFAULT 'stable';
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS has_export_bigquery BOOLEAN DEFAULT false;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT true;

-- 5. Ajouter colonnes services
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS projects_count INTEGER DEFAULT 0;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS total_usage DECIMAL(15,3) DEFAULT 0;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS usage_unit TEXT DEFAULT 'EUR';

-- Message de confirmation
SELECT 'Toutes les colonnes manquantes ajoutées avec succès!' as message;
