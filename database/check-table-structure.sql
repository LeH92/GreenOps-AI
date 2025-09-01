-- Vérifier la structure des tables existantes
-- Pour comprendre quelles colonnes existent déjà

-- 1. Structure de gcp_projects
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'gcp_projects' 
ORDER BY ordinal_position;

-- 2. Structure de gcp_services_usage  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'gcp_services_usage' 
ORDER BY ordinal_position;

-- 3. Structure de gcp_optimization_recommendations
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'gcp_optimization_recommendations' 
ORDER BY ordinal_position;

-- 4. Structure de gcp_connections
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'gcp_connections' 
ORDER BY ordinal_position;
