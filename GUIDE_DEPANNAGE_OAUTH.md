# 🔧 Guide de Dépannage OAuth GCP - Problème d'Authentification

## ❌ **Problème actuel :**
- L'utilisateur n'est **pas authentifié** dans GreenOps AI
- L'endpoint OAuth retourne **"Authentication required"**
- La session est **vide** même après connexion

## 🔍 **Diagnostic :**

### **1. Vérification du serveur :**
```bash
# Le serveur fonctionne
curl -I http://localhost:3000
# ✅ Retourne HTTP/1.1 404 (normal pour la racine)
```

### **2. Vérification de l'authentification :**
```bash
# L'utilisateur n'est pas authentifié
curl -s http://localhost:3000/api/test-auth | jq .
# ❌ Retourne : {"authenticated": false, "user": null}
```

### **3. Vérification des variables d'environnement :**
```bash
# NEXTAUTH_SECRET corrigé
grep "NEXTAUTH_SECRET" .env.local
# ✅ Retourne : NEXTAUTH_SECRET=nbusZ2u5P1rBYg5qap6zor0aVaJM383zu4EmL57Pdtg=
```

## 🎯 **Solution étape par étape :**

### **Étape 1 : Nettoyage complet des cookies**
1. **Ouvrez les DevTools** (F12)
2. **Allez dans l'onglet Application/Storage**
3. **Sous "Cookies", sélectionnez `http://localhost:3000`**
4. **Supprimez TOUS les cookies** (clic droit → Clear)
5. **Fermez et rouvrez le navigateur**

### **Étape 2 : Connexion via navigateur**
1. **Allez sur** `http://localhost:3000/login`
2. **Cliquez sur "Se connecter avec Google"**
3. **Autorisez l'accès** à votre compte Google
4. **Attendez la redirection** vers le dashboard

### **Étape 3 : Vérification de la session**
1. **Restez sur le dashboard**
2. **Ouvrez les DevTools** (F12)
3. **Allez dans l'onglet Console**
4. **Tapez :** `fetch('/api/test-auth').then(r => r.json()).then(console.log)`
5. **Vérifiez que vous obtenez :** `{authenticated: true, user: {...}}`

### **Étape 4 : Test du bouton GCP**
1. **Allez sur** `http://localhost:3000/dashboard/cloud-providers`
2. **Cliquez sur "+ Connecter Google Cloud"**
3. **Vérifiez la redirection** vers Google OAuth

## 🚨 **Si le problème persiste :**

### **Problème 1 : Session toujours vide**
```bash
# Vérifiez les logs du serveur
# Dans le terminal où npm run dev tourne
# Cherchez : "User authenticated: [email]"
```

### **Problème 2 : Erreur de configuration**
```bash
# Vérifiez que toutes les variables sont définies
cat .env.local | grep -E "(NEXTAUTH|GOOGLE|SUPABASE)"
```

### **Problème 3 : Problème de cookies**
```bash
# Testez avec un navigateur privé/incognito
# Ou utilisez un autre navigateur
```

## 🔧 **Dépannage avancé :**

### **1. Vérification des logs NextAuth :**
```bash
# Dans le terminal, cherchez :
# - "User authenticated: [email]"
# - "Session created for user: [email]"
# - "OAuth callback received"
```

### **2. Test de l'endpoint de session :**
```bash
# Avec un navigateur connecté, testez :
curl -s -H "Cookie: [VOTRE_SESSION_COOKIE]" http://localhost:3000/api/auth/session
```

### **3. Vérification de la base de données :**
```bash
# Si vous utilisez Supabase, vérifiez les tables :
# - auth.users
# - auth.sessions
```

## 📋 **Checklist de vérification :**

- [ ] Serveur redémarré avec nouveau NEXTAUTH_SECRET
- [ ] Cookies supprimés et navigateur fermé
- [ ] Connexion via `http://localhost:3000/login`
- [ ] Session vérifiée avec `/api/test-auth`
- [ ] Bouton GCP testé sur la page cloud-providers
- [ ] Redirection OAuth fonctionne

## 🚀 **Résultat attendu :**

Après ces étapes, vous devriez avoir :
- ✅ **Session authentifiée** dans GreenOps AI
- ✅ **Bouton GCP fonctionnel**
- ✅ **Redirection OAuth** vers Google Cloud
- ✅ **Pas d'erreurs 401**

---

**Note importante :** L'authentification NextAuth nécessite des cookies de session. Les tests `curl` sans cookies retourneront toujours `{"authenticated": false}`. Testez uniquement via le navigateur connecté.
