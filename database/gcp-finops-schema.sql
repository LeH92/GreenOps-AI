-- =====================================================
-- SCHEMA FINOPS/GREENOPS AVANCÉ - GCP
-- Tables optimisées pour analyses de coûts et performance
-- =====================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- TABLE: gcp_projects (mise à jour)
-- =====================================================
DROP TABLE IF EXISTS gcp_projects CASCADE;
CREATE TABLE gcp_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_number TEXT,
  billing_account_id TEXT,
  billing_account_name TEXT,
  
  -- Métadonnées projet
  lifecycle_state TEXT DEFAULT 'ACTIVE',
  create_time TIMESTAMP WITH TIME ZONE,
  labels JSONB DEFAULT '{}',
  
  -- Métriques de coût
  current_month_cost NUMERIC(12, 4) DEFAULT 0,
  last_month_cost NUMERIC(12, 4) DEFAULT 0,
  total_cost_ytd NUMERIC(12, 4) DEFAULT 0,
  budget_amount NUMERIC(12, 4),
  budget_utilization_percent NUMERIC(5, 2) DEFAULT 0,
  
  -- Métriques de performance
  compute_hours_month NUMERIC(10, 2) DEFAULT 0,
  storage_gb_month NUMERIC(12, 2) DEFAULT 0,
  network_gb_month NUMERIC(12, 2) DEFAULT 0,
  
  -- Métriques environnementales (GreenOps)
  carbon_footprint_kg NUMERIC(10, 4) DEFAULT 0,
  energy_consumption_kwh NUMERIC(10, 2) DEFAULT 0,
  renewable_energy_percent NUMERIC(5, 2) DEFAULT 0,
  
  -- Métriques d'optimisation
  optimization_score INTEGER DEFAULT 0, -- 0-100
  cost_optimization_potential NUMERIC(10, 2) DEFAULT 0,
  underutilized_resources JSONB DEFAULT '[]',
  optimization_recommendations JSONB DEFAULT '[]',
  
  -- Alertes et seuils
  cost_alert_threshold NUMERIC(10, 2),
  usage_alert_threshold NUMERIC(5, 2),
  last_alert_sent TIMESTAMP WITH TIME ZONE,
  
  -- Statut et métadonnées
  is_active BOOLEAN DEFAULT true,
  sync_status TEXT DEFAULT 'pending', -- pending, syncing, completed, error
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(user_id, project_id)
);

-- =====================================================
-- TABLE: gcp_services_usage
-- =====================================================
CREATE TABLE IF NOT EXISTS gcp_services_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  
  -- Identification du service
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_category TEXT, -- compute, storage, networking, ai-ml, database, etc.
  
  -- Période de facturation
  billing_period DATE NOT NULL,
  billing_account_id TEXT,
  
  -- Métriques de coût
  cost_amount NUMERIC(12, 4) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  cost_type TEXT, -- usage, subscription, support, etc.
  
  -- Métriques d'utilisation
  usage_amount NUMERIC(15, 4) DEFAULT 0,
  usage_unit TEXT, -- hours, GB, requests, etc.
  usage_start_time TIMESTAMP WITH TIME ZONE,
  usage_end_time TIMESTAMP WITH TIME ZONE,
  
  -- Localisation (pour GreenOps)
  location TEXT,
  region TEXT,
  zone TEXT,
  
  -- Métriques environnementales
  carbon_footprint_grams NUMERIC(10, 4) DEFAULT 0,
  energy_source TEXT, -- renewable, grid, mixed
  
  -- Détails techniques
  sku_id TEXT,
  sku_description TEXT,
  resource_name TEXT,
  resource_type TEXT,
  
  -- Métriques de performance
  cpu_utilization NUMERIC(5, 2),
  memory_utilization NUMERIC(5, 2),
  disk_utilization NUMERIC(5, 2),
  network_utilization NUMERIC(5, 2),
  
  -- Recommandations d'optimisation
  optimization_opportunity TEXT,
  potential_savings NUMERIC(10, 2) DEFAULT 0,
  
  -- Métadonnées
  labels JSONB DEFAULT '{}',
  export_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index et contraintes
  UNIQUE(user_id, project_id, service_id, billing_period, sku_id)
);

-- =====================================================
-- TABLE: gcp_cost_anomalies
-- =====================================================
CREATE TABLE IF NOT EXISTS gcp_cost_anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  
  -- Détection d'anomalie
  anomaly_type TEXT NOT NULL, -- spike, trend, unusual_pattern
  severity TEXT NOT NULL, -- low, medium, high, critical
  
  -- Détails de l'anomalie
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Métriques
  expected_cost NUMERIC(12, 4),
  actual_cost NUMERIC(12, 4),
  variance_amount NUMERIC(12, 4),
  variance_percent NUMERIC(8, 2),
  
  -- Cause identifiée
  root_cause TEXT,
  affected_services JSONB DEFAULT '[]',
  affected_resources JSONB DEFAULT '[]',
  
  -- Actions
  status TEXT DEFAULT 'open', -- open, investigating, resolved, false_positive
  assigned_to TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_channels JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: gcp_budgets_tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS gcp_budgets_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  
  -- Budget configuration
  budget_name TEXT NOT NULL,
  budget_amount NUMERIC(12, 4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  period_type TEXT NOT NULL, -- monthly, quarterly, yearly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Utilisation actuelle
  spent_amount NUMERIC(12, 4) DEFAULT 0,
  forecasted_amount NUMERIC(12, 4) DEFAULT 0,
  utilization_percent NUMERIC(5, 2) DEFAULT 0,
  
  -- Seuils d'alerte
  alert_threshold_50 BOOLEAN DEFAULT true,
  alert_threshold_80 BOOLEAN DEFAULT true,
  alert_threshold_90 BOOLEAN DEFAULT true,
  alert_threshold_100 BOOLEAN DEFAULT true,
  
  -- Statut des alertes
  alert_50_sent BOOLEAN DEFAULT false,
  alert_80_sent BOOLEAN DEFAULT false,
  alert_90_sent BOOLEAN DEFAULT false,
  alert_100_sent BOOLEAN DEFAULT false,
  
  -- Prédictions
  forecasted_end_amount NUMERIC(12, 4),
  days_to_budget_exhaustion INTEGER,
  burn_rate_daily NUMERIC(10, 2),
  
  -- Métadonnées
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, project_id, budget_name, period_start)
);

-- =====================================================
-- TABLE: gcp_optimization_recommendations
-- =====================================================
CREATE TABLE IF NOT EXISTS gcp_optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  
  -- Type de recommandation
  recommendation_type TEXT NOT NULL, -- rightsizing, unused_resources, commitment_discounts, etc.
  category TEXT NOT NULL, -- cost, performance, sustainability
  priority TEXT NOT NULL, -- low, medium, high, critical
  
  -- Description
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_description TEXT,
  
  -- Métriques d'impact
  potential_monthly_savings NUMERIC(10, 2) DEFAULT 0,
  potential_annual_savings NUMERIC(10, 2) DEFAULT 0,
  implementation_effort TEXT, -- low, medium, high
  implementation_time_hours INTEGER,
  
  -- Ressources affectées
  affected_resource_type TEXT,
  affected_resource_name TEXT,
  affected_service TEXT,
  resource_details JSONB DEFAULT '{}',
  
  -- Impact environnemental
  carbon_reduction_kg NUMERIC(8, 4) DEFAULT 0,
  energy_savings_kwh NUMERIC(8, 2) DEFAULT 0,
  
  -- Statut de la recommandation
  status TEXT DEFAULT 'new', -- new, in_progress, implemented, dismissed, not_applicable
  implemented_at TIMESTAMP WITH TIME ZONE,
  dismissed_reason TEXT,
  
  -- Suivi
  confidence_score NUMERIC(3, 2), -- 0.0 to 1.0
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  generated_by TEXT DEFAULT 'system',
  tags JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: gcp_carbon_footprint
-- =====================================================
CREATE TABLE IF NOT EXISTS gcp_carbon_footprint (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  
  -- Période de mesure
  measurement_period DATE NOT NULL,
  measurement_type TEXT NOT NULL, -- daily, weekly, monthly
  
  -- Localisation
  region TEXT NOT NULL,
  zone TEXT,
  
  -- Émissions carbone
  total_emissions_kg NUMERIC(10, 4) NOT NULL DEFAULT 0,
  emissions_by_service JSONB DEFAULT '{}',
  
  -- Consommation énergétique
  total_energy_kwh NUMERIC(10, 2) DEFAULT 0,
  renewable_energy_kwh NUMERIC(10, 2) DEFAULT 0,
  grid_energy_kwh NUMERIC(10, 2) DEFAULT 0,
  renewable_percentage NUMERIC(5, 2) DEFAULT 0,
  
  -- Facteurs d'émission
  carbon_intensity_g_per_kwh NUMERIC(8, 2),
  grid_carbon_intensity NUMERIC(8, 2),
  
  -- Comparaisons
  baseline_emissions_kg NUMERIC(10, 4),
  emissions_reduction_kg NUMERIC(10, 4),
  efficiency_score INTEGER, -- 0-100
  
  -- Métriques de performance environnementale
  pue_ratio NUMERIC(4, 2), -- Power Usage Effectiveness
  cue_ratio NUMERIC(4, 2), -- Carbon Usage Effectiveness
  
  -- Métadonnées
  data_quality_score NUMERIC(3, 2), -- 0.0 to 1.0
  calculation_method TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, project_id, measurement_period, region)
);

-- =====================================================
-- INDEXES POUR PERFORMANCE
-- =====================================================

-- gcp_projects
CREATE INDEX idx_gcp_projects_user_id ON gcp_projects(user_id);
CREATE INDEX idx_gcp_projects_sync_status ON gcp_projects(sync_status);
CREATE INDEX idx_gcp_projects_cost ON gcp_projects(current_month_cost DESC);
CREATE INDEX idx_gcp_projects_carbon ON gcp_projects(carbon_footprint_kg DESC);

-- gcp_services_usage
CREATE INDEX idx_gcp_services_user_project ON gcp_services_usage(user_id, project_id);
CREATE INDEX idx_gcp_services_period ON gcp_services_usage(billing_period DESC);
CREATE INDEX idx_gcp_services_cost ON gcp_services_usage(cost_amount DESC);
CREATE INDEX idx_gcp_services_category ON gcp_services_usage(service_category);
CREATE INDEX idx_gcp_services_location ON gcp_services_usage(region, zone);

-- gcp_cost_anomalies
CREATE INDEX idx_gcp_anomalies_user_project ON gcp_cost_anomalies(user_id, project_id);
CREATE INDEX idx_gcp_anomalies_severity ON gcp_cost_anomalies(severity, detected_at DESC);
CREATE INDEX idx_gcp_anomalies_status ON gcp_cost_anomalies(status);

-- gcp_budgets_tracking
CREATE INDEX idx_gcp_budgets_user_project ON gcp_budgets_tracking(user_id, project_id);
CREATE INDEX idx_gcp_budgets_utilization ON gcp_budgets_tracking(utilization_percent DESC);
CREATE INDEX idx_gcp_budgets_period ON gcp_budgets_tracking(period_start, period_end);

-- gcp_optimization_recommendations
CREATE INDEX idx_gcp_recommendations_user_project ON gcp_optimization_recommendations(user_id, project_id);
CREATE INDEX idx_gcp_recommendations_priority ON gcp_optimization_recommendations(priority, potential_monthly_savings DESC);
CREATE INDEX idx_gcp_recommendations_status ON gcp_optimization_recommendations(status);
CREATE INDEX idx_gcp_recommendations_category ON gcp_optimization_recommendations(category);

-- gcp_carbon_footprint
CREATE INDEX idx_gcp_carbon_user_project ON gcp_carbon_footprint(user_id, project_id);
CREATE INDEX idx_gcp_carbon_period ON gcp_carbon_footprint(measurement_period DESC);
CREATE INDEX idx_gcp_carbon_emissions ON gcp_carbon_footprint(total_emissions_kg DESC);
CREATE INDEX idx_gcp_carbon_region ON gcp_carbon_footprint(region);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour calculer le score d'optimisation
CREATE OR REPLACE FUNCTION calculate_optimization_score(
  p_user_id TEXT,
  p_project_id TEXT
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 100;
  cost_efficiency NUMERIC;
  carbon_efficiency NUMERIC;
  budget_utilization NUMERIC;
BEGIN
  -- Récupérer les métriques du projet
  SELECT 
    CASE 
      WHEN current_month_cost > 0 THEN 
        LEAST(100, (budget_amount / NULLIF(current_month_cost, 0)) * 50)
      ELSE 100 
    END,
    CASE 
      WHEN carbon_footprint_kg > 0 THEN 
        GREATEST(0, 100 - (carbon_footprint_kg * 10))
      ELSE 100 
    END,
    budget_utilization_percent
  INTO cost_efficiency, carbon_efficiency, budget_utilization
  FROM gcp_projects 
  WHERE user_id = p_user_id AND project_id = p_project_id;
  
  -- Calculer le score composite
  score := ROUND(
    (COALESCE(cost_efficiency, 50) * 0.4) + 
    (COALESCE(carbon_efficiency, 50) * 0.3) + 
    (GREATEST(0, 100 - COALESCE(budget_utilization, 0)) * 0.3)
  );
  
  -- Mettre à jour le projet
  UPDATE gcp_projects 
  SET optimization_score = score, updated_at = NOW()
  WHERE user_id = p_user_id AND project_id = p_project_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour détecter les anomalies de coût
CREATE OR REPLACE FUNCTION detect_cost_anomalies(
  p_user_id TEXT,
  p_project_id TEXT,
  p_current_cost NUMERIC,
  p_expected_cost NUMERIC DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  variance_threshold NUMERIC := 20.0; -- 20% de variance
  variance_amount NUMERIC;
  variance_percent NUMERIC;
  expected_cost NUMERIC;
BEGIN
  -- Calculer le coût attendu si non fourni (moyenne des 3 derniers mois)
  IF p_expected_cost IS NULL THEN
    SELECT AVG(cost_amount) INTO expected_cost
    FROM gcp_services_usage 
    WHERE user_id = p_user_id 
      AND project_id = p_project_id 
      AND billing_period >= CURRENT_DATE - INTERVAL '3 months'
      AND billing_period < CURRENT_DATE - INTERVAL '1 month';
    
    expected_cost := COALESCE(expected_cost, p_current_cost);
  ELSE
    expected_cost := p_expected_cost;
  END IF;
  
  -- Calculer la variance
  variance_amount := p_current_cost - expected_cost;
  variance_percent := CASE 
    WHEN expected_cost > 0 THEN (variance_amount / expected_cost) * 100 
    ELSE 0 
  END;
  
  -- Créer une anomalie si la variance dépasse le seuil
  IF ABS(variance_percent) > variance_threshold THEN
    INSERT INTO gcp_cost_anomalies (
      user_id, project_id, anomaly_type, severity,
      period_start, period_end,
      expected_cost, actual_cost, variance_amount, variance_percent,
      root_cause
    ) VALUES (
      p_user_id, p_project_id,
      CASE WHEN variance_percent > 0 THEN 'spike' ELSE 'drop' END,
      CASE 
        WHEN ABS(variance_percent) > 50 THEN 'critical'
        WHEN ABS(variance_percent) > 30 THEN 'high'
        ELSE 'medium'
      END,
      CURRENT_DATE - INTERVAL '1 month',
      CURRENT_DATE,
      expected_cost, p_current_cost, variance_amount, variance_percent,
      'Automatic detection based on historical patterns'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger à toutes les tables
CREATE TRIGGER update_gcp_projects_updated_at BEFORE UPDATE ON gcp_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gcp_cost_anomalies_updated_at BEFORE UPDATE ON gcp_cost_anomalies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gcp_budgets_tracking_updated_at BEFORE UPDATE ON gcp_budgets_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gcp_optimization_recommendations_updated_at BEFORE UPDATE ON gcp_optimization_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gcp_carbon_footprint_updated_at BEFORE UPDATE ON gcp_carbon_footprint FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VUES POUR ANALYSES RAPIDES
-- =====================================================

-- Vue pour tableau de bord FinOps
CREATE OR REPLACE VIEW v_finops_dashboard AS
SELECT 
  p.user_id,
  p.project_id,
  p.project_name,
  p.current_month_cost,
  p.budget_amount,
  p.budget_utilization_percent,
  p.optimization_score,
  p.carbon_footprint_kg,
  COUNT(r.id) as active_recommendations,
  SUM(r.potential_monthly_savings) as potential_savings,
  COUNT(a.id) as open_anomalies
FROM gcp_projects p
LEFT JOIN gcp_optimization_recommendations r ON p.user_id = r.user_id AND p.project_id = r.project_id AND r.status = 'new'
LEFT JOIN gcp_cost_anomalies a ON p.user_id = a.user_id AND p.project_id = a.project_id AND a.status = 'open'
WHERE p.is_active = true
GROUP BY p.user_id, p.project_id, p.project_name, p.current_month_cost, p.budget_amount, p.budget_utilization_percent, p.optimization_score, p.carbon_footprint_kg;

-- Vue pour analyse des coûts par service
CREATE OR REPLACE VIEW v_cost_by_service AS
SELECT 
  user_id,
  project_id,
  service_category,
  service_name,
  DATE_TRUNC('month', billing_period) as month,
  SUM(cost_amount) as total_cost,
  SUM(carbon_footprint_grams) / 1000 as total_carbon_kg,
  AVG(cpu_utilization) as avg_cpu_utilization,
  AVG(memory_utilization) as avg_memory_utilization
FROM gcp_services_usage
GROUP BY user_id, project_id, service_category, service_name, DATE_TRUNC('month', billing_period);

-- =====================================================
-- DONNÉES DE TEST POUR DÉVELOPPEMENT
-- =====================================================

INSERT INTO gcp_projects (
  user_id, project_id, project_name, project_number, 
  billing_account_id, current_month_cost, budget_amount,
  carbon_footprint_kg, optimization_score
) VALUES 
(
  'test@example.com', 'carewash-v3', 'CareWash - V3', '103208691996',
  '0127ED-2B9B5B-DD38A4', 1250.75, 2000.00,
  15.6, 78
) ON CONFLICT (user_id, project_id) DO UPDATE SET
  project_name = EXCLUDED.project_name,
  current_month_cost = EXCLUDED.current_month_cost,
  budget_amount = EXCLUDED.budget_amount,
  carbon_footprint_kg = EXCLUDED.carbon_footprint_kg,
  optimization_score = EXCLUDED.optimization_score,
  updated_at = NOW();

-- =====================================================
-- TABLE: gcp_audit_log
-- =====================================================
CREATE TABLE IF NOT EXISTS gcp_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  
  -- Action effectuée
  action TEXT NOT NULL, -- connect, disconnect, sync, update, delete
  action_type TEXT DEFAULT 'user', -- user, system, scheduled
  
  -- Détails de l'action
  details JSONB NOT NULL DEFAULT '{}',
  affected_resources JSONB DEFAULT '[]',
  
  -- Métadonnées de session
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  
  -- Résultat
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour l'audit
CREATE INDEX idx_gcp_audit_user_id ON gcp_audit_log(user_id);
CREATE INDEX idx_gcp_audit_action ON gcp_audit_log(action, created_at DESC);
CREATE INDEX idx_gcp_audit_created_at ON gcp_audit_log(created_at DESC);

-- =====================================================
-- MISE À JOUR DES TABLES EXISTANTES
-- =====================================================

-- Ajouter des champs pour le soft delete et l'archivage
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS disconnection_reason TEXT;

-- =====================================================
-- FONCTIONS POUR LA DÉCONNEXION
-- =====================================================

-- Fonction pour nettoyer les données anciennes (appelée lors de la déconnexion)
CREATE OR REPLACE FUNCTION cleanup_disconnected_user_data(p_user_id TEXT)
RETURNS TABLE (
  projects_archived INTEGER,
  billing_records_archived INTEGER,
  recommendations_archived INTEGER,
  anomalies_resolved INTEGER
) AS $$
DECLARE
  projects_count INTEGER := 0;
  billing_count INTEGER := 0;
  recommendations_count INTEGER := 0;
  anomalies_count INTEGER := 0;
BEGIN
  -- Archiver les projets
  UPDATE gcp_projects 
  SET 
    is_active = false,
    sync_status = 'disconnected',
    archived_at = NOW(),
    disconnection_reason = 'user_requested',
    updated_at = NOW()
  WHERE user_id = p_user_id AND is_active = true;
  
  GET DIAGNOSTICS projects_count = ROW_COUNT;

  -- Marquer les données de services comme archivées
  UPDATE gcp_services_usage 
  SET 
    is_archived = true,
    archived_at = NOW()
  WHERE user_id = p_user_id AND is_archived = false;
  
  GET DIAGNOSTICS billing_count = ROW_COUNT;

  -- Marquer les recommandations comme obsolètes
  UPDATE gcp_optimization_recommendations 
  SET 
    status = 'obsolete',
    updated_at = NOW()
  WHERE user_id = p_user_id AND status IN ('new', 'in_progress');
  
  GET DIAGNOSTICS recommendations_count = ROW_COUNT;

  -- Résoudre les anomalies ouvertes
  UPDATE gcp_cost_anomalies 
  SET 
    status = 'resolved',
    resolution_notes = 'Account disconnected - tracking stopped',
    resolved_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND status = 'open';
  
  GET DIAGNOSTICS anomalies_count = ROW_COUNT;

  RETURN QUERY SELECT projects_count, billing_count, recommendations_count, anomalies_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour restaurer les données après reconnexion
CREATE OR REPLACE FUNCTION restore_user_data_after_reconnection(p_user_id TEXT)
RETURNS TABLE (
  projects_restored INTEGER,
  billing_records_restored INTEGER
) AS $$
DECLARE
  projects_count INTEGER := 0;
  billing_count INTEGER := 0;
BEGIN
  -- Réactiver les projets récemment archivés (moins de 30 jours)
  UPDATE gcp_projects 
  SET 
    is_active = true,
    sync_status = 'pending',
    archived_at = NULL,
    disconnection_reason = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id 
    AND is_active = false 
    AND archived_at > NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS projects_count = ROW_COUNT;

  -- Restaurer les données de services récentes
  UPDATE gcp_services_usage 
  SET 
    is_archived = false,
    archived_at = NULL
  WHERE user_id = p_user_id 
    AND is_archived = true 
    AND archived_at > NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS billing_count = ROW_COUNT;

  RETURN QUERY SELECT projects_count, billing_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISSIONS ET SÉCURITÉ
-- =====================================================

-- RLS (Row Level Security) - À activer en production
-- ALTER TABLE gcp_projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gcp_services_usage ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gcp_cost_anomalies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gcp_budgets_tracking ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gcp_optimization_recommendations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gcp_carbon_footprint ENABLE ROW LEVEL SECURITY;

-- Exemple de politique RLS
-- CREATE POLICY "Users can only see their own data" ON gcp_projects FOR ALL USING (auth.uid()::text = user_id);

COMMENT ON SCHEMA public IS 'Schema optimisé pour analyses FinOps et GreenOps avancées';
