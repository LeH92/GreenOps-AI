import { createBrowserClient } from '@supabase/ssr'
import { supabase } from '@/lib/supabase'
import type { AuthError, User, Session } from '@supabase/supabase-js'

/**
 * Authentication utilities and helpers for GreenOps AI Dashboard
 * Centralized auth functions following cursor rules and ShadCN patterns
 */

// Types for auth operations
export interface AuthResponse<T = any> {
  data: T | null
  error: AuthError | null
  success: boolean
  message: string
}

export interface SignInData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignUpData {
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  password: string
  confirmPassword: string
}

/**
 * Sign in user with email and password
 */
export async function signIn({ email, password }: SignInData): Promise<AuthResponse<{ user: User; session: Session }>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      return {
        data: null,
        error,
        success: false,
        message: getAuthErrorMessage(error),
      }
    }

    if (!data.user || !data.session) {
      return {
        data: null,
        error: null,
        success: false,
        message: 'Authentication failed. Please try again.',
      }
    }

    return {
      data: { user: data.user, session: data.session },
      error: null,
      success: true,
      message: 'Successfully signed in!',
    }
  } catch (error) {
    return {
      data: null,
      error: error as AuthError,
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Sign up new user with email and password
 */
export async function signUp({ email, password }: Omit<SignUpData, 'confirmPassword' | 'acceptTerms'>): Promise<AuthResponse<{ user: User }>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return {
        data: null,
        error,
        success: false,
        message: getAuthErrorMessage(error),
      }
    }

    if (!data.user) {
      return {
        data: null,
        error: null,
        success: false,
        message: 'Failed to create account. Please try again.',
      }
    }

    return {
      data: { user: data.user },
      error: null,
      success: true,
      message: data.session 
        ? 'Account created successfully!' 
        : 'Account created! Please check your email to verify your account.',
    }
  } catch (error) {
    return {
      data: null,
      error: error as AuthError,
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<AuthResponse<null>> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        data: null,
        error,
        success: false,
        message: getAuthErrorMessage(error),
      }
    }

    return {
      data: null,
      error: null,
      success: true,
      message: 'Successfully signed out!',
    }
  } catch (error) {
    return {
      data: null,
      error: error as AuthError,
      success: false,
      message: 'An unexpected error occurred during sign out.',
    }
  }
}

/**
 * Send password reset email
 */
export async function resetPassword({ email }: ResetPasswordData): Promise<AuthResponse<null>> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return {
        data: null,
        error,
        success: false,
        message: getAuthErrorMessage(error),
      }
    }

    return {
      data: null,
      error: null,
      success: true,
      message: 'Password reset email sent! Please check your inbox.',
    }
  } catch (error) {
    return {
      data: null,
      error: error as AuthError,
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Update user password (used after reset)
 */
export async function updatePassword({ password }: Omit<UpdatePasswordData, 'confirmPassword'>): Promise<AuthResponse<User>> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return {
        data: null,
        error,
        success: false,
        message: getAuthErrorMessage(error),
      }
    }

    if (!data.user) {
      return {
        data: null,
        error: null,
        success: false,
        message: 'Failed to update password. Please try again.',
      }
    }

    return {
      data: data.user,
      error: null,
      success: true,
      message: 'Password updated successfully!',
    }
  } catch (error) {
    return {
      data: null,
      error: error as AuthError,
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<AuthResponse<{ user: User; session: Session }>> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return {
        data: null,
        error,
        success: false,
        message: getAuthErrorMessage(error),
      }
    }

    if (!data.session || !data.session.user) {
      return {
        data: null,
        error: null,
        success: false,
        message: 'No active session found.',
      }
    }

    return {
      data: { user: data.session.user, session: data.session },
      error: null,
      success: true,
      message: 'Session retrieved successfully.',
    }
  } catch (error) {
    return {
      data: null,
      error: error as AuthError,
      success: false,
      message: 'Failed to retrieve session.',
    }
  }
}

/**
 * Email validation utility
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Password strength validation
 */
export interface PasswordValidation {
  isValid: boolean
  score: number // 0-4
  feedback: string[]
}

export function validatePasswordStrength(password: string): PasswordValidation {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password must be at least 8 characters long')
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one uppercase letter')
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one lowercase letter')
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one number')
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one special character')
  }

  return {
    isValid: score >= 3,
    score: Math.min(score, 4),
    feedback,
  }
}

/**
 * Convert Supabase auth errors to user-friendly messages
 */
export function getAuthErrorMessage(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please check your credentials and try again.'
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link before signing in.'
    case 'User already registered':
      return 'An account with this email already exists. Try signing in instead.'
    case 'Password should be at least 6 characters':
      return 'Password must be at least 6 characters long.'
    case 'Email rate limit exceeded':
      return 'Too many requests. Please wait a few minutes before trying again.'
    case 'Invalid email':
      return 'Please enter a valid email address.'
    case 'Signup disabled':
      return 'Account registration is currently disabled.'
    case 'Email link is invalid or has expired':
      return 'This link has expired. Please request a new password reset email.'
    case 'Token has expired or is invalid':
      return 'This link has expired. Please request a new password reset email.'
    case 'New password should be different from the old password':
      return 'Your new password must be different from your current password.'
    default:
      // Log the actual error for debugging
      console.error('Supabase Auth Error:', error)
      return error.message || 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Format user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest'
  
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name
  }
  
  if (user.user_metadata?.name) {
    return user.user_metadata.name
  }
  
  if (user.email) {
    return user.email.split('@')[0]
  }
  
  return 'User'
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User | null): string {
  if (!user) return 'G'
  
  const displayName = getUserDisplayName(user)
  
  if (displayName === 'Guest' || displayName === 'User') {
    return user.email ? user.email[0].toUpperCase() : 'G'
  }
  
  const names = displayName.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase()
  }
  
  return displayName.substring(0, 2).toUpperCase()
}

/**
 * Session persistence configuration
 */
export const AUTH_CONFIG = {
  // Session will persist for 7 days
  sessionPersistence: 7 * 24 * 60 * 60, // 7 days in seconds
  // Refresh token before expiry
  refreshThreshold: 60 * 5, // 5 minutes before expiry
  // Auto-refresh interval
  refreshInterval: 60 * 60, // 1 hour
} as const

/**
 * Check if session is about to expire
 */
export function isSessionExpiringSoon(session: Session | null): boolean {
  if (!session) return false
  
  const expiresAt = session.expires_at
  if (!expiresAt) return false
  
  const now = Math.floor(Date.now() / 1000)
  const timeUntilExpiry = expiresAt - now
  
  return timeUntilExpiry <= AUTH_CONFIG.refreshThreshold
}
