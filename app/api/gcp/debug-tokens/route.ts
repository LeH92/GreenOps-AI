import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/debug-tokens
 * Debug des tokens et connexions GCP pour un utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required. Please sign in first.' }, 
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier le token Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication failed. Please sign in again.' }, 
        { status: 401 }
      );
    }

    console.log('🔍 Debug GCP tokens for user:', user.email);

    // 1. Vérifier la connexion GCP
    const { data: connection, error: connectionError } = await supabase
      .from('gcp_connections')
      .select('*')
      .eq('user_id', user.email)
      .single();

    if (connectionError) {
      return NextResponse.json({
        error: 'No GCP connection found',
        details: connectionError.message,
        userEmail: user.email,
        recommendations: [
          'Connect to Google Cloud first using the "Connect to Google Cloud" button',
          'Check if OAuth callback was successful'
        ]
      }, { status: 404 });
    }

    // 2. Analyser les tokens
    let tokens;
    let tokenAnalysis = {
      hasTokens: false,
      tokenFormat: 'unknown',
      tokenSize: 0,
      parseError: null
    };

    try {
      if (connection.tokens_encrypted) {
        tokens = JSON.parse(connection.tokens_encrypted);
        tokenAnalysis = {
          hasTokens: true,
          tokenFormat: 'encrypted_json',
          tokenSize: connection.tokens_encrypted.length,
          parseError: null
        };
      }
    } catch (parseError: any) {
      tokenAnalysis.parseError = parseError.message;
    }

    // 3. Vérifier les projets stockés
    const { data: projects, error: projectsError } = await supabase
      .from('gcp_projects')
      .select('*')
      .eq('user_id', user.email);

    // 4. Vérifier les comptes de facturation
    const { data: billingAccounts, error: billingError } = await supabase
      .from('gcp_billing_accounts')
      .select('*')
      .eq('user_id', user.email);

    // 5. Vérifier les données de facturation
    const { data: billingData, error: billingDataError } = await supabase
      .from('gcp_billing_data')
      .select('*')
      .eq('user_id', user.email);

    const response = {
      success: true,
      message: 'GCP connection debug completed',
      data: {
        userEmail: user.email,
        connection: {
          status: connection.connection_status,
          lastSync: connection.last_sync,
          createdAt: connection.created_at,
          updatedAt: connection.updated_at
        },
        tokens: tokenAnalysis,
        storedData: {
          projects: {
            count: projects?.length || 0,
            error: projectsError?.message || null,
            data: projects || []
          },
          billingAccounts: {
            count: billingAccounts?.length || 0,
            error: billingError?.message || null,
            data: billingAccounts || []
          },
          billingData: {
            count: billingData?.length || 0,
            error: billingDataError?.message || null,
            data: billingData || []
          }
        },
        accountInfo: connection.account_info,
        recommendations: []
      }
    };

    // Ajouter des recommandations basées sur l'analyse
    if (!tokenAnalysis.hasTokens) {
      response.data.recommendations.push('❌ No GCP tokens found. Reconnect to Google Cloud.');
    } else if (tokenAnalysis.parseError) {
      response.data.recommendations.push('❌ Token format error. Reconnect to Google Cloud.');
    }

    if (response.data.storedData.projects.count === 0) {
      response.data.recommendations.push('❌ No projects stored. Check if GCP APIs are enabled and accessible.');
    }

    if (response.data.storedData.billingAccounts.count === 0) {
      response.data.recommendations.push('❌ No billing accounts stored. Check Cloud Billing API access.');
    }

    if (response.data.recommendations.length === 0) {
      response.data.recommendations.push('✅ GCP connection appears to be working correctly.');
    }

    console.log('🔍 GCP debug completed:', response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ GCP debug error:', error);
    return NextResponse.json(
      { error: 'GCP debug failed', details: error.message }, 
      { status: 500 }
    );
  }
}
