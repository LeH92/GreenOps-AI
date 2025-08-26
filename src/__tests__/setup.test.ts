/**
 * Test de configuration Jest
 * Vérifie que l'environnement de test est correctement configuré
 */

describe('Test Environment Setup', () => {
  it('should have Jest configured correctly', () => {
    expect(true).toBe(true)
  })

  it('should have access to DOM APIs', () => {
    expect(document).toBeDefined()
    expect(window).toBeDefined()
  })

  it('should have mocked Next.js router', () => {
    const { useRouter } = require('next/navigation')
    const router = useRouter()
    expect(router.push).toBeDefined()
    expect(typeof router.push).toBe('function')
  })
})

describe('Module Resolution', () => {
  it('should resolve path aliases', () => {
    // Test simple de résolution de chemin
    expect(() => {
      // Ce test vérifie que les chemins peuvent être résolus
      require('@/src/lib/auth-validation')
    }).not.toThrow()
  })
})
