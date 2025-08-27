import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { gcpOAuthClient } from '@/src/lib/gcp/oauth-client';
import { GCPDataFetcher } from '@/src/services/GCPDataFetcher';

/**
 * POST /api/gcp/refresh
 * Refresh GCP data for the current user
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

    // Get existing connection
    const { data: connection, error: fetchError } = await supabase
      .from('gcp_connections')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !connection) {
      console.error('No GCP connection found for user:', session.user.id);
      return NextResponse.json(
        { error: 'No GCP connection found' }, 
        { status: 404 }
      );
    }

    if (connection.connection_status !== 'connected') {
      return NextResponse.json(
        { error: 'GCP account is not connected' }, 
        { status: 400 }
      );
    }

    // Decrypt tokens
    let tokens;
    try {
      tokens = gcpOAuthClient.constructor.decryptTokens(connection.tokens_encrypted);
    } catch (decryptError: any) {
      console.error('Failed to decrypt GCP tokens:', decryptError);
      return NextResponse.json(
        { error: 'Invalid connection tokens' }, 
        { status: 400 }
      );
    }

    // Check if tokens need refresh
    if (gcpOAuthClient.isTokenExpired(tokens)) {
      console.log('Refreshing expired GCP tokens...');
      try {
        tokens = await gcpOAuthClient.refreshAccessToken(tokens.refresh_token);
        
        // Update encrypted tokens in database
        const encryptedTokens = gcpOAuthClient.constructor.encryptTokens(tokens);
        await supabase
          .from('gcp_connections')
          .update({
            tokens_encrypted: encryptedTokens,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);
          
        console.log('Successfully refreshed GCP tokens');
      } catch (refreshError: any) {
        console.error('Failed to refresh GCP tokens:', refreshError);
        
        // Mark connection as expired
        await supabase
          .from('gcp_connections')
          .update({
            connection_status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);
          
        return NextResponse.json(
          { error: 'Token refresh failed, please reconnect' }, 
          { status: 401 }
        );
      }
    }

    // Initialize data fetcher and refresh data
    console.log('Refreshing GCP data...');
    const dataFetcher = new GCPDataFetcher(tokens);
    const dataResult = await dataFetcher.refreshData();

    if (!dataResult.success) {
      console.error('Failed to refresh GCP data:', dataResult.error);
      return NextResponse.json(
        { error: 'Failed to refresh data', message: dataResult.error }, 
        { status: 500 }
      );
    }

    // Update connection info with fresh data
    const { error: updateError } = await supabase
      .from('gcp_connections')
      .update({
        account_info: {
          ...connection.account_info,
          billingAccounts: dataResult.data!.billingAccounts,
          projects: dataResult.data!.projects,
        },
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id);

    if (updateError) {
      console.warn('Failed to update connection info:', updateError);
      // Don't fail the entire operation for this
    }

    // Store fresh billing data if available
    if (dataResult.data!.billingData.length > 0) {
      // Delete old billing data for this user (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      await supabase
        .from('gcp_billing_data')
        .delete()
        .eq('user_id', session.user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Insert fresh billing data
      const billingRecords = dataResult.data!.billingData.map(data => ({
        user_id: session.user.id,
        project_id: data.projectId,
        billing_account_id: data.billingAccountId,
        cost: data.cost,
        currency: data.currency,
        start_date: data.startDate,
        end_date: data.endDate,
        services: data.services,
        created_at: new Date().toISOString(),
      }));

      const { error: billingError } = await supabase
        .from('gcp_billing_data')
        .insert(billingRecords);

      if (billingError) {
        console.warn('Failed to store fresh billing data:', billingError);
        // Don't fail the entire operation for this
      }
    }

    console.log('Successfully refreshed GCP data for user:', session.user.id);

    return NextResponse.json({
      success: true,
      message: 'GCP data refreshed successfully',
      projectsCount: dataResult.data!.projects.length,
      billingAccountsCount: dataResult.data!.billingAccounts.length,
      lastSync: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error refreshing GCP data:', error);
    
    return NextResponse.json(
      { 
        error: 'Data refresh failed',
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}
