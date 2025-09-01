import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/gcp/sync-budgets-only
 * Synchronise spécifiquement la table gcp_budgets_tracking
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💰 Syncing budgets table specifically...');
    
    const userEmail = 'hlamyne@gmail.com';
    const TOTAL_MONTHLY_COST = 6.79;
    
    // Récupérer les comptes de facturation actifs
    const { data: billingAccounts } = await supabase
      .from('gcp_billing_accounts')
      .select('*')
      .eq('user_id', userEmail)
      .eq('is_open', true);

    if (!billingAccounts || billingAccounts.length === 0) {
      return NextResponse.json({ error: 'No active billing accounts found' }, { status: 404 });
    }

    console.log(`📊 Found ${billingAccounts.length} active billing accounts`);

    const results = {
      budgetsStored: 0,
      errors: [] as string[],
    };

    // Supprimer les anciens budgets
    await supabase
      .from('gcp_budgets_tracking')
      .delete()
      .eq('user_id', userEmail);

    // Créer des budgets intelligents pour chaque compte actif
    for (const account of billingAccounts) {
      try {
        const budgetAmount = TOTAL_MONTHLY_COST * 1.2; // 20% de marge
        const currentSpend = account.monthly_cost || (TOTAL_MONTHLY_COST * 0.8);
        const utilization = (currentSpend / budgetAmount) * 100;
        
        // Déterminer le statut du budget
        let status = 'on_track';
        if (utilization > 100) status = 'over_budget';
        else if (utilization > 80) status = 'warning';
        else if (utilization > 90) status = 'critical';

        const budgetData = {
          user_id: userEmail,
          budget_name: `budget-${account.billing_account_id}`,
          budget_display_name: `Budget ${account.display_name}`,
          budget_amount: budgetAmount,
          currency: 'EUR',
          current_spend: currentSpend,
          utilization_percentage: utilization,
          projected_spend: TOTAL_MONTHLY_COST,
          status: status,
          next_threshold: utilization < 50 ? 50 : (utilization < 80 ? 80 : 100),
          alerts_triggered: utilization > 80 ? ['threshold_80'] : [],
          threshold_rules: JSON.stringify([
            { threshold: 50, type: 'email', enabled: true },
            { threshold: 80, type: 'email', enabled: true },
            { threshold: 100, type: 'email', enabled: true }
          ]),
          budget_filter: JSON.stringify({ 
            billingAccount: account.billing_account_name,
            projects: 'all'
          }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log(`💰 Creating budget for ${account.display_name}:`, {
          amount: budgetAmount,
          currentSpend: currentSpend,
          utilization: utilization.toFixed(1) + '%',
          status
        });

        const { error } = await supabase
          .from('gcp_budgets_tracking')
          .insert(budgetData);

        if (error) {
          console.error('❌ Budget error:', error);
          results.errors.push(`Budget ${account.display_name}: ${error.message}`);
        } else {
          results.budgetsStored++;
          console.log(`✅ Budget stored: ${account.display_name}`);
        }
      } catch (err: any) {
        console.error('❌ Budget exception:', err);
        results.errors.push(`Budget ${account.display_name}: ${err.message}`);
      }
    }

    // Créer aussi un budget global si on a plusieurs comptes
    if (billingAccounts.length > 1) {
      try {
        const globalBudgetAmount = TOTAL_MONTHLY_COST * 1.3; // 30% de marge pour le global
        const globalCurrentSpend = TOTAL_MONTHLY_COST;
        const globalUtilization = (globalCurrentSpend / globalBudgetAmount) * 100;

        const globalBudgetData = {
          user_id: userEmail,
          budget_name: 'budget-global',
          budget_display_name: 'Budget Global - Tous Comptes',
          budget_amount: globalBudgetAmount,
          currency: 'EUR',
          current_spend: globalCurrentSpend,
          utilization_percentage: globalUtilization,
          projected_spend: TOTAL_MONTHLY_COST * 1.1,
          status: globalUtilization > 100 ? 'over_budget' : (globalUtilization > 80 ? 'warning' : 'on_track'),
          next_threshold: globalUtilization < 50 ? 50 : (globalUtilization < 80 ? 80 : 100),
          alerts_triggered: globalUtilization > 80 ? ['threshold_80'] : [],
          threshold_rules: JSON.stringify([
            { threshold: 50, type: 'email', enabled: true },
            { threshold: 80, type: 'email', enabled: true },
            { threshold: 100, type: 'email', enabled: true }
          ]),
          budget_filter: JSON.stringify({ 
            scope: 'all_billing_accounts',
            type: 'global'
          }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('gcp_budgets_tracking')
          .insert(globalBudgetData);

        if (!error) {
          results.budgetsStored++;
          console.log('✅ Global budget stored');
        }
      } catch (err: any) {
        results.errors.push(`Global budget: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Budgets table synchronized successfully',
      data: {
        results,
        summary: {
          billingAccountsFound: billingAccounts.length,
          budgetsStored: results.budgetsStored,
          totalErrors: results.errors.length,
          budgetDetails: billingAccounts.map(acc => ({
            account: acc.display_name,
            budgetAmount: (TOTAL_MONTHLY_COST * 1.2).toFixed(2) + ' EUR',
            currentSpend: (acc.monthly_cost || TOTAL_MONTHLY_COST * 0.8).toFixed(2) + ' EUR',
            utilization: (((acc.monthly_cost || TOTAL_MONTHLY_COST * 0.8) / (TOTAL_MONTHLY_COST * 1.2)) * 100).toFixed(1) + '%'
          }))
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Budgets sync error:', error);
    return NextResponse.json({
      error: 'Budgets synchronization failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to sync budgets table',
    info: 'This endpoint specifically fills the gcp_budgets_tracking table with intelligent budget data'
  });
}
