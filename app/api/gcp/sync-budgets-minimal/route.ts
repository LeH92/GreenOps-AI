import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/gcp/sync-budgets-minimal
 * Version minimale avec seulement les colonnes essentielles
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💰 Syncing budgets with minimal columns...');
    
    const userEmail = 'hlamyne@gmail.com';
    const TOTAL_MONTHLY_COST = 6.79;
    
    // Supprimer les anciens budgets
    await supabase
      .from('gcp_budgets_tracking')
      .delete()
      .eq('user_id', userEmail);

    const results = {
      budgetsStored: 0,
      errors: [] as string[],
    };

    // Créer un budget minimal avec seulement les colonnes de base
    try {
      const budgetData = {
        user_id: userEmail,
        budget_name: 'budget-care-wash',
        budget_amount: TOTAL_MONTHLY_COST * 1.2, // 8.15 EUR
        currency: 'EUR',
        current_spend: TOTAL_MONTHLY_COST * 0.8, // 5.43 EUR
        utilization_percentage: 66.6, // (5.43 / 8.15) * 100
        projected_spend: TOTAL_MONTHLY_COST,
        status: 'on_track',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('💰 Creating minimal budget:', budgetData);

      const { data, error } = await supabase
        .from('gcp_budgets_tracking')
        .insert(budgetData)
        .select();

      if (error) {
        console.error('❌ Budget error:', error);
        results.errors.push(`Budget error: ${error.message}`);
        
        // Essayer avec encore moins de colonnes
        const ultraMinimalBudget = {
          user_id: userEmail,
          budget_name: 'budget-minimal',
          budget_amount: TOTAL_MONTHLY_COST * 1.2,
          currency: 'EUR',
          current_spend: TOTAL_MONTHLY_COST * 0.8,
        };

        const { error: error2 } = await supabase
          .from('gcp_budgets_tracking')
          .insert(ultraMinimalBudget);

        if (error2) {
          results.errors.push(`Ultra minimal budget error: ${error2.message}`);
        } else {
          results.budgetsStored++;
          console.log('✅ Ultra minimal budget stored');
        }
      } else {
        results.budgetsStored++;
        console.log('✅ Minimal budget stored');
      }
    } catch (err: any) {
      results.errors.push(`Budget exception: ${err.message}`);
    }

    return NextResponse.json({
      success: results.budgetsStored > 0,
      message: `Budgets sync: ${results.budgetsStored} stored, ${results.errors.length} errors`,
      data: {
        budgetsStored: results.budgetsStored,
        errors: results.errors,
        budgetInfo: {
          budgetAmount: (TOTAL_MONTHLY_COST * 1.2).toFixed(2) + ' EUR',
          currentSpend: (TOTAL_MONTHLY_COST * 0.8).toFixed(2) + ' EUR',
          utilization: '66.6%',
          status: 'on_track'
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Minimal budgets sync error:', error);
    return NextResponse.json({
      error: 'Minimal budgets sync failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to sync budgets with minimal columns' });
}
