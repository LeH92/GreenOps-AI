'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Database, Shield, Key, Globe, Play } from 'lucide-react'

interface TestResult {
  name: string
  status: 'idle' | 'running' | 'success' | 'error'
  message: string
  duration?: number
}

export function SupabaseApiTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Configuration Check', status: 'idle', message: 'Not tested yet' },
    { name: 'Database Connection', status: 'idle', message: 'Not tested yet' },
    { name: 'Authentication Test', status: 'idle', message: 'Not tested yet' },
    { name: 'Health Check', status: 'idle', message: 'Not tested yet' },
    { name: 'Storage Access', status: 'idle', message: 'Not tested yet' }
  ])

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ))
  }

  const testConfiguration = async () => {
    const startTime = Date.now()
    updateTest(0, { status: 'running', message: 'Checking configuration...' })
    
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        throw new Error('Missing environment variables')
      }
      
      if (!url.includes('supabase.co')) {
        throw new Error('Invalid Supabase URL format')
      }
      
      const duration = Date.now() - startTime
      updateTest(0, { 
        status: 'success', 
        message: `Configuration valid - URL: ${url.substring(0, 30)}...`, 
        duration 
      })
    } catch (error) {
      const duration = Date.now() - startTime
      updateTest(0, { 
        status: 'error', 
        message: `Configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        duration 
      })
    }
  }

  const testDatabaseConnection = async () => {
    const startTime = Date.now()
    updateTest(1, { status: 'running', message: 'Testing database connection...' })
    
    try {
      // Test simple query to check connection
      const { data, error } = await supabase
        .from('providers')
        .select('count')
        .limit(1)
      
      if (error) {
        throw error
      }
      
      const duration = Date.now() - startTime
      updateTest(1, { 
        status: 'success', 
        message: `Database connection successful (${duration}ms)`, 
        duration 
      })
    } catch (error: any) {
      const duration = Date.now() - startTime
      updateTest(1, { 
        status: 'error', 
        message: `Database error: ${error.message || 'Connection failed'}`, 
        duration 
      })
    }
  }

  const testAuthentication = async () => {
    const startTime = Date.now()
    updateTest(2, { status: 'running', message: 'Testing authentication...' })
    
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }
      
      const duration = Date.now() - startTime
      updateTest(2, { 
        status: 'success', 
        message: session ? `User authenticated: ${session.user.email}` : 'No active session (normal for anonymous access)', 
        duration 
      })
    } catch (error: any) {
      const duration = Date.now() - startTime
      updateTest(2, { 
        status: 'error', 
        message: `Auth error: ${error.message || 'Authentication failed'}`, 
        duration 
      })
    }
  }

  const testHealthCheck = async () => {
    const startTime = Date.now()
    updateTest(3, { status: 'running', message: 'Performing health check...' })
    
    try {
      // Test if we can access Supabase REST API
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const duration = Date.now() - startTime
      updateTest(3, { 
        status: 'success', 
        message: `Supabase API healthy (${response.status})`, 
        duration 
      })
    } catch (error: any) {
      const duration = Date.now() - startTime
      updateTest(3, { 
        status: 'error', 
        message: `Health check failed: ${error.message}`, 
        duration 
      })
    }
  }

  const testStorageAccess = async () => {
    const startTime = Date.now()
    updateTest(4, { status: 'running', message: 'Testing storage access...' })
    
    try {
      // List buckets (this will work even if no buckets exist)
      const { data, error } = await supabase.storage.listBuckets()
      
      if (error) {
        throw error
      }
      
      const duration = Date.now() - startTime
      updateTest(4, { 
        status: 'success', 
        message: `Storage accessible - Found ${data.length} buckets`, 
        duration 
      })
    } catch (error: any) {
      const duration = Date.now() - startTime
      updateTest(4, { 
        status: 'error', 
        message: `Storage error: ${error.message || 'Storage access failed'}`, 
        duration 
      })
    }
  }

  const runAllTests = async () => {
    await testConfiguration()
    await testDatabaseConnection()
    await testAuthentication()
    await testHealthCheck()
    await testStorageAccess()
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border border-gray-300" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary">Running...</Badge>
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Idle</Badge>
    }
  }

  const overallStatus = tests.every(t => t.status === 'success') ? 'success' :
                       tests.some(t => t.status === 'error') ? 'error' :
                       tests.some(t => t.status === 'running') ? 'running' : 'idle'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Tests API Supabase
        </CardTitle>
        <CardDescription>
          Tests complets des fonctionnalités Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Statut global des tests</span>
              {getStatusBadge(overallStatus)}
            </div>
          </AlertDescription>
        </Alert>

        {/* Individual Tests */}
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {test.message}
                    {test.duration && ` (${test.duration}ms)`}
                  </div>
                </div>
              </div>
              {getStatusBadge(test.status)}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={runAllTests} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Lancer tous les tests
          </Button>
          <Button variant="outline" onClick={testConfiguration}>
            Config
          </Button>
          <Button variant="outline" onClick={testDatabaseConnection}>
            Base de données
          </Button>
          <Button variant="outline" onClick={testAuthentication}>
            Auth
          </Button>
          <Button variant="outline" onClick={testHealthCheck}>
            Health
          </Button>
          <Button variant="outline" onClick={testStorageAccess}>
            Storage
          </Button>
        </div>

        {/* Environment Info */}
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <div className="text-sm space-y-1">
            <div className="font-medium">Configuration actuelle :</div>
            <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50)}...</div>
            <div>Clé: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Configurée' : '✗ Manquante'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
