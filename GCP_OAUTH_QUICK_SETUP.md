# 🔧 Configuration Rapide OAuth GCP - Résolution d'erreur

## ❌ Problème actuel
Le bouton "Connecter Google Cloud" ne fonctionne pas car les credentials OAuth ne sont pas configurés.

## ✅ Solution en 3 étapes

### 1. Créer les credentials Google OAuth

1. **Aller sur [Google Cloud Console](https://console.cloud.google.com/)**
2. **Créer un projet** (ou sélectionner un existant)
3. **Activer les APIs** :
   - Cloud Billing API
   - Cloud Resource Manager API
   - BigQuery API
4. **Créer les credentials OAuth** :
   - Menu : "APIs & Services" > "Credentials"
   - "Create Credentials" > "OAuth 2.0 Client IDs"
   - Type : "Web application"
   - **Origines JavaScript autorisées** :
     ```
     http://localhost:3000
     ```
   - **URIs de redirection autorisés** :
     ```
     http://localhost:3000/api/auth/gcp/callback
     ```

### 2. Configurer les variables d'environnement

Créer/modifier le fichier `.env.local` à la racine du projet :

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-key-here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

# Supabase Configuration (si pas déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Encryption Key (32 caractères)
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### 3. Redémarrer le serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

## 🧪 Test de la configuration

1. **Vérifier que l'endpoint fonctionne** :
   ```bash
   curl http://localhost:3000/api/auth/gcp
   ```
   - ✅ Si OK : Redirection vers Google OAuth
   - ❌ Si erreur 400 : Credentials manquants

2. **Cliquer sur le bouton "Connecter Google Cloud"**
   - ✅ Si OK : Redirection vers Google
   - ❌ Si erreur : Vérifier les variables d'environnement

## 🔍 Dépannage

### Erreur "Configuration OAuth manquante"
- ✅ Vérifier que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont définis
- ✅ Redémarrer le serveur après modification du `.env.local`

### Erreur "Invalid redirect URI"
- ✅ Vérifier que l'URI de redirection dans Google Console correspond exactement à :
  ```
  http://localhost:3000/api/auth/gcp/callback
  ```

### Erreur "Authentication required"
- ✅ S'assurer d'être connecté à l'application
- ✅ Vérifier que NextAuth fonctionne

## 📋 Checklist de vérification

- [ ] Credentials OAuth créés dans Google Cloud Console
- [ ] APIs activées (Billing, Resource Manager, BigQuery)
- [ ] URIs de redirection configurés
- [ ] Variables d'environnement dans `.env.local`
- [ ] Serveur redémarré
- [ ] Test de l'endpoint `/api/auth/gcp`
- [ ] Bouton "Connecter Google Cloud" fonctionne

## 🚀 Une fois configuré

Le workflow OAuth complet fonctionnera :
1. Clic sur "Connecter Google Cloud"
2. Redirection vers Google OAuth
3. Autorisation utilisateur
4. Récupération automatique des données GCP
5. Affichage dans le dashboard

---

**Note** : Les credentials de développement fonctionnent uniquement avec `localhost:3000`. Pour la production, ajoutez votre domaine dans les URIs autorisés.
