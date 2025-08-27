import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { gcpOAuthClient } from '@/src/lib/gcp/oauth-client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/auth/gcp
 * Initiate OAuth flow with Google Cloud Platform
 */
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

    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Generate OAuth authorization URL
    const authUrl = gcpOAuthClient.generateAuthUrl(session.user.id);

    // Log OAuth initiation for debugging
    console.log('Initiating GCP OAuth for user:', session.user.id);
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
