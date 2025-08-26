import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { ReactNode } from 'react'

/**
 * Auth Error and Message Components
 * Centralized error message handling for authentication
 * Following cursor rules and ShadCN patterns
 */

export type MessageType = 'error' | 'success' | 'info' | 'warning'

interface AuthMessageProps {
  type: MessageType
  message: string
  className?: string
}

/**
 * Auth Message Component
 * Displays formatted messages for auth operations
 */
export function AuthMessage({ type, message, className = '' }: AuthMessageProps) {
  if (!message) return null

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'info':
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive'
      case 'success':
        return 'default'
      case 'warning':
        return 'default'
      case 'info':
      default:
        return 'default'
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'error':
      default:
        return ''
    }
  }

  return (
    <Alert variant={getVariant()} className={`${getStyles()} ${className}`}>
      {getIcon()}
      <AlertDescription className="ml-2">
        {message}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Auth Error Component
 * Specific error display for auth operations
 */
interface AuthErrorProps {
  error: string | null
  className?: string
}

export function AuthError({ error, className }: AuthErrorProps) {
  if (!error) return null

  return <AuthMessage type="error" message={error} className={className} />
}

/**
 * Auth Success Component
 * Success message display for auth operations
 */
interface AuthSuccessProps {
  message: string | null
  className?: string
}

export function AuthSuccess({ message, className }: AuthSuccessProps) {
  if (!message) return null

  return <AuthMessage type="success" message={message} className={className} />
}

/**
 * Auth Info Component
 * Info message display for auth operations
 */
interface AuthInfoProps {
  message: string | null
  className?: string
}

export function AuthInfo({ message, className }: AuthInfoProps) {
  if (!message) return null

  return <AuthMessage type="info" message={message} className={className} />
}

/**
 * Auth Warning Component
 * Warning message display for auth operations
 */
interface AuthWarningProps {
  message: string | null
  className?: string
}

export function AuthWarning({ message, className }: AuthWarningProps) {
  if (!message) return null

  return <AuthMessage type="warning" message={message} className={className} />
}

/**
 * Common Auth Error Messages
 * Predefined error messages for common scenarios
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials and try again.',
  EMAIL_NOT_CONFIRMED: 'Please check your email and click the confirmation link before signing in.',
  USER_ALREADY_EXISTS: 'An account with this email already exists. Try signing in instead.',
  WEAK_PASSWORD: 'Password must be at least 6 characters long.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a few minutes before trying again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  SIGNUP_DISABLED: 'Account registration is currently disabled.',
  EXPIRED_LINK: 'This link has expired. Please request a new password reset email.',
  INVALID_TOKEN: 'This link has expired. Please request a new password reset email.',
  PASSWORD_SAME: 'Your new password must be different from your current password.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
} as const

/**
 * Auth Success Messages
 * Predefined success messages for common scenarios
 */
export const AUTH_SUCCESS_MESSAGES = {
  SIGNED_IN: 'Successfully signed in! Redirecting to dashboard...',
  SIGNED_UP: 'Account created successfully! Please check your email to verify your account.',
  SIGNED_OUT: 'Successfully signed out.',
  PASSWORD_RESET_SENT: 'Password reset email sent! Please check your inbox.',
  PASSWORD_UPDATED: 'Password updated successfully!',
  EMAIL_VERIFIED: 'Email verified successfully! You can now sign in.',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const

/**
 * Auth Info Messages
 * Predefined info messages for common scenarios
 */
export const AUTH_INFO_MESSAGES = {
  EMAIL_VERIFICATION_PENDING: 'Please check your email and click the verification link to complete your registration.',
  PASSWORD_RESET_INSTRUCTIONS: 'Enter your email address and we\'ll send you a link to reset your password.',
  SIGN_IN_TO_CONTINUE: 'Please sign in to continue to your dashboard.',
  ACCOUNT_CREATED_VERIFY: 'Your account has been created! Please verify your email address to get started.',
} as const

/**
 * Utility function to get user-friendly error message
 */
export function getAuthErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error
  }

  if (error?.message) {
    // Map common Supabase errors to user-friendly messages
    const message = error.message.toLowerCase()
    
    if (message.includes('invalid login credentials')) {
      return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
    }
    if (message.includes('email not confirmed')) {
      return AUTH_ERROR_MESSAGES.EMAIL_NOT_CONFIRMED
    }
    if (message.includes('user already registered')) {
      return AUTH_ERROR_MESSAGES.USER_ALREADY_EXISTS
    }
    if (message.includes('password should be at least')) {
      return AUTH_ERROR_MESSAGES.WEAK_PASSWORD
    }
    if (message.includes('rate limit exceeded')) {
      return AUTH_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
    }
    if (message.includes('invalid email')) {
      return AUTH_ERROR_MESSAGES.INVALID_EMAIL
    }
    if (message.includes('signup disabled')) {
      return AUTH_ERROR_MESSAGES.SIGNUP_DISABLED
    }
    if (message.includes('expired') || message.includes('invalid')) {
      return AUTH_ERROR_MESSAGES.EXPIRED_LINK
    }
    
    return error.message
  }

  return AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR
}

/**
 * Multi-line message component for complex instructions
 */
interface AuthInstructionsProps {
  title: string
  instructions: string[]
  type?: MessageType
}

export function AuthInstructions({ title, instructions, type = 'info' }: AuthInstructionsProps) {
  return (
    <div className="space-y-2">
      <AuthMessage type={type} message={title} />
      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
        {instructions.map((instruction, index) => (
          <li key={index} className="list-disc">
            {instruction}
          </li>
        ))}
      </ul>
    </div>
  )
}
