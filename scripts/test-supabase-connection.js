#!/usr/bin/env node

/**
 * Script pour tester la connexion Supabase et vérifier les tables
 * Usage: node scripts/test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Test de connexion Supabase...\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ OK' : '❌ Manquant');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ OK' : '❌ Manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('📡 Test de connexion de base...');
    const { data, error } = await supabase.from('gcp_connections').select('*').limit(1);
    
    if (error) {
      console.log('⚠️ Table gcp_connections:', error.message);
    } else {
      console.log('✅ Connexion Supabase OK');
      console.log(`📊 Table gcp_connections: ${data.length} enregistrement(s)`);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  }
  
  return true;
}

async function checkTables() {
  const tables = [
    'gcp_connections',
    'gcp_projects',
    'gcp_services_usage',
    'gcp_cost_anomalies',
    'gcp_optimization_recommendations',
    'gcp_carbon_footprint'
  ];
  
  console.log('\n🔍 Vérification des tables...');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ Table ${table}: N'existe pas`);
        } else {
          console.log(`⚠️ Table ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ Table ${table}: OK (${data.length} enregistrement(s) de test)`);
      }
    } catch (err) {
      console.log(`❌ Table ${table}: Erreur - ${err.message}`);
    }
  }
}

async function testDataInsertion() {
  console.log('\n🧪 Test d\'insertion de données...');
  
  const testProject = {
    user_id: 'test-user@example.com',
    project_id: 'test-project-123',
    project_name: 'Test Project',
    current_month_cost: 123.45,
    carbon_footprint_kg: 5.67,
    optimization_score: 85,
    sync_status: 'completed'
  };
  
  try {
    // Test d'insertion dans gcp_projects
    const { data, error } = await supabase
      .from('gcp_projects')
      .upsert(testProject, { onConflict: 'user_id,project_id' })
      .select();
    
    if (error) {
      console.log('❌ Test d\'insertion échoué:', error.message);
      return false;
    }
    
    console.log('✅ Test d\'insertion réussi');
    console.log('📄 Données insérées:', data);
    
    // Nettoyer le test
    await supabase
      .from('gcp_projects')
      .delete()
      .eq('user_id', 'test-user@example.com')
      .eq('project_id', 'test-project-123');
    
    console.log('🧹 Données de test nettoyées');
    return true;
    
  } catch (error) {
    console.log('❌ Erreur lors du test d\'insertion:', error.message);
    return false;
  }
}

async function checkExistingData() {
  console.log('\n📊 Vérification des données existantes...');
  
  const tables = [
    'gcp_connections',
    'gcp_projects', 
    'gcp_services_usage',
    'gcp_cost_anomalies',
    'gcp_optimization_recommendations',
    'gcp_carbon_footprint'
  ];
  
  let totalRecords = 0;
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`📋 ${table}: ${count || 0} enregistrement(s)`);
        totalRecords += count || 0;
      } else {
        console.log(`⚠️ ${table}: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Erreur - ${err.message}`);
    }
  }
  
  console.log(`\n📈 Total: ${totalRecords} enregistrement(s) dans toutes les tables`);
  
  if (totalRecords === 0) {
    console.log('\n💡 Suggestions:');
    console.log('   1. Exécutez le schéma SQL dans Supabase');
    console.log('   2. Testez la synchronisation depuis le wizard GCP');
    console.log('   3. Vérifiez les logs du serveur pour les erreurs');
  }
}

async function main() {
  console.log('🚀 Diagnostic complet Supabase GreenOps\n');
  
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Impossible de continuer sans connexion Supabase');
    process.exit(1);
  }
  
  await checkTables();
  
  const canInsert = await testDataInsertion();
  if (canInsert) {
    await checkExistingData();
  }
  
  console.log('\n🎉 Diagnostic terminé !');
  console.log('\n📋 Résumé:');
  console.log('   - Connexion Supabase: ✅');
  console.log('   - Tables créées: Vérifiez ci-dessus');
  console.log('   - Insertion possible: ' + (canInsert ? '✅' : '❌'));
  
  console.log('\n🔧 Prochaines étapes:');
  console.log('   1. Si des tables manquent, exécutez gcp-finops-schema-safe.sql');
  console.log('   2. Testez la synchronisation depuis le wizard');
  console.log('   3. Consultez les logs du serveur (terminal Next.js)');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

