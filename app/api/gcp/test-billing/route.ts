import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GCPDataFetcher } from '@/services/GCPDataFetcher';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/test-billing
 * Test spécifique pour les comptes de facturation GCP
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing GCP Billing Accounts specifically...');
    
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
      .select('tokens_encrypted, account_info, connection_status, last_sync')
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

    console.log('✅ GCP connection found');

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

    // Tester spécifiquement les comptes de facturation
    try {
      console.log('🔄 Initializing GCPDataFetcher...');
      const dataFetcher = new GCPDataFetcher(connection.tokens_encrypted);
      
      console.log('📡 Testing billing accounts fetch specifically...');
      const billingAccounts = await dataFetcher.fetchBillingAccounts();
      console.log('✅ Billing accounts result:', billingAccounts);

      // Test aussi les projets pour comparaison
      console.log('📡 Testing projects fetch for comparison...');
      const projects = await dataFetcher.fetchProjects();
      console.log('✅ Projects result:', projects);

      return NextResponse.json({
        success: true,
        message: 'Billing accounts test completed',
        data: {
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
          connectionInfo: {
            status: connection.connection_status,
            lastSync: connection.last_sync,
            userEmail: user.email
          }
        }
      });

    } catch (gcpError: any) {
      console.error('❌ GCP API Error during billing test:', gcpError);
      
      return NextResponse.json({
        success: false,
        error: 'GCP API Error during billing test',
        debug: {
          errorMessage: gcpError.message,
          errorCode: gcpError.code,
          errorStatus: gcpError.status,
          errorDetails: gcpError.details,
          isApiError: gcpError.message?.includes('API has not been used') || gcpError.message?.includes('disabled'),
          isPermissionError: gcpError.code === 403,
          fullError: {
            name: gcpError.name,
            message: gcpError.message,
            stack: gcpError.stack
          }
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Test Billing API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during billing test',
      debug: {
        errorMessage: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
}

