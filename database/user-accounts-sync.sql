-- =====================================================
-- TABLE: user_accounts_sync
-- Suivi de la synchronisation des comptes utilisateurs
-- =====================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table principale pour le suivi des comptes utilisateurs
CREATE TABLE IF NOT EXISTS user_accounts_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identifiant de l'utilisateur (email Supabase)
  user_email TEXT NOT NULL,
  
  -- Type de compte (gcp, aws, azure, etc.)
  account_type TEXT NOT NULL,
  
  -- Statut de la synchronisation
  sync_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'syncing', 'completed', 'failed', 'disabled'
  
  -- Informations du compte
  account_info JSONB NOT NULL DEFAULT '{}', -- Détails du compte (nom, ID, etc.)
  
  -- Données synchronisées
  synced_data JSONB DEFAULT '{}', -- Projets, comptes de facturation, coûts, etc.
  
  -- Métadonnées de synchronisation
  last_sync_attempt TIMESTAMP WITH TIME ZONE,
  last_successful_sync TIMESTAMP WITH TIME ZONE,
  sync_error_message TEXT,
  sync_retry_count INTEGER DEFAULT 0,
  
  -- Configuration de synchronisation
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_hours INTEGER DEFAULT 24, -- Fréquence en heures
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(user_email, account_type)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_accounts_sync_user_email ON user_accounts_sync(user_email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_sync_status ON user_accounts_sync(sync_status);
CREATE INDEX IF NOT EXISTS idx_user_accounts_sync_type ON user_accounts_sync(account_type);
CREATE INDEX IF NOT EXISTS idx_user_accounts_sync_last_sync ON user_accounts_sync(last_successful_sync);

-- RLS (Row Level Security)
ALTER TABLE user_accounts_sync ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres comptes
CREATE POLICY "Users can view their own account sync status" ON user_accounts_sync
  FOR SELECT USING (auth.email() = user_email);

-- Politique : Les utilisateurs peuvent modifier leurs propres comptes
CREATE POLICY "Users can update their own account sync status" ON user_accounts_sync
  FOR UPDATE USING (auth.email() = user_email);

-- Politique : Les utilisateurs peuvent insérer leurs propres comptes
CREATE POLICY "Users can insert their own account sync status" ON user_accounts_sync
  FOR INSERT WITH CHECK (auth.email() = user_email);

-- Politique : Les utilisateurs peuvent supprimer leurs propres comptes
CREATE POLICY "Users can delete their own account sync status" ON user_accounts_sync
  FOR DELETE USING (auth.email() = user_email);

-- =====================================================
-- TABLE: user_sync_logs
-- Journal des tentatives de synchronisation
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Référence vers user_accounts_sync
  user_account_sync_id UUID REFERENCES user_accounts_sync(id) ON DELETE CASCADE,
  
  -- Détails de la synchronisation
  sync_operation TEXT NOT NULL, -- 'initial', 'refresh', 'error_recovery'
  sync_result TEXT NOT NULL, -- 'success', 'partial', 'failed'
  
  -- Données de la synchronisation
  projects_count INTEGER DEFAULT 0,
  billing_accounts_count INTEGER DEFAULT 0,
  cost_data_count INTEGER DEFAULT 0,
  
  -- Détails de l'erreur si échec
  error_message TEXT,
  error_details JSONB,
  
  -- Métadonnées
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER, -- Durée en millisecondes
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les logs
CREATE INDEX IF NOT EXISTS idx_user_sync_logs_account_id ON user_sync_logs(user_account_sync_id);
CREATE INDEX IF NOT EXISTS idx_user_sync_logs_created_at ON user_sync_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sync_logs_result ON user_sync_logs(sync_result);

-- RLS pour les logs
ALTER TABLE user_sync_logs ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres logs
CREATE POLICY "Users can view their own sync logs" ON user_sync_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_accounts_sync 
      WHERE id = user_sync_logs.user_account_sync_id 
      AND user_email = auth.email()
    )
  );

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_user_accounts_sync_updated_at 
  BEFORE UPDATE ON user_accounts_sync 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONNÉES DE TEST (optionnel)
-- =====================================================

-- Insérer des données de test pour le développement
-- (à supprimer en production)
INSERT INTO user_accounts_sync (user_email, account_type, sync_status, account_info) 
VALUES 
  ('test@example.com', 'gcp', 'pending', '{"name": "Test GCP Account", "projectId": "test-project-123"}'),
  ('test@example.com', 'aws', 'completed', '{"name": "Test AWS Account", "accountId": "123456789012"}'),
  ('test@example.com', 'azure', 'failed', '{"name": "Test Azure Account", "subscriptionId": "azure-sub-123"}')
ON CONFLICT (user_email, account_type) DO NOTHING;

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue pour le statut global de synchronisation d'un utilisateur
CREATE OR REPLACE VIEW user_sync_overview AS
SELECT 
  user_email,
  account_type,
  sync_status,
  last_successful_sync,
  sync_error_message,
  auto_sync_enabled,
  CASE 
    WHEN sync_status = 'completed' THEN '✅ Synchronisé'
    WHEN sync_status = 'syncing' THEN '🔄 En cours'
    WHEN sync_status = 'failed' THEN '❌ Échec'
    WHEN sync_status = 'pending' THEN '⏳ En attente'
    ELSE '❓ Inconnu'
  END as status_display,
  CASE 
    WHEN last_successful_sync IS NULL THEN 'Jamais'
    WHEN last_successful_sync > NOW() - INTERVAL '1 hour' THEN 'Il y a moins d''1h'''
    WHEN last_successful_sync > NOW() - INTERVAL '1 day' THEN 'Il y a moins d''1j'''
    ELSE 'Il y a plus d''1j'''
  END as last_sync_display
FROM user_accounts_sync
ORDER BY user_email, account_type;

-- =====================================================
-- COMMENTAIRES
-- =====================================================

COMMENT ON TABLE user_accounts_sync IS 'Suivi de la synchronisation des comptes utilisateurs avec les fournisseurs cloud';
COMMENT ON TABLE user_sync_logs IS 'Journal détaillé des tentatives de synchronisation';
COMMENT ON VIEW user_sync_overview IS 'Vue d''ensemble du statut de synchronisation des utilisateurs';

COMMENT ON COLUMN user_accounts_sync.sync_status IS 'Statut de la synchronisation: pending, syncing, completed, failed, disabled';
COMMENT ON COLUMN user_accounts_sync.account_info IS 'Informations du compte (nom, ID, métadonnées)';
COMMENT ON COLUMN user_accounts_sync.synced_data IS 'Données synchronisées (projets, coûts, etc.)';
COMMENT ON COLUMN user_accounts_sync.sync_frequency_hours IS 'Fréquence de synchronisation automatique en heures';
