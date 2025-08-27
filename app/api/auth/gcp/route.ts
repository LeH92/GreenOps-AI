import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { gcpOAuthClient } from '@/lib/gcp/oauth-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Check if OAuth credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth credentials not configured');
      return NextResponse.json(
        { 
          error: 'OAuth configuration missing',
          message: 'Google OAuth credentials are not configured. Please check your environment variables.',
          details: {
            GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET
          }
        }, 
        { status: 400 }
      );
    }

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

    // Generate OAuth authorization URL using email as user identifier
    const authUrl = gcpOAuthClient.generateAuthUrl(user.email);

    // Log OAuth initiation for debugging
    console.log('Initiating GCP OAuth for user:', user.email);
    console.log('Redirect URL:', authUrl);

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);

  } catch (error: any) {
    console.error('Error initiating GCP OAuth:', error);
    
    return NextResponse.json(
      { 
        error: 'OAuth initiation failed',
        message: error.message,
        details: 'Check server logs for more information'
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/gcp
 * Alternative endpoint for programmatic OAuth initiation
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Parse request body for any additional parameters
    const body = await request.json().catch(() => ({}));
    
    // Generate OAuth authorization URL
    const authUrl = gcpOAuthClient.generateAuthUrl(session.user.id);

    // Return the authorization URL instead of redirecting
    return NextResponse.json({
      success: true,
      authUrl,
      message: 'OAuth URL generated successfully'
    });

  } catch (error: any) {
    console.error('Error generating GCP OAuth URL:', error);
    
    return NextResponse.json(
      { 
        error: 'OAuth URL generation failed',
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}
