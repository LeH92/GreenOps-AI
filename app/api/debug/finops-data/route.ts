import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/debug/finops-data
 * Debug endpoint pour voir les données FinOps stockées
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging FinOps data in Supabase...');
    
    // Vérifier toutes les tables FinOps
    const [
      connectionsResult,
      projectsResult,
      billingAccountsResult,
      servicesResult,
      carbonResult,
      budgetsResult,
      recommendationsResult,
      anomaliesResult
    ] = await Promise.all([
      // Connexions existantes
      supabase.from('gcp_connections').select('*'),
      
      // Nouvelles tables FinOps (peuvent ne pas exister)
      supabase.from('gcp_projects').select('*').limit(10),
      supabase.from('gcp_billing_accounts').select('*').limit(10),
      supabase.from('gcp_services_usage').select('*').limit(10),
      supabase.from('gcp_carbon_footprint').select('*').limit(10),
      supabase.from('gcp_budgets_tracking').select('*').limit(10),
      supabase.from('gcp_optimization_recommendations').select('*').limit(10),
      supabase.from('gcp_cost_anomalies').select('*').limit(10),
    ]);

    const debug = {
      connections: {
        count: connectionsResult.data?.length || 0,
        data: connectionsResult.data || [],
        error: connectionsResult.error?.message,
      },
      projects: {
        count: projectsResult.data?.length || 0,
        data: projectsResult.data || [],
        error: projectsResult.error?.message,
        tableExists: !projectsResult.error,
      },
      billingAccounts: {
        count: billingAccountsResult.data?.length || 0,
        data: billingAccountsResult.data || [],
        error: billingAccountsResult.error?.message,
        tableExists: !billingAccountsResult.error,
      },
      services: {
        count: servicesResult.data?.length || 0,
        data: servicesResult.data || [],
        error: servicesResult.error?.message,
        tableExists: !servicesResult.error,
      },
      carbon: {
        count: carbonResult.data?.length || 0,
        data: carbonResult.data || [],
        error: carbonResult.error?.message,
        tableExists: !carbonResult.error,
      },
      budgets: {
        count: budgetsResult.data?.length || 0,
        data: budgetsResult.data || [],
        error: budgetsResult.error?.message,
        tableExists: !budgetsResult.error,
      },
      recommendations: {
        count: recommendationsResult.data?.length || 0,
        data: recommendationsResult.data || [],
        error: recommendationsResult.error?.message,
        tableExists: !recommendationsResult.error,
      },
      anomalies: {
        count: anomaliesResult.data?.length || 0,
        data: anomaliesResult.data || [],
        error: anomaliesResult.error?.message,
        tableExists: !anomaliesResult.error,
      },
    };

    // Résumé des données
    const summary = {
      tablesStatus: {
        gcp_connections: 'EXISTS',
        gcp_projects: debug.projects.tableExists ? 'EXISTS' : 'MISSING',
        gcp_billing_accounts: debug.billingAccounts.tableExists ? 'EXISTS' : 'MISSING',
        gcp_services_usage: debug.services.tableExists ? 'EXISTS' : 'MISSING',
        gcp_carbon_footprint: debug.carbon.tableExists ? 'EXISTS' : 'MISSING',
        gcp_budgets_tracking: debug.budgets.tableExists ? 'EXISTS' : 'MISSING',
        gcp_optimization_recommendations: debug.recommendations.tableExists ? 'EXISTS' : 'MISSING',
        gcp_cost_anomalies: debug.anomalies.tableExists ? 'EXISTS' : 'MISSING',
      },
      dataCount: {
        connections: debug.connections.count,
        projects: debug.projects.count,
        billingAccounts: debug.billingAccounts.count,
        services: debug.services.count,
        carbon: debug.carbon.count,
        budgets: debug.budgets.count,
        recommendations: debug.recommendations.count,
        anomalies: debug.anomalies.count,
      },
      totalRecords: debug.connections.count + debug.projects.count + debug.billingAccounts.count + 
                   debug.services.count + debug.carbon.count + debug.budgets.count + 
                   debug.recommendations.count + debug.anomalies.count,
    };

    return NextResponse.json({
      success: true,
      summary,
      debug,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error debugging FinOps data:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
