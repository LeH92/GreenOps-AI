'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword,
  getCurrentSession,
  getUserDisplayName,
  getUserInitials,
  isSessionExpiringSoon,
  AUTH_CONFIG,
  type SignInData,
  type SignUpData,
  type ResetPasswordData,
  type UpdatePasswordData,
  type AuthResponse,
} from '@/lib/auth'


/**
 * Authentication hook state interface
 */
interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isEmailVerified: boolean
}

/**
 * Authentication hook return interface
 */
interface UseAuthReturn extends AuthState {
  // Auth actions
  signIn: (data: SignInData) => Promise<AuthResponse<{ user: User; session: Session }>>
  signUp: (data: SignUpData) => Promise<AuthResponse<{ user: User }>>
  signOut: () => Promise<AuthResponse<null>>
  resetPassword: (data: ResetPasswordData) => Promise<AuthResponse<null>>
  updatePassword: (data: UpdatePasswordData) => Promise<AuthResponse<User>>
  
  // User utilities
  getUserDisplayName: () => string
  getUserInitials: () => string
  
  // State management
  clearError: () => void
  refreshSession: () => Promise<void>
}

/**
 * Custom authentication hook for GreenOps AI Dashboard
 * Provides comprehensive auth state management and operations
 * Following cursor rules and ShadCN patterns
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter()
  
  // Auth state
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: false, // Changé de true à false pour éviter l'état de loading permanent
    error: null,
    isAuthenticated: false,
    isEmailVerified: false,
  })

  /**
   * Update auth state
   */
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  /**
   * Set error state
   */
  const setError = useCallback((error: string) => {
    updateState({ error })
  }, [updateState])

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    updateState({ loading })
  }, [updateState])

  /**
   * Update session and user state
   */
  const updateSession = useCallback((session: Session | null, user: User | null = null) => {
    const actualUser = user || session?.user || null
    
    updateState({
      session,
      user: actualUser,
      isAuthenticated: !!session && !!actualUser,
      isEmailVerified: actualUser?.email_confirmed_at ? true : false,
      loading: false,
      error: null,
    })
  }, [updateState])

  /**
   * Refresh current session
   */
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getCurrentSession()
      
      if (response.success && response.data) {
        updateSession(response.data.session, response.data.user)
      } else {
        updateSession(null, null)
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
      updateSession(null, null)
    } finally {
      setLoading(false)
    }
  }, [setLoading, updateSession])

  /**
   * Sign in user
   */
  const signIn = useCallback(async (data: SignInData): Promise<AuthResponse<{ user: User; session: Session }>> => {
    try {
      setLoading(true)
      clearError()
      
      const response = await authSignIn(data)
      
      if (response.success && response.data) {
        updateSession(response.data.session, response.data.user)
        
        // Redirection directe - plus de middleware pour interférer !
        console.log("✅ Sign in successful, redirecting directly to dashboard...")
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get("redirectTo") || "/dashboard/default"
        
        console.log("🚀 Direct redirect to:", redirectTo)
        router.push(redirectTo)
      } else {
        setError(response.message)
      }
      
      return response
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during sign in.'
      setError(errorMessage)
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, updateSession, setError, router])

  /**
   * Sign up user
   */
  const signUp = useCallback(async (data: SignUpData): Promise<AuthResponse<{ user: User }>> => {
    try {
      setLoading(true)
      clearError()
      
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        const errorMessage = 'Passwords do not match.'
        setError(errorMessage)
        return {
          data: null,
          error: null,
          success: false,
          message: errorMessage,
        }
      }
      
      // Validate terms acceptance
      if (!data.acceptTerms) {
        const errorMessage = 'You must accept the terms and conditions.'
        setError(errorMessage)
        return {
          data: null,
          error: null,
          success: false,
          message: errorMessage,
        }
      }
      
      const response = await authSignUp({
        email: data.email,
        password: data.password,
      })
      
      if (!response.success) {
        setError(response.message)
      }
      
      return response
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during sign up.'
      setError(errorMessage)
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setError])

  /**
   * Sign out user
   */
  const signOut = useCallback(async (): Promise<AuthResponse<null>> => {
    try {
      setLoading(true)
      clearError()
      
      const response = await authSignOut()
      
      if (response.success) {
        updateSession(null, null)
        router.push('/login')
      } else {
        setError(response.message)
      }
      
      return response
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during sign out.'
      setError(errorMessage)
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, updateSession, setError, router])

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (data: ResetPasswordData): Promise<AuthResponse<null>> => {
    try {
      setLoading(true)
      clearError()
      
      const response = await authResetPassword(data)
      
      if (!response.success) {
        setError(response.message)
      }
      
      return response
    } catch (error) {
      const errorMessage = 'An unexpected error occurred while sending reset email.'
      setError(errorMessage)
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setError])

  /**
   * Update password
   */
  const updatePassword = useCallback(async (data: UpdatePasswordData): Promise<AuthResponse<User>> => {
    try {
      setLoading(true)
      clearError()
      
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        const errorMessage = 'Passwords do not match.'
        setError(errorMessage)
        return {
          data: null,
          error: null,
          success: false,
          message: errorMessage,
        }
      }
      
      const response = await authUpdatePassword(data)
      
      if (response.success && response.data) {
        updateSession(state.session, response.data)
        router.push('/login?message=password-updated')
      } else {
        setError(response.message)
      }
      
      return response
    } catch (error) {
      const errorMessage = 'An unexpected error occurred while updating password.'
      setError(errorMessage)
      return {
        data: null,
        error: error as AuthError,
        success: false,
        message: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setError, updateSession, state.session, router])

  /**
   * Get user display name
   */
  const getUserDisplayNameWrapper = useCallback(() => {
    return getUserDisplayName(state.user)
  }, [state.user])

  /**
   * Get user initials
   */
  const getUserInitialsWrapper = useCallback(() => {
    return getUserInitials(state.user)
  }, [state.user])

  /**
   * Initialize auth state and set up listeners
   */
  useEffect(() => {
    let mounted = true
    let refreshTimer: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (mounted) {
          if (error) {
            console.error('Auth initialization error:', error)
            updateSession(null, null)
          } else {
            updateSession(session, session?.user || null)
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        if (mounted) {
          updateSession(null, null)
        }
      }
    }

    const setupAuthListener = () => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return

        console.log('Auth state change:', event, session?.user?.email)

        switch (event) {
          case 'SIGNED_IN':
            updateSession(session, session?.user || null)
            break
          case 'SIGNED_OUT':
            updateSession(null, null)
            break
          case 'TOKEN_REFRESHED':
            updateSession(session, session?.user || null)
            break
          case 'USER_UPDATED':
            updateSession(session, session?.user || null)
            break
          case 'PASSWORD_RECOVERY':
            // Handle password recovery if needed
            break
          default:
            break
        }
      })

      return subscription
    }

    const setupAutoRefresh = () => {
      const timer = setInterval(async () => {
        if (!mounted) return

        const { data: { session } } = await supabase.auth.getSession()
        
        if (session && isSessionExpiringSoon(session)) {
          try {
            await supabase.auth.refreshSession()
          } catch (error) {
            console.error('Failed to refresh session:', error)
          }
        }
      }, AUTH_CONFIG.refreshInterval * 1000)

      return timer
    }

    // Initialize
    initializeAuth()
    const subscription = setupAuthListener()
    refreshTimer = setupAutoRefresh()

    // Cleanup
    return () => {
      mounted = false
      subscription.unsubscribe()
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
    }
  }, [updateSession])

  return {
    // State
    ...state,
    
    // Actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    
    // Utilities
    getUserDisplayName: getUserDisplayNameWrapper,
    getUserInitials: getUserInitialsWrapper,
    
    // State management
    clearError,
    refreshSession,
  }
}
