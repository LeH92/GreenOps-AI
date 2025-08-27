import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { gcpOAuthClient } from '@/lib/gcp/oauth-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
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

    // Parse the request body to get the access token
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      console.error('No access token provided in request body');
      return NextResponse.json(
        { error: 'Access token required in request body' }, 
        { status: 400 }
      );
    }

    // Verify the Supabase JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
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

    // Return the authorization URL instead of redirecting
    return NextResponse.json({
      authUrl,
      message: 'OAuth URL generated successfully'
    });

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
