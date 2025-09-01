-- =====================================================
-- MIGRATION SÉCURISÉE - GCP FINOPS SCHEMA
-- Script pour mettre à jour les tables existantes sans conflit
-- =====================================================

-- 1. MISE À JOUR DE LA TABLE gcp_projects EXISTANTE
-- Ajouter les nouvelles colonnes une par une avec IF NOT EXISTS

-- Métadonnées projet
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS lifecycle_state TEXT DEFAULT 'ACTIVE';
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS create_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS labels JSONB DEFAULT '{}';

-- Métriques de coût
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS current_month_cost NUMERIC(12, 4) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS last_month_cost NUMERIC(12, 4) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS total_cost_ytd NUMERIC(12, 4) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS budget_amount NUMERIC(12, 4);
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS budget_utilization_percent NUMERIC(5, 2) DEFAULT 0;

-- Métriques de performance
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS compute_hours_month NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS storage_gb_month NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS network_gb_month NUMERIC(12, 2) DEFAULT 0;

-- Métriques environnementales (GreenOps)
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS carbon_footprint_kg NUMERIC(10, 4) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS energy_consumption_kwh NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS renewable_energy_percent NUMERIC(5, 2) DEFAULT 0;

-- Métriques d'optimisation
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS optimization_score INTEGER DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS cost_optimization_potential NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS underutilized_resources JSONB DEFAULT '[]';
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS optimization_recommendations JSONB DEFAULT '[]';

-- Alertes et seuils
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS cost_alert_threshold NUMERIC(10, 2);
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS usage_alert_threshold NUMERIC(5, 2);
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS last_alert_sent TIMESTAMP WITH TIME ZONE;

-- Statut et métadonnées
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending';
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS sync_error TEXT;

-- Champs d'archivage
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE gcp_projects ADD COLUMN IF NOT EXISTS disconnection_reason TEXT;

-- 2. CRÉER LES NOUVELLES TABLES SEULEMENT SI ELLES N'EXISTENT PAS

-- Table gcp_cost_anomalies
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

-- Table gcp_budgets_tracking
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

-- Table gcp_optimization_recommendations
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

-- Table gcp_carbon_footprint
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

-- Table gcp_audit_log
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

-- 3. MISE À JOUR DE LA TABLE gcp_services_usage EXISTANTE
-- Ajouter les nouvelles colonnes si elles n'existent pas

ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS service_category TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS cost_type TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS usage_start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS usage_end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS zone TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS carbon_footprint_grams NUMERIC(10, 4) DEFAULT 0;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS energy_source TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS sku_id TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS sku_description TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS resource_name TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS resource_type TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS cpu_utilization NUMERIC(5, 2);
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS memory_utilization NUMERIC(5, 2);
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS disk_utilization NUMERIC(5, 2);
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS network_utilization NUMERIC(5, 2);
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS optimization_opportunity TEXT;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS potential_savings NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS labels JSONB DEFAULT '{}';
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS export_time TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE gcp_services_usage ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- 4. CRÉER LES INDEX SEULEMENT S'ILS N'EXISTENT PAS
DO $$
BEGIN
  -- gcp_projects
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_projects_sync_status') THEN
    CREATE INDEX idx_gcp_projects_sync_status ON gcp_projects(sync_status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_projects_cost') THEN
    CREATE INDEX idx_gcp_projects_cost ON gcp_projects(current_month_cost DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_projects_carbon') THEN
    CREATE INDEX idx_gcp_projects_carbon ON gcp_projects(carbon_footprint_kg DESC);
  END IF;

  -- gcp_services_usage
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_services_category') THEN
    CREATE INDEX idx_gcp_services_category ON gcp_services_usage(service_category);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_services_location') THEN
    CREATE INDEX idx_gcp_services_location ON gcp_services_usage(region, zone);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_services_archived') THEN
    CREATE INDEX idx_gcp_services_archived ON gcp_services_usage(is_archived, archived_at);
  END IF;

  -- gcp_cost_anomalies
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_anomalies_user_project') THEN
    CREATE INDEX idx_gcp_anomalies_user_project ON gcp_cost_anomalies(user_id, project_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_anomalies_severity') THEN
    CREATE INDEX idx_gcp_anomalies_severity ON gcp_cost_anomalies(severity, detected_at DESC);
  END IF;

  -- gcp_budgets_tracking
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_budgets_user_project') THEN
    CREATE INDEX idx_gcp_budgets_user_project ON gcp_budgets_tracking(user_id, project_id);
  END IF;

  -- gcp_optimization_recommendations
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_recommendations_priority') THEN
    CREATE INDEX idx_gcp_recommendations_priority ON gcp_optimization_recommendations(priority, potential_monthly_savings DESC);
  END IF;

  -- gcp_carbon_footprint
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_carbon_period') THEN
    CREATE INDEX idx_gcp_carbon_period ON gcp_carbon_footprint(measurement_period DESC);
  END IF;

  -- gcp_audit_log
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_audit_user_id') THEN
    CREATE INDEX idx_gcp_audit_user_id ON gcp_audit_log(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gcp_audit_action') THEN
    CREATE INDEX idx_gcp_audit_action ON gcp_audit_log(action, created_at DESC);
  END IF;
END $$;

-- 5. CRÉER LES FONCTIONS (REPLACE pour éviter les conflits)

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

-- Fonction pour nettoyer les données lors de la déconnexion
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
  WHERE user_id = p_user_id AND (is_archived = false OR is_archived IS NULL);
  
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

-- 6. CRÉER LES TRIGGERS SEULEMENT S'ILS N'EXISTENT PAS
DO $$
BEGIN
  -- Trigger pour gcp_projects
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gcp_projects_updated_at') THEN
    CREATE TRIGGER update_gcp_projects_updated_at 
      BEFORE UPDATE ON gcp_projects 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Trigger pour gcp_cost_anomalies
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gcp_cost_anomalies_updated_at') THEN
    CREATE TRIGGER update_gcp_cost_anomalies_updated_at 
      BEFORE UPDATE ON gcp_cost_anomalies 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Trigger pour gcp_budgets_tracking
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gcp_budgets_tracking_updated_at') THEN
    CREATE TRIGGER update_gcp_budgets_tracking_updated_at 
      BEFORE UPDATE ON gcp_budgets_tracking 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Trigger pour gcp_optimization_recommendations
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gcp_optimization_recommendations_updated_at') THEN
    CREATE TRIGGER update_gcp_optimization_recommendations_updated_at 
      BEFORE UPDATE ON gcp_optimization_recommendations 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Trigger pour gcp_carbon_footprint
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gcp_carbon_footprint_updated_at') THEN
    CREATE TRIGGER update_gcp_carbon_footprint_updated_at 
      BEFORE UPDATE ON gcp_carbon_footprint 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 7. CRÉER LES VUES (REPLACE pour éviter les conflits)

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
WHERE is_archived = false OR is_archived IS NULL
GROUP BY user_id, project_id, service_category, service_name, DATE_TRUNC('month', billing_period);

-- 8. INSÉRER DES DONNÉES DE TEST MISES À JOUR
INSERT INTO gcp_projects (
  user_id, project_id, project_name, project_number, 
  billing_account_id, current_month_cost, budget_amount,
  carbon_footprint_kg, optimization_score, sync_status
) VALUES 
(
  'test@example.com', 'carewash-v3', 'CareWash - V3', '103208691996',
  '0127ED-2B9B5B-DD38A4', 1250.75, 2000.00,
  15.6, 78, 'completed'
) ON CONFLICT (user_id, project_id) DO UPDATE SET
  project_name = EXCLUDED.project_name,
  current_month_cost = EXCLUDED.current_month_cost,
  budget_amount = EXCLUDED.budget_amount,
  carbon_footprint_kg = EXCLUDED.carbon_footprint_kg,
  optimization_score = EXCLUDED.optimization_score,
  sync_status = EXCLUDED.sync_status,
  updated_at = NOW();

-- Vérification finale
SELECT 
  'Migration completed successfully' as status,
  (SELECT count(*) FROM gcp_projects) as projects_count,
  (SELECT count(*) FROM gcp_services_usage) as services_usage_count,
  (SELECT count(*) FROM gcp_cost_anomalies) as anomalies_count,
  (SELECT count(*) FROM gcp_optimization_recommendations) as recommendations_count,
  (SELECT count(*) FROM gcp_carbon_footprint) as carbon_data_count,
  (SELECT count(*) FROM gcp_audit_log) as audit_logs_count;
