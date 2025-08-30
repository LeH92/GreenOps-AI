#!/usr/bin/env node

/**
 * Script pour nettoyer les anciennes données et régénérer des montants réalistes
 * Usage: node scripts/reset-realistic-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetData() {
  console.log('🧹 Nettoyage des anciennes données...\n');
  
  try {
    // Supprimer les données de services avec des montants irréalistes
    const { data: oldData, error: selectError } = await supabase
      .from('gcp_services_usage')
      .select('*');
    
    if (selectError) {
      console.error('❌ Erreur lors de la lecture:', selectError.message);
      return;
    }
    
    console.log(`📊 Trouvé ${oldData.length} enregistrements`);
    
    // Analyser les montants actuels
    const totalCost = oldData.reduce((sum, item) => sum + parseFloat(item.cost_amount || 0), 0);
    console.log(`💰 Coût total actuel: $${totalCost.toFixed(2)}`);
    
    if (totalCost > 1000) {
      console.log('⚠️ Montants trop élevés détectés - nettoyage nécessaire');
      
      // Supprimer les données existantes
      const { error: deleteError } = await supabase
        .from('gcp_services_usage')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprimer tout
      
      if (deleteError) {
        console.error('❌ Erreur lors de la suppression:', deleteError.message);
        return;
      }
      
      console.log('✅ Anciennes données supprimées');
      
      // Supprimer aussi les recommandations basées sur les anciens montants
      await supabase
        .from('gcp_optimization_recommendations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      console.log('✅ Anciennes recommandations supprimées');
      
      // Réinitialiser le projet
      await supabase
        .from('gcp_projects')
        .update({
          current_month_cost: 0,
          carbon_footprint_kg: 0,
          cost_optimization_potential: 0,
          optimization_recommendations: [],
          sync_status: 'pending'
        })
        .eq('project_id', 'carewash-v3');
      
      console.log('✅ Projet réinitialisé');
      
    } else {
      console.log('✅ Les montants semblent déjà réalistes');
    }
    
    console.log('\n🎯 Prochaines étapes:');
    console.log('1. Relancez la synchronisation depuis le wizard GCP');
    console.log('2. Les nouveaux montants devraient être plus réalistes ($50-200/mois)');
    console.log('3. Vérifiez avec: node scripts/show-kpis.js');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

async function showCurrentTotals() {
  console.log('📊 MONTANTS ACTUELS\n' + '='.repeat(40));
  
  const { data: services } = await supabase
    .from('gcp_services_usage')
    .select('cost_amount, carbon_footprint_grams, service_category');
  
  if (!services || services.length === 0) {
    console.log('📭 Aucune donnée trouvée');
    return;
  }
  
  const totalCost = services.reduce((sum, item) => sum + parseFloat(item.cost_amount || 0), 0);
  const totalCarbon = services.reduce((sum, item) => sum + parseFloat(item.carbon_footprint_grams || 0), 0);
  
  console.log(`💰 Coût total: $${totalCost.toFixed(2)}`);
  console.log(`🌱 Carbone total: ${(totalCarbon / 1000).toFixed(2)} kg CO2`);
  console.log(`📊 Nombre de services: ${services.length}`);
  
  // Grouper par catégorie
  const byCategory = services.reduce((acc, service) => {
    const cat = service.service_category || 'other';
    if (!acc[cat]) acc[cat] = { cost: 0, count: 0 };
    acc[cat].cost += parseFloat(service.cost_amount || 0);
    acc[cat].count += 1;
    return acc;
  }, {});
  
  console.log('\n📦 Par catégorie:');
  for (const [category, totals] of Object.entries(byCategory)) {
    console.log(`   ${category}: $${totals.cost.toFixed(2)} (${totals.count} services)`);
  }
  
  if (totalCost > 500) {
    console.log('\n⚠️ ATTENTION: Montants trop élevés pour un projet de développement');
    console.log('💡 Recommandation: Exécutez le nettoyage avec --clean');
  } else if (totalCost < 10) {
    console.log('\n✅ Montants réalistes pour un projet de développement');
  } else {
    console.log('\n📈 Montants dans une fourchette acceptable');
  }
}

async function main() {
  const shouldClean = process.argv.includes('--clean');
  
  if (shouldClean) {
    await resetData();
  } else {
    await showCurrentTotals();
    console.log('\n💡 Pour nettoyer les données: node scripts/reset-realistic-data.js --clean');
  }
}

main().catch(console.error);
