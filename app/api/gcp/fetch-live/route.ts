import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GCPDataFetcher } from '@/services/GCPDataFetcher';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/fetch-live
 * Récupère les données GCP en temps réel depuis Google Cloud
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Live fetch: Starting fresh GCP data retrieval...');
    
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    // Récupérer la connexion GCP
    const { data: connection, error: connectionError } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted')
      .eq('user_id', user.email)
      .eq('connection_status', 'connected')
      .single();

    if (connectionError || !connection) {
      console.log('❌ No active connection found');
      return NextResponse.json({ 
        error: 'No active GCP connection found',
        action: 'Please reconnect to Google Cloud'
      }, { status: 404 });
    }

    if (!connection.tokens_encrypted) {
      console.log('❌ No tokens found');
      return NextResponse.json({ 
        error: 'No GCP tokens found',
        action: 'Please reconnect to Google Cloud'
      }, { status: 400 });
    }

    // Récupérer directement depuis Google Cloud
    try {
      console.log('📡 Fetching live data from Google Cloud APIs...');
      const dataFetcher = new GCPDataFetcher(connection.tokens_encrypted);
      
      // Récupération en parallèle pour plus de rapidité
      console.log('🔄 Fetching billing accounts...');
      const billingAccountsPromise = dataFetcher.fetchBillingAccounts();
      
      console.log('🔄 Fetching projects...');
      const projectsPromise = dataFetcher.fetchProjects();
      
      // Attendre les deux en parallèle
      const [billingAccounts, projects] = await Promise.all([
        billingAccountsPromise,
        projectsPromise
      ]);

      console.log(`✅ Live fetch completed: ${billingAccounts.length} billing accounts, ${projects.length} projects`);

      return NextResponse.json({
        success: true,
        data: {
          billingAccounts,
          projects,
          userEmail: user.email,
          fetchedAt: new Date().toISOString()
        }
      });

    } catch (gcpError: any) {
      console.error('❌ GCP API Error:', gcpError);
      
      if (gcpError.message?.includes('API has not been used') || gcpError.message?.includes('disabled')) {
        return NextResponse.json({
          error: 'GCP APIs not enabled',
          message: 'Required Google Cloud APIs are not enabled',
          apis: ['Cloud Billing API', 'Cloud Resource Manager API'],
          action: 'Enable APIs in Google Cloud Console'
        }, { status: 403 });
      }

      if (gcpError.code === 403) {
        return NextResponse.json({
          error: 'Insufficient permissions',
          message: 'You do not have sufficient permissions',
          action: 'Check your IAM roles (Billing Account Viewer required)'
        }, { status: 403 });
      }

      return NextResponse.json({
        error: 'Failed to fetch GCP data',
        details: gcpError.message,
        action: 'Check your Google Cloud permissions and API access'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Live fetch API Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}



