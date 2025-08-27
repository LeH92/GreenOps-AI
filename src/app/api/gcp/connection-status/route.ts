import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/gcp/connection-status
 * Check GCP connection status for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check for existing GCP connection
    const { data: connection, error } = await supabase
      .from('gcp_connections')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking GCP connection:', error);
      return NextResponse.json(
        { error: 'Failed to check connection status' }, 
        { status: 500 }
      );
    }

    // Return connection status
    if (connection && connection.connection_status === 'connected') {
      return NextResponse.json({
        connected: true,
        connection: {
          id: connection.id,
          user_id: connection.user_id,
          connection_status: connection.connection_status,
          account_info: connection.account_info,
          last_sync: connection.last_sync,
          created_at: connection.created_at,
          updated_at: connection.updated_at,
        }
      });
    } else {
      return NextResponse.json({
        connected: false,
        connection: null
      });
    }

  } catch (error: any) {
    console.error('Error in GCP connection status check:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}
