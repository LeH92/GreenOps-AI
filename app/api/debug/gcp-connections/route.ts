import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/debug/gcp-connections
 * Debug endpoint pour voir toutes les connexions GCP en base
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Listing all GCP connections...');

    // Récupérer toutes les connexions GCP
    const { data: connections, error } = await supabase
      .from('gcp_connections')
      .select('user_id, connection_status, account_info, last_sync, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error', details: error }, { status: 500 });
    }

    console.log(`Found ${connections?.length || 0} GCP connections in database`);

    const debugInfo = {
      totalConnections: connections?.length || 0,
      connections: connections?.map(conn => ({
        user_id: conn.user_id,
        status: conn.connection_status,
        lastSync: conn.last_sync,
        projectsCount: conn.account_info?.projects?.length || 0,
        billingAccountsCount: conn.account_info?.billingAccounts?.length || 0,
        hasTokens: !!conn.account_info?.oauthStatus,
        createdAt: conn.created_at,
        updatedAt: conn.updated_at
      })) || [],
      activeConnections: connections?.filter(c => c.connection_status === 'connected').length || 0
    };

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Debug API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}



