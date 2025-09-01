import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/debug/fix-billing-table
 * Corrige la table gcp_billing_accounts avec la bonne structure
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing gcp_billing_accounts table structure...');
    
    // Supprimer l'ancienne table
    const dropResult = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS gcp_billing_accounts CASCADE;'
    });
    
    console.log('🗑️ Dropped old table:', dropResult);

    // Créer la nouvelle table avec la bonne structure
    const createTableSQL = `
      CREATE TABLE gcp_billing_accounts (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        billing_account_id TEXT NOT NULL,
        billing_account_name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        is_open BOOLEAN DEFAULT true,
        currency TEXT DEFAULT 'EUR',
        projects_count INTEGER DEFAULT 0,
        monthly_cost DECIMAL(12,2) DEFAULT 0,
        monthly_carbon DECIMAL(10,3) DEFAULT 0,
        master_billing_account TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, billing_account_id)
      );
    `;

    const createResult = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    console.log('✅ Created new table:', createResult);

    // Vérifier les colonnes
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'gcp_billing_accounts')
      .order('ordinal_position');

    return NextResponse.json({
      success: true,
      message: 'Table gcp_billing_accounts fixed successfully',
      columns: columns || [],
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error fixing billing table:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Could not fix gcp_billing_accounts table structure'
    }, { status: 500 });
  }
}
