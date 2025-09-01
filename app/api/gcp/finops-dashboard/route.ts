import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { FinOpsKPIs } from '@/hooks/useFinOpsData';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/finops-dashboard
 * Récupère toutes les données FinOps/GreenOps pour le dashboard
 * Optimisé avec requêtes parallèles et cache intelligent
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('📊 Fetching FinOps dashboard data...');
    
    // Authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    // Vérifier la connexion GCP active
    const { data: connection } = await supabase
      .from('gcp_connections')
      .select('connection_status, last_sync, total_monthly_cost, total_monthly_carbon, currency')
      .eq('user_id', user.email)
      .eq('connection_status', 'connected')
      .single();

    if (!connection) {
      return NextResponse.json({
        success: false,
        error: 'No active GCP connection found',
        action: 'Please connect your Google Cloud account first'
      }, { status: 404 });
    }

    // Récupérer toutes les données en parallèle pour optimiser les performances
    const [
      projectsData,
      servicesData,
      carbonData,
      budgetsData,
      recommendationsData,
      anomaliesData,
      trendsData
    ] = await Promise.all([
      // 1. Projets avec KPIs
      supabase
        .from('gcp_projects')
        .select('project_id, project_name, monthly_cost, monthly_carbon, cost_percentage, carbon_percentage, cost_trend, carbon_trend')
        .eq('user_id', user.email)
        .eq('is_archived', false)
        .order('monthly_cost', { ascending: false }),

      // 2. Services les plus coûteux
      supabase
        .from('gcp_services_usage')
        .select('service_id, service_name, monthly_cost, cost_percentage, projects_count, currency')
        .eq('user_id', user.email)
        .eq('usage_month', new Date().toISOString().slice(0, 7)) // Mois courant
        .order('monthly_cost', { ascending: false })
        .limit(10),

      // 3. Données carbone par projet
      supabase
        .from('gcp_carbon_footprint')
        .select('project_id, service_name, monthly_carbon, carbon_percentage')
        .eq('user_id', user.email)
        .eq('usage_month', new Date().toISOString().slice(0, 7))
        .order('monthly_carbon', { ascending: false })
        .limit(10),

      // 4. Budgets et utilisation
      supabase
        .from('gcp_budgets_tracking')
        .select('budget_display_name, budget_amount, current_spend, utilization_percentage, projected_spend, status, currency')
        .eq('user_id', user.email)
        .order('utilization_percentage', { ascending: false }),

      // 5. Recommandations actives
      supabase
        .from('gcp_optimization_recommendations')
        .select('recommendation_id, type, title, description, potential_savings, potential_carbon_reduction, priority, status')
        .eq('user_id', user.email)
        .in('status', ['pending', 'in_progress'])
        .order('priority', { ascending: false })
        .limit(20),

      // 6. Anomalies ouvertes
      supabase
        .from('gcp_cost_anomalies')
        .select('id, project_id, service_name, anomaly_type, severity, current_cost, expected_cost, variance_percentage, anomaly_date, status')
        .eq('user_id', user.email)
        .in('status', ['open', 'investigating'])
        .order('severity', { ascending: false })
        .limit(10),

      // 7. Tendances mensuelles (6 derniers mois)
      supabase
        .from('gcp_monthly_trends')
        .select('trend_month, total_cost, total_carbon, cost_change_percentage, carbon_change_percentage')
        .eq('user_id', user.email)
        .order('trend_month', { ascending: false })
        .limit(6)
    ]);

    // Traitement et agrégation des données
    const finOpsData: FinOpsKPIs = {
      // Métriques globales
      totalMonthlyCost: connection.total_monthly_cost || 0,
      totalMonthlyCarbon: connection.total_monthly_carbon || 0,
      currency: connection.currency || 'EUR',
      
      // Projets
      totalProjects: projectsData.data?.length || 0,
      topCostProjects: (projectsData.data || []).slice(0, 10).map(p => ({
        projectId: p.project_id,
        projectName: p.project_name,
        monthlyCost: p.monthly_cost,
        costPercentage: p.cost_percentage,
        trend: p.cost_trend as 'increasing' | 'decreasing' | 'stable',
      })),
      
      topCarbonProjects: (projectsData.data || [])
        .filter(p => p.monthly_carbon > 0)
        .sort((a, b) => b.monthly_carbon - a.monthly_carbon)
        .slice(0, 10)
        .map(p => ({
          projectId: p.project_id,
          projectName: p.project_name,
          monthlyCarbon: p.monthly_carbon,
          carbonPercentage: p.carbon_percentage,
          trend: p.carbon_trend as 'increasing' | 'decreasing' | 'stable',
        })),
      
      // Services
      topCostServices: (servicesData.data || []).map(s => ({
        serviceId: s.service_id,
        serviceName: s.service_name,
        monthlyCost: s.monthly_cost,
        costPercentage: s.cost_percentage,
        projectsCount: s.projects_count,
      })),
      
      // Budgets
      budgets: (budgetsData.data || []).map(b => ({
        budgetName: b.budget_display_name,
        budgetAmount: b.budget_amount,
        currentSpend: b.current_spend,
        utilizationPercentage: b.utilization_percentage,
        status: b.status as 'on_track' | 'warning' | 'over_budget' | 'critical',
        projectedSpend: b.projected_spend,
      })),
      
      // Recommandations
      recommendations: (recommendationsData.data || []).map(r => ({
        id: r.recommendation_id,
        type: r.type as 'cost' | 'carbon' | 'performance',
        title: r.title,
        description: r.description,
        potentialSavings: r.potential_savings,
        potentialCarbonReduction: r.potential_carbon_reduction,
        priority: r.priority as 'high' | 'medium' | 'low',
        status: r.status as 'pending' | 'in_progress' | 'completed' | 'dismissed',
      })),
      
      // Anomalies
      costAnomalies: (anomaliesData.data || []).map(a => ({
        id: a.id.toString(),
        projectId: a.project_id,
        serviceName: a.service_name,
        anomalyType: a.anomaly_type as 'spike' | 'unusual_pattern' | 'budget_exceeded',
        severity: a.severity as 'low' | 'medium' | 'high' | 'critical',
        currentCost: a.current_cost,
        expectedCost: a.expected_cost,
        variancePercentage: a.variance_percentage,
        date: a.anomaly_date,
        status: a.status as 'open' | 'investigating' | 'resolved' | 'false_positive',
      })),
      
      // Tendances
      monthlyTrends: (trendsData.data || []).map(t => ({
        month: t.trend_month,
        totalCost: t.total_cost,
        totalCarbon: t.total_carbon,
        costChangePercentage: t.cost_change_percentage,
        carbonChangePercentage: t.carbon_change_percentage,
      })),
    };

    // Calculs supplémentaires et enrichissements
    const enrichedData = enrichFinOpsData(finOpsData);

    const processingTime = Date.now() - startTime;
    console.log(`✅ FinOps dashboard data loaded in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      data: enrichedData,
      metadata: {
        lastSync: connection.last_sync,
        processingTime,
        dataFreshness: new Date().toISOString(),
        totalProjects: enrichedData.totalProjects,
        totalCost: enrichedData.totalMonthlyCost,
        totalCarbon: enrichedData.totalMonthlyCarbon,
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching FinOps dashboard data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch FinOps dashboard data',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Enrichit les données FinOps avec des calculs supplémentaires
 */
function enrichFinOpsData(data: FinOpsKPIs): FinOpsKPIs {
  // Calculer les pourcentages si manquants
  if (data.totalMonthlyCost > 0) {
    data.topCostProjects = data.topCostProjects.map(project => ({
      ...project,
      costPercentage: project.costPercentage || (project.monthlyCost / data.totalMonthlyCost) * 100,
    }));

    data.topCostServices = data.topCostServices.map(service => ({
      ...service,
      costPercentage: service.costPercentage || (service.monthlyCost / data.totalMonthlyCost) * 100,
    }));
  }

  if (data.totalMonthlyCarbon > 0) {
    data.topCarbonProjects = data.topCarbonProjects.map(project => ({
      ...project,
      carbonPercentage: project.carbonPercentage || (project.monthlyCarbon / data.totalMonthlyCarbon) * 100,
    }));
  }

  // Trier les recommandations par priorité et impact
  data.recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // Si même priorité, trier par économies potentielles
    return b.potentialSavings - a.potentialSavings;
  });

  // Calculer les tendances si on a assez de données historiques
  if (data.monthlyTrends.length >= 2) {
    const latestMonth = data.monthlyTrends[0];
    const previousMonth = data.monthlyTrends[1];
    
    if (latestMonth && previousMonth) {
      latestMonth.costChangePercentage = latestMonth.costChangePercentage || 
        ((latestMonth.totalCost - previousMonth.totalCost) / previousMonth.totalCost) * 100;
      
      latestMonth.carbonChangePercentage = latestMonth.carbonChangePercentage ||
        ((latestMonth.totalCarbon - previousMonth.totalCarbon) / previousMonth.totalCarbon) * 100;
    }
  }

  return data;
}

/**
 * POST /api/gcp/finops-dashboard
 * Force le refresh des données (invalide le cache)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Force refreshing FinOps dashboard data...');
    
    // Authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Déclencher une détection d'anomalies
    const { data: anomaliesResult } = await supabase
      .rpc('detect_cost_anomalies', { p_user_id: user.email });

    console.log(`🔍 Detected ${anomaliesResult || 0} new cost anomalies`);

    // Mettre à jour le timestamp de dernière actualisation
    await supabase
      .from('gcp_connections')
      .update({ 
        last_finops_sync: new Date().toISOString(),
        finops_sync_status: 'completed'
      })
      .eq('user_id', user.email);

    // Retourner les données fraîches
    return GET(request);

  } catch (error: any) {
    console.error('❌ Error refreshing FinOps dashboard:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh FinOps dashboard',
      details: error.message
    }, { status: 500 });
  }
}
