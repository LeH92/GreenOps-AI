import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/gcp/sync-cost-anomalies
 * Détecte et synchronise les anomalies de coût intelligemment
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚨 Detecting and syncing cost anomalies...');
    
    const userEmail = 'hlamyne@gmail.com';
    const TOTAL_MONTHLY_COST = 6.79;
    
    // Récupérer les données existantes pour analyse
    const [projectsResult, servicesResult] = await Promise.all([
      supabase
        .from('gcp_projects')
        .select('*')
        .eq('user_id', userEmail),
      supabase
        .from('gcp_services_usage')
        .select('*')
        .eq('user_id', userEmail)
    ]);

    const projects = projectsResult.data || [];
    const services = servicesResult.data || [];

    if (projects.length === 0 && services.length === 0) {
      return NextResponse.json({ 
        error: 'No projects or services data found for anomaly detection' 
      }, { status: 404 });
    }

    console.log(`📊 Analyzing ${projects.length} projects and ${services.length} services for anomalies`);

    const results = {
      anomaliesDetected: 0,
      errors: [] as string[],
    };

    // Supprimer les anciennes anomalies
    await supabase
      .from('gcp_cost_anomalies')
      .delete()
      .eq('user_id', userEmail);

    // 1. DÉTECTER LES ANOMALIES DE PROJETS
    const avgProjectCost = TOTAL_MONTHLY_COST / projects.length;
    const projectAnomalies = [];

    for (const project of projects) {
      const projectCost = project.monthly_cost || avgProjectCost;
      
      // Anomalie si coût > 150% de la moyenne
      if (projectCost > avgProjectCost * 1.5) {
        projectAnomalies.push({
          user_id: userEmail,
          project_id: project.project_id,
          service_id: 'all-services',
          service_name: 'All Services',
          anomaly_date: new Date().toISOString().split('T')[0],
          anomaly_type: 'spike',
          severity: projectCost > avgProjectCost * 2 ? 'high' : 'medium',
          current_cost: projectCost,
          expected_cost: avgProjectCost,
          variance_percentage: ((projectCost - avgProjectCost) / avgProjectCost) * 100,
          currency: 'EUR',
          description: `Le projet "${project.project_name}" coûte ${projectCost.toFixed(2)} EUR/mois, soit ${(((projectCost - avgProjectCost) / avgProjectCost) * 100).toFixed(1)}% au-dessus de la moyenne (${avgProjectCost.toFixed(2)} EUR).`,
          suggested_actions: JSON.stringify([
            'Analyser les ressources actives du projet',
            'Vérifier les instances en cours d\'exécution',
            'Optimiser le dimensionnement des ressources',
            'Configurer des alertes de budget'
          ]),
          status: 'open',
          created_at: new Date().toISOString(),
        });
      }
      
      // Anomalie si coût très faible (possiblement inactif)
      if (projectCost < avgProjectCost * 0.1 && projectCost > 0) {
        projectAnomalies.push({
          user_id: userEmail,
          project_id: project.project_id,
          service_id: 'all-services',
          service_name: 'All Services',
          anomaly_date: new Date().toISOString().split('T')[0],
          anomaly_type: 'unusual_pattern',
          severity: 'low',
          current_cost: projectCost,
          expected_cost: avgProjectCost,
          variance_percentage: ((avgProjectCost - projectCost) / avgProjectCost) * 100,
          currency: 'EUR',
          description: `Le projet "${project.project_name}" a un coût très faible (${projectCost.toFixed(2)} EUR/mois). Il pourrait être inactif ou sous-utilisé.`,
          suggested_actions: JSON.stringify([
            'Vérifier si le projet est encore utilisé',
            'Considérer l\'archivage si inactif',
            'Analyser les ressources allouées'
          ]),
          status: 'open',
          created_at: new Date().toISOString(),
        });
      }
    }

    // 2. DÉTECTER LES ANOMALIES DE SERVICES
    const avgServiceCost = TOTAL_MONTHLY_COST / services.length;
    const serviceAnomalies = [];

    for (const service of services) {
      const serviceCost = service.monthly_cost || avgServiceCost;
      
      // Anomalie si service coûte > 50% du total
      if (serviceCost > TOTAL_MONTHLY_COST * 0.5) {
        serviceAnomalies.push({
          user_id: userEmail,
          project_id: '',
          service_id: service.service_id,
          service_name: service.service_name,
          anomaly_date: new Date().toISOString().split('T')[0],
          anomaly_type: 'spike',
          severity: 'high',
          current_cost: serviceCost,
          expected_cost: avgServiceCost,
          variance_percentage: ((serviceCost - avgServiceCost) / avgServiceCost) * 100,
          currency: 'EUR',
          description: `Le service "${service.service_name}" représente ${((serviceCost / TOTAL_MONTHLY_COST) * 100).toFixed(1)}% du coût total (${serviceCost.toFixed(2)} EUR/mois). C'est inhabituel.`,
          suggested_actions: JSON.stringify([
            'Analyser l\'utilisation détaillée du service',
            'Vérifier les configurations de ressources',
            'Optimiser les instances ou le stockage',
            'Configurer des alertes spécifiques'
          ]),
          status: 'open',
          created_at: new Date().toISOString(),
        });
      }
    }

    // 3. DÉTECTER LES ANOMALIES GLOBALES
    const globalAnomalies = [];
    
    // Anomalie si coût total > seuil attendu (exemple: 10 EUR/mois)
    const expectedMaxCost = 10.0;
    if (TOTAL_MONTHLY_COST > expectedMaxCost) {
      globalAnomalies.push({
        user_id: userEmail,
        project_id: '',
        service_id: 'global',
        service_name: 'Global Account',
        anomaly_date: new Date().toISOString().split('T')[0],
        anomaly_type: 'budget_exceeded',
        severity: TOTAL_MONTHLY_COST > expectedMaxCost * 1.5 ? 'high' : 'medium',
        current_cost: TOTAL_MONTHLY_COST,
        expected_cost: expectedMaxCost,
        variance_percentage: ((TOTAL_MONTHLY_COST - expectedMaxCost) / expectedMaxCost) * 100,
        currency: 'EUR',
        description: `Le coût total mensuel (${TOTAL_MONTHLY_COST} EUR) dépasse le seuil attendu de ${expectedMaxCost} EUR de ${(((TOTAL_MONTHLY_COST - expectedMaxCost) / expectedMaxCost) * 100).toFixed(1)}%.`,
        suggested_actions: JSON.stringify([
          'Revoir la stratégie d\'optimisation globale',
          'Analyser les projets les plus coûteux',
          'Configurer des budgets stricts',
          'Implémenter des politiques de gouvernance'
        ]),
        status: 'open',
        created_at: new Date().toISOString(),
      });
    }

    // 4. ANOMALIES BASÉES SUR LES TENDANCES
    const trendAnomalies = [];
    
    // Simuler une anomalie de tendance (en réalité, il faudrait des données historiques)
    if (projects.some(p => p.cost_trend === 'increasing')) {
      trendAnomalies.push({
        user_id: userEmail,
        project_id: '',
        service_id: 'trend-analysis',
        service_name: 'Trend Analysis',
        anomaly_date: new Date().toISOString().split('T')[0],
        anomaly_type: 'unusual_pattern',
        severity: 'medium',
        current_cost: TOTAL_MONTHLY_COST,
        expected_cost: TOTAL_MONTHLY_COST * 0.9,
        variance_percentage: 10,
        currency: 'EUR',
        description: 'Tendance d\'augmentation des coûts détectée sur plusieurs projets. Surveillance recommandée.',
        suggested_actions: JSON.stringify([
          'Surveiller l\'évolution des coûts',
          'Identifier les causes de l\'augmentation',
          'Mettre en place des alertes préventives'
        ]),
        status: 'open',
        created_at: new Date().toISOString(),
      });
    }

    // Combiner toutes les anomalies
    const allAnomalies = [
      ...projectAnomalies,
      ...serviceAnomalies, 
      ...globalAnomalies,
      ...trendAnomalies
    ];

    // Insérer les anomalies détectées
    if (allAnomalies.length > 0) {
      const { error } = await supabase
        .from('gcp_cost_anomalies')
        .insert(allAnomalies);

      if (error) {
        console.error('❌ Anomalies insertion error:', error);
        results.errors.push(`Anomalies insertion: ${error.message}`);
      } else {
        results.anomaliesDetected = allAnomalies.length;
        console.log(`✅ ${allAnomalies.length} anomalies detected and stored`);
      }
    } else {
      // Si aucune anomalie détectée, créer une entrée "all clear"
      const noAnomalyEntry = {
        user_id: userEmail,
        project_id: '',
        service_id: 'system-check',
        service_name: 'System Health Check',
        anomaly_date: new Date().toISOString().split('T')[0],
        anomaly_type: 'unusual_pattern',
        severity: 'low',
        current_cost: TOTAL_MONTHLY_COST,
        expected_cost: TOTAL_MONTHLY_COST,
        variance_percentage: 0,
        currency: 'EUR',
        description: `Analyse terminée : aucune anomalie de coût détectée. Tous les projets et services sont dans les limites normales (${TOTAL_MONTHLY_COST} EUR/mois).`,
        suggested_actions: JSON.stringify([
          'Continuer la surveillance régulière',
          'Maintenir les bonnes pratiques actuelles',
          'Planifier la prochaine analyse'
        ]),
        status: 'open',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('gcp_cost_anomalies')
        .insert([noAnomalyEntry]);

      if (!error) {
        results.anomaliesDetected = 1;
        console.log('✅ No anomalies detected - health check entry created');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cost anomalies detection completed',
      data: {
        results,
        summary: {
          projectsAnalyzed: projects.length,
          servicesAnalyzed: services.length,
          anomaliesDetected: results.anomaliesDetected,
          totalMonthlyCost: TOTAL_MONTHLY_COST,
          analysisTypes: [
            'Project cost spikes',
            'Service cost concentration', 
            'Global budget thresholds',
            'Cost trend patterns'
          ],
          anomaliesByType: {
            spikes: projectAnomalies.length + serviceAnomalies.filter(a => a.anomaly_type === 'spike').length,
            patterns: trendAnomalies.length + projectAnomalies.filter(a => a.anomaly_type === 'unusual_pattern').length,
            budgetExceeded: globalAnomalies.length,
          }
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Cost anomalies sync error:', error);
    return NextResponse.json({
      error: 'Cost anomalies detection failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to detect and sync cost anomalies',
    info: 'This endpoint analyzes projects and services to detect cost anomalies, spikes, and unusual patterns'
  });
}
