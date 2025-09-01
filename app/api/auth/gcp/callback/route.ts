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

    let userEmail: string | null = decodedState.userId || null;
    console.log('Processing OAuth callback, user from state:', userEmail);

    // Exchange code for tokens
    const tokens = await gcpOAuthClient.exchangeCodeForTokens(code);
    console.log('Successfully obtained OAuth tokens');

    // Récupération MINIMALE: uniquement listes comptes de facturation + projets
    // (pas de coûts/billing détaillés). Le fetch complet sera déclenché par le wizard.
    console.log('Fetching minimal lists (billing accounts + projects)...');

    // Fallback: si on n'a pas d'email dans le state, on tente de le déduire via userinfo Google
    if (!userEmail) {
      try {
        const tmpFetcher = new GCPDataFetcher(tokens);
        const accountInfo = await tmpFetcher.fetchAccountInfo();
        userEmail = accountInfo.email || null;
        console.log('User email resolved from Google account info:', userEmail);
      } catch (e) {
        console.warn('Could not resolve Google account info:', e);
      }
    }

    if (!userEmail) {
      console.error('Unable to resolve user identifier for storing connection');
      return NextResponse.redirect(new URL('/dashboard/cloud-providers?gcp_status=error&message=missing_user', request.url));
    }

    // Charger listes minimales
    let minimalBillingAccounts: any[] = [];
    let minimalProjects: any[] = [];
    try {
      const df = new GCPDataFetcher(tokens);
      minimalBillingAccounts = await df.fetchBillingAccounts();
      minimalProjects = await df.fetchProjects();
      console.log(`Minimal fetch: ${minimalBillingAccounts.length} billing accounts, ${minimalProjects.length} projects`);
    } catch (e) {
      console.warn('Minimal lists fetch failed (will proceed with empty lists):', e);
    }

    // STOCKAGE EN BASE (snapshot minimal)
    console.log('Storing minimal connection snapshot in Supabase...');
    const baseAccountInfo = {
      email: userEmail,
      billingAccounts: minimalBillingAccounts,
      projects: minimalProjects,
      oauthStatus: 'connected',
      lastOAuth: new Date().toISOString(),
      note: 'OAuth connected. Detailed data will be fetched from the wizard.'
    };
    
    // Store connection (force update même si existe déjà)
    const { data: storedConnection, error: connectionError } = await supabase
      .from('gcp_connections')
      .upsert({
        user_id: userEmail,
        connection_status: 'connected',
        account_info: baseAccountInfo,
        tokens_encrypted: JSON.stringify(tokens),
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (connectionError) {
      console.error('❌ Failed to store connection:', connectionError);
      throw new Error('Failed to store connection');
    }

    console.log('✅ GCP minimal connection stored successfully:', {
      userId: storedConnection?.user_id,
      status: storedConnection?.connection_status,
      projectsCount: storedConnection?.account_info?.projects?.length || 0,
      billingAccountsCount: storedConnection?.account_info?.billingAccounts?.length || 0,
      hasTokens: !!storedConnection?.tokens_encrypted
    });

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
