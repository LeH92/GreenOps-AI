import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Middleware désactivé - laisser passer toutes les requêtes
  console.log('🔓 Middleware disabled - allowing all requests')
  return NextResponse.next()
}

export const config = {
  matcher: []  // Matcher vide = middleware ne s'exécute jamais
}
