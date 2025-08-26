import type { Metadata } from 'next'
import { SupabaseTest } from '@/components/supabase-test'
import { CreateTestAccount, QuickTestLogin } from '@/components/create-test-account'

/**
 * Authentication Test Page
 * Page pour tester tous les cas d'usage d'authentification
 */

export const metadata: Metadata = {
  title: 'Test Auth - GreenOps AI',
  description: 'Test de tous les cas d\'usage d\'authentification',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Test d&apos;Authentification</h1>
          <p className="text-muted-foreground mt-2">
            Vérification de tous les cas d&apos;usage d&apos;authentification
          </p>
        </div>
        
        <SupabaseTest />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Composants de test rapide */}
          <div className="flex justify-center">
            <CreateTestAccount />
          </div>
          <div className="flex justify-center">
            <QuickTestLogin />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Liens de test */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pages d&apos;authentification</h2>
            <div className="space-y-2">
              <a href="/login" className="block p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-center">
                Page de connexion
              </a>
              <a href="/signup" className="block p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-center">
                Page d&apos;inscription
              </a>
              <a href="/forgot-password" className="block p-2 bg-muted text-muted-foreground rounded hover:bg-muted/80 text-center">
                Mot de passe oublié
              </a>
              <a href="/dashboard/default" className="block p-2 bg-green-600 text-white rounded hover:bg-green-700 text-center">
                Dashboard (protégé)
              </a>
            </div>
          </div>
          
          {/* Cas d'usage */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Cas d&apos;usage testés</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Connexion réussie → Redirection dashboard
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Identifiants incorrects → Message d&apos;erreur
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Email non vérifié → Demande de vérification
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Compte inexistant → Suggestion d&apos;inscription
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Session expirée → Reconnexion automatique
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Protection des routes → Redirection login
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
