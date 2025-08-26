import type { Metadata } from 'next'

/**
 * Test Accounts Page
 * Comptes de test pour valider l'authentification
 */

export const metadata: Metadata = {
  title: 'Comptes de Test - GreenOps AI',
  description: 'Comptes de test pour valider l\'authentification',
  robots: {
    index: false,
    follow: false,
  },
}

export default function TestAccountsPage() {
  const testAccounts = [
    {
      name: "Compte Admin",
      email: "admin@greenops.ai",
      password: "admin123",
      status: "Actif",
      role: "Administrateur"
    },
    {
      name: "Compte Utilisateur",
      email: "user@greenops.ai", 
      password: "user123",
      status: "Actif",
      role: "Utilisateur"
    },
    {
      name: "Compte Test",
      email: "test@example.com",
      password: "test123",
      status: "À créer",
      role: "Test"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Comptes de Test</h1>
          <p className="text-muted-foreground mt-2">
            Utilisez ces comptes pour tester l&apos;authentification
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testAccounts.map((account, index) => (
            <div key={index} className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">{account.name}</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email:</label>
                  <div className="bg-muted p-2 rounded text-sm font-mono">
                    {account.email}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Password:</label>
                  <div className="bg-muted p-2 rounded text-sm font-mono">
                    {account.password}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    account.status === 'Actif' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {account.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <span className="text-sm font-medium">{account.role}</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <a 
                  href="/login" 
                  className="block w-full p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-center text-sm"
                >
                  Tester la connexion
                </a>
                {account.status === 'À créer' && (
                  <a 
                    href="/signup" 
                    className="block w-full p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-center text-sm"
                  >
                    Créer le compte
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions de Test</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">✅ Cas de réussite à tester:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Connexion avec identifiants valides</li>
                <li>• Redirection vers le dashboard</li>
                <li>• Persistance de la session</li>
                <li>• Déconnexion fonctionnelle</li>
                <li>• Navigation protégée</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">❌ Cas d&apos;erreur à tester:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Email incorrect</li>
                <li>• Mot de passe incorrect</li>
                <li>• Champs vides</li>
                <li>• Format email invalide</li>
                <li>• Compte inexistant</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex gap-4 justify-center">
            <a href="/auth-test" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Page de test complète
            </a>
            <a href="/login" className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
              Commencer les tests
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
