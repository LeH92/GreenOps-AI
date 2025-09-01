#!/usr/bin/env node

/**
 * Script pour tester l'accès aux vraies données GCP
 * Usage: node scripts/test-real-gcp-data.js
 */

const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRealGCPAccess() {
  console.log('🔍 TEST D\'ACCÈS AUX VRAIES DONNÉES GCP\n');
  
  try {
    // 1. Récupérer les tokens OAuth
    console.log('1️⃣ Récupération des tokens OAuth...');
    
    const { data: connection } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted, account_info')
      .eq('connection_status', 'connected')
      .single();
    
    if (!connection) {
      console.log('❌ Aucune connexion GCP active trouvée');
      return;
    }
    
    const tokens = JSON.parse(connection.tokens_encrypted);
    console.log('✅ Tokens OAuth récupérés');
    
    // 2. Configurer le client OAuth
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/auth/gcp/callback'
    );
    
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: new Date(tokens.expires_at).getTime()
    });
    
    console.log('✅ Client OAuth configuré\n');
    
    // 3. Test Cloud Billing API
    console.log('2️⃣ Test Cloud Billing API...');
    try {
      const billing = google.cloudbilling({ version: 'v1', auth: oauth2Client });
      const { data } = await billing.billingAccounts.list();
      
      console.log(`✅ Cloud Billing API accessible`);
      console.log(`📊 ${data.billingAccounts?.length || 0} comptes de facturation trouvés`);
      
      if (data.billingAccounts && data.billingAccounts.length > 0) {
        const account = data.billingAccounts[0];
        console.log(`📋 Premier compte: ${account.displayName} (${account.open ? 'Ouvert' : 'Fermé'})`);
        
        // Test d'accès aux projets liés
        try {
          const projectsResponse = await billing.billingAccounts.projects.list({
            name: account.name
          });
          console.log(`🏗️ ${projectsResponse.data.projectBillingInfo?.length || 0} projets liés`);
        } catch (projectError) {
          console.log('⚠️ Impossible de récupérer les projets liés:', projectError.message);
        }
      }
      
    } catch (billingError) {
      console.log('❌ Cloud Billing API:', billingError.message);
    }
    
    // 4. Test BigQuery Export
    console.log('\n3️⃣ Test BigQuery Export...');
    try {
      const bigquery = google.bigquery({ version: 'v2', auth: oauth2Client });
      
      // Chercher des datasets de facturation
      const { data: datasets } = await bigquery.datasets.list({
        projectId: 'carewash-v3' // Remplacer par votre vrai project ID
      });
      
      console.log(`📊 ${datasets.datasets?.length || 0} datasets BigQuery trouvés`);
      
      const billingDatasets = datasets.datasets?.filter(ds => 
        ds.datasetReference?.datasetId?.includes('billing') ||
        ds.datasetReference?.datasetId?.includes('export')
      ) || [];
      
      if (billingDatasets.length > 0) {
        console.log('✅ Datasets de facturation détectés:');
        billingDatasets.forEach(ds => {
          console.log(`   - ${ds.datasetReference?.datasetId}`);
        });
      } else {
        console.log('⚠️ Aucun dataset de facturation trouvé');
        console.log('💡 Pour activer: https://console.cloud.google.com/billing/export');
      }
      
    } catch (bqError) {
      console.log('❌ BigQuery API:', bqError.message);
    }
    
    // 5. Test Monitoring API
    console.log('\n4️⃣ Test Monitoring API...');
    try {
      const monitoring = google.monitoring({ version: 'v1', auth: oauth2Client });
      
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // 24h
      
      const response = await monitoring.projects.timeSeries.list({
        name: 'projects/carewash-v3', // Remplacer par votre vrai project ID
        filter: 'metric.type="compute.googleapis.com/instance/cpu/utilization"',
        'interval.endTime': endTime.toISOString(),
        'interval.startTime': startTime.toISOString(),
      });
      
      const seriesCount = response.data.timeSeries?.length || 0;
      console.log(`✅ Monitoring API accessible`);
      console.log(`📈 ${seriesCount} séries temporelles trouvées`);
      
      if (seriesCount > 0) {
        console.log('✅ Données de monitoring réelles disponibles');
      } else {
        console.log('⚠️ Aucune donnée de monitoring (normal si pas de ressources actives)');
      }
      
    } catch (monitoringError) {
      console.log('❌ Monitoring API:', monitoringError.message);
    }
    
    // 6. Test Service Usage API
    console.log('\n5️⃣ Test Service Usage API...');
    try {
      const serviceUsage = google.serviceusage({ version: 'v1', auth: oauth2Client });
      
      const response = await serviceUsage.services.list({
        parent: 'projects/carewash-v3', // Remplacer par votre vrai project ID
        filter: 'state:ENABLED'
      });
      
      const enabledServices = response.data.services || [];
      console.log(`✅ Service Usage API accessible`);
      console.log(`🔧 ${enabledServices.length} services activés`);
      
      if (enabledServices.length > 0) {
        console.log('📋 Quelques services activés:');
        enabledServices.slice(0, 5).forEach(service => {
          console.log(`   - ${service.config?.title || service.config?.name}`);
        });
      }
      
    } catch (serviceError) {
      console.log('❌ Service Usage API:', serviceError.message);
    }
    
    console.log('\n📋 RÉSUMÉ:');
    console.log('==========================================');
    console.log('🎯 POUR OBTENIR LES VRAIES DONNÉES:');
    console.log('');
    console.log('1. Si Cloud Billing API fonctionne:');
    console.log('   → Les coûts réels peuvent être récupérés');
    console.log('');
    console.log('2. Si BigQuery Export est configuré:');
    console.log('   → Données détaillées de facturation disponibles');
    console.log('   → Configuration: https://console.cloud.google.com/billing/export');
    console.log('');
    console.log('3. Si Monitoring API a des données:');
    console.log('   → Métriques d\'utilisation réelles disponibles');
    console.log('');
    console.log('4. Actuellement, la synchronisation utilise:');
    console.log('   ✅ Services réels (Service Usage API)');
    console.log('   ❌ Coûts simulés (fallback)');
    console.log('   ❌ Métriques simulées (fallback)');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testRealGCPAccess();

