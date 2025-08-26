'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { User, Session } from '@supabase/supabase-js'

/**
 * Auth Provider Component
 * Provides authentication context to the application
 * Following cursor rules and React patterns
 */

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isEmailVerified: boolean
  signIn: ReturnType<typeof useAuth>['signIn']
  signUp: ReturnType<typeof useAuth>['signUp']
  signOut: ReturnType<typeof useAuth>['signOut']
  resetPassword: ReturnType<typeof useAuth>['resetPassword']
  updatePassword: ReturnType<typeof useAuth>['updatePassword']
  getUserDisplayName: ReturnType<typeof useAuth>['getUserDisplayName']
  getUserInitials: ReturnType<typeof useAuth>['getUserInitials']
  clearError: ReturnType<typeof useAuth>['clearError']
  refreshSession: ReturnType<typeof useAuth>['refreshSession']
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use auth context
 * This is a wrapper around the useAuth hook for context usage
 */
export function useAuthContext() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Client-side Auth Guard
 * For use in client components
 */
interface ClientAuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientAuthGuard({ children, fallback }: ClientAuthGuardProps) {
  const { isAuthenticated, loading } = useAuthContext()

  if (loading) {
    return <>{fallback || <div>Loading...</div>}</>
  }

  if (!isAuthenticated) {
    return <>{fallback || <div>Please sign in to continue</div>}</>
  }

  return <>{children}</>
}
