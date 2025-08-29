import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/test-apis
 * Teste quelles APIs GCP sont activées pour un utilisateur
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

    console.log('🧪 Testing GCP APIs for user:', user.email);

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

    // Décrypter les tokens (simulation - en production, utilisez une vraie décryption)
    let tokens;
    try {
      tokens = JSON.parse(connection.tokens_encrypted);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token format. Please reconnect to Google Cloud.' }, 
        { status: 400 }
      );
    }

    // Créer le client OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/auth/gcp/callback'
    );

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expires_at?.getTime() || Date.now() + 3600000,
    });

    const apiTests = [];

    // Test 1: Cloud Billing API
    try {
      console.log('🧪 Testing Cloud Billing API...');
      const billing = google.cloudbilling({ version: 'v1', auth: oauth2Client });
      const { data } = await billing.billingAccounts.list();
      apiTests.push({
        api: 'Cloud Billing API',
        status: '✅ Active',
        billingAccounts: data.billingAccounts?.length || 0,
        details: 'Successfully fetched billing accounts'
      });
    } catch (error: any) {
      apiTests.push({
        api: 'Cloud Billing API',
        status: '❌ Not Active',
        error: error.message,
        details: 'API not enabled or access denied'
      });
    }

    // Test 2: Cloud Resource Manager API
    try {
      console.log('🧪 Testing Cloud Resource Manager API...');
      const resourceManager = google.cloudresourcemanager({ version: 'v1', auth: oauth2Client });
      const { data } = await resourceManager.projects.list();
      apiTests.push({
        api: 'Cloud Resource Manager API',
        status: '✅ Active',
        projects: data.projects?.length || 0,
        details: 'Successfully fetched projects'
      });
    } catch (error: any) {
      apiTests.push({
        api: 'Cloud Resource Manager API',
        status: '❌ Not Active',
        error: error.message,
        details: 'API not enabled or access denied'
      });
    }

    // Test 3: BigQuery API
    try {
      console.log('🧪 Testing BigQuery API...');
      const bigquery = google.bigquery({ version: 'v2', auth: oauth2Client });
      const { data } = await bigquery.projects.list();
      apiTests.push({
        api: 'BigQuery API',
        status: '✅ Active',
        projects: data.projects?.length || 0,
        details: 'Successfully fetched BigQuery projects'
      });
    } catch (error: any) {
      apiTests.push({
        api: 'BigQuery API',
        status: '❌ Not Active',
        error: error.message,
        details: 'API not enabled or access denied'
      });
    }

    // Test 4: User Info API (OAuth2)
    try {
      console.log('🧪 Testing User Info API...');
      const { data } = await oauth2Client.request({ 
        url: 'https://www.googleapis.com/oauth2/v2/userinfo' 
      });
      apiTests.push({
        api: 'User Info API (OAuth2)',
        status: '✅ Active',
        userEmail: data.email,
        details: 'Successfully fetched user info'
      });
    } catch (error: any) {
      apiTests.push({
        api: 'User Info API (OAuth2)',
        status: '❌ Not Active',
        error: error.message,
        details: 'OAuth2 user info access denied'
      });
    }

    // Résumé des tests
    const activeApis = apiTests.filter(test => test.status.includes('✅')).length;
    const totalApis = apiTests.length;

    const response = {
      success: true,
      message: `GCP API tests completed. ${activeApis}/${totalApis} APIs are active.`,
      data: {
        userEmail: user.email,
        summary: {
          totalApis,
          activeApis,
          inactiveApis: totalApis - activeApis
        },
        apiTests,
        recommendations: activeApis === 0 ? [
          'Enable Cloud Billing API in Google Cloud Console',
          'Enable Cloud Resource Manager API in Google Cloud Console',
          'Enable BigQuery API in Google Cloud Console'
        ] : activeApis < totalApis ? [
          'Some APIs are not enabled. Enable them for full functionality.'
        ] : [
          'All required APIs are enabled. GCP integration should work properly.'
        ]
      }
    };

    console.log('🎉 GCP API tests completed:', response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ GCP API test error:', error);
    return NextResponse.json(
      { error: 'GCP API test failed', details: error.message }, 
      { status: 500 }
    );
  }
}
