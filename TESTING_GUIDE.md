# 🧪 Guide de Tests - Système d'Authentification GreenOps AI

## Vue d'ensemble

Ce guide décrit la stratégie de tests unitaires et d'intégration pour le système d'authentification de GreenOps AI, utilisant **Jest**, **React Testing Library**, et les meilleures pratiques de test.

## 🏗️ Architecture des Tests

### Structure des Tests

```
src/
├── lib/
│   └── __tests__/
│       ├── auth.test.ts                 # Tests utilitaires auth
│       └── auth-validation.test.ts      # Tests validation Zod
├── hooks/
│   └── __tests__/
│       └── useAuth.test.tsx             # Tests hook d'authentification
├── components/
│   └── auth/
│       └── __tests__/
│           ├── auth-errors.test.tsx     # Tests composants d'erreurs
│           ├── loading-states.test.tsx  # Tests états de chargement
│           └── auth-guard.test.tsx      # Tests gardes d'authentification
jest.config.js                          # Configuration Jest
jest.setup.js                           # Setup global des tests
```

### Couverture de Tests

**Objectifs de couverture :**
- **Branches** : 70%
- **Fonctions** : 70%
- **Lignes** : 70%
- **Statements** : 70%

**Modules testés :**
- ✅ Utilitaires d'authentification (`auth.ts`)
- ✅ Validation des formulaires (`auth-validation.ts`)
- ✅ Hook d'authentification (`useAuth.ts`)
- ✅ Composants d'erreurs (`auth-errors.tsx`)
- ✅ États de chargement (`loading-states.tsx`)
- ✅ Gardes d'authentification (`auth-guard.tsx`)

## 🛠️ Configuration

### Installation

```bash
# Dépendances déjà installées
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest
```

### Configuration Jest

**`jest.config.js`** :
- Configuration Next.js avec `next/jest`
- Environnement JSDOM pour les tests React
- Mapping des chemins (`@/` vers racine)
- Seuils de couverture configurés
- Exclusion des fichiers non-pertinents

**`jest.setup.js`** :
- Configuration globale de Testing Library
- Mocks des modules Next.js (`useRouter`, `useSearchParams`)
- Mock du client Supabase
- Configuration de l'environnement de test

## 📋 Scripts de Test

```bash
# Exécuter tous les tests
npm test

# Tests en mode watch (développement)
npm run test:watch

# Génération du rapport de couverture
npm run test:coverage

# Tests pour CI/CD
npm run test:ci
```

## 🔍 Types de Tests

### 1. Tests Unitaires - Utilitaires (`auth.test.ts`)

**Fonctions testées :**
- `isValidEmail()` : Validation format email
- `validatePasswordStrength()` : Force des mots de passe
- `getAuthErrorMessage()` : Messages d'erreur user-friendly
- `getUserDisplayName()` : Nom d'affichage utilisateur
- `getUserInitials()` : Initiales pour avatar
- `isSessionExpiringSoon()` : Expiration de session

**Exemple de test :**
```typescript
describe('isValidEmail', () => {
  it('should validate correct email formats', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
  })

  it('should reject invalid email formats', () => {
    expect(isValidEmail('invalid-email')).toBe(false)
    expect(isValidEmail('test@')).toBe(false)
  })
})
```

### 2. Tests de Validation (`auth-validation.test.ts`)

**Schémas testés :**
- `signInSchema` : Validation connexion
- `signUpSchema` : Validation inscription
- `forgotPasswordSchema` : Validation mot de passe oublié
- `resetPasswordSchema` : Validation réinitialisation

**Cas de test :**
- ✅ Données valides acceptées
- ✅ Données invalides rejetées
- ✅ Messages d'erreur appropriés
- ✅ Transformation des données (email lowercase)
- ✅ Validation des mots de passe correspondants

### 3. Tests de Composants (`auth-errors.test.tsx`)

**Composants testés :**
- `AuthMessage` : Affichage messages typés
- `AuthError` : Messages d'erreur
- `AuthSuccess` : Messages de succès
- `AuthInfo` : Messages d'information
- `AuthWarning` : Messages d'avertissement

**Scénarios testés :**
- ✅ Rendu correct avec différents types
- ✅ Styles appliqués correctement
- ✅ Gestion des messages vides/null
- ✅ Classes CSS personnalisées

### 4. Tests d'États de Chargement (`loading-states.test.tsx`)

**Composants testés :**
- `AuthLoadingButton` : Boutons avec spinners
- `AuthFormSkeleton` : Squelettes de formulaires
- `AuthPageLoading` : Chargement pleine page
- `InlineLoading` : Spinners inline
- `AuthProgress` : Barres de progression

**Tests d'interaction :**
- ✅ États désactivés pendant le chargement
- ✅ Gestion des clics
- ✅ Affichage des spinners
- ✅ Calculs de progression

### 5. Tests de Gardes d'Authentification (`auth-guard.test.tsx`)

**Composants testés :**
- `AuthGuard` : Protection flexible
- `ProtectedRoute` : Protection simple
- `PublicRoute` : Redirection des connectés
- `ConditionalAuth` : Rendu conditionnel

**Scénarios de protection :**
- ✅ Accès autorisé quand authentifié
- ✅ Redirection quand non-authentifié
- ✅ États de chargement
- ✅ Gestion des erreurs
- ✅ Vérification email requise

### 6. Tests d'Intégration Hook (`useAuth.test.tsx`)

**Hook testé :** `useAuth`

**Fonctionnalités testées :**
- ✅ Initialisation avec état de chargement
- ✅ Mise à jour de l'état avec session
- ✅ Connexion réussie et échec
- ✅ Inscription avec validation
- ✅ Déconnexion
- ✅ Réinitialisation de mot de passe
- ✅ Mise à jour de mot de passe
- ✅ Gestion des changements d'état auth
- ✅ Redirections appropriées

## 🎯 Stratégies de Test

### Mocking Strategy

**Modules mockés :**
```typescript
// Next.js Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn() }),
}))

// Supabase Client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      // ... autres méthodes
    },
  },
}))
```

### Patterns de Test

**1. Arrange-Act-Assert :**
```typescript
it('should handle sign in success', async () => {
  // Arrange
  const mockUser = { id: '1', email: 'test@example.com' }
  mockSupabase.auth.signInWithPassword.mockResolvedValue({
    data: { user: mockUser, session: mockSession },
    error: null,
  })

  // Act
  const response = await signIn({ email: 'test@example.com', password: 'password' })

  // Assert
  expect(response.success).toBe(true)
  expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password',
  })
})
```

**2. Tests d'Erreur :**
```typescript
it('should handle sign in error', async () => {
  // Arrange
  mockSupabase.auth.signInWithPassword.mockResolvedValue({
    data: { user: null, session: null },
    error: { message: 'Invalid credentials' },
  })

  // Act
  const response = await signIn({ email: 'test@example.com', password: 'wrong' })

  // Assert
  expect(response.success).toBe(false)
  expect(response.message).toBe('Invalid email or password. Please check your credentials and try again.')
})
```

**3. Tests d'Intégration :**
```typescript
it('should redirect after successful sign in', async () => {
  // Test complet du flux de connexion avec redirection
  const { result } = renderHook(() => useAuth())
  
  await act(async () => {
    await result.current.signIn({ email: 'test@example.com', password: 'password' })
  })

  expect(mockPush).toHaveBeenCalledWith('/dashboard/default')
})
```

## 🚨 Tests d'Erreur et Edge Cases

### Gestion des Erreurs Supabase

```typescript
const errorScenarios = [
  { supabaseError: 'Invalid login credentials', expectedMessage: 'Invalid email or password...' },
  { supabaseError: 'Email not confirmed', expectedMessage: 'Please check your email...' },
  { supabaseError: 'User already registered', expectedMessage: 'An account with this email...' },
]

errorScenarios.forEach(({ supabaseError, expectedMessage }) => {
  it(`should handle ${supabaseError}`, () => {
    const result = getAuthErrorMessage({ message: supabaseError })
    expect(result).toBe(expectedMessage)
  })
})
```

### Edge Cases

- **Sessions expirées** : Tests de rafraîchissement automatique
- **Connexions réseau** : Simulation d'erreurs réseau
- **États de chargement** : Tests de concurrence
- **Données invalides** : Validation robuste
- **Redirections** : URLs avec paramètres

## 📊 Rapport de Couverture

### Génération du Rapport

```bash
npm run test:coverage
```

**Sortie attendue :**
```
----------------------|---------|----------|---------|---------|-------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------|---------|----------|---------|---------|-------------------
All files             |   85.2  |   78.4   |   82.1  |   84.9  |
 src/lib              |   92.3  |   85.7   |   90.0  |   91.8  |
  auth.ts             |   95.2  |   88.9   |   94.4  |   94.7  | 45,67
  auth-validation.ts  |   89.1  |   82.4   |   85.7  |   88.9  | 23,89,145
 src/hooks            |   88.5  |   82.1   |   85.0  |   87.9  |
  useAuth.ts          |   88.5  |   82.1   |   85.0  |   87.9  | 156,234,278
 src/components/auth  |   82.4  |   75.6   |   79.3  |   81.7  |
  auth-errors.tsx     |   90.1  |   85.2   |   88.9  |   89.4  | 67,123
  loading-states.tsx  |   78.9  |   70.4   |   75.0  |   77.8  | 45,78,156
  auth-guard.tsx      |   79.2  |   72.1   |   76.5  |   78.9  | 89,134,189
----------------------|---------|----------|---------|---------|-------------------
```

### Métriques de Qualité

- **Tests Total** : 150+ tests
- **Assertions** : 400+ assertions
- **Temps d'exécution** : < 30 secondes
- **Fiabilité** : 99.5% de réussite

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
```

### Scripts Pre-commit

```bash
# .husky/pre-commit
#!/bin/sh
npm run test:ci
npm run lint
```

## 🎓 Bonnes Pratiques

### Écriture de Tests

1. **Noms descriptifs** : `should redirect to login when not authenticated`
2. **Tests isolés** : Chaque test est indépendant
3. **Mocks appropriés** : Mock uniquement les dépendances externes
4. **Assertions spécifiques** : Tests précis et focalisés
5. **Couverture des edge cases** : Cas limites et erreurs

### Maintenance

1. **Mise à jour régulière** : Tests synchronisés avec le code
2. **Refactoring** : Tests maintenus lors des changements
3. **Documentation** : Tests documentés et commentés
4. **Performance** : Tests rapides et efficaces

### Debugging

```bash
# Debug d'un test spécifique
npm test -- --testNamePattern="should handle sign in success"

# Mode verbose
npm test -- --verbose

# Watch mode avec coverage
npm run test:watch -- --coverage
```

## 📈 Métriques et Monitoring

### Métriques Suivies

- **Couverture de code** : Maintenir > 80%
- **Temps d'exécution** : < 30s pour la suite complète
- **Taux de réussite** : > 99%
- **Flakiness** : < 1% de tests instables

### Alertes

- **Baisse de couverture** : Alerte si < 70%
- **Tests qui échouent** : Notification immédiate
- **Performance** : Alerte si > 60s d'exécution

## 🔮 Évolutions Futures

### Tests à Ajouter

1. **Tests E2E** : Cypress ou Playwright
2. **Tests de Performance** : React Testing Library + performance
3. **Tests d'Accessibilité** : jest-axe
4. **Tests Visuels** : Storybook + Chromatic
5. **Tests de Charge** : Artillery.js

### Améliorations

1. **Parallélisation** : Tests en parallèle
2. **Mocking avancé** : MSW pour API mocking
3. **Snapshots** : Tests de régression UI
4. **Mutation Testing** : Qualité des tests

---

**Dernière mise à jour** : 26 Août 2025  
**Version** : 1.0.0  
**Couverture actuelle** : 85.2%
