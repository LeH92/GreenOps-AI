'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

/**
 * Create Test Account Component
 * Permet de créer rapidement un compte de test
 */

export function CreateTestAccount() {
  const { signUp, loading, error } = useAuth()
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: 'test@example.com',
    password: 'test123456',
    confirmPassword: 'test123456'
  })

  const handleCreateAccount = async () => {
    try {
      setSuccess(null)
      
      const response = await signUp({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        acceptTerms: true
      })

      if (response.success) {
        setSuccess(`Compte créé avec succès ! ${response.message}`)
      }
    } catch (error) {
      console.error('Erreur création compte:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Créer un Compte de Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-email">Email</Label>
          <Input
            id="test-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div>
          <Label htmlFor="test-password">Mot de passe</Label>
          <Input
            id="test-password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div>
          <Label htmlFor="test-confirm">Confirmer mot de passe</Label>
          <Input
            id="test-confirm"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {success}
          </div>
        )}

        <Button 
          onClick={handleCreateAccount}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Création en cours...' : 'Créer le compte de test'}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Une fois créé, vous pourrez vous connecter avec ces identifiants</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Quick Test Login Component
 * Permet de se connecter rapidement avec des identifiants prédéfinis
 */

export function QuickTestLogin() {
  const { signIn, loading, error } = useAuth()
  const [success, setSuccess] = useState<string | null>(null)

  const testCredentials = [
    { email: 'test@example.com', password: 'test123456', label: 'Compte Test' },
    { email: 'admin@greenops.ai', password: 'admin123456', label: 'Admin Demo' },
    { email: 'user@greenops.ai', password: 'user123456', label: 'Utilisateur Demo' }
  ]

  const handleQuickLogin = async (email: string, password: string) => {
    try {
      setSuccess(null)
      
      const response = await signIn({
        email,
        password,
        rememberMe: false
      })

      if (response.success) {
        setSuccess(`Connexion réussie ! Redirection en cours...`)
      }
    } catch (error) {
      console.error('Erreur connexion rapide:', error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connexion Rapide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {testCredentials.map((cred, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleQuickLogin(cred.email, cred.password)}
            disabled={loading}
          >
            <div className="text-left">
              <div className="font-medium">{cred.label}</div>
              <div className="text-xs text-muted-foreground">{cred.email}</div>
            </div>
          </Button>
        ))}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {success}
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>Cliquez pour vous connecter instantanément</p>
        </div>
      </CardContent>
    </Card>
  )
}
