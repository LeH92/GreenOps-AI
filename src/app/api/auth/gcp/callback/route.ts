import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { gcpOAuthClient } from '@/src/lib/gcp/oauth-client';
import { GCPDataFetcher } from '@/src/services/GCPDataFetcher';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/auth/gcp/callback
 * Handle OAuth callback from Google Cloud Platform
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  try {
    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      
      const errorUrl = new URL('/dashboard/cloud-providers', request.url);
      errorUrl.searchParams.set('gcp_error', error);
      errorUrl.searchParams.set('gcp_error_description', errorDescription || '');
      
      return NextResponse.redirect(errorUrl);
    }

    // Validate required parameters
    if (!code || !state) {
      console.error('Missing OAuth parameters:', { code: !!code, state: !!state });
      
      const errorUrl = new URL('/dashboard/cloud-providers', request.url);
      errorUrl.searchParams.set('gcp_error', 'invalid_request');
      errorUrl.searchParams.set('gcp_error_description', 'Missing authorization code or state');
      
      return NextResponse.redirect(errorUrl);
    }

    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('No user session found during OAuth callback');
      
      const errorUrl = new URL('/login', request.url);
      errorUrl.searchParams.set('error', 'session_required');
      
      return NextResponse.redirect(errorUrl);
    }

    // Validate OAuth state
    if (!gcpOAuthClient.validateState(state, session.user.id)) {
      console.error('Invalid OAuth state parameter');
      
      const errorUrl = new URL('/dashboard/cloud-providers', request.url);
      errorUrl.searchParams.set('gcp_error', 'invalid_state');
      errorUrl.searchParams.set('gcp_error_description', 'Invalid or expired state parameter');
      
      return NextResponse.redirect(errorUrl);
    }

    console.log('Processing OAuth callback for user:', session.user.id);

    // Exchange authorization code for tokens
    const tokens = await gcpOAuthClient.exchangeCodeForTokens(code);
    console.log('Successfully obtained OAuth tokens');

    // Initialize data fetcher with new tokens
    const dataFetcher = new GCPDataFetcher(tokens);

    // Fetch initial GCP data
    console.log('Fetching initial GCP data...');
    const dataResult = await dataFetcher.fetchInitialData();

    if (!dataResult.success) {
      console.error('Failed to fetch initial GCP data:', dataResult.error);
      
      const errorUrl = new URL('/dashboard/cloud-providers', request.url);
      errorUrl.searchParams.set('gcp_error', 'data_fetch_failed');
      errorUrl.searchParams.set('gcp_error_description', dataResult.error || 'Failed to fetch GCP data');
      
      return NextResponse.redirect(errorUrl);
    }

    // Store connection and data in Supabase
    console.log('Storing GCP connection and data...');
    
    // Here we would typically use a Supabase service to store the data
    // For now, we'll create a simplified storage call
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Encrypt and store tokens
    const encryptedTokens = gcpOAuthClient.constructor.encryptTokens(tokens);

    // Store connection information
    const connectionData = {
      user_id: session.user.id,
      connection_status: 'connected',
      account_info: dataResult.data!.accountInfo,
      tokens_encrypted: encryptedTokens,
      last_sync: new Date().toISOString(),
    };

    const { error: dbError } = await supabase
      .from('gcp_connections')
      .upsert(connectionData, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Error storing GCP connection:', dbError);
      
      const errorUrl = new URL('/dashboard/cloud-providers', request.url);
      errorUrl.searchParams.set('gcp_error', 'storage_failed');
      errorUrl.searchParams.set('gcp_error_description', 'Failed to store connection data');
      
      return NextResponse.redirect(errorUrl);
    }

    // Store billing data if available
    if (dataResult.data!.billingData.length > 0) {
      const { error: billingError } = await supabase
        .from('gcp_billing_data')
        .insert(
          dataResult.data!.billingData.map(data => ({
            user_id: session.user.id,
            project_id: data.projectId,
            billing_account_id: data.billingAccountId,
            cost: data.cost,
            currency: data.currency,
            start_date: data.startDate,
            end_date: data.endDate,
            services: data.services,
            created_at: new Date().toISOString(),
          }))
        );

      if (billingError) {
        console.warn('Error storing billing data:', billingError);
        // Don't fail the entire flow for billing data storage issues
      }
    }

    console.log('GCP OAuth flow completed successfully');

    // Redirect to dashboard with success message
    const successUrl = new URL('/dashboard/cloud-providers', request.url);
    successUrl.searchParams.set('gcp_connected', 'true');
    successUrl.searchParams.set('projects_count', dataResult.data!.projects.length.toString());
    successUrl.searchParams.set('billing_accounts_count', dataResult.data!.billingAccounts.length.toString());
    
    return NextResponse.redirect(successUrl);

  } catch (error: any) {
    console.error('Error processing OAuth callback:', error);
    
    const errorUrl = new URL('/dashboard/cloud-providers', request.url);
    errorUrl.searchParams.set('gcp_error', 'callback_failed');
    errorUrl.searchParams.set('gcp_error_description', error.message || 'Unknown error occurred');
    
    return NextResponse.redirect(errorUrl);
  }
}
