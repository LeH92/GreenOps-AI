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
      return NextResponse.json({
        authenticated: false,
        user: null,
        sessionExists: false,
        timestamp: new Date().toISOString(),
        message: 'No authorization header found'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the Supabase JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Supabase authentication failed:', error);
      return NextResponse.json({
        authenticated: false,
        user: null,
        sessionExists: false,
        timestamp: new Date().toISOString(),
        message: 'Invalid or expired token'
      });
    }

    console.log('User authenticated via Supabase:', user.email);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at,
        lastSignIn: user.last_sign_in_at,
      },
      sessionExists: true,
      timestamp: new Date().toISOString(),
      message: 'Authentication successful'
    });

  } catch (error: any) {
    console.error('Test Auth Error:', error);
    
    return NextResponse.json({
      error: error.message,
      authenticated: false,
      sessionExists: false,
      timestamp: new Date().toISOString(),
      message: 'Server error occurred'
    }, { status: 500 });
  }
}
