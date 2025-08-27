# 🧪 Test OAuth GCP - Guide de vérification

## ✅ État actuel

### Variables d'environnement configurées :
- ✅ `GOOGLE_CLIENT_ID=test-client-id`
- ✅ `GOOGLE_CLIENT_SECRET=test-client-secret`
- ✅ `ENCRYPTION_KEY=test-encryption-key-32-chars-long`

### Fichiers API déplacés :
- ✅ `app/api/auth/gcp/route.ts`
- ✅ `app/api/auth/gcp/callback/route.ts`
- ✅ `app/api/gcp/connection-status/route.ts`
- ✅ `app/api/gcp/disconnect/route.ts`
- ✅ `app/api/gcp/refresh/route.ts`

### Imports corrigés :
- ✅ Tous les imports pointent vers les bons chemins
- ✅ Composant GCPConnectButton intégré

## 🎯 Test du bouton "Connecter Google Cloud"

### 1. Vérification de l'authentification
- ✅ L'utilisateur `hlamyne@gmail.com` est connecté via NextAuth
- ✅ Session valide détectée dans la console

### 2. Test du bouton
1. **Cliquer sur "+ Connecter Google Cloud"**
2. **Attendre la redirection** vers Google OAuth
3. **Vérifier les logs** dans la console du navigateur

### 3. Comportement attendu

#### ✅ Si tout fonctionne :
- Redirection vers `https://accounts.google.com/oauth/authorize`
- URL contient les paramètres OAuth corrects
- Pas d'erreurs 401 dans la console

#### ❌ Si problème persiste :
- Erreur 401 : Problème d'authentification
- Erreur 400 : Credentials manquants
- Pas de redirection : Problème de configuration

## 🔍 Debugging

### Vérifier les logs serveur :
```bash
# Dans le terminal où npm run dev tourne
# Chercher les logs :
# - "User authenticated: hlamyne@gmail.com"
# - "Initiating GCP OAuth for user: hlamyne@gmail.com"
# - "Redirect URL: https://accounts.google.com/..."
```

### Vérifier la console navigateur :
- Erreurs 401/400
- Messages de redirection
- Logs du composant GCPConnectButton

### Tester l'endpoint directement :
```bash
# Avec curl (sans session, devrait donner 401)
curl -I http://localhost:3000/api/auth/gcp

# Avec session (via navigateur connecté)
# Aller sur http://localhost:3000/api/auth/gcp
```

## 🚀 Prochaines étapes

### Si le test fonctionne :
1. **Configurer de vrais credentials Google OAuth**
2. **Tester le workflow complet**
3. **Vérifier la récupération des données**

### Si le test échoue :
1. **Vérifier les logs d'erreur**
2. **Corriger la configuration**
3. **Retester**

## 📋 Checklist de test

- [ ] Serveur redémarré avec nouvelles variables
- [ ] Utilisateur connecté via NextAuth
- [ ] Bouton "Connecter Google Cloud" visible
- [ ] Clic sur le bouton
- [ ] Redirection vers Google OAuth
- [ ] Pas d'erreurs 401/400 dans la console
- [ ] Logs serveur montrent l'initiation OAuth

---

**Note** : Ce test utilise des credentials factices. Pour un test complet, configurez de vrais credentials Google OAuth.
