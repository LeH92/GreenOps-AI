import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GCPDataFetcher } from '@/services/GCPDataFetcher';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/projects
 * Récupère la liste des projets GCP pour un utilisateur connecté
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

    console.log('Fetching GCP projects for user:', user.email);

    // Récupérer la connexion GCP depuis Supabase
    const { data: connection, error: connectionError } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted, account_info')
      .eq('user_id', user.email)
      .eq('connection_status', 'connected')
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'No active GCP connection found. Please connect to Google Cloud first.' }, 
        { status: 404 }
      );
    }

    if (!connection.tokens_encrypted) {
      return NextResponse.json(
        { error: 'GCP tokens not found. Please reconnect to Google Cloud.' }, 
        { status: 400 }
      );
    }

    try {
      // Initialiser le data fetcher avec les tokens
      const dataFetcher = new GCPDataFetcher(connection.tokens_encrypted);
      
      // Récupérer les données GCP
      console.log('Fetching GCP data for projects...');
      const dataResult = await dataFetcher.fetchInitialData();

      if (!dataResult.success) {
        return NextResponse.json(
          { error: 'Failed to fetch GCP data', details: dataResult.error }, 
          { status: 500 }
        );
      }

      // Retourner la liste des projets et comptes de facturation
      const response = {
        success: true,
        data: {
          projects: dataResult.data.projects || [],
          billingAccounts: dataResult.data.billingAccounts || [],
          billingData: dataResult.data.billingData || [],
          lastSync: new Date().toISOString(),
          userEmail: user.email
        }
      };

      console.log(`Successfully fetched ${response.data.projects.length} projects and ${response.data.billingAccounts.length} billing accounts`);

      return NextResponse.json(response);

    } catch (gcpError: any) {
      console.error('Error fetching GCP data:', gcpError);
      
      // Si c'est une erreur d'API non activée, retourner un message spécifique
      if (gcpError.message?.includes('API has not been used') || gcpError.message?.includes('disabled')) {
        return NextResponse.json({
          error: 'GCP APIs not enabled',
          message: 'Some Google Cloud APIs are not enabled in your project',
          details: gcpError.message,
          solution: 'Please enable the required APIs in Google Cloud Console',
          apis: [
            'Cloud Billing API',
            'Cloud Resource Manager API',
            'BigQuery API',
            'Monitoring API'
          ]
        }, { status: 403 });
      }

      return NextResponse.json(
        { error: 'Failed to fetch GCP projects', details: gcpError.message }, 
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('API Error fetching GCP projects:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/gcp/projects
 * Met à jour les données des projets GCP (refresh)
 */
export async function POST(request: NextRequest) {
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

    console.log('Refreshing GCP projects for user:', user.email);

    // Récupérer la connexion GCP depuis Supabase
    const { data: connection, error: connectionError } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted, account_info')
      .eq('user_id', user.email)
      .eq('connection_status', 'connected')
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'No active GCP connection found. Please connect to Google Cloud first.' }, 
        { status: 404 }
      );
    }

    if (!connection.tokens_encrypted) {
      return NextResponse.json(
        { error: 'GCP tokens not found. Please reconnect to Google Cloud.' }, 
        { status: 400 }
      );
    }

    try {
      // Initialiser le data fetcher avec les tokens
      const dataFetcher = new GCPDataFetcher(connection.tokens_encrypted);
      
      // Récupérer les données GCP fraîches
      console.log('Refreshing GCP data...');
      const dataResult = await dataFetcher.fetchInitialData();

      if (!dataResult.success) {
        return NextResponse.json(
          { error: 'Failed to refresh GCP data', details: dataResult.error }, 
          { status: 500 }
        );
      }

      // Mettre à jour les informations de connexion dans Supabase
      const { error: updateError } = await supabase
        .from('gcp_connections')
        .update({
          account_info: {
            ...connection.account_info,
            projects: dataResult.data.projects || [],
            billingAccounts: dataResult.data.billingAccounts || [],
          },
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.email);

      if (updateError) {
        console.error('Error updating connection info:', updateError);
      }

      // Retourner les données fraîches
      const response = {
        success: true,
        message: 'GCP data refreshed successfully',
        data: {
          projects: dataResult.data.projects || [],
          billingAccounts: dataResult.data.billingAccounts || [],
          billingData: dataResult.data.billingData || [],
          lastSync: new Date().toISOString(),
          userEmail: user.email
        }
      };

      console.log(`Successfully refreshed ${response.data.projects.length} projects and ${response.data.billingAccounts.length} billing accounts`);

      return NextResponse.json(response);

    } catch (gcpError: any) {
      console.error('Error refreshing GCP data:', gcpError);
      
      return NextResponse.json(
        { error: 'Failed to refresh GCP projects', details: gcpError.message }, 
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('API Error refreshing GCP projects:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}
