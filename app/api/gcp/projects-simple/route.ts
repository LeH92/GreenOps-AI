import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GCPDataFetcher } from '@/services/GCPDataFetcher';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/projects-simple
 * Version simplifiée qui récupère seulement les projets et comptes de facturation
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting simple GCP projects fetch...');
    
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
        { error: 'Authentication failed' }, 
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.email);

    // Récupérer la connexion GCP depuis Supabase
    const { data: connection, error: connectionError } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted, account_info')
      .eq('user_id', user.email)
      .eq('connection_status', 'connected')
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'No active GCP connection found' }, 
        { status: 404 }
      );
    }

    if (!connection.tokens_encrypted) {
      return NextResponse.json(
        { error: 'GCP tokens not found' }, 
        { status: 400 }
      );
    }

    try {
      console.log('🔄 Initializing GCP data fetcher...');
      const dataFetcher = new GCPDataFetcher(connection.tokens_encrypted);
      
      // Récupérer SEULEMENT les comptes de facturation et projets (pas fetchInitialData)
      console.log('📡 Fetching billing accounts...');
      const billingAccounts = await dataFetcher.fetchBillingAccounts();
      console.log(`✅ Found ${billingAccounts.length} billing accounts`);
      
      console.log('📡 Fetching projects...');
      const projects = await dataFetcher.fetchProjects();
      console.log(`✅ Found ${projects.length} projects`);

      // Retourner immédiatement les données simples
      const response = {
        success: true,
        data: {
          projects: projects || [],
          billingAccounts: billingAccounts || [],
          lastSync: new Date().toISOString(),
          userEmail: user.email
        }
      };

      console.log(`🎉 Simple fetch completed: ${response.data.projects.length} projects, ${response.data.billingAccounts.length} billing accounts`);

      return NextResponse.json(response);

    } catch (gcpError: any) {
      console.error('❌ GCP API Error:', gcpError);
      
      // Gestion d'erreur spécifique
      if (gcpError.message?.includes('API has not been used') || gcpError.message?.includes('disabled')) {
        return NextResponse.json({
          error: 'GCP APIs not enabled',
          message: 'Required Google Cloud APIs are not enabled',
          details: gcpError.message,
          solution: 'Please enable the required APIs in Google Cloud Console',
          apis: [
            'Cloud Billing API',
            'Cloud Resource Manager API'
          ]
        }, { status: 403 });
      }

      if (gcpError.code === 403) {
        return NextResponse.json({
          error: 'Insufficient permissions',
          message: 'You do not have sufficient permissions to access billing accounts',
          details: gcpError.message,
          solution: 'Please ensure you have the "Billing Account Viewer" role'
        }, { status: 403 });
      }

      return NextResponse.json(
        { error: 'Failed to fetch GCP data', details: gcpError.message }, 
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}



