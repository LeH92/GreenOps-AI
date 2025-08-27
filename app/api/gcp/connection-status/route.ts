import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header (Bearer token from Supabase)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid authorization header found');
      return NextResponse.json(
        { error: 'Authorization header required. Please sign in first.' }, 
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the Supabase JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Supabase authentication failed:', authError);
      return NextResponse.json(
        { error: 'Authentication failed. Please sign in again.' }, 
        { status: 401 }
      );
    }

    console.log('User authenticated via Supabase:', user.email);

    // Check for existing GCP connection
    const { data: connection, error } = await supabase
      .from('gcp_connections')
      .select('*')
      .eq('user_id', user.email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    if (!connection) {
      return NextResponse.json({ connection_status: 'disconnected', account_info: null }, { status: 200 });
    }

    return NextResponse.json(connection, { status: 200 });
  } catch (error: any) {
    console.error('API Error fetching GCP connection status:', error);
    return NextResponse.json({ error: 'Failed to fetch GCP connection status', message: error.message }, { status: 500 });
  }
}
