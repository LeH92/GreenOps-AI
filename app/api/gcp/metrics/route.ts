import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/metrics
 * Récupère les métriques agrégées GCP pour l'utilisateur
 */
export async function GET(request: NextRequest) {
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

    console.log('Fetching GCP metrics for user:', user.email);

    // 1. Récupérer les vraies données FinOps depuis les nouvelles tables
    const [projectsResult, connectionResult, servicesResult] = await Promise.all([
      // Projets avec nouvelles colonnes FinOps
      supabase
        .from('gcp_projects')
        .select(`
          project_id,
          project_name,
          monthly_cost,
          monthly_carbon,
          cost_percentage,
          carbon_percentage,
          cost_trend,
          carbon_trend,
          has_export_bigquery,
          is_selected,
          is_archived,
          updated_at
        `)
        .eq('user_id', user.email)
        .eq('is_archived', false),

      // Données de connexion avec totaux
      supabase
        .from('gcp_connections')
        .select(`
          total_monthly_cost,
          total_monthly_carbon,
          currency,
          last_finops_sync,
          finops_sync_status,
          projects_count,
          billing_accounts_count
        `)
        .eq('user_id', user.email)
        .eq('connection_status', 'connected')
        .single(),

      // Services avec coûts
      supabase
        .from('gcp_services_usage')
        .select('service_name, monthly_cost, projects_count')
        .eq('user_id', user.email)
        .eq('usage_month', new Date().toISOString().slice(0, 7))
        .order('monthly_cost', { ascending: false })
        .limit(5)
    ]);

    if (projectsResult.error && projectsResult.error.code !== 'PGRST116') {
      console.error('Error fetching projects:', projectsResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch projects data' }, 
        { status: 500 }
      );
    }

    const projects = projectsResult.data || [];
    const connection = connectionResult.data;
    const services = servicesResult.data || [];

    // 2. Calculer les métriques avec les vraies données FinOps
    const activeProjects = projects.filter(p => p.is_selected && !p.is_archived) || [];
    
    // Utiliser les données de connexion (plus fiables) ou calculer depuis les projets
    const totalMonthlyCost = connection?.total_monthly_cost || 
      activeProjects.reduce((sum, p) => sum + (p.monthly_cost || 0), 0);
    
    const totalMonthlyCarbon = connection?.total_monthly_carbon ||
      activeProjects.reduce((sum, p) => sum + (p.monthly_carbon || 0), 0);
    
    const currency = connection?.currency || 'EUR';
    
    // Score d'optimisation basé sur les données réelles
    const averageOptimizationScore = activeProjects.length > 0 ? 
      Math.round(activeProjects.reduce((sum, p) => {
        // Score basé sur l'utilisation des exports BigQuery et les coûts
        let score = 50; // Base
        if (p.has_export_bigquery) score += 30; // +30 si BigQuery configuré
        if (p.monthly_cost > 0) score += 20; // +20 si données de coûts disponibles
        return sum + score;
      }, 0) / activeProjects.length) : 0;

    // 3. Récupérer les recommandations actives
    const { count: recommendationsCount } = await supabase
      .from('gcp_optimization_recommendations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.email)
      .in('status', ['pending', 'in_progress']);

    // 4. Récupérer les économies potentielles
    const { data: recommendations } = await supabase
      .from('gcp_optimization_recommendations')
      .select('potential_savings')
      .eq('user_id', user.email)
      .in('status', ['pending', 'in_progress']);

    const potentialSavings = recommendations?.reduce((sum, r) => sum + (r.potential_savings || 0), 0) || 0;

    // 5. Déterminer le statut de synchronisation
    const globalSyncStatus = connection?.finops_sync_status || 'pending';
    const lastSync = connection?.last_finops_sync || connection?.last_sync;

    const metrics = {
      success: true,
      data: {
        // Métriques principales RÉELLES
        totalMonthlyCost,
        totalMonthlyCarbon,
        currency,
        
        // Projets
        totalProjects: connection?.projects_count || projects.length,
        activeProjects: activeProjects.length,
        billingAccountsCount: connection?.billing_accounts_count || 0,
        
        // Performance et optimisation
        averageOptimizationScore,
        potentialMonthlySavings: potentialSavings,
        activeRecommendations: recommendationsCount || 0,
        
        // Services
        topServices: services.map(s => ({
          name: s.service_name,
          cost: s.monthly_cost,
          projectsCount: s.projects_count,
        })),
        
        // Synchronisation
        syncStatus: globalSyncStatus,
        lastSync: lastSync,
        hasRealData: totalMonthlyCost > 0 || activeProjects.some(p => p.has_export_bigquery),
        
        // Détails par projet avec vraies données
        projectsDetails: activeProjects.map(p => ({
          projectId: p.project_id,
          projectName: p.project_name,
          monthlyCost: p.monthly_cost || 0,
          monthlyCarbon: p.monthly_carbon || 0,
          costPercentage: p.cost_percentage || 0,
          carbonPercentage: p.carbon_percentage || 0,
          costTrend: p.cost_trend || 'stable',
          carbonTrend: p.carbon_trend || 'stable',
          hasExportBigQuery: p.has_export_bigquery || false,
          lastUpdate: p.updated_at,
        })),
        
        // Méta-informations
        dataSource: 'real_bigquery_sync',
        bigQueryEnabled: activeProjects.some(p => p.has_export_bigquery),
        lastBigQuerySync: connection?.last_finops_sync,
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(metrics);

  } catch (error: any) {
    console.error('Error fetching GCP metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GCP metrics', details: error.message }, 
      { status: 500 }
    );
  }
}

