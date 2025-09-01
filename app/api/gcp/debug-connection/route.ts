import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GCPDataFetcher } from '@/services/GCPDataFetcher';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/debug-connection
 * Debug endpoint pour diagnostiquer les problèmes de connexion GCP
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting GCP connection debug...');
    
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' }, 
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier le token Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication failed', details: authError }, 
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.email);

    // Récupérer la connexion GCP depuis Supabase
    const { data: connection, error: connectionError } = await supabase
      .from('gcp_connections')
      .select('*')
      .eq('user_id', user.email)
      .eq('connection_status', 'connected')
      .single();

    if (connectionError || !connection) {
      console.log('❌ No GCP connection found:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'No active GCP connection found',
        debug: {
          userEmail: user.email,
          connectionError: connectionError?.message,
          hasConnection: !!connection
        }
      });
    }

    console.log('✅ GCP connection found:', {
      userId: connection.user_id,
      status: connection.connection_status,
      hasTokens: !!connection.tokens_encrypted,
      lastSync: connection.last_sync,
      createdAt: connection.created_at
    });

    if (!connection.tokens_encrypted) {
      return NextResponse.json({
        success: false,
        error: 'GCP tokens not found',
        debug: {
          connectionId: connection.id,
          hasTokens: false
        }
      });
    }

    // Tester les tokens
    let tokens;
    try {
      tokens = JSON.parse(connection.tokens_encrypted);
      console.log('✅ Tokens parsed successfully:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        tokenType: tokens.token_type,
        expiresAt: tokens.expires_at
      });
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token format',
        debug: {
          parseError: parseError.message
        }
      });
    }

    // Tester la connexion avec GCPDataFetcher
    try {
      console.log('🔄 Testing GCP API connection...');
      const dataFetcher = new GCPDataFetcher(connection.tokens_encrypted);
      
      // Test simple : récupérer les infos du compte
      console.log('📡 Testing account info fetch...');
      const accountInfo = await dataFetcher.fetchAccountInfo();
      console.log('✅ Account info:', accountInfo);
      
      // Test : récupérer les comptes de facturation
      console.log('📡 Testing billing accounts fetch...');
      const billingAccounts = await dataFetcher.fetchBillingAccounts();
      console.log('✅ Billing accounts:', billingAccounts);
      
      // Test : récupérer les projets
      console.log('📡 Testing projects fetch...');
      const projects = await dataFetcher.fetchProjects();
      console.log('✅ Projects:', projects);

      return NextResponse.json({
        success: true,
        debug: {
          userEmail: user.email,
          connectionStatus: connection.connection_status,
          accountInfo,
          billingAccountsCount: billingAccounts.length,
          billingAccounts: billingAccounts.map(acc => ({
            name: acc.name,
            displayName: acc.displayName,
            open: acc.open
          })),
          projectsCount: projects.length,
          projects: projects.map(proj => ({
            projectId: proj.projectId,
            name: proj.name,
            billingAccountName: proj.billingAccountName
          })),
          tokenInfo: {
            hasAccessToken: !!tokens.access_token,
            hasRefreshToken: !!tokens.refresh_token,
            tokenType: tokens.token_type,
            expiresAt: tokens.expires_at
          }
        }
      });

    } catch (gcpError: any) {
      console.error('❌ GCP API Error:', gcpError);
      
      return NextResponse.json({
        success: false,
        error: 'GCP API Error',
        debug: {
          errorMessage: gcpError.message,
          errorCode: gcpError.code,
          errorStatus: gcpError.status,
          errorDetails: gcpError.details,
          isApiError: gcpError.message?.includes('API has not been used'),
          isPermissionError: gcpError.code === 403,
          fullError: gcpError
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Debug API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      debug: {
        errorMessage: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
}

