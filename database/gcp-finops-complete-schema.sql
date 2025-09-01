-- Schema complet pour les données FinOps/GreenOps GCP
-- Basé sur les règles apigcprules pour une collecte optimale des KPIs

-- Table des comptes de facturation enrichie
CREATE TABLE IF NOT EXISTS gcp_billing_accounts (
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

-- Table des projets enrichie avec KPIs FinOps/GreenOps
CREATE TABLE IF NOT EXISTS gcp_projects (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_number TEXT,
  billing_account_name TEXT,
  billing_account_id TEXT,
  lifecycle_state TEXT DEFAULT 'ACTIVE',
  
  -- KPIs FinOps
  monthly_cost DECIMAL(12,2) DEFAULT 0,
  cost_trend TEXT CHECK (cost_trend IN ('increasing', 'decreasing', 'stable')) DEFAULT 'stable',
  cost_percentage DECIMAL(5,2) DEFAULT 0, -- Pourcentage du coût total
  
  -- KPIs GreenOps
  monthly_carbon DECIMAL(10,3) DEFAULT 0, -- kg CO2e
  carbon_trend TEXT CHECK (carbon_trend IN ('increasing', 'decreasing', 'stable')) DEFAULT 'stable',
  carbon_percentage DECIMAL(5,2) DEFAULT 0, -- Pourcentage du carbone total
  
  -- Configuration exports
  has_export_bigquery BOOLEAN DEFAULT false,
  has_carbon_export BOOLEAN DEFAULT false,
  
  -- Métadonnées
  is_selected BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, project_id)
);

-- Table d'utilisation des services avec coûts
CREATE TABLE IF NOT EXISTS gcp_services_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  usage_month TEXT NOT NULL, -- Format YYYY-MM
  
  -- Métriques de coût
  monthly_cost DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  cost_percentage DECIMAL(5,2) DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  
  -- Métriques d'usage (si disponibles)
  total_usage DECIMAL(15,3) DEFAULT 0,
  usage_unit TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, service_id, usage_month)
);

-- Table d'empreinte carbone détaillée
CREATE TABLE IF NOT EXISTS gcp_carbon_footprint (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  usage_month TEXT NOT NULL, -- Format YYYY-MM
  
  -- Identifiants
  project_id TEXT,
  service_id TEXT,
  service_name TEXT,
  location_region TEXT,
  location_zone TEXT,
  
  -- Métriques carbone
  monthly_carbon DECIMAL(10,3) DEFAULT 0, -- kg CO2e market-based
  carbon_location_based DECIMAL(10,3) DEFAULT 0, -- kg CO2e location-based
  carbon_percentage DECIMAL(5,2) DEFAULT 0,
  projects_count INTEGER DEFAULT 1,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, project_id, service_id, location_region, usage_month)
);

-- Table de suivi des budgets enrichie
CREATE TABLE IF NOT EXISTS gcp_budgets_tracking (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  budget_name TEXT NOT NULL,
  budget_display_name TEXT NOT NULL,
  
  -- Configuration budget
  budget_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Utilisation actuelle
  current_spend DECIMAL(12,2) DEFAULT 0,
  utilization_percentage DECIMAL(5,2) DEFAULT 0,
  projected_spend DECIMAL(12,2) DEFAULT 0,
  
  -- Statut et alertes
  status TEXT CHECK (status IN ('on_track', 'warning', 'over_budget', 'critical')) DEFAULT 'on_track',
  next_threshold DECIMAL(5,2),
  alerts_triggered TEXT[] DEFAULT '{}',
  
  -- Configuration avancée (JSON)
  threshold_rules JSONB,
  budget_filter JSONB,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, budget_name)
);

-- Table des recommandations d'optimisation
CREATE TABLE IF NOT EXISTS gcp_optimization_recommendations (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  recommendation_id TEXT NOT NULL,
  
  -- Classification
  type TEXT CHECK (type IN ('cost', 'carbon', 'performance')) NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  effort TEXT CHECK (effort IN ('low', 'medium', 'high')) DEFAULT 'medium',
  
  -- Contenu
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  implementation TEXT NOT NULL,
  
  -- Scope
  project_id TEXT,
  service_id TEXT,
  
  -- Impact potentiel
  potential_savings DECIMAL(12,2) DEFAULT 0,
  potential_carbon_reduction DECIMAL(10,3) DEFAULT 0,
  
  -- Suivi
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')) DEFAULT 'pending',
  implemented_at TIMESTAMPTZ,
  actual_savings DECIMAL(12,2) DEFAULT 0,
  actual_carbon_reduction DECIMAL(10,3) DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, recommendation_id)
);

-- Table des anomalies de coût (détection automatique)
CREATE TABLE IF NOT EXISTS gcp_cost_anomalies (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  
  -- Identification
  project_id TEXT,
  service_id TEXT,
  service_name TEXT,
  
  -- Anomalie détectée
  anomaly_date DATE NOT NULL,
  anomaly_type TEXT CHECK (anomaly_type IN ('spike', 'unusual_pattern', 'budget_exceeded')) NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  
  -- Métriques
  current_cost DECIMAL(12,2) NOT NULL,
  expected_cost DECIMAL(12,2) NOT NULL,
  variance_percentage DECIMAL(5,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Description
  description TEXT NOT NULL,
  suggested_actions TEXT[],
  
  -- Suivi
  status TEXT CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')) DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des tendances mensuelles (coûts et carbone)
CREATE TABLE IF NOT EXISTS gcp_monthly_trends (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  trend_month TEXT NOT NULL, -- Format YYYY-MM
  
  -- Métriques globales
  total_cost DECIMAL(12,2) DEFAULT 0,
  total_carbon DECIMAL(10,3) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  
  -- Évolutions
  cost_change_percentage DECIMAL(5,2) DEFAULT 0,
  carbon_change_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Détails par scope
  cost_by_project JSONB DEFAULT '{}',
  cost_by_service JSONB DEFAULT '{}',
  carbon_by_project JSONB DEFAULT '{}',
  carbon_by_service JSONB DEFAULT '{}',
  
  -- Top contributors
  top_cost_projects TEXT[] DEFAULT '{}',
  top_carbon_projects TEXT[] DEFAULT '{}',
  top_cost_services TEXT[] DEFAULT '{}',
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, trend_month)
);

-- Mise à jour de la table gcp_connections pour inclure les nouveaux KPIs
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS total_monthly_cost DECIMAL(12,2) DEFAULT 0;
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS total_monthly_carbon DECIMAL(10,3) DEFAULT 0;
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS last_finops_sync TIMESTAMPTZ;
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS finops_sync_status TEXT DEFAULT 'pending';

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_gcp_projects_user_cost ON gcp_projects(user_id, monthly_cost DESC);
CREATE INDEX IF NOT EXISTS idx_gcp_projects_user_carbon ON gcp_projects(user_id, monthly_carbon DESC);
CREATE INDEX IF NOT EXISTS idx_gcp_services_usage_user_month ON gcp_services_usage(user_id, usage_month);
CREATE INDEX IF NOT EXISTS idx_gcp_services_usage_cost ON gcp_services_usage(user_id, monthly_cost DESC);
CREATE INDEX IF NOT EXISTS idx_gcp_carbon_footprint_user_month ON gcp_carbon_footprint(user_id, usage_month);
CREATE INDEX IF NOT EXISTS idx_gcp_budgets_status ON gcp_budgets_tracking(user_id, status);
CREATE INDEX IF NOT EXISTS idx_gcp_recommendations_priority ON gcp_optimization_recommendations(user_id, priority, status);
CREATE INDEX IF NOT EXISTS idx_gcp_anomalies_date ON gcp_cost_anomalies(user_id, anomaly_date DESC);
CREATE INDEX IF NOT EXISTS idx_gcp_trends_month ON gcp_monthly_trends(user_id, trend_month DESC);

-- RLS (Row Level Security) pour sécuriser les données par utilisateur
ALTER TABLE gcp_billing_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_services_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_carbon_footprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_budgets_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_optimization_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_cost_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_monthly_trends ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (exemple pour une table, à adapter selon votre système d'auth)
CREATE POLICY IF NOT EXISTS "Users can only see their own billing accounts" ON gcp_billing_accounts
  FOR ALL USING (auth.jwt() ->> 'email' = user_id);

CREATE POLICY IF NOT EXISTS "Users can only see their own projects" ON gcp_projects
  FOR ALL USING (auth.jwt() ->> 'email' = user_id);

CREATE POLICY IF NOT EXISTS "Users can only see their own services usage" ON gcp_services_usage
  FOR ALL USING (auth.jwt() ->> 'email' = user_id);

CREATE POLICY IF NOT EXISTS "Users can only see their own carbon footprint" ON gcp_carbon_footprint
  FOR ALL USING (auth.jwt() ->> 'email' = user_id);

CREATE POLICY IF NOT EXISTS "Users can only see their own budgets" ON gcp_budgets_tracking
  FOR ALL USING (auth.jwt() ->> 'email' = user_id);

CREATE POLICY IF NOT EXISTS "Users can only see their own recommendations" ON gcp_optimization_recommendations
  FOR ALL USING (auth.jwt() ->> 'email' = user_id);

CREATE POLICY IF NOT EXISTS "Users can only see their own anomalies" ON gcp_cost_anomalies
  FOR ALL USING (auth.jwt() ->> 'email' = user_id);

CREATE POLICY IF NOT EXISTS "Users can only see their own trends" ON gcp_monthly_trends
  FOR ALL USING (auth.jwt() ->> 'email' = user_id);

-- Vues utiles pour les dashboards FinOps/GreenOps
CREATE OR REPLACE VIEW gcp_finops_summary AS
SELECT 
  user_id,
  COUNT(DISTINCT project_id) as total_projects,
  SUM(monthly_cost) as total_monthly_cost,
  SUM(monthly_carbon) as total_monthly_carbon,
  AVG(monthly_cost) as avg_cost_per_project,
  AVG(monthly_carbon) as avg_carbon_per_project,
  MAX(updated_at) as last_sync
FROM gcp_projects
WHERE is_archived = false
GROUP BY user_id;

CREATE OR REPLACE VIEW gcp_top_cost_projects AS
SELECT 
  user_id,
  project_id,
  project_name,
  monthly_cost,
  cost_percentage,
  cost_trend,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY monthly_cost DESC) as rank
FROM gcp_projects
WHERE is_archived = false AND monthly_cost > 0;

CREATE OR REPLACE VIEW gcp_top_carbon_projects AS
SELECT 
  user_id,
  project_id,
  project_name,
  monthly_carbon,
  carbon_percentage,
  carbon_trend,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY monthly_carbon DESC) as rank
FROM gcp_projects
WHERE is_archived = false AND monthly_carbon > 0;

-- Fonctions utiles pour les calculs FinOps
CREATE OR REPLACE FUNCTION calculate_cost_trend(
  p_user_id TEXT,
  p_project_id TEXT,
  p_months INTEGER DEFAULT 3
) RETURNS TEXT AS $$
DECLARE
  trend_result TEXT;
BEGIN
  -- Logique simplifiée pour calculer la tendance
  -- Dans une implémentation complète, on analyserait les données historiques
  SELECT 
    CASE 
      WHEN AVG(monthly_cost) > 0 THEN 'stable'
      ELSE 'stable'
    END INTO trend_result
  FROM gcp_projects 
  WHERE user_id = p_user_id AND project_id = p_project_id;
  
  RETURN COALESCE(trend_result, 'stable');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour détecter les anomalies de coût
CREATE OR REPLACE FUNCTION detect_cost_anomalies(p_user_id TEXT) RETURNS INTEGER AS $$
DECLARE
  anomalies_count INTEGER := 0;
BEGIN
  -- Insérer les anomalies détectées (logique simplifiée)
  INSERT INTO gcp_cost_anomalies (
    user_id, project_id, service_id, service_name, anomaly_date, anomaly_type, 
    severity, current_cost, expected_cost, variance_percentage, description
  )
  SELECT 
    p_user_id,
    p.project_id,
    s.service_id,
    s.service_name,
    CURRENT_DATE,
    'spike' as anomaly_type,
    CASE 
      WHEN s.monthly_cost > 1000 THEN 'high'
      WHEN s.monthly_cost > 500 THEN 'medium'
      ELSE 'low'
    END as severity,
    s.monthly_cost,
    s.monthly_cost * 0.8 as expected_cost, -- Simplification
    ((s.monthly_cost - (s.monthly_cost * 0.8)) / (s.monthly_cost * 0.8)) * 100 as variance_percentage,
    'Coût inhabituel détecté pour le service ' || s.service_name
  FROM gcp_services_usage s
  JOIN gcp_projects p ON s.user_id = p.user_id
  WHERE s.user_id = p_user_id 
    AND s.monthly_cost > 100 -- Seuil minimum
    AND s.usage_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
    AND NOT EXISTS (
      SELECT 1 FROM gcp_cost_anomalies a 
      WHERE a.user_id = p_user_id 
        AND a.service_id = s.service_id 
        AND a.anomaly_date = CURRENT_DATE
    );
  
  GET DIAGNOSTICS anomalies_count = ROW_COUNT;
  RETURN anomalies_count;
END;
$$ LANGUAGE plpgsql;

-- Commentaires de documentation
COMMENT ON TABLE gcp_billing_accounts IS 'Comptes de facturation GCP avec KPIs FinOps/GreenOps enrichis';
COMMENT ON TABLE gcp_projects IS 'Projets GCP avec métriques de coût, carbone et tendances';
COMMENT ON TABLE gcp_services_usage IS 'Utilisation et coûts par service GCP';
COMMENT ON TABLE gcp_carbon_footprint IS 'Empreinte carbone détaillée par projet/service/région';
COMMENT ON TABLE gcp_budgets_tracking IS 'Suivi des budgets avec utilisation et alertes';
COMMENT ON TABLE gcp_optimization_recommendations IS 'Recommandations d\'optimisation FinOps/GreenOps';
COMMENT ON TABLE gcp_cost_anomalies IS 'Détection automatique d\'anomalies de coût';
COMMENT ON TABLE gcp_monthly_trends IS 'Tendances mensuelles de coûts et carbone';
