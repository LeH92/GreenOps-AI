import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/debug/user-finops-data?userId=email
 * Debug des données FinOps pour un utilisateur spécifique
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'hlamyne@gmail.com';
    
    console.log(`🔍 Debugging FinOps data for user: ${userId}`);
    
    // Récupérer toutes les données pour cet utilisateur
    const [
      connectionResult,
      projectsResult,
      billingAccountsResult,
      servicesResult,
      recommendationsResult
    ] = await Promise.all([
      supabase.from('gcp_connections').select('*').eq('user_id', userId),
      supabase.from('gcp_projects').select('*').eq('user_id', userId),
      supabase.from('gcp_billing_accounts').select('*').eq('user_id', userId),
      supabase.from('gcp_services_usage').select('*').eq('user_id', userId),
      supabase.from('gcp_optimization_recommendations').select('*').eq('user_id', userId),
    ]);

    const userData = {
      userId,
      connection: connectionResult.data?.[0] || null,
      projects: {
        count: projectsResult.data?.length || 0,
        data: projectsResult.data || [],
        error: projectsResult.error?.message,
      },
      billingAccounts: {
        count: billingAccountsResult.data?.length || 0,
        data: billingAccountsResult.data || [],
        error: billingAccountsResult.error?.message,
      },
      services: {
        count: servicesResult.data?.length || 0,
        data: servicesResult.data || [],
        error: servicesResult.error?.message,
      },
      recommendations: {
        count: recommendationsResult.data?.length || 0,
        data: recommendationsResult.data || [],
        error: recommendationsResult.error?.message,
      },
    };

    // Analyser les données
    const analysis = {
      hasActiveConnection: !!userData.connection && userData.connection.connection_status === 'connected',
      hasTokens: !!userData.connection?.tokens_encrypted,
      hasRealProjects: userData.projects.count > 0,
      hasRealBillingAccounts: userData.billingAccounts.count > 0,
      hasRecommendations: userData.recommendations.count > 0,
      lastSync: userData.connection?.last_sync,
      projectsFromConnection: userData.connection?.account_info?.projects?.length || 0,
      billingAccountsFromConnection: userData.connection?.account_info?.billingAccounts?.length || 0,
    };

    return NextResponse.json({
      success: true,
      userData,
      analysis,
      conclusion: analysis.hasRealProjects && analysis.hasRealBillingAccounts ? 
        'DONNÉES RÉELLES stockées' : 
        'DONNÉES FICTIVES ou non stockées - Synchronisation incomplète',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error debugging user FinOps data:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
