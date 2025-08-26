# Configuration Google Cloud OAuth pour GreenOps AI

## 1. Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## 2. Configuration Google Cloud Console

### Étape 1: Créer un Projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez l'ID du projet

### Étape 2: Activer les APIs Nécessaires
Activez les APIs suivantes dans votre projet :
- Cloud Resource Manager API
- Cloud Billing API
- BigQuery API
- Cloud Billing Budget API

### Étape 3: Configurer l'OAuth Consent Screen
1. Allez dans "APIs & Services" > "OAuth consent screen"
2. Configurez l'écran de consentement :
   - User Type: External
   - App name: GreenOps AI
   - User support email: votre email
   - Developer contact information: votre email

### Étape 4: Créer les Credentials OAuth
1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth client ID"
3. Application type: Web application
4. Nom: GreenOps AI Web Client
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (pour la production)

### Étape 5: Configurer les Scopes
Les scopes suivants sont automatiquement demandés :
- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/cloud-platform.read-only`
- `https://www.googleapis.com/auth/cloud-billing.readonly`
- `https://www.googleapis.com/auth/bigquery.readonly`

## 3. Configuration des Permissions

### Pour les Comptes de Service (Optionnel)
Si vous voulez utiliser des comptes de service au lieu de l'OAuth :

1. Allez dans "IAM & Admin" > "Service Accounts"
2. Créez un nouveau compte de service
3. Ajoutez les rôles suivants :
   - Billing Account Viewer
   - Project Viewer
   - BigQuery Data Viewer
4. Créez une clé JSON et téléchargez-la

## 4. Test de la Configuration

### Test de l'Authentification
1. Démarrez le serveur de développement : `npm run dev`
2. Allez sur `http://localhost:3000/login`
3. Cliquez sur "Sign in with Google"
4. Autorisez l'application

### Test des APIs
1. Connectez-vous avec Google
2. Allez dans "Fournisseurs Cloud"
3. Cliquez sur "Ajouter un fournisseur"
4. Sélectionnez "Google Cloud Platform"
5. Suivez le workflow de configuration

## 5. Utilisation dans le Code

### Hook personnalisé pour les tokens
```typescript
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

function MyComponent() {
  const { accessToken, refreshToken, error, isLoading } = useGoogleAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // Utilisez accessToken pour les appels API
}
```

### Hook pour les appels API Google Cloud
```typescript
import { useGoogleCloudAPI } from "@/hooks/useGoogleAuth";

function MyComponent() {
  const { callGoogleAPI, isLoading } = useGoogleCloudAPI();
  
  const fetchProjects = async () => {
    try {
      const projects = await callGoogleAPI("/cloudresourcemanager/v1/projects");
      console.log(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
}
```

## 6. Déploiement en Production

### Variables d'Environnement de Production
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret-key
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
```

### URLs de Redirection de Production
Ajoutez dans Google Cloud Console :
- `https://yourdomain.com/api/auth/callback/google`

## 7. Sécurité

### Bonnes Pratiques
- Ne jamais commiter les clés secrètes dans le code
- Utiliser des variables d'environnement
- Limiter les scopes aux minimums nécessaires
- Surveiller l'utilisation des APIs
- Utiliser des comptes de service pour les tâches automatisées

### Gestion des Tokens
- Les tokens sont automatiquement rafraîchis
- Les refresh tokens sont stockés de manière sécurisée
- Les erreurs d'authentification sont gérées automatiquement

## 8. Dépannage

### Erreurs Communes
1. **"Invalid redirect URI"** : Vérifiez les URLs de redirection dans Google Cloud Console
2. **"Access denied"** : Vérifiez les scopes demandés
3. **"API not enabled"** : Activez les APIs nécessaires
4. **"Invalid credentials"** : Vérifiez les variables d'environnement

### Logs de Débogage
Activez les logs de débogage en ajoutant dans `.env.local` :
```env
NODE_ENV=development
```

Les logs NextAuth apparaîtront dans la console du serveur.
