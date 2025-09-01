-- Migration sécurisée pour ajouter les colonnes FinOps/GreenOps manquantes
-- À exécuter dans Supabase SQL Editor

-- 1. Mettre à jour la table gcp_billing_accounts (créer si n'existe pas)
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

-- 2. Ajouter les colonnes manquantes à gcp_projects
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS cost_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS carbon_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS monthly_carbon DECIMAL(10,3) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS cost_trend TEXT CHECK (cost_trend IN ('increasing', 'decreasing', 'stable')) DEFAULT 'stable';
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS carbon_trend TEXT CHECK (carbon_trend IN ('increasing', 'decreasing', 'stable')) DEFAULT 'stable';
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS has_export_bigquery BOOLEAN DEFAULT false;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS has_carbon_export BOOLEAN DEFAULT false;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT false;

-- 3. Renommer monthly_cost si elle existe sous un autre nom
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gcp_projects' AND column_name = 'current_month_cost') THEN
        ALTER TABLE gcp_projects RENAME COLUMN current_month_cost TO monthly_cost;
    END IF;
END $$;

-- 4. Ajouter monthly_cost si elle n'existe pas
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS monthly_cost DECIMAL(12,2) DEFAULT 0;

-- 5. Créer les autres tables FinOps
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

-- 6. Mettre à jour gcp_connections avec les nouvelles colonnes
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS total_monthly_cost DECIMAL(12,2) DEFAULT 0;
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS total_monthly_carbon DECIMAL(10,3) DEFAULT 0;
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS last_finops_sync TIMESTAMPTZ;
ALTER TABLE gcp_connections ADD COLUMN IF NOT EXISTS finops_sync_status TEXT DEFAULT 'pending';

-- 7. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_gcp_projects_user_cost ON gcp_projects(user_id, monthly_cost DESC);
CREATE INDEX IF NOT EXISTS idx_gcp_projects_user_carbon ON gcp_projects(user_id, monthly_carbon DESC);
CREATE INDEX IF NOT EXISTS idx_gcp_services_usage_user_month ON gcp_services_usage(user_id, usage_month);
CREATE INDEX IF NOT EXISTS idx_gcp_services_usage_cost ON gcp_services_usage(user_id, monthly_cost DESC);
CREATE INDEX IF NOT EXISTS idx_gcp_carbon_footprint_user_month ON gcp_carbon_footprint(user_id, usage_month);
CREATE INDEX IF NOT EXISTS idx_gcp_budgets_status ON gcp_budgets_tracking(user_id, status);
CREATE INDEX IF NOT EXISTS idx_gcp_recommendations_priority ON gcp_optimization_recommendations(user_id, priority, status);
CREATE INDEX IF NOT EXISTS idx_gcp_anomalies_date ON gcp_cost_anomalies(user_id, anomaly_date DESC);
CREATE INDEX IF NOT EXISTS idx_gcp_trends_month ON gcp_monthly_trends(user_id, trend_month DESC);

-- 8. Activer RLS sur les nouvelles tables
ALTER TABLE gcp_billing_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_services_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_carbon_footprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_budgets_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_optimization_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_cost_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcp_monthly_trends ENABLE ROW LEVEL SECURITY;

-- 9. Créer les politiques RLS (à adapter selon votre système d'auth)
DO $$ 
BEGIN
    -- Créer les politiques seulement si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only see their own billing accounts') THEN
        CREATE POLICY "Users can only see their own billing accounts" ON gcp_billing_accounts
        FOR ALL USING (auth.jwt() ->> 'email' = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only see their own services usage') THEN
        CREATE POLICY "Users can only see their own services usage" ON gcp_services_usage
        FOR ALL USING (auth.jwt() ->> 'email' = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only see their own carbon footprint') THEN
        CREATE POLICY "Users can only see their own carbon footprint" ON gcp_carbon_footprint
        FOR ALL USING (auth.jwt() ->> 'email' = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only see their own budgets') THEN
        CREATE POLICY "Users can only see their own budgets" ON gcp_budgets_tracking
        FOR ALL USING (auth.jwt() ->> 'email' = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only see their own recommendations') THEN
        CREATE POLICY "Users can only see their own recommendations" ON gcp_optimization_recommendations
        FOR ALL USING (auth.jwt() ->> 'email' = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only see their own anomalies') THEN
        CREATE POLICY "Users can only see their own anomalies" ON gcp_cost_anomalies
        FOR ALL USING (auth.jwt() ->> 'email' = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only see their own trends') THEN
        CREATE POLICY "Users can only see their own trends" ON gcp_monthly_trends
        FOR ALL USING (auth.jwt() ->> 'email' = user_id);
    END IF;
END $$;

-- 10. Créer des vues utiles pour les dashboards
CREATE OR REPLACE VIEW gcp_finops_summary AS
SELECT 
  user_id,
  COUNT(DISTINCT project_id) as total_projects,
  COALESCE(SUM(monthly_cost), 0) as total_monthly_cost,
  COALESCE(SUM(monthly_carbon), 0) as total_monthly_carbon,
  COALESCE(AVG(monthly_cost), 0) as avg_cost_per_project,
  COALESCE(AVG(monthly_carbon), 0) as avg_carbon_per_project,
  MAX(updated_at) as last_sync
FROM gcp_projects
WHERE is_archived = false OR is_archived IS NULL
GROUP BY user_id;

-- 11. Fonction pour détecter les anomalies de coût
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
    s.service_id, -- Utiliser service_id comme project_id temporairement
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

-- Message de confirmation
SELECT 'Migration FinOps/GreenOps terminée avec succès! 🎉' as status;
