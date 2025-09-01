import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GCPFinOpsDataFetcher, type GCPFinOpsKPIs } from '@/services/GCPFinOpsDataFetcher';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/gcp/sync-finops-complete
 * Synchronisation complète des données FinOps/GreenOps avec stockage optimisé en Supabase
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting complete FinOps/GreenOps synchronization...');
    
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

    // Récupérer les projets sélectionnés depuis le body
    const body = await request.json();
    const { selectedProjects = [] } = body;

    if (!selectedProjects.length) {
      return NextResponse.json({ 
        error: 'No projects selected',
        message: 'Please select at least one project to synchronize'
      }, { status: 400 });
    }

    console.log(`📊 Synchronizing ${selectedProjects.length} selected projects`);

    // Récupérer la connexion GCP
    const { data: connection, error: connectionError } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted')
      .eq('user_id', user.email)
      .eq('connection_status', 'connected')
      .single();

    if (connectionError || !connection || !connection.tokens_encrypted) {
      return NextResponse.json({ 
        error: 'No active GCP connection found',
        action: 'Please reconnect to Google Cloud'
      }, { status: 404 });
    }

    // Initialiser le fetcher FinOps
    const finOpsFetcher = new GCPFinOpsDataFetcher(connection.tokens_encrypted);

    // Récupérer toutes les données FinOps/GreenOps
    const finOpsData = await finOpsFetcher.fetchCompleteFinOpsData();

    // Stocker les données en Supabase
    const syncResults = await storeFinOpsDataInSupabase(user.email, finOpsData, selectedProjects);

    // Mettre à jour le statut de connexion
    await supabase
      .from('gcp_connections')
      .update({ 
        last_sync: new Date().toISOString(),
        projects_count: selectedProjects.length,
        billing_accounts_count: finOpsData.billingAccounts.length,
        total_monthly_cost: finOpsData.costKPIs.totalMonthlyCost,
        total_monthly_carbon: finOpsData.carbonKPIs.totalMonthlyCarbon,
      })
      .eq('user_id', user.email);

    const totalTime = Date.now() - startTime;
    
    console.log(`✅ FinOps synchronization completed in ${totalTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'FinOps/GreenOps synchronization completed successfully',
      data: {
        syncResults,
        performance: finOpsData.performanceMetrics,
        summary: {
          projectsSynced: selectedProjects.length,
          billingAccounts: finOpsData.billingAccounts.length,
          totalMonthlyCost: finOpsData.costKPIs.totalMonthlyCost,
          currency: finOpsData.costKPIs.currency,
          totalMonthlyCarbon: finOpsData.carbonKPIs.totalMonthlyCarbon,
          budgets: finOpsData.budgets.length,
          recommendations: finOpsData.optimizationRecommendations.length,
          totalSyncTime: totalTime,
        }
      }
    });

  } catch (error: any) {
    console.error('❌ FinOps synchronization error:', error);
    
    return NextResponse.json({
      error: 'FinOps synchronization failed',
      details: error.message,
      action: 'Check your GCP permissions and try again'
    }, { status: 500 });
  }
}

/**
 * Stocke toutes les données FinOps en Supabase de manière optimisée
 */
async function storeFinOpsDataInSupabase(
  userEmail: string, 
  finOpsData: GCPFinOpsKPIs,
  selectedProjects: string[]
): Promise<any> {
  const results = {
    projectsStored: 0,
    billingAccountsStored: 0,
    costDataStored: 0,
    carbonDataStored: 0,
    budgetsStored: 0,
    recommendationsStored: 0,
    errors: [] as string[],
  };

  try {
    console.log('💾 Storing FinOps data in Supabase...');

    // 1. Stocker/Mettre à jour les comptes de facturation
    for (const account of finOpsData.billingAccounts) {
      try {
        const { error } = await supabase
          .from('gcp_billing_accounts')
          .upsert({
            user_id: userEmail,
            billing_account_id: account.name.split('/')[1],
            billing_account_name: account.name,
            display_name: account.displayName,
            is_open: account.open,
            currency: account.currency,
            projects_count: account.projectCount,
            monthly_cost: account.totalMonthlyCost,
            monthly_carbon: account.totalMonthlyCarbon,
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
        }
      } catch (err: any) {
        results.errors.push(`Billing account ${account.displayName}: ${err.message}`);
      }
    }

    // 2. Stocker/Mettre à jour les projets sélectionnés
    const selectedProjectsData = finOpsData.projects.filter(p => 
      selectedProjects.includes(p.projectId)
    );

    for (const project of selectedProjectsData) {
      try {
        // Trouver les KPIs pour ce projet
        const projectCost = finOpsData.costKPIs.costByProject.find(p => p.projectId === project.projectId);
        const projectCarbon = finOpsData.carbonKPIs.carbonByProject.find(p => p.projectId === project.projectId);

        const { error } = await supabase
          .from('gcp_projects')
          .upsert({
            user_id: userEmail,
            project_id: project.projectId,
            project_name: project.name,
            project_number: project.projectNumber,
            billing_account_name: project.billingAccountName,
            billing_account_id: project.billingAccountName.split('/')[1] || '',
            lifecycle_state: project.lifecycleState,
            created_at: project.createTime,
            // KPIs enrichis
            monthly_cost: projectCost?.totalCost || 0,
            monthly_carbon: projectCarbon?.totalCarbon || 0,
            cost_trend: projectCost?.trend || 'stable',
            carbon_trend: projectCarbon?.trend || 'stable',
            cost_percentage: projectCost?.percentageOfTotal || 0,
            carbon_percentage: projectCarbon?.percentageOfTotal || 0,
            has_export_bigquery: project.hasExportBigQuery,
            has_carbon_export: project.hasCarbonExport,
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
        }
      } catch (err: any) {
        results.errors.push(`Project ${project.name}: ${err.message}`);
      }
    }

    // 3. Stocker les données de coût par service
    for (const service of finOpsData.costKPIs.costByService) {
      try {
        const { error } = await supabase
          .from('gcp_services_usage')
          .upsert({
            user_id: userEmail,
            service_id: service.serviceId,
            service_name: service.serviceName,
            monthly_cost: service.totalCost,
            currency: service.currency,
            projects_count: service.projectsCount,
            cost_percentage: service.percentageOfTotal,
            usage_month: new Date().toISOString().slice(0, 7), // YYYY-MM
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,service_id,usage_month'
          });

        if (error) {
          console.error('Error storing service cost:', error);
          results.errors.push(`Service ${service.serviceName}: ${error.message}`);
        } else {
          results.costDataStored++;
        }
      } catch (err: any) {
        results.errors.push(`Service ${service.serviceName}: ${err.message}`);
      }
    }

    // 4. Stocker les données carbone par service
    for (const service of finOpsData.carbonKPIs.carbonByService) {
      try {
        const { error } = await supabase
          .from('gcp_carbon_footprint')
          .upsert({
            user_id: userEmail,
            project_id: '', // Service-level data
            service_id: service.serviceId,
            service_name: service.serviceName,
            monthly_carbon: service.totalCarbon,
            carbon_percentage: service.percentageOfTotal,
            projects_count: service.projectsCount,
            usage_month: new Date().toISOString().slice(0, 7),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,service_id,usage_month'
          });

        if (!error) {
          results.carbonDataStored++;
        }
      } catch (err: any) {
        // Continue silently for carbon data
      }
    }

    // 5. Stocker les budgets
    for (const budget of finOpsData.budgets) {
      try {
        const utilization = finOpsData.budgetUtilization.find(u => u.budgetName === budget.displayName);
        
        const { error } = await supabase
          .from('gcp_budgets_tracking')
          .upsert({
            user_id: userEmail,
            budget_name: budget.name,
            budget_display_name: budget.displayName,
            budget_amount: budget.amount.specifiedAmount ? 
              parseFloat(budget.amount.specifiedAmount.units) : 0,
            currency: budget.amount.specifiedAmount?.currencyCode || 'EUR',
            current_spend: utilization?.currentSpend || 0,
            utilization_percentage: utilization?.utilizationPercentage || 0,
            projected_spend: utilization?.projectedSpend || 0,
            status: utilization?.status || 'on_track',
            threshold_rules: JSON.stringify(budget.thresholdRules),
            budget_filter: JSON.stringify(budget.budgetFilter),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,budget_name'
          });

        if (!error) {
          results.budgetsStored++;
        }
      } catch (err: any) {
        // Continue silently for budgets
      }
    }

    // 6. Stocker les recommandations d'optimisation
    // D'abord, nettoyer les anciennes recommandations
    await supabase
      .from('gcp_optimization_recommendations')
      .delete()
      .eq('user_id', userEmail);

    for (const recommendation of finOpsData.optimizationRecommendations) {
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
            service_id: recommendation.serviceId,
            potential_savings: recommendation.potentialSavings,
            potential_carbon_reduction: recommendation.potentialCarbonReduction,
            implementation: recommendation.implementation,
            priority: recommendation.priority,
            effort: recommendation.effort,
            status: 'pending',
            created_at: new Date().toISOString(),
          });

        if (!error) {
          results.recommendationsStored++;
        }
      } catch (err: any) {
        // Continue silently for recommendations
      }
    }

    // 7. Créer un log d'audit
    await supabase
      .from('gcp_audit_log')
      .insert({
        user_id: userEmail,
        action: 'finops_sync_complete',
        details: JSON.stringify({
          projectsSelected: selectedProjects.length,
          dataCollected: {
            billingAccounts: finOpsData.billingAccounts.length,
            totalCost: finOpsData.costKPIs.totalMonthlyCost,
            totalCarbon: finOpsData.carbonKPIs.totalMonthlyCarbon,
            budgets: finOpsData.budgets.length,
            recommendations: finOpsData.optimizationRecommendations.length,
          },
          performance: finOpsData.performanceMetrics,
          syncResults: results,
        }),
        created_at: new Date().toISOString(),
      });

    console.log('✅ FinOps data stored successfully:', results);
    return results;

  } catch (error: any) {
    console.error('❌ Error storing FinOps data:', error);
    results.errors.push(`General storage error: ${error.message}`);
    return results;
  }
}
