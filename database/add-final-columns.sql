-- Ajouter les dernières colonnes manquantes

-- 1. Ajouter updated_at à gcp_services_usage
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Ajouter potential_savings à gcp_optimization_recommendations
ALTER TABLE gcp_optimization_recommendations ADD COLUMN IF NOT EXISTS potential_savings DECIMAL(12,2) DEFAULT 0;

-- 3. Ajouter created_at si manquant
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Message de confirmation
SELECT 'Dernières colonnes ajoutées - synchronisation complète possible !' as message;
