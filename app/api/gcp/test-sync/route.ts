import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/gcp/test-sync
 * Route de test pour la synchronisation GCP et le remplissage de la table Supabase
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

    console.log('🧪 Test sync for user:', user.email);

    // 1. Créer ou mettre à jour l'entrée dans user_accounts_sync
    const { data: syncRecord, error: syncError } = await supabase
      .from('user_accounts_sync')
      .upsert({
        user_email: user.email,
        account_type: 'gcp',
        sync_status: 'syncing',
        account_info: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          lastOAuth: new Date().toISOString(),
          testMode: true
        },
        synced_data: {
          projects: [
            {
              projectId: 'test-project-123',
              name: 'Projet Test GCP',
              projectNumber: '123456789',
              billingAccountId: 'billing-account-123'
            },
            {
              projectId: 'demo-project-456',
              name: 'Projet Démo GCP',
              projectNumber: '987654321',
              billingAccountId: 'billing-account-456'
            }
          ],
          billingAccounts: [
            {
              id: 'billing-account-123',
              displayName: 'Compte Facturation Principal',
              open: true
            },
            {
              id: 'billing-account-456',
              displayName: 'Compte Facturation Secondaire',
              open: true
            }
          ],
          costData: [
            {
              projectId: 'test-project-123',
              cost: 125.50,
              currency: 'USD',
              period: '2024-01'
            },
            {
              projectId: 'demo-project-456',
              cost: 89.75,
              currency: 'USD',
              period: '2024-01'
            }
          ]
        },
        last_sync_attempt: new Date().toISOString(),
        last_successful_sync: new Date().toISOString(),
        sync_error_message: null,
        sync_retry_count: 0,
        auto_sync_enabled: true,
        sync_frequency_hours: 24
      }, { 
        onConflict: 'user_email,account_type',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (syncError) {
      console.error('❌ Error creating sync record:', syncError);
      return NextResponse.json(
        { error: 'Failed to create sync record', details: syncError }, 
        { status: 500 }
      );
    }

    console.log('✅ Sync record created/updated:', syncRecord.id);

    // 2. Créer un log de synchronisation
    const { data: logRecord, error: logError } = await supabase
      .from('user_sync_logs')
      .insert({
        user_account_sync_id: syncRecord.id,
        sync_operation: 'test_sync',
        sync_result: 'success',
        projects_count: 2,
        billing_accounts_count: 2,
        cost_data_count: 2,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: 1500
      })
      .select()
      .single();

    if (logError) {
      console.error('⚠️ Warning: Could not create sync log:', logError);
    } else {
      console.log('✅ Sync log created:', logRecord.id);
    }

    // 3. Mettre à jour le statut de synchronisation
    const { error: updateError } = await supabase
      .from('user_accounts_sync')
      .update({
        sync_status: 'completed',
        last_successful_sync: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', syncRecord.id);

    if (updateError) {
      console.error('⚠️ Warning: Could not update sync status:', updateError);
    }

    // 4. Retourner les données de test
    const response = {
      success: true,
      message: 'Test sync completed successfully',
      data: {
        syncRecordId: syncRecord.id,
        logRecordId: logRecord?.id,
        userEmail: user.email,
        accountType: 'gcp',
        syncStatus: 'completed',
        projectsCount: 2,
        billingAccountsCount: 2,
        costDataCount: 2,
        timestamp: new Date().toISOString()
      }
    };

    console.log('🎉 Test sync response:', response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Test sync error:', error);
    return NextResponse.json(
      { error: 'Test sync failed', details: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/gcp/test-sync
 * Récupère le statut de synchronisation de l'utilisateur
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

    console.log('📊 Getting sync status for user:', user.email);

    // Récupérer le statut de synchronisation
    const { data: syncStatus, error: syncError } = await supabase
      .from('user_accounts_sync')
      .select(`
        *,
        user_sync_logs (
          id,
          sync_operation,
          sync_result,
          created_at,
          duration_ms
        )
      `)
      .eq('user_email', user.email)
      .order('created_at', { ascending: false });

    if (syncError) {
      console.error('❌ Error fetching sync status:', syncError);
      return NextResponse.json(
        { error: 'Failed to fetch sync status', details: syncError }, 
        { status: 500 }
      );
    }

    const response = {
      success: true,
      message: 'Sync status retrieved successfully',
      data: {
        userEmail: user.email,
        syncRecords: syncStatus || [],
        totalRecords: syncStatus?.length || 0,
        timestamp: new Date().toISOString()
      }
    };

    console.log('📊 Sync status response:', response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Get sync status error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status', details: error.message }, 
      { status: 500 }
    );
  }
}
