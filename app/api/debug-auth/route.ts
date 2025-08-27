import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les headers de la requête
    const headers = Object.fromEntries(request.headers.entries());
    
    // Récupérer les cookies
    const cookies = request.headers.get('cookie') || '';
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    const hasAuthToken = !!(authHeader && authHeader.startsWith('Bearer '));
    
    // Essayer de récupérer la session Supabase si un token est fourni
    let user = null;
    let authError = null;
    
    if (hasAuthToken) {
      const token = authHeader!.replace('Bearer ', '');
      const { data, error } = await supabase.auth.getUser(token);
      user = data.user;
      authError = error;
    }
    
    // Vérifier les variables d'environnement
    const envVars = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Défini' : '❌ Manquant',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Défini' : '❌ Manquant',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Défini' : '❌ Manquant',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Défini' : '❌ Manquant',
      NODE_ENV: process.env.NODE_ENV,
    };

    // Analyser les cookies
    const cookieAnalysis = cookies.split(';').map(cookie => {
      const [name, value] = cookie.trim().split('=');
      return {
        name: name || 'unknown',
        value: value ? `${value.substring(0, 30)}...` : 'empty',
        isSupabase: name?.includes('supabase') || name?.includes('sb-') || false
      };
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      serverInfo: {
        nodeEnv: process.env.NODE_ENV,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKeys: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY),
      },
      requestInfo: {
        method: request.method,
        url: request.url,
        userAgent: headers['user-agent'],
        host: headers.host,
        origin: headers.origin,
        referer: headers.referer,
        hasAuthHeader: hasAuthToken,
      },
      cookies: {
        raw: cookies,
        count: cookieAnalysis.length,
        analysis: cookieAnalysis,
        hasSupabaseCookies: cookieAnalysis.some(c => c.isSupabase),
      },
      authentication: {
        hasAuthToken,
        user: user ? {
          id: user.id,
          email: user.email,
          emailConfirmed: user.email_confirmed_at,
          lastSignIn: user.last_sign_in_at,
        } : null,
        authError: authError?.message || null,
        authenticated: !!user,
      },
      environment: envVars,
      recommendations: []
    });

  } catch (error: any) {
    console.error('Debug Auth Error:', error);
    
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString(),
      recommendations: [
        'Vérifiez que NEXT_PUBLIC_SUPABASE_URL est défini',
        'Vérifiez que SUPABASE_SERVICE_ROLE_KEY est défini',
        'Vérifiez que GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sont définis',
        'Redémarrez le serveur après modification des variables d\'environnement',
        'Vérifiez que l\'utilisateur est connecté via Supabase'
      ]
    }, { status: 500 });
  }
}
