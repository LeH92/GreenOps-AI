import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/gcp/sync-budgets-simple
 * Version simplifiée pour remplir gcp_budgets_tracking avec colonnes de base
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💰 Syncing budgets with basic columns...');
    
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

    const results = {
      budgetsStored: 0,
      errors: [] as string[],
    };

    // Supprimer les anciens budgets
    await supabase
      .from('gcp_budgets_tracking')
      .delete()
      .eq('user_id', userEmail);

    // Créer des budgets avec seulement les colonnes de base
    for (const account of billingAccounts) {
      try {
        const budgetAmount = TOTAL_MONTHLY_COST * 1.2; // 20% de marge
        const currentSpend = account.monthly_cost || (TOTAL_MONTHLY_COST * 0.8);
        const utilization = (currentSpend / budgetAmount) * 100;
        
        let status = 'on_track';
        if (utilization > 100) status = 'over_budget';
        else if (utilization > 80) status = 'warning';

        // Données budget simplifiées
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log(`💰 Creating budget: ${account.display_name} - ${budgetAmount.toFixed(2)} EUR`);

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
        results.errors.push(`Budget ${account.display_name}: ${err.message}`);
      }
    }

    // Budget global
    try {
      const globalBudgetData = {
        user_id: userEmail,
        budget_name: 'budget-global',
        budget_display_name: 'Budget Global',
        budget_amount: TOTAL_MONTHLY_COST * 1.3,
        currency: 'EUR',
        current_spend: TOTAL_MONTHLY_COST,
        utilization_percentage: (TOTAL_MONTHLY_COST / (TOTAL_MONTHLY_COST * 1.3)) * 100,
        projected_spend: TOTAL_MONTHLY_COST * 1.1,
        status: 'on_track',
        next_threshold: 80,
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

    return NextResponse.json({
      success: true,
      message: 'Budgets synchronized with basic columns',
      data: {
        results,
        budgetsCreated: results.budgetsStored,
        totalErrors: results.errors.length
      }
    });

  } catch (error: any) {
    console.error('❌ Simple budgets sync error:', error);
    return NextResponse.json({
      error: 'Simple budgets sync failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to sync budgets with basic columns' });
}
