'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Database, Shield, Key, Globe } from 'lucide-react'

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [authStatus, setAuthStatus] = useState<'checking' | 'ready' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [configInfo, setConfigInfo] = useState<{
    url: string
    hasAnonKey: boolean
    envVars: boolean
  }>({
    url: '',
    hasAnonKey: false,
    envVars: false
  })

  useEffect(() => {
    checkConfiguration()
    testConnection()
  }, [])

  const checkConfiguration = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    setConfigInfo({
      url: url || 'Missing',
      hasAnonKey: !!anonKey,
      envVars: !!(url && anonKey)
    })
  }

  const testConnection = async () => {
    try {
      setConnectionStatus('checking')
      
      // Test de la connexion de base
      const { data, error } = await supabase.from('providers').select('count').limit(1)
      
      if (error) {
        // Si c'est une erreur d'authentification, c'est normal (pas de session)
        if (error.code === 'PGRST116') {
          setConnectionStatus('connected')
          setAuthStatus('ready')
        } else {
          throw error
        }
      } else {
        setConnectionStatus('connected')
        setAuthStatus('ready')
      }
    } catch (error: any) {
      console.error('Supabase connection error:', error)
      setConnectionStatus('error')
      setAuthStatus('error')
      setErrorMessage(error.message || 'Erreur de connexion inconnue')
    }
  }

  const testAuthFlow = async () => {
    try {
      setAuthStatus('checking')
      
      // Test de l'authentification
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }
      
      setAuthStatus('ready')
    } catch (error: any) {
      console.error('Auth test error:', error)
      setAuthStatus('error')
      setErrorMessage(error.message || 'Erreur d\'authentification')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Checking...</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Test de Connexion Supabase
        </CardTitle>
        <CardDescription>
          Vérification de la configuration et de la connexion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Configuration</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(configInfo.envVars ? 'connected' : 'error')}
            <Badge variant={configInfo.envVars ? 'default' : 'destructive'}>
              {configInfo.envVars ? 'Configured' : 'Missing'}
            </Badge>
          </div>
        </div>

        {/* Database Connection */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Connexion Base de Données</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(connectionStatus)}
            {getStatusBadge(connectionStatus)}
          </div>
        </div>

        {/* Authentication */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Authentification</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(authStatus)}
            {getStatusBadge(authStatus)}
          </div>
        </div>

        {/* Environment Variables Details */}
        {!configInfo.envVars && (
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              Variables d'environnement manquantes. Vérifiez que le fichier .env.local contient :
              <br />
              <code className="text-xs bg-muted p-1 rounded">
                NEXT_PUBLIC_SUPABASE_URL=...
                <br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=...
              </code>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={testConnection} variant="outline" size="sm">
            Tester la Connexion
          </Button>
          <Button onClick={testAuthFlow} variant="outline" size="sm">
            Tester l'Auth
          </Button>
        </div>

        {/* Configuration Details */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>URL: {configInfo.url}</div>
          <div>Clé Anonyme: {configInfo.hasAnonKey ? '✓ Présente' : '✗ Manquante'}</div>
        </div>
      </CardContent>
    </Card>
  )
}
