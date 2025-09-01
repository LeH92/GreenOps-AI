import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/budgets
 * Récupère les budgets de l'utilisateur authentifié
 */
export async function GET(request: NextRequest) {
  try {
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

    // Récupérer les budgets pour cet utilisateur
    const { data: budgets, error } = await supabase
      .from('gcp_budgets_tracking')
      .select('*')
      .eq('user_id', user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching budgets:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch budgets',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: budgets || [],
      count: budgets?.length || 0,
      summary: budgets?.length > 0 ? {
        totalBudgetAmount: budgets.reduce((sum, b) => sum + (b.budget_amount || 0), 0),
        totalCurrentSpend: budgets.reduce((sum, b) => sum + (b.current_spend || 0), 0),
        averageUtilization: budgets.reduce((sum, b) => sum + (b.utilization_percentage || 0), 0) / budgets.length,
        budgetsOverThreshold: budgets.filter(b => (b.utilization_percentage || 0) > 80).length,
      } : null
    });

  } catch (error: any) {
    console.error('❌ Budgets API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
