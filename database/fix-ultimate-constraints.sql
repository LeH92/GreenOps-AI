-- Corrections finales pour compléter la synchronisation

-- 1. Modifier billing_period pour accepter NULL dans gcp_services_usage
ALTER TABLE gcp_services_usage ALTER COLUMN billing_period DROP NOT NULL;

-- 2. Ajouter service_id à gcp_optimization_recommendations
ALTER TABLE gcp_optimization_recommendations ADD COLUMN IF NOT EXISTS service_id TEXT DEFAULT '';

-- 3. Ajouter project_id à gcp_optimization_recommendations si manquant
ALTER TABLE gcp_optimization_recommendations ADD COLUMN IF NOT EXISTS project_id TEXT DEFAULT '';

-- Message de confirmation
SELECT 'SYNCHRONISATION FINALE PRÊTE - Toutes les contraintes sont corrigées !' as message;
