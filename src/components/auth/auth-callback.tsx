'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AuthPageLoading } from './loading-states'
import { AuthLayout } from './auth-layout'
import { AuthError, AuthSuccess } from './auth-errors'

/**
 * Auth Callback Handler Component
 * Handles authentication callbacks from Supabase email links
 * Following cursor rules and ShadCN patterns
 */

type CallbackType = 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change' | null

interface CallbackState {
  type: CallbackType
  loading: boolean
  error: string | null
  success: string | null
}

export function AuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [state, setState] = useState<CallbackState>({
    type: null,
    loading: true,
    error: null,
    success: null,
  })

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get URL parameters
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type') as CallbackType
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        setState(prev => ({ ...prev, type, loading: true }))

        // Handle errors from Supabase
        if (error) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorDescription || error || 'Authentication failed',
          }))
          return
        }

        // Handle different callback types
        switch (type) {
          case 'signup':
            await handleSignupCallback(accessToken, refreshToken)
            break
          case 'recovery':
            await handleRecoveryCallback(accessToken, refreshToken)
            break
          case 'invite':
            await handleInviteCallback(accessToken, refreshToken)
            break
          case 'magiclink':
            await handleMagicLinkCallback(accessToken, refreshToken)
            break
          case 'email_change':
            await handleEmailChangeCallback(accessToken, refreshToken)
            break
          default:
            // Generic session handling
            await handleGenericCallback()
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'An unexpected error occurred during authentication.',
        }))
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  /**
   * Handle signup email confirmation
   */
  const handleSignupCallback = async (accessToken: string | null, refreshToken: string | null) => {
    if (!accessToken || !refreshToken) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid confirmation link. Please try signing up again.',
      }))
      return
    }

    try {
      // Set the session
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to confirm your account. Please try again.',
        }))
        return
      }

      if (data.session) {
        setState(prev => ({
          ...prev,
          loading: false,
          success: 'Your account has been confirmed! Redirecting to dashboard...',
        }))

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard/default')
        }, 2000)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to confirm your account. Please contact support.',
      }))
    }
  }

  /**
   * Handle password recovery callback
   */
  const handleRecoveryCallback = async (accessToken: string | null, refreshToken: string | null) => {
    if (!accessToken || !refreshToken) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid password reset link. Please request a new one.',
      }))
      return
    }

    try {
      // Set the session for password reset
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'This password reset link has expired. Please request a new one.',
        }))
        return
      }

      if (data.session) {
        setState(prev => ({
          ...prev,
          loading: false,
          success: 'Password reset link verified! Redirecting...',
        }))

        // Redirect to reset password form
        setTimeout(() => {
          router.push('/reset-password')
        }, 1500)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to process password reset. Please try again.',
      }))
    }
  }

  /**
   * Handle invite callback (for future team invitations)
   */
  const handleInviteCallback = async (accessToken: string | null, refreshToken: string | null) => {
    setState(prev => ({
      ...prev,
      loading: false,
      success: 'Invite processed! Please complete your account setup.',
    }))

    setTimeout(() => {
      router.push('/signup')
    }, 2000)
  }

  /**
   * Handle magic link callback
   */
  const handleMagicLinkCallback = async (accessToken: string | null, refreshToken: string | null) => {
    if (!accessToken || !refreshToken) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid magic link. Please try again.',
      }))
      return
    }

    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Magic link has expired. Please request a new one.',
        }))
        return
      }

      if (data.session) {
        setState(prev => ({
          ...prev,
          loading: false,
          success: 'Successfully signed in! Redirecting to dashboard...',
        }))

        setTimeout(() => {
          router.push('/dashboard/default')
        }, 2000)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to process magic link. Please try again.',
      }))
    }
  }

  /**
   * Handle email change callback
   */
  const handleEmailChangeCallback = async (accessToken: string | null, refreshToken: string | null) => {
    setState(prev => ({
      ...prev,
      loading: false,
      success: 'Email address updated successfully!',
    }))

    setTimeout(() => {
      router.push('/dashboard/default')
    }, 2000)
  }

  /**
   * Handle generic callback (fallback)
   */
  const handleGenericCallback = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Authentication failed. Please try again.',
        }))
        return
      }

      if (session) {
        setState(prev => ({
          ...prev,
          loading: false,
          success: 'Successfully authenticated! Redirecting...',
        }))

        setTimeout(() => {
          router.push('/dashboard/default')
        }, 2000)
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'No active session found. Please sign in again.',
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred. Please try again.',
      }))
    }
  }

  /**
   * Get appropriate title based on callback type
   */
  const getTitle = () => {
    switch (state.type) {
      case 'signup':
        return 'Confirming your account'
      case 'recovery':
        return 'Verifying reset link'
      case 'invite':
        return 'Processing invitation'
      case 'magiclink':
        return 'Signing you in'
      case 'email_change':
        return 'Updating email address'
      default:
        return 'Authenticating'
    }
  }

  /**
   * Get appropriate description based on callback type
   */
  const getDescription = () => {
    switch (state.type) {
      case 'signup':
        return 'Please wait while we confirm your account...'
      case 'recovery':
        return 'Verifying your password reset request...'
      case 'invite':
        return 'Processing your team invitation...'
      case 'magiclink':
        return 'Signing you in securely...'
      case 'email_change':
        return 'Updating your email address...'
      default:
        return 'Please wait while we authenticate you...'
    }
  }

  // Show loading state
  if (state.loading) {
    return <AuthPageLoading />
  }

  // Show success or error state
  return (
    <AuthLayout
      title={getTitle()}
      description={getDescription()}
      showBackToLogin={!!state.error}
    >
      <div className="space-y-4 text-center">
        {state.success && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <AuthSuccess message={state.success} />
          </>
        )}

        {state.error && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <AuthError error={state.error} />
            
            <div className="space-y-2 pt-4">
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              >
                Back to sign in
              </button>
              
              {state.type === 'signup' && (
                <button
                  onClick={() => router.push('/signup')}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                >
                  Try signing up again
                </button>
              )}
              
              {state.type === 'recovery' && (
                <button
                  onClick={() => router.push('/forgot-password')}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                >
                  Request new reset link
                </button>
              )}
            </div>
          </>
        )}

        {!state.success && !state.error && (
          <div className="text-sm text-muted-foreground">
            Processing your request...
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
