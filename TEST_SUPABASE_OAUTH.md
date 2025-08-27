# 🧪 Test Intégration Supabase + OAuth GCP

## ✅ **Problème résolu :**
- **L'application utilise Supabase** pour l'authentification (pas NextAuth)
- **Tous les endpoints OAuth** ont été corrigés pour utiliser Supabase
- **Le composant GCPConnectButton** envoie maintenant le token Supabase

## 🔧 **Changements effectués :**

### **1. Endpoints API corrigés :**
- ✅ `/api/auth/gcp` - Utilise Supabase au lieu de NextAuth
- ✅ `/api/gcp/connection-status` - Utilise Supabase au lieu de NextAuth
- ✅ `/api/debug-auth` - Utilise Supabase au lieu de NextAuth
- ✅ `/api/test-auth` - Utilise Supabase au lieu de NextAuth

### **2. Composant GCPConnectButton :**
- ✅ **Vérifie l'authentification Supabase** avant d'agir
- ✅ **Envoie le token d'autorisation** dans les headers
- ✅ **Gère les états d'authentification** correctement

## 🎯 **Test étape par étape :**

### **Étape 1 : Vérification de la configuration**
```bash
# Vérifiez que toutes les variables sont définies
cat .env.local | grep -E "(SUPABASE|GOOGLE)"

# Doit retourner :
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
```

### **Étape 2 : Test de l'endpoint de debug**
```bash
# Testez l'endpoint de debug (sans authentification)
curl -s http://localhost:3000/api/debug-auth | jq .

# Doit retourner :
# {
#   "serverInfo": { "hasSupabaseKeys": true },
#   "authentication": { "hasAuthToken": false, "authenticated": false }
# }
```

### **Étape 3 : Connexion via navigateur**
1. **Allez sur** `http://localhost:3000/login`
2. **Connectez-vous** avec vos identifiants
3. **Vérifiez que vous êtes redirigé** vers le dashboard

### **Étape 4 : Test de l'authentification**
1. **Sur le dashboard, ouvrez la Console** (F12)
2. **Tapez :** `fetch('/api/test-auth', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('supabase.auth.token') } }).then(r => r.json()).then(console.log)`
3. **Vérifiez que vous obtenez :** `{authenticated: true, user: {...}}`

### **Étape 5 : Test du bouton GCP**
1. **Allez sur** `http://localhost:3000/dashboard/cloud-providers`
2. **Cliquez sur "+ Connecter Google Cloud"**
3. **Vérifiez la redirection** vers Google OAuth

## 🔍 **Vérification des logs serveur :**

Pendant les tests, surveillez les logs dans le terminal :
```bash
# Cherchez ces messages :
# - "User authenticated via Supabase: [email]"
# - "Initiating GCP OAuth for user: [email]"
# - "Redirect URL: https://accounts.google.com/..."
```

## 🚨 **Si le problème persiste :**

### **Problème 1 : Erreur 401 persistante**
```bash
# Vérifiez que l'utilisateur est connecté
curl -s http://localhost:3000/api/debug-auth | jq '.authentication'
```

### **Problème 2 : Token Supabase invalide**
```bash
# Vérifiez la configuration Supabase
curl -s http://localhost:3000/api/debug-auth | jq '.environment'
```

### **Problème 3 : Redirection OAuth échoue**
```bash
# Vérifiez les variables Google OAuth
grep "GOOGLE" .env.local
```

## 📋 **Checklist de vérification :**

- [ ] Variables d'environnement Supabase définies
- [ ] Variables d'environnement Google OAuth définies
- [ ] Serveur redémarré après modifications
- [ ] Utilisateur connecté via Supabase
- [ ] Endpoint `/api/test-auth` retourne `authenticated: true`
- [ ] Bouton "Connecter Google Cloud" visible
- [ ] Clic sur le bouton redirige vers Google OAuth
- [ ] Pas d'erreurs 401 dans la console

## 🚀 **Résultat attendu :**

Après ces étapes, vous devriez avoir :
- ✅ **Authentification Supabase** fonctionnelle
- ✅ **Bouton GCP fonctionnel** 
- ✅ **Redirection OAuth** vers Google Cloud
- ✅ **Pas d'erreurs 401**

---

**Note importante :** L'application utilise maintenant Supabase pour l'authentification. Tous les endpoints OAuth ont été corrigés pour être compatibles avec ce système.
