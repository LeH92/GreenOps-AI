import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { gcpOAuthClient } from '@/lib/gcp/oauth-client';
import { GCPDataFetcher } from '@/services/GCPDataFetcher';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  try {
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/dashboard/cloud-providers?gcp_error=' + error, request.url));
    }

    if (!code || !state) {
      console.error('Missing OAuth parameters:', { code: !!code, state: !!state });
      return NextResponse.redirect(new URL('/dashboard/cloud-providers?gcp_error=missing_params', request.url));
    }

    // Parse state to get user email
    let decodedState;
    try {
      decodedState = JSON.parse(state);
    } catch (e) {
      console.error('Failed to decode state:', e);
      return NextResponse.redirect(new URL('/dashboard/cloud-providers?gcp_error=invalid_state', request.url));
    }

    const userEmail = decodedState.userId;
    console.log('Processing OAuth callback for user:', userEmail);

    // Exchange code for tokens
    const tokens = await gcpOAuthClient.exchangeCodeForTokens(code);
    console.log('Successfully obtained OAuth tokens');

    // RÉCUPÉRATION AUTOMATIQUE DES DONNÉES
    console.log('Fetching GCP data automatically...');
    const dataFetcher = new GCPDataFetcher(tokens);
    const dataResult = await dataFetcher.fetchInitialData();

    // Même si la récupération des données échoue, on considère la connexion comme réussie
    // car l'OAuth a fonctionné
    if (!dataResult.success) {
      console.warn('⚠️ GCP data fetch failed, but OAuth succeeded:', dataResult.error);
      // On continue avec des données vides plutôt que de faire échouer tout le processus
    }

    // STOCKAGE EN BASE
    console.log('Storing connection and data in Supabase...');
    
    // Préparer les données de base (même si les APIs GCP ne sont pas activées)
    const baseAccountInfo = {
      email: userEmail,
      billingAccounts: dataResult.data?.billingAccounts || [],
      projects: dataResult.data?.projects || [],
      oauthStatus: 'connected',
      lastOAuth: new Date().toISOString(),
      note: dataResult.success ? 'Full data sync successful' : 'OAuth connected but APIs not enabled'
    };
    
    // Store connection
    const { error: connectionError } = await supabase
      .from('gcp_connections')
      .upsert({
        user_id: userEmail,
        connection_status: 'connected',
        account_info: baseAccountInfo,
        tokens_encrypted: JSON.stringify(tokens),
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (connectionError) {
      console.error('❌ Failed to store connection:', connectionError);
      throw new Error('Failed to store connection');
    }

    console.log('✅ GCP connection stored successfully');

    // Store projects in gcp_projects table
    if (dataResult.data?.projects && dataResult.data.projects.length > 0) {
      const projectRecords = dataResult.data.projects.map(project => ({
        user_id: userEmail,
        project_id: project.projectId,
        project_name: project.name,
        project_number: project.projectNumber,
        billing_account_id: project.billingAccountName?.split('/').pop() || null, // Extract ID from full name
        billing_account_name: dataResult.data?.billingAccounts?.find(ba => ba.name === project.billingAccountName)?.displayName || 'Unknown',
        is_active: true,
        cost_estimate: 0, // Will be updated later
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }));

      const { error: projectError } = await supabase.from('gcp_projects').upsert(projectRecords, {
        onConflict: 'user_id,project_id',
        ignoreDuplicates: false
      });
      
      if (projectError) {
        console.warn('⚠️ Could not store projects:', projectError);
      } else {
        console.log(`✅ ${projectRecords.length} projects stored successfully`);
      }
    }

    // Store billing accounts in gcp_billing_accounts table
    if (dataResult.data?.billingAccounts && dataResult.data.billingAccounts.length > 0) {
      const billingAccountRecords = dataResult.data.billingAccounts.map(account => ({
        user_id: userEmail,
        billing_account_id: account.name.split('/').pop() || account.name, // Extract ID from full name
        billing_account_name: account.displayName,
        is_open: account.open,
        currency_code: 'USD',
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }));

      const { error: billingAccountError } = await supabase.from('gcp_billing_accounts').upsert(billingAccountRecords, {
        onConflict: 'user_id,billing_account_id',
        ignoreDuplicates: false
      });
      
      if (billingAccountError) {
        console.warn('⚠️ Could not store billing accounts:', billingAccountError);
      } else {
        console.log(`✅ ${billingAccountRecords.length} billing accounts stored successfully`);
      }
    }

    // Store billing data if available
    if (dataResult.success && dataResult.data?.billingData && dataResult.data.billingData.length > 0) {
      const billingRecords = dataResult.data.billingData.map(data => ({
        user_id: userEmail,
        project_id: data.projectId,
        billing_account_id: data.billingAccountId,
        cost: data.cost,
        currency: data.currency,
        start_date: data.startDate,
        end_date: data.endDate,
        services: data.services,
        created_at: new Date().toISOString(),
      }));

      const { error: billingError } = await supabase.from('gcp_billing_data').insert(billingRecords);
      if (billingError) {
        console.warn('⚠️ Could not store billing data:', billingError);
      } else {
        console.log('✅ Billing data stored successfully');
      }
    } else {
      console.log('ℹ️ No billing data to store (APIs not enabled)');
    }

    console.log('🎉 GCP OAuth completed successfully!');
    
    // Rediriger vers la page cloud-providers avec les paramètres pour ouvrir le wizard
    const redirectUrl = new URL('/dashboard/cloud-providers', request.url);
    redirectUrl.searchParams.set('gcp_status', 'connected');
    redirectUrl.searchParams.set('auto_open_wizard', 'true');
    redirectUrl.searchParams.set('message', 'Connexion GCP réussie !');
    redirectUrl.searchParams.set('timestamp', Date.now().toString()); // Éviter le cache
    
    console.log('🔄 Redirecting to:', redirectUrl.toString());
    
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    return NextResponse.redirect(new URL('/dashboard/cloud-providers?gcp_status=error&message=' + error.message, request.url));
  }
}
