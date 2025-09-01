import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GCPDataFetcher } from '@/services/GCPDataFetcher';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SyncRequest {
  selectedProjects: string[];
  billingAccountId: string;
}

interface BillingDataPoint {
  projectId: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  costAmount: number;
  currency: string;
  usageAmount: number;
  usageUnit: string;
  billingPeriod: string;
  location: string;
  region: string;
  skuId: string;
  skuDescription: string;
  carbonFootprintGrams: number;
  labels: any;
}

/**
 * POST /api/gcp/sync-billing-data
 * Synchronise les données de facturation pour les projets sélectionnés
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required. Please sign in first.' }, 
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier le token Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication failed. Please sign in again.' }, 
        { status: 401 }
      );
    }

    // Récupérer les données de la requête
    const { selectedProjects, billingAccountId }: SyncRequest = await request.json();

    if (!selectedProjects || selectedProjects.length === 0) {
      return NextResponse.json(
        { error: 'No projects selected for synchronization' }, 
        { status: 400 }
      );
    }

    console.log(`🔄 Starting billing data sync for user ${user.email}, ${selectedProjects.length} projects`);

    // Récupérer la connexion GCP
    const { data: connection, error: connectionError } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted, account_info')
      .eq('user_id', user.email)
      .eq('connection_status', 'connected')
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'No active GCP connection found. Please reconnect to Google Cloud.' }, 
        { status: 404 }
      );
    }

    // Initialiser le data fetcher
    const dataFetcher = new GCPDataFetcher(connection.tokens_encrypted);
    
    // Récupérer les tokens pour les appels API directs
    const tokens = JSON.parse(connection.tokens_encrypted);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/auth/gcp/callback'
    );

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expires_at ? new Date(tokens.expires_at).getTime() : Date.now() + 3600000,
    });

    const syncResults = {
      projectsProcessed: 0,
      servicesAnalyzed: 0,
      billingRecordsCreated: 0,
      carbonDataPoints: 0,
      anomaliesDetected: 0,
      recommendationsGenerated: 0,
      errors: [] as string[]
    };

    // Traiter chaque projet sélectionné
    for (const projectId of selectedProjects) {
      try {
        console.log(`📊 Processing project: ${projectId}`);

        // 1. Récupérer les données de facturation détaillées
        const billingData = await fetchDetailedBillingData(oauth2Client, projectId, billingAccountId);
        
        // 2. Analyser l'utilisation des services
        const serviceUsage = await analyzeServiceUsage(oauth2Client, projectId);
        
        // 3. Calculer l'empreinte carbone
        const carbonData = await calculateCarbonFootprint(billingData, serviceUsage);
        
        // 4. Détecter les anomalies de coût
        const anomalies = await detectCostAnomalies(billingData, projectId);
        
        // 5. Générer des recommandations d'optimisation
        const recommendations = await generateOptimizationRecommendations(billingData, serviceUsage, projectId);

        // 6. Stocker tout dans Supabase
        await storeBillingData(user.email, projectId, billingData, serviceUsage, carbonData, anomalies, recommendations);

        syncResults.projectsProcessed++;
        syncResults.servicesAnalyzed += serviceUsage.length;
        syncResults.billingRecordsCreated += billingData.length;
        syncResults.carbonDataPoints += carbonData.length;
        syncResults.anomaliesDetected += anomalies.length;
        syncResults.recommendationsGenerated += recommendations.length;

        console.log(`✅ Completed processing for project ${projectId}`);

      } catch (projectError: any) {
        console.error(`❌ Error processing project ${projectId}:`, projectError);
        syncResults.errors.push(`Project ${projectId}: ${projectError.message}`);
      }
    }

    // Mettre à jour le statut des projets
    await updateProjectSyncStatus(user.email, selectedProjects, 'completed');

    console.log(`🎉 Billing data sync completed:`, syncResults);

    return NextResponse.json({
      success: true,
      message: 'Billing data synchronization completed',
      results: syncResults,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Billing sync error:', error);
    return NextResponse.json(
      { error: 'Billing data synchronization failed', details: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Récupère les données de facturation détaillées via BigQuery
 */
async function fetchDetailedBillingData(oauth2Client: any, projectId: string, billingAccountId: string): Promise<BillingDataPoint[]> {
  const bigquery = google.bigquery({ version: 'v2', auth: oauth2Client });
  
  // Période : 3 derniers mois
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);

  const query = `
    SELECT 
      project.id as project_id,
      service.id as service_id,
      service.description as service_name,
      CASE 
        WHEN service.description LIKE '%Compute%' THEN 'compute'
        WHEN service.description LIKE '%Storage%' THEN 'storage'
        WHEN service.description LIKE '%Network%' THEN 'networking'
        WHEN service.description LIKE '%BigQuery%' THEN 'analytics'
        WHEN service.description LIKE '%AI%' OR service.description LIKE '%ML%' THEN 'ai-ml'
        ELSE 'other'
      END as service_category,
      SUM(cost) as cost_amount,
      currency,
      SUM(usage.amount) as usage_amount,
      usage.unit as usage_unit,
      DATE(_PARTITIONTIME) as billing_period,
      location.location as location,
      location.region as region,
      sku.id as sku_id,
      sku.description as sku_description,
      labels,
      -- Estimation empreinte carbone (à affiner selon les régions)
      CASE 
        WHEN location.region LIKE '%europe%' THEN SUM(cost) * 0.3 -- Europe: plus d'énergies renouvelables
        WHEN location.region LIKE '%us-central%' THEN SUM(cost) * 0.5 -- US Central: mix énergétique
        ELSE SUM(cost) * 0.7 -- Autres régions: estimation conservatrice
      END as carbon_footprint_grams
    FROM \`${billingAccountId.replace('billingAccounts/', '')}.gcp_billing_export_v1_${billingAccountId.replace('billingAccounts/', '').replace(/-/g, '_')}\`
    WHERE project.id = '${projectId}'
      AND _PARTITIONTIME >= TIMESTAMP('${startDate.toISOString().split('T')[0]}')
      AND _PARTITIONTIME <= TIMESTAMP('${endDate.toISOString().split('T')[0]}')
      AND cost > 0
    GROUP BY 
      project_id, service_id, service_name, service_category, currency, 
      usage_unit, billing_period, location, region, sku_id, sku_description, labels
    ORDER BY cost_amount DESC
    LIMIT 1000
  `;

  try {
    const { data } = await bigquery.jobs.query({
      requestBody: {
        query,
        useLegacySql: false,
      },
    });

    const billingData: BillingDataPoint[] = [];

    if (data.rows) {
      for (const row of data.rows) {
        const fields = row.f?.map(f => f.v) || [];
        billingData.push({
          projectId: fields[0] || projectId,
          serviceId: fields[1] || '',
          serviceName: fields[2] || '',
          serviceCategory: fields[3] || 'other',
          costAmount: parseFloat(fields[4] || '0'),
          currency: fields[5] || 'USD',
          usageAmount: parseFloat(fields[6] || '0'),
          usageUnit: fields[7] || '',
          billingPeriod: fields[8] || new Date().toISOString().split('T')[0],
          location: fields[9] || '',
          region: fields[10] || '',
          skuId: fields[11] || '',
          skuDescription: fields[12] || '',
          carbonFootprintGrams: parseFloat(fields[14] || '0'),
          labels: fields[13] ? JSON.parse(fields[13]) : {}
        });
      }
    }

    return billingData;
  } catch (error) {
    console.warn(`⚠️ BigQuery billing data not available for project ${projectId}, using fallback`);
    return [];
  }
}

/**
 * Analyse l'utilisation des services via l'API Monitoring
 */
async function analyzeServiceUsage(oauth2Client: any, projectId: string): Promise<any[]> {
  try {
    const monitoring = google.monitoring({ version: 'v1', auth: oauth2Client });
    
    // Récupérer les métriques d'utilisation des ressources
    const metricsQueries = [
      'compute.googleapis.com/instance/cpu/utilization',
      'compute.googleapis.com/instance/memory/utilization',
      'storage.googleapis.com/storage/total_bytes'
    ];

    const serviceUsage = [];
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Dernières 24h

    for (const metric of metricsQueries) {
      try {
        const response = await monitoring.projects.timeSeries.list({
          name: `projects/${projectId}`,
          filter: `metric.type="${metric}"`,
          'interval.endTime': endTime.toISOString(),
          'interval.startTime': startTime.toISOString(),
        });

        if (response.data.timeSeries) {
          for (const series of response.data.timeSeries) {
            serviceUsage.push({
              metric: metric,
              resource: series.resource,
              values: series.points || [],
              labels: series.metric?.labels || {}
            });
          }
        }
      } catch (metricError) {
        console.warn(`⚠️ Could not fetch metric ${metric} for project ${projectId}`);
      }
    }

    return serviceUsage;
  } catch (error) {
    console.warn(`⚠️ Monitoring API not available for project ${projectId}`);
    return [];
  }
}

/**
 * Calcule l'empreinte carbone basée sur les données de facturation et d'utilisation
 */
async function calculateCarbonFootprint(billingData: BillingDataPoint[], serviceUsage: any[]): Promise<any[]> {
  const carbonData = [];
  
  // Facteurs d'émission par région (kg CO2 par kWh)
  const carbonIntensity: { [key: string]: number } = {
    'europe-west1': 0.35,  // Belgique - mix énergétique avec renouvelables
    'europe-west3': 0.40,  // Allemagne
    'us-central1': 0.45,   // Iowa - éolien important
    'us-east1': 0.50,      // Caroline du Sud
    'us-west1': 0.25,      // Oregon - hydroélectrique
    'asia-southeast1': 0.60, // Singapour
    'default': 0.50        // Moyenne mondiale
  };

  // Grouper par région et période
  const regionPeriodMap = new Map();

  for (const dataPoint of billingData) {
    const key = `${dataPoint.region}-${dataPoint.billingPeriod}`;
    if (!regionPeriodMap.has(key)) {
      regionPeriodMap.set(key, {
        region: dataPoint.region,
        period: dataPoint.billingPeriod,
        totalCost: 0,
        totalEmissions: 0,
        services: []
      });
    }

    const regionData = regionPeriodMap.get(key);
    regionData.totalCost += dataPoint.costAmount;
    regionData.totalEmissions += dataPoint.carbonFootprintGrams / 1000; // Conversion en kg
    regionData.services.push({
      serviceName: dataPoint.serviceName,
      cost: dataPoint.costAmount,
      emissions: dataPoint.carbonFootprintGrams / 1000
    });
  }

  // Convertir en format pour la base de données
  for (const [key, data] of regionPeriodMap.entries()) {
    const intensity = carbonIntensity[data.region] || carbonIntensity['default'];
    
    carbonData.push({
      region: data.region,
      measurementPeriod: data.period,
      totalEmissionsKg: data.totalEmissions,
      carbonIntensity: intensity,
      emissionsByService: data.services.reduce((acc: any, service: any) => {
        acc[service.serviceName] = service.emissions;
        return acc;
      }, {}),
      renewablePercentage: calculateRenewablePercentage(data.region),
      efficiencyScore: calculateEfficiencyScore(data.totalCost, data.totalEmissions)
    });
  }

  return carbonData;
}

/**
 * Détecte les anomalies de coût
 */
async function detectCostAnomalies(billingData: BillingDataPoint[], projectId: string): Promise<any[]> {
  const anomalies = [];
  
  // Grouper par service et analyser les tendances
  const serviceMap = new Map();
  
  for (const dataPoint of billingData) {
    if (!serviceMap.has(dataPoint.serviceName)) {
      serviceMap.set(dataPoint.serviceName, []);
    }
    serviceMap.get(dataPoint.serviceName).push(dataPoint);
  }

  for (const [serviceName, dataPoints] of serviceMap.entries()) {
    const costs = dataPoints.map((dp: BillingDataPoint) => dp.costAmount).sort((a, b) => a - b);
    
    if (costs.length >= 3) {
      const median = costs[Math.floor(costs.length / 2)];
      const q1 = costs[Math.floor(costs.length / 4)];
      const q3 = costs[Math.floor(costs.length * 3 / 4)];
      const iqr = q3 - q1;
      
      // Détecter les outliers (méthode IQR)
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      for (const dataPoint of dataPoints) {
        if (dataPoint.costAmount < lowerBound || dataPoint.costAmount > upperBound) {
          anomalies.push({
            projectId,
            anomalyType: dataPoint.costAmount > upperBound ? 'spike' : 'drop',
            severity: dataPoint.costAmount > upperBound * 2 ? 'critical' : 'medium',
            affectedService: serviceName,
            actualCost: dataPoint.costAmount,
            expectedCost: median,
            varianceAmount: dataPoint.costAmount - median,
            variancePercent: ((dataPoint.costAmount - median) / median) * 100,
            detectedAt: new Date(),
            period: dataPoint.billingPeriod
          });
        }
      }
    }
  }

  return anomalies;
}

/**
 * Génère des recommandations d'optimisation
 */
async function generateOptimizationRecommendations(billingData: BillingDataPoint[], serviceUsage: any[], projectId: string): Promise<any[]> {
  const recommendations = [];

  // 1. Analyse des coûts par service pour identifier les plus gros postes
  const serviceCosts = billingData.reduce((acc, dataPoint) => {
    acc[dataPoint.serviceName] = (acc[dataPoint.serviceName] || 0) + dataPoint.costAmount;
    return acc;
  }, {} as { [key: string]: number });

  const sortedServices = Object.entries(serviceCosts).sort(([,a], [,b]) => b - a);

  // 2. Recommandations basées sur les coûts élevés
  for (const [serviceName, cost] of sortedServices.slice(0, 5)) {
    if (cost > 100) { // Seuil arbitraire pour les services coûteux
      recommendations.push({
        projectId,
        recommendationType: 'cost_optimization',
        category: 'cost',
        priority: cost > 500 ? 'high' : 'medium',
        title: `Optimiser les coûts de ${serviceName}`,
        description: `Le service ${serviceName} représente $${cost.toFixed(2)} de vos coûts mensuels. Analysez l'utilisation pour identifier des opportunités d'économies.`,
        potentialMonthlySavings: cost * 0.15, // Estimation 15% d'économies potentielles
        implementationEffort: 'medium',
        affectedService: serviceName,
        status: 'new'
      });
    }
  }

  // 3. Recommandations environnementales
  const totalEmissions = billingData.reduce((sum, dp) => sum + dp.carbonFootprintGrams, 0) / 1000;
  if (totalEmissions > 10) { // Plus de 10 kg CO2
    recommendations.push({
      projectId,
      recommendationType: 'sustainability',
      category: 'sustainability',
      priority: 'medium',
      title: 'Réduire l\'empreinte carbone',
      description: `Votre projet génère ${totalEmissions.toFixed(2)} kg CO2 par mois. Considérez migrer vers des régions avec plus d'énergies renouvelables.`,
      carbonReductionKg: totalEmissions * 0.3,
      implementationEffort: 'low',
      status: 'new'
    });
  }

  // 4. Recommandations basées sur l'utilisation des ressources
  for (const usage of serviceUsage) {
    if (usage.metric.includes('cpu/utilization')) {
      const avgUtilization = calculateAverageUtilization(usage.values);
      if (avgUtilization < 20) { // CPU sous-utilisé
        recommendations.push({
          projectId,
          recommendationType: 'rightsizing',
          category: 'performance',
          priority: 'medium',
          title: 'Redimensionner les instances sous-utilisées',
          description: `Des instances ont une utilisation CPU moyenne de ${avgUtilization.toFixed(1)}%. Considérez un redimensionnement.`,
          potentialMonthlySavings: 50, // Estimation
          implementationEffort: 'low',
          affectedResourceType: 'compute_instance',
          status: 'new'
        });
      }
    }
  }

  return recommendations;
}

/**
 * Stocke toutes les données dans Supabase
 */
async function storeBillingData(
  userId: string, 
  projectId: string, 
  billingData: BillingDataPoint[], 
  serviceUsage: any[], 
  carbonData: any[], 
  anomalies: any[], 
  recommendations: any[]
) {
  // 1. Stocker les données d'utilisation des services
  if (billingData.length > 0) {
    const serviceUsageRecords = billingData.map(dp => ({
      user_id: userId,
      project_id: projectId,
      service_id: dp.serviceId,
      service_name: dp.serviceName,
      service_category: dp.serviceCategory,
      billing_period: dp.billingPeriod,
      cost_amount: dp.costAmount,
      currency: dp.currency,
      usage_amount: dp.usageAmount,
      usage_unit: dp.usageUnit,
      location: dp.location,
      region: dp.region,
      sku_id: dp.skuId,
      sku_description: dp.skuDescription,
      carbon_footprint_grams: dp.carbonFootprintGrams,
      labels: dp.labels
    }));

    await supabase.from('gcp_services_usage').upsert(serviceUsageRecords, {
      onConflict: 'user_id,project_id,service_id,billing_period,sku_id'
    });
  }

  // 2. Stocker les données carbone
  if (carbonData.length > 0) {
    const carbonRecords = carbonData.map(cd => ({
      user_id: userId,
      project_id: projectId,
      measurement_period: cd.measurementPeriod,
      region: cd.region,
      total_emissions_kg: cd.totalEmissionsKg,
      emissions_by_service: cd.emissionsByService,
      carbon_intensity_g_per_kwh: cd.carbonIntensity * 1000,
      renewable_percentage: cd.renewablePercentage,
      efficiency_score: cd.efficiencyScore
    }));

    await supabase.from('gcp_carbon_footprint').upsert(carbonRecords, {
      onConflict: 'user_id,project_id,measurement_period,region'
    });
  }

  // 3. Stocker les anomalies
  if (anomalies.length > 0) {
    const anomalyRecords = anomalies.map(a => ({
      user_id: userId,
      project_id: projectId,
      anomaly_type: a.anomalyType,
      severity: a.severity,
      period_start: a.period,
      period_end: a.period,
      expected_cost: a.expectedCost,
      actual_cost: a.actualCost,
      variance_amount: a.varianceAmount,
      variance_percent: a.variancePercent,
      affected_services: [a.affectedService]
    }));

    await supabase.from('gcp_cost_anomalies').insert(anomalyRecords);
  }

  // 4. Stocker les recommandations
  if (recommendations.length > 0) {
    const recommendationRecords = recommendations.map(r => ({
      user_id: userId,
      project_id: projectId,
      recommendation_type: r.recommendationType,
      category: r.category,
      priority: r.priority,
      title: r.title,
      description: r.description,
      potential_monthly_savings: r.potentialMonthlySavings || 0,
      implementation_effort: r.implementationEffort,
      affected_service: r.affectedService,
      affected_resource_type: r.affectedResourceType,
      carbon_reduction_kg: r.carbonReductionKg || 0,
      status: r.status
    }));

    await supabase.from('gcp_optimization_recommendations').insert(recommendationRecords);
  }

  // 5. Mettre à jour les métriques du projet
  const totalCost = billingData.reduce((sum, dp) => sum + dp.costAmount, 0);
  const totalCarbon = carbonData.reduce((sum, cd) => sum + cd.totalEmissionsKg, 0);
  const potentialSavings = recommendations.reduce((sum, r) => sum + (r.potentialMonthlySavings || 0), 0);

  await supabase.from('gcp_projects').upsert({
    user_id: userId,
    project_id: projectId,
    current_month_cost: totalCost,
    carbon_footprint_kg: totalCarbon,
    cost_optimization_potential: potentialSavings,
    optimization_recommendations: recommendations.slice(0, 5), // Top 5 recommandations
    last_sync: new Date().toISOString(),
    sync_status: 'completed'
  }, {
    onConflict: 'user_id,project_id'
  });
}

/**
 * Met à jour le statut de synchronisation des projets
 */
async function updateProjectSyncStatus(userId: string, projectIds: string[], status: string) {
  for (const projectId of projectIds) {
    await supabase.from('gcp_projects').upsert({
      user_id: userId,
      project_id: projectId,
      sync_status: status,
      last_sync: new Date().toISOString()
    }, {
      onConflict: 'user_id,project_id'
    });
  }
}

/**
 * Fonctions utilitaires
 */
function calculateRenewablePercentage(region: string): number {
  const renewableRatios: { [key: string]: number } = {
    'europe-west1': 85, // Belgique
    'europe-west3': 60, // Allemagne
    'us-central1': 70,  // Iowa
    'us-west1': 90,     // Oregon
    'default': 50       // Moyenne
  };
  return renewableRatios[region] || renewableRatios['default'];
}

function calculateEfficiencyScore(cost: number, emissions: number): number {
  // Score d'efficacité basé sur le ratio coût/émissions
  if (emissions === 0) return 100;
  const ratio = cost / emissions;
  return Math.min(100, Math.max(0, ratio * 10)); // Score arbitraire
}

function calculateAverageUtilization(values: any[]): number {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, point) => acc + (point.value?.doubleValue || 0), 0);
  return (sum / values.length) * 100;
}

