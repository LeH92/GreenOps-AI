-- Corriger les dernières contraintes

-- 1. Modifier project_id pour accepter NULL dans gcp_services_usage (services globaux)
ALTER TABLE gcp_services_usage ALTER COLUMN project_id DROP NOT NULL;

-- 2. Ajouter recommendation_id à gcp_optimization_recommendations
ALTER TABLE gcp_optimization_recommendations ADD COLUMN IF NOT EXISTS recommendation_id TEXT;

-- 3. Mettre à jour les contraintes si nécessaire
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS service_id TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS service_name TEXT;

-- Message de confirmation
SELECT 'Contraintes finales corrigées - synchronisation prête !' as message;
