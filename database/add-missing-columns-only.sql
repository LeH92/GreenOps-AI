-- Ajouter seulement les colonnes strictement nécessaires
-- Basé sur les erreurs détectées

-- 1. Ajouter usage_month à gcp_services_usage (colonne manquante détectée)
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS usage_month TEXT NOT NULL DEFAULT '2025-01';

-- 2. Ajouter is_archived à gcp_projects (erreur détectée précédemment)
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- 3. Ajouter cost_percentage à gcp_services_usage (erreur détectée précédemment)
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS cost_percentage DECIMAL(5,2) DEFAULT 0;

-- 4. Ajouter effort à gcp_optimization_recommendations (erreur détectée précédemment)
ALTER TABLE gcp_optimization_recommendations ADD COLUMN IF NOT EXISTS effort TEXT DEFAULT 'medium';

-- 5. Ajouter implementation à gcp_optimization_recommendations (souvent nécessaire)
ALTER TABLE gcp_optimization_recommendations ADD COLUMN IF NOT EXISTS implementation TEXT DEFAULT 'À définir';

-- Message de confirmation
SELECT 'Colonnes manquantes ajoutées avec succès!' as message;
