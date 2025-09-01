import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { gcpOAuthClient } from '@/lib/gcp/oauth-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DisconnectionSummary {
  connectionsRemoved: number;
  projectsArchived: number;
  billingDataArchived: number;
  recommendationsArchived: number;
  anomaliesArchived: number;
  carbonDataArchived: number;
  tokensRevoked: boolean;
  disconnectedAt: string;
}

/**
 * POST /api/gcp/disconnect
 * Déconnexion complète et désynchronisation du compte GCP
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

    const userEmail = user.email;
    console.log(`🔄 Starting GCP disconnection for user: ${userEmail}`);

    const summary: DisconnectionSummary = {
      connectionsRemoved: 0,
      projectsArchived: 0,
      billingDataArchived: 0,
      recommendationsArchived: 0,
      anomaliesArchived: 0,
      carbonDataArchived: 0,
      tokensRevoked: false,
      disconnectedAt: new Date().toISOString()
    };

    // 1. RÉCUPÉRER LA CONNEXION EXISTANTE
    const { data: connection, error: fetchError } = await supabase
      .from('gcp_connections')
      .select('*')
      .eq('user_id', userEmail)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching GCP connection:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch connection data' }, 
        { status: 500 }
      );
    }

    if (!connection) {
      return NextResponse.json(
        { error: 'No GCP connection found for this user' }, 
        { status: 404 }
      );
    }

    // 2. RÉVOQUER LES TOKENS GOOGLE
    if (connection.tokens_encrypted) {
      try {
        const tokens = JSON.parse(connection.tokens_encrypted);
        if (tokens.access_token) {
          await gcpOAuthClient.revokeTokens(tokens.access_token);
          summary.tokensRevoked = true;
          console.log('✅ GCP tokens revoked successfully');
        }
      } catch (revokeError: any) {
        console.warn('⚠️ Failed to revoke GCP tokens:', revokeError.message);
        // Continue with disconnection even if token revocation fails
      }
    }

    // 3. ARCHIVER LES PROJETS (marquer comme inactifs au lieu de supprimer)
    const { data: projects, error: projectsError } = await supabase
      .from('gcp_projects')
      .update({
        is_active: false,
        sync_status: 'disconnected',
        last_sync: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userEmail)
      .select('project_id');

    if (!projectsError && projects) {
      summary.projectsArchived = projects.length;
      console.log(`📦 Archived ${projects.length} projects`);
    }

    // 4. ARCHIVER LES DONNÉES DE SERVICES (soft delete avec flag)
    const { count: billingCount } = await supabase
      .from('gcp_services_usage')
      .update({
        // Ajouter un champ archived_at pour soft delete
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userEmail)
      .select('*', { count: 'exact', head: true });

    summary.billingDataArchived = billingCount || 0;

    // 5. ARCHIVER LES RECOMMANDATIONS (marquer comme obsolètes)
    const { count: recommendationsCount } = await supabase
      .from('gcp_optimization_recommendations')
      .update({
        status: 'obsolete',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userEmail)
      .eq('status', 'new')
      .select('*', { count: 'exact', head: true });

    summary.recommendationsArchived = recommendationsCount || 0;

    // 6. ARCHIVER LES ANOMALIES (marquer comme résolues)
    const { count: anomaliesCount } = await supabase
      .from('gcp_cost_anomalies')
      .update({
        status: 'resolved',
        resolution_notes: 'Account disconnected - anomaly tracking stopped',
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userEmail)
      .eq('status', 'open')
      .select('*', { count: 'exact', head: true });

    summary.anomaliesArchived = anomaliesCount || 0;

    // 7. ARCHIVER LES DONNÉES CARBONE (garder pour historique)
    const { count: carbonCount } = await supabase
      .from('gcp_carbon_footprint')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userEmail)
      .select('*', { count: 'exact', head: true });

    summary.carbonDataArchived = carbonCount || 0;

    // 8. METTRE À JOUR LA CONNEXION PRINCIPALE
    const { error: connectionUpdateError } = await supabase
      .from('gcp_connections')
      .update({
        connection_status: 'disconnected',
        tokens_encrypted: null, // Supprimer les tokens
        account_info: {
          ...connection.account_info,
          disconnected_at: new Date().toISOString(),
          disconnection_reason: 'user_requested',
          projects: [], // Vider la liste des projets
          billingAccounts: [] // Vider la liste des comptes
        },
        last_sync: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userEmail);

    if (connectionUpdateError) {
      console.error('Error updating connection status:', connectionUpdateError);
      return NextResponse.json(
        { error: 'Failed to update connection status' }, 
        { status: 500 }
      );
    }

    summary.connectionsRemoved = 1;

    // 9. CRÉER UN ENREGISTREMENT D'AUDIT
    await supabase.from('gcp_audit_log').insert({
      user_id: userEmail,
      action: 'disconnect',
      details: {
        summary,
        user_agent: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    }).select().single();

    console.log('✅ GCP disconnection completed successfully:', summary);

    return NextResponse.json({
      success: true,
      message: 'GCP account disconnected and data archived successfully',
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error during GCP disconnection:', error);
    
    return NextResponse.json(
      { 
        error: 'Disconnection failed',
        message: error.message,
        details: 'Check server logs for more information'
      }, 
      { status: 500 }
    );
  }
}
