import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/debug/fix-connection
 * Force la mise à jour du statut de connexion pour un utilisateur
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail required' }, { status: 400 });
    }

    console.log('🔧 Fixing connection for user:', userEmail);

    // Mettre à jour le statut de connexion
    const { data: updated, error } = await supabase
      .from('gcp_connections')
      .update({
        connection_status: 'connected',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userEmail)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Update failed', details: error }, { status: 500 });
    }

    console.log('✅ Connection status updated:', updated);

    return NextResponse.json({
      success: true,
      message: 'Connection status updated to connected',
      connection: updated
    });

  } catch (error: any) {
    console.error('❌ Fix connection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}



