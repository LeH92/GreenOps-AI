#!/usr/bin/env node

/**
 * Script pour vérifier et créer les tables Supabase nécessaires
 * Usage: node scripts/setup-supabase-tables.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    return !error || error.code !== 'PGRST116'; // PGRST116 = table not found
  } catch (error) {
    return false;
  }
}

async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Diviser le SQL en statements individuels
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📄 Exécution de ${statements.length} statements depuis ${path.basename(filePath)}...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_statement: statement });
          if (error && !error.message.includes('already exists')) {
            console.warn(`⚠️ Avertissement SQL: ${error.message}`);
          }
        } catch (err) {
          // Ignorer certaines erreurs communes lors de la création
          if (!err.message.includes('already exists') && 
              !err.message.includes('does not exist') &&
              !err.message.includes('permission denied')) {
            console.error(`❌ Erreur SQL: ${err.message}`);
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution du fichier SQL: ${error.message}`);
    return false;
  }
}

async function setupTables() {
  console.log('🚀 Vérification et création des tables Supabase...\n');
  
  // Tables à vérifier
  const requiredTables = [
    'gcp_connections',
    'gcp_projects', 
    'gcp_services_usage',
    'gcp_cost_anomalies',
    'gcp_budgets_tracking',
    'gcp_optimization_recommendations',
    'gcp_carbon_footprint'
  ];
  
  // Vérifier les tables existantes
  const existingTables = [];
  const missingTables = [];
  
  for (const table of requiredTables) {
    const exists = await checkTableExists(table);
    if (exists) {
      existingTables.push(table);
      console.log(`✅ Table ${table} existe`);
    } else {
      missingTables.push(table);
      console.log(`❌ Table ${table} manquante`);
    }
  }
  
  console.log(`\n📊 Résumé: ${existingTables.length}/${requiredTables.length} tables trouvées\n`);
  
  if (missingTables.length > 0) {
    console.log('🔨 Création des tables manquantes...\n');
    
    // Exécuter le schéma FinOps complet
    const schemaPath = path.join(__dirname, '../database/gcp-finops-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const success = await executeSQLFile(schemaPath);
      if (success) {
        console.log('✅ Schéma FinOps créé avec succès');
      } else {
        console.log('⚠️ Certaines erreurs lors de la création du schéma (normal si les tables existent déjà)');
      }
    } else {
      console.error(`❌ Fichier de schéma non trouvé: ${schemaPath}`);
    }
    
    // Vérifier à nouveau après création
    console.log('\n🔍 Vérification post-création...');
    for (const table of missingTables) {
      const exists = await checkTableExists(table);
      if (exists) {
        console.log(`✅ Table ${table} créée avec succès`);
      } else {
        console.log(`❌ Échec de création de la table ${table}`);
      }
    }
  }
  
  // Test d'insertion simple
  console.log('\n🧪 Test d\'insertion de données...');
  try {
    const testData = {
      user_id: 'test@example.com',
      project_id: 'test-project',
      project_name: 'Test Project',
      current_month_cost: 123.45,
      carbon_footprint_kg: 5.67,
      optimization_score: 85,
      sync_status: 'completed'
    };
    
    const { error } = await supabase
      .from('gcp_projects')
      .upsert(testData, { onConflict: 'user_id,project_id' });
    
    if (error) {
      console.log(`⚠️ Test d'insertion: ${error.message}`);
    } else {
      console.log('✅ Test d\'insertion réussi');
      
      // Nettoyer le test
      await supabase
        .from('gcp_projects')
        .delete()
        .eq('user_id', 'test@example.com')
        .eq('project_id', 'test-project');
    }
  } catch (error) {
    console.log(`⚠️ Test d'insertion échoué: ${error.message}`);
  }
  
  console.log('\n🎉 Configuration Supabase terminée !');
  console.log('\n📝 Tables disponibles pour les données GCP:');
  requiredTables.forEach(table => {
    console.log(`   - ${table}`);
  });
  
  console.log('\n💡 Prochaines étapes:');
  console.log('   1. Testez la synchronisation depuis le wizard GCP');
  console.log('   2. Vérifiez les données dans l\'interface Supabase');
  console.log('   3. Consultez les métriques dans le dashboard FinOps');
}

// Exécuter le script
setupTables().catch(error => {
  console.error('❌ Erreur lors de la configuration:', error);
  process.exit(1);
});
