import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { gcpOAuthClient } from '@/src/lib/gcp/oauth-client';

/**
 * POST /api/gcp/disconnect
 * Disconnect GCP account for the current user
 */
export async function POST(request: NextRequest) {
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

    // Get existing connection to retrieve tokens
    const { data: connection, error: fetchError } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted')
      .eq('user_id', session.user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching GCP connection:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch connection data' }, 
        { status: 500 }
      );
    }

    // If connection exists and has tokens, revoke them
    if (connection && connection.tokens_encrypted) {
      try {
        const tokens = gcpOAuthClient.constructor.decryptTokens(connection.tokens_encrypted);
        await gcpOAuthClient.revokeTokens(tokens.access_token);
        console.log('Successfully revoked GCP tokens');
      } catch (revokeError: any) {
        console.warn('Failed to revoke GCP tokens:', revokeError.message);
        // Continue with disconnection even if token revocation fails
      }
    }

    // Update connection status to disconnected
    const { error: updateError } = await supabase
      .from('gcp_connections')
      .update({
        connection_status: 'disconnected',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id);

    if (updateError) {
      console.error('Error updating connection status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update connection status' }, 
        { status: 500 }
      );
    }

    console.log('Successfully disconnected GCP for user:', session.user.id);

    return NextResponse.json({
      success: true,
      message: 'GCP account disconnected successfully'
    });

  } catch (error: any) {
    console.error('Error disconnecting GCP account:', error);
    
    return NextResponse.json(
      { 
        error: 'Disconnection failed',
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}
