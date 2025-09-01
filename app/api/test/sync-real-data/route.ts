import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GCPDataFetcher } from '@/services/GCPDataFetcher';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/test/sync-real-data
 * Test de synchronisation avec les vraies données de hlamyne@gmail.com
 */
export async function POST(request: NextRequest) {
  const userEmail = 'hlamyne@gmail.com';
  
  try {
    console.log(`🧪 Testing real data sync for ${userEmail}...`);
    
    // Récupérer la connexion
    const { data: connection } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted, account_info')
      .eq('user_id', userEmail)
      .eq('connection_status', 'connected')
      .single();

    if (!connection || !connection.tokens_encrypted) {
      return NextResponse.json({ 
        error: 'No active connection found for user'
      }, { status: 404 });
    }

    // Récupérer les vraies données depuis les APIs Google
    const dataFetcher = new GCPDataFetcher(connection.tokens_encrypted);
    
    console.log('📡 Fetching real data from Google Cloud...');
    const [accountInfo, billingAccounts, projects] = await Promise.all([
      dataFetcher.fetchAccountInfo(),
      dataFetcher.fetchBillingAccounts(), 
      dataFetcher.fetchProjects(),
    ]);

    console.log(`✅ Real data fetched: ${billingAccounts.length} billing accounts, ${projects.length} projects`);

    // Stocker les comptes de facturation RÉELS
    let billingAccountsStored = 0;
    for (const account of billingAccounts) {
      try {
        const accountId = account.name.split('/')[1];
        const projectsForAccount = projects.filter(p => p.billingAccountName === account.name);

        const { error } = await supabase
          .from('gcp_billing_accounts')
          .upsert({
            user_id: userEmail,
            billing_account_id: accountId,
            billing_account_name: account.name,
            display_name: account.displayName,
            is_open: account.open,
            currency: 'EUR',
            projects_count: projectsForAccount.length,
            monthly_cost: 0, // Sera mis à jour avec BigQuery
            monthly_carbon: 0,
            master_billing_account: account.masterBillingAccount || '',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,billing_account_id'
          });

        if (!error) {
          billingAccountsStored++;
          console.log(`✅ Stored billing account: ${account.displayName} (${account.open ? 'OPEN' : 'CLOSED'})`);
        } else {
          console.error(`❌ Error storing ${account.displayName}:`, error);
        }
      } catch (err: any) {
        console.error(`❌ Exception storing ${account.displayName}:`, err.message);
      }
    }

    // Stocker les projets RÉELS
    let projectsStored = 0;
    for (const project of projects) {
      try {
        const billingAccountId = project.billingAccountName ? 
          project.billingAccountName.split('/')[1] : '';

        const { error } = await supabase
          .from('gcp_projects')
          .upsert({
            user_id: userEmail,
            project_id: project.projectId,
            project_name: project.name,
            project_number: project.projectNumber,
            billing_account_name: project.billingAccountName,
            billing_account_id: billingAccountId,
            lifecycle_state: project.lifecycleState,
            monthly_cost: 0,
            monthly_carbon: 0,
            cost_percentage: 0,
            carbon_percentage: 0,
            cost_trend: 'stable',
            carbon_trend: 'stable',
            has_export_bigquery: false, // À détecter
            has_carbon_export: false, // À détecter
            is_selected: true, // Marquer comme sélectionné
            is_archived: false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,project_id'
          });

        if (!error) {
          projectsStored++;
          console.log(`✅ Stored project: ${project.name} -> ${project.billingAccountName}`);
        } else {
          console.error(`❌ Error storing ${project.name}:`, error);
        }
      } catch (err: any) {
        console.error(`❌ Exception storing ${project.name}:`, err.message);
      }
    }

    // Générer des recommandations de base
    const recommendations = [];
    
    // Recommandation sur les comptes fermés
    const closedAccounts = billingAccounts.filter(acc => !acc.open);
    if (closedAccounts.length > 0) {
      recommendations.push({
        user_id: userEmail,
        recommendation_id: 'billing-accounts-closed',
        type: 'cost',
        title: `${closedAccounts.length} compte(s) de facturation fermé(s)`,
        description: `Vous avez ${closedAccounts.length} compte(s) fermé(s): ${closedAccounts.map(a => a.displayName).join(', ')}`,
        project_id: '',
        service_id: '',
        potential_savings: 0,
        potential_carbon_reduction: 0,
        implementation: 'Vérifier les projets liés aux comptes fermés',
        priority: 'medium',
        effort: 'low',
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }

    // Recommandation BigQuery
    recommendations.push({
      user_id: userEmail,
      recommendation_id: 'setup-bigquery-exports',
      type: 'cost',
      title: 'Configurer les exports BigQuery pour analyses détaillées',
      description: 'Vous avez des datasets BigQuery. Configurez les exports de facturation pour obtenir des analyses FinOps précises.',
      project_id: 'carewashv1',
      service_id: '',
      potential_savings: 0,
      potential_carbon_reduction: 0,
      implementation: 'Activer les exports dans Google Cloud Console > Facturation > Export vers BigQuery',
      priority: 'high',
      effort: 'medium',
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    // Stocker les recommandations
    let recommendationsStored = 0;
    for (const rec of recommendations) {
      const { error } = await supabase
        .from('gcp_optimization_recommendations')
        .upsert(rec, { onConflict: 'user_id,recommendation_id' });
      
      if (!error) {
        recommendationsStored++;
      }
    }

    // Mettre à jour la connexion
    await supabase
      .from('gcp_connections')
      .update({
        last_finops_sync: new Date().toISOString(),
        finops_sync_status: 'completed',
        total_monthly_cost: 0, // Sera mis à jour avec BigQuery
        total_monthly_carbon: 0,
      })
      .eq('user_id', userEmail);

    const results = {
      accountInfo,
      billingAccountsStored,
      projectsStored,
      recommendationsStored,
      realData: {
        billingAccounts: billingAccounts.map(acc => ({
          name: acc.displayName,
          id: acc.name.split('/')[1],
          open: acc.open,
          projectsLinked: projects.filter(p => p.billingAccountName === acc.name).length
        })),
        projects: projects.map(proj => ({
          name: proj.name,
          id: proj.projectId,
          billingAccount: proj.billingAccountName?.split('/')[1] || 'None',
          state: proj.lifecycleState
        }))
      }
    };

    console.log('✅ Real data sync test completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Real data synchronization test completed',
      results,
      conclusion: billingAccountsStored > 0 && projectsStored > 0 ? 
        'VRAIES DONNÉES stockées avec succès!' : 
        'Synchronisation partielle - vérifiez les erreurs'
    });

  } catch (error: any) {
    console.error('❌ Error in real data sync test:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
