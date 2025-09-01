import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GCPDataFetcher } from '@/services/GCPDataFetcher';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/gcp/sync-finops-basic
 * Synchronisation FinOps de base SANS BigQuery (pour commencer)
 * Collecte les données disponibles via les APIs REST uniquement
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting basic FinOps synchronization (no BigQuery)...');
    
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

    // Récupérer les projets sélectionnés
    const body = await request.json();
    const { selectedProjects = [] } = body;

    if (!selectedProjects.length) {
      return NextResponse.json({ 
        error: 'No projects selected',
        message: 'Please select at least one project to synchronize'
      }, { status: 400 });
    }

    console.log(`📊 Basic sync for ${selectedProjects.length} selected projects`);

    // Récupérer la connexion GCP
    const { data: connection, error: connectionError } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted, account_info')
      .eq('user_id', user.email)
      .eq('connection_status', 'connected')
      .single();

    if (connectionError || !connection || !connection.tokens_encrypted) {
      return NextResponse.json({ 
        error: 'No active GCP connection found',
        action: 'Please reconnect to Google Cloud'
      }, { status: 404 });
    }

    // Utiliser le GCPDataFetcher existant
    const dataFetcher = new GCPDataFetcher(connection.tokens_encrypted);

    // Récupérer les données de base
    console.log('📡 Fetching basic GCP data...');
    const [accountInfo, billingAccounts, projects] = await Promise.all([
      dataFetcher.fetchAccountInfo(),
      dataFetcher.fetchBillingAccounts(),
      dataFetcher.fetchProjects(),
    ]);

    console.log(`✅ Basic data fetched: ${billingAccounts.length} billing accounts, ${projects.length} projects`);

    // Filtrer les projets sélectionnés
    const selectedProjectsData = projects.filter(p => selectedProjects.includes(p.projectId));

    // Stocker les données de base (sans BigQuery)
    const syncResults = await storeBasicFinOpsData(
      user.email, 
      accountInfo, 
      billingAccounts, 
      selectedProjectsData
    );

    // Mettre à jour la connexion
    await supabase
      .from('gcp_connections')
      .update({ 
        last_sync: new Date().toISOString(),
        projects_count: selectedProjects.length,
        billing_accounts_count: billingAccounts.length,
        last_finops_sync: new Date().toISOString(),
        finops_sync_status: 'completed',
      })
      .eq('user_id', user.email);

    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Basic FinOps sync completed in ${totalTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Basic FinOps synchronization completed successfully',
      data: {
        syncResults,
        summary: {
          projectsSynced: selectedProjects.length,
          billingAccounts: billingAccounts.length,
          accountInfo,
          totalSyncTime: totalTime,
          note: 'BigQuery data will be available once exports are configured'
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Basic FinOps synchronization error:', error);
    
    return NextResponse.json({
      error: 'Basic FinOps synchronization failed',
      details: error.message,
      action: 'Check your GCP permissions and try again'
    }, { status: 500 });
  }
}

/**
 * Stocke les données de base FinOps (sans BigQuery)
 */
async function storeBasicFinOpsData(
  userEmail: string,
  accountInfo: { email: string; name: string },
  billingAccounts: any[],
  selectedProjects: any[]
): Promise<any> {
  const results = {
    projectsStored: 0,
    billingAccountsStored: 0,
    recommendationsGenerated: 0,
    errors: [] as string[],
  };

  try {
    console.log('💾 Storing basic FinOps data...');

    // 1. Stocker les comptes de facturation
    for (const account of billingAccounts) {
      try {
        const accountId = account.name.split('/')[1];
        const projectsForThisAccount = selectedProjects.filter(p => 
          p.billingAccountName === account.name
        );

        const { error } = await supabase
          .from('gcp_billing_accounts')
          .upsert({
            user_id: userEmail,
            billing_account_id: accountId,
            billing_account_name: account.name,
            display_name: account.displayName,
            is_open: account.open,
            currency: 'EUR',
            projects_count: projectsForThisAccount.length,
            monthly_cost: 0, // Sera mis à jour quand BigQuery sera configuré
            monthly_carbon: 0,
            master_billing_account: account.masterBillingAccount,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,billing_account_id'
          });

        if (error) {
          console.error('Error storing billing account:', error);
          results.errors.push(`Billing account ${account.displayName}: ${error.message}`);
        } else {
          results.billingAccountsStored++;
          console.log(`✅ Stored billing account: ${account.displayName}`);
        }
      } catch (err: any) {
        results.errors.push(`Billing account ${account.displayName}: ${err.message}`);
      }
    }

    // 2. Stocker les projets sélectionnés
    for (const project of selectedProjects) {
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
            monthly_cost: 0, // Sera mis à jour avec BigQuery
            monthly_carbon: 0, // Sera mis à jour avec BigQuery
            cost_percentage: 0,
            carbon_percentage: 0,
            cost_trend: 'stable',
            carbon_trend: 'stable',
            has_export_bigquery: false, // À vérifier plus tard
            has_carbon_export: false, // À vérifier plus tard
            is_selected: true,
            is_archived: false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,project_id'
          });

        if (error) {
          console.error('Error storing project:', error);
          results.errors.push(`Project ${project.name}: ${error.message}`);
        } else {
          results.projectsStored++;
          console.log(`✅ Stored project: ${project.name}`);
        }
      } catch (err: any) {
        results.errors.push(`Project ${project.name}: ${err.message}`);
      }
    }

    // 3. Générer des recommandations de base
    const basicRecommendations = generateBasicRecommendations(selectedProjects, billingAccounts);
    
    // Supprimer les anciennes recommandations
    await supabase
      .from('gcp_optimization_recommendations')
      .delete()
      .eq('user_id', userEmail);

    for (const recommendation of basicRecommendations) {
      try {
        const { error } = await supabase
          .from('gcp_optimization_recommendations')
          .insert({
            user_id: userEmail,
            recommendation_id: recommendation.id,
            type: recommendation.type,
            title: recommendation.title,
            description: recommendation.description,
            project_id: recommendation.projectId,
            service_id: '',
            potential_savings: recommendation.potentialSavings,
            potential_carbon_reduction: recommendation.potentialCarbonReduction,
            implementation: recommendation.implementation,
            priority: recommendation.priority,
            effort: recommendation.effort,
            status: 'pending',
            created_at: new Date().toISOString(),
          });

        if (!error) {
          results.recommendationsGenerated++;
        }
      } catch (err: any) {
        // Continue silently
      }
    }

    // 4. Log d'audit
    await supabase
      .from('gcp_audit_log')
      .insert({
        user_id: userEmail,
        action: 'basic_finops_sync',
        details: JSON.stringify({
          projectsSelected: selectedProjects.length,
          billingAccountsFound: billingAccounts.length,
          syncResults: results,
          note: 'Basic sync without BigQuery data',
        }),
        created_at: new Date().toISOString(),
      });

    return results;

  } catch (error: any) {
    console.error('❌ Error storing basic FinOps data:', error);
    results.errors.push(`General error: ${error.message}`);
    return results;
  }
}

/**
 * Génère des recommandations de base sans BigQuery
 */
function generateBasicRecommendations(projects: any[], billingAccounts: any[]) {
  const recommendations = [];
  
  // Recommandation générale sur les comptes fermés
  const closedAccounts = billingAccounts.filter(acc => !acc.open);
  if (closedAccounts.length > 0) {
    recommendations.push({
      id: 'billing-accounts-closed',
      type: 'cost',
      title: `${closedAccounts.length} compte(s) de facturation fermé(s)`,
      description: `Vous avez ${closedAccounts.length} compte(s) de facturation fermé(s). Vérifiez si des projets y sont encore liés.`,
      projectId: '',
      potentialSavings: 0,
      potentialCarbonReduction: 0,
      implementation: 'Vérifier les projets liés aux comptes fermés et migrer si nécessaire',
      priority: 'medium',
      effort: 'low',
    });
  }

  // Recommandation sur les exports BigQuery
  recommendations.push({
    id: 'setup-bigquery-exports',
    type: 'cost',
    title: 'Configurer les exports BigQuery',
    description: 'Pour obtenir des analyses FinOps détaillées, configurez les exports de facturation et carbone vers BigQuery.',
    projectId: '',
    potentialSavings: 0,
    potentialCarbonReduction: 0,
    implementation: 'Activer les exports dans Google Cloud Console > Facturation > Export vers BigQuery',
    priority: 'high',
    effort: 'medium',
  });

  // Recommandations par projet
  projects.forEach((project, index) => {
    recommendations.push({
      id: `project-analysis-${index}`,
      type: 'performance',
      title: `Analyser le projet ${project.name}`,
      description: `Projet ${project.name} synchronisé. Analysez son utilisation une fois les exports BigQuery configurés.`,
      projectId: project.projectId,
      potentialSavings: 0,
      potentialCarbonReduction: 0,
      implementation: 'Surveiller les coûts et optimiser les ressources sous-utilisées',
      priority: 'low',
      effort: 'medium',
    });
  });

  return recommendations;
}
