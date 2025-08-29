import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/debug-complete
 * Debug complet du processus OAuth GCP
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

    console.log('🔍 Debug complet GCP pour user:', user.email);

    const debugResults = {
      user: {
        email: user.email,
        id: user.id,
        authenticated: true
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Défini' : '❌ Manquant',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Défini' : '❌ Manquant',
        googleClientId: process.env.GOOGLE_CLIENT_ID ? '✅ Défini' : '❌ Manquant',
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ Défini' : '❌ Manquant'
      },
      database: {
        tables: {},
        connection: {}
      },
      gcp: {
        oauth: {},
        apis: {}
      }
    };

    // 1. VÉRIFIER LES TABLES SUPABASE
    console.log('🔍 Vérification des tables Supabase...');
    
    try {
      // Test table gcp_connections
      const { data: connections, error: connError } = await supabase
        .from('gcp_connections')
        .select('*')
        .eq('user_id', user.email);
      
      debugResults.database.tables.gcp_connections = {
        exists: !connError,
        error: connError?.message || null,
        count: connections?.length || 0,
        data: connections || []
      };

      // Test table gcp_projects
      const { data: projects, error: projError } = await supabase
        .from('gcp_projects')
        .select('*')
        .eq('user_id', user.email);
      
      debugResults.database.tables.gcp_projects = {
        exists: !projError,
        error: projError?.message || null,
        count: projects?.length || 0,
        data: projects || []
      };

      // Test table gcp_billing_accounts
      const { data: billing, error: billError } = await supabase
        .from('gcp_billing_accounts')
        .select('*')
        .eq('user_id', user.email);
      
      debugResults.database.tables.gcp_billing_accounts = {
        exists: !billError,
        error: billError?.message || null,
        count: billing?.length || 0,
        data: billing || []
      };

    } catch (dbError: any) {
      debugResults.database.tables.error = dbError.message;
    }

    // 2. VÉRIFIER LA CONNEXION GCP
    console.log('🔍 Vérification de la connexion GCP...');
    
    try {
      const { data: connection, error: connectionError } = await supabase
        .from('gcp_connections')
        .select('*')
        .eq('user_id', user.email)
        .eq('connection_status', 'connected')
        .single();

      if (connectionError) {
        debugResults.database.connection = {
          exists: false,
          error: connectionError.message,
          status: 'not_found'
        };
      } else {
        debugResults.database.connection = {
          exists: true,
          status: connection.connection_status,
          lastSync: connection.last_sync,
          createdAt: connection.created_at,
          updatedAt: connection.updated_at,
          hasTokens: !!connection.tokens_encrypted,
          tokenSize: connection.tokens_encrypted?.length || 0,
          accountInfo: connection.account_info
        };

        // 3. ANALYSER LES TOKENS
        if (connection.tokens_encrypted) {
          try {
            const tokens = JSON.parse(connection.tokens_encrypted);
            debugResults.gcp.oauth.tokens = {
              hasAccessToken: !!tokens.access_token,
              hasRefreshToken: !!tokens.refresh_token,
              accessTokenLength: tokens.access_token?.length || 0,
              refreshTokenLength: tokens.refresh_token?.length || 0,
              expiresAt: tokens.expires_at,
              tokenType: tokens.token_type,
              scope: tokens.scope
            };

            // 4. TESTER LES APIS GCP AVEC LES TOKENS
            console.log('🔍 Test des APIs GCP avec les tokens...');
            
            const oauth2Client = new google.auth.OAuth2(
              process.env.GOOGLE_CLIENT_ID,
              process.env.GOOGLE_CLIENT_SECRET,
              'http://localhost:3000/api/auth/gcp/callback'
            );

            oauth2Client.setCredentials({
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expiry_date: tokens.expires_at?.getTime() || Date.now() + 3600000,
            });

            // Test Cloud Billing API
            try {
              const billing = google.cloudbilling({ version: 'v1', auth: oauth2Client });
              const { data } = await billing.billingAccounts.list();
              debugResults.gcp.apis.cloudBilling = {
                status: '✅ Active',
                billingAccounts: data.billingAccounts?.length || 0,
                details: 'Successfully fetched billing accounts'
              };
            } catch (error: any) {
              debugResults.gcp.apis.cloudBilling = {
                status: '❌ Not Active',
                error: error.message,
                details: 'API not enabled or access denied'
              };
            }

            // Test Cloud Resource Manager API
            try {
              const resourceManager = google.cloudresourcemanager({ version: 'v1', auth: oauth2Client });
              const { data } = await resourceManager.projects.list();
              debugResults.gcp.apis.cloudResourceManager = {
                status: '✅ Active',
                projects: data.projects?.length || 0,
                details: 'Successfully fetched projects'
              };
            } catch (error: any) {
              debugResults.gcp.apis.cloudResourceManager = {
                status: '❌ Not Active',
                error: error.message,
                details: 'API not enabled or access denied'
              };
            }

          } catch (tokenError: any) {
            debugResults.gcp.oauth.tokenError = tokenError.message;
          }
        } else {
          debugResults.gcp.oauth.tokens = {
            error: 'No tokens found in connection'
          };
        }
      }

    } catch (gcpError: any) {
      debugResults.gcp.error = gcpError.message;
    }

    // 5. GÉNÉRER LES RECOMMANDATIONS
    const recommendations = [];

    if (!debugResults.environment.serviceRoleKey.includes('✅')) {
      recommendations.push('❌ SUPABASE_SERVICE_ROLE_KEY manquant - OAuth ne peut pas fonctionner');
    }

    if (!debugResults.environment.googleClientId.includes('✅')) {
      recommendations.push('❌ GOOGLE_CLIENT_ID manquant - OAuth ne peut pas fonctionner');
    }

    if (!debugResults.database.connection.exists) {
      recommendations.push('❌ Aucune connexion GCP trouvée - Connectez-vous d\'abord');
    } else if (!debugResults.database.connection.hasTokens) {
      recommendations.push('❌ Tokens GCP manquants - Reconnectez-vous à Google Cloud');
    }

    if (debugResults.gcp.apis.cloudResourceManager?.status?.includes('❌')) {
      recommendations.push('❌ Cloud Resource Manager API non activée - Activez-la dans Google Cloud Console');
    }

    if (debugResults.gcp.apis.cloudBilling?.status?.includes('❌')) {
      recommendations.push('❌ Cloud Billing API non activée - Activez-la dans Google Cloud Console');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Configuration GCP OAuth correcte');
    }

    const response = {
      success: true,
      message: 'Debug complet GCP terminé',
      timestamp: new Date().toISOString(),
      data: debugResults,
      recommendations,
      summary: {
        totalIssues: recommendations.filter(r => r.includes('❌')).length,
        criticalIssues: recommendations.filter(r => r.includes('❌')).length,
        status: recommendations.filter(r => r.includes('❌')).length === 0 ? '✅ OK' : '❌ PROBLÈMES DÉTECTÉS'
      }
    };

    console.log('🎉 Debug complet terminé:', response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Debug complet error:', error);
    return NextResponse.json(
      { error: 'Debug complet failed', details: error.message }, 
      { status: 500 }
    );
  }
}
