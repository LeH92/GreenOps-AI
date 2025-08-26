'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthPageLoading } from './loading-states'
import { AuthLayout } from './auth-layout'
import { AuthError } from './auth-errors'

/**
 * Auth Guard Component
 * Wrapper component for protected routes
 * Following cursor rules and ShadCN patterns
 */

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  requireVerification?: boolean
  redirectTo?: string
  fallback?: ReactNode
  loadingFallback?: ReactNode
  errorFallback?: ReactNode
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireVerification = false,
  redirectTo = '/login',
  fallback,
  loadingFallback,
  errorFallback,
}: AuthGuardProps) {
  const router = useRouter()
  const { user, session, loading, error, isAuthenticated, isEmailVerified } = useAuth()

  useEffect(() => {
    if (!loading) {
      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        const currentPath = window.location.pathname
        const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
        router.push(redirectUrl)
        return
      }

      // If email verification is required but user email is not verified
      if (requireVerification && isAuthenticated && !isEmailVerified) {
        router.push('/verify-email')
        return
      }
    }
  }, [loading, isAuthenticated, isEmailVerified, requireAuth, requireVerification, redirectTo, router])

  // Show loading state
  if (loading) {
    return loadingFallback || <AuthPageLoading />
  }

  // Show error state
  if (error) {
    return (
      errorFallback || (
        <AuthLayout
          title="Authentication Error"
          description="There was a problem with your authentication"
          showBackToLogin={true}
        >
          <AuthError error={error} />
        </AuthLayout>
      )
    )
  }

  // Check authentication requirements
  if (requireAuth && !isAuthenticated) {
    return (
      fallback || (
        <AuthLayout
          title="Authentication Required"
          description="Please sign in to access this page"
          showBackToLogin={true}
        >
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You need to be signed in to view this content.
            </p>
            <button
              onClick={() => router.push(redirectTo)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              Sign in to continue
            </button>
          </div>
        </AuthLayout>
      )
    )
  }

  // Check email verification requirements
  if (requireVerification && isAuthenticated && !isEmailVerified) {
    return (
      fallback || (
        <AuthLayout
          title="Email Verification Required"
          description="Please verify your email address to continue"
        >
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">📧</div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                We've sent a verification email to <strong>{user?.email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Please check your inbox and click the verification link.
              </p>
            </div>
          </div>
        </AuthLayout>
      )
    )
  }

  // All checks passed, render children
  return <>{children}</>
}

/**
 * Protected Route Component
 * Higher-order component for protecting routes
 */
interface ProtectedRouteProps {
  children: ReactNode
  requireVerification?: boolean
}

export function ProtectedRoute({ children, requireVerification = false }: ProtectedRouteProps) {
  return (
    <AuthGuard requireAuth={true} requireVerification={requireVerification}>
      {children}
    </AuthGuard>
  )
}

/**
 * Public Route Component
 * Redirects authenticated users away from auth pages
 */
interface PublicRouteProps {
  children: ReactNode
  redirectTo?: string
}

export function PublicRoute({ children, redirectTo = '/dashboard/default' }: PublicRouteProps) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [loading, isAuthenticated, redirectTo, router])

  // Show loading state
  if (loading) {
    return <AuthPageLoading />
  }

  // If authenticated, don't render children (redirect will happen)
  if (isAuthenticated) {
    return <AuthPageLoading />
  }

  // Not authenticated, render children
  return <>{children}</>
}

/**
 * Admin Route Component
 * For future admin-only routes
 */
interface AdminRouteProps {
  children: ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth()
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin'

  if (loading) {
    return <AuthPageLoading />
  }

  if (!isAdmin) {
    return (
      <AuthLayout
        title="Access Denied"
        description="You don't have permission to access this page"
        showBackToLogin={true}
      >
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🚫</div>
          <p className="text-sm text-muted-foreground">
            This page is restricted to administrators only.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}

/**
 * Role-based Route Component
 * For future role-based access control
 */
interface RoleRouteProps {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
}

export function RoleRoute({ children, allowedRoles, fallback }: RoleRouteProps) {
  const { user, loading } = useAuth()
  
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'user'
  const hasPermission = allowedRoles.includes(userRole)

  if (loading) {
    return <AuthPageLoading />
  }

  if (!hasPermission) {
    return (
      fallback || (
        <AuthLayout
          title="Access Denied"
          description="You don't have permission to access this page"
          showBackToLogin={true}
        >
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🚫</div>
            <p className="text-sm text-muted-foreground">
              Your current role ({userRole}) doesn't have access to this page.
            </p>
            <p className="text-xs text-muted-foreground">
              Required roles: {allowedRoles.join(', ')}
            </p>
          </div>
        </AuthLayout>
      )
    )
  }

  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}

/**
 * Conditional Auth Component
 * Shows different content based on auth state
 */
interface ConditionalAuthProps {
  authenticated?: ReactNode
  unauthenticated?: ReactNode
  loading?: ReactNode
  verified?: ReactNode
  unverified?: ReactNode
}

export function ConditionalAuth({
  authenticated,
  unauthenticated,
  loading: loadingContent,
  verified,
  unverified,
}: ConditionalAuthProps) {
  const { isAuthenticated, isEmailVerified, loading } = useAuth()

  if (loading) {
    return <>{loadingContent || <AuthPageLoading />}</>
  }

  if (isAuthenticated) {
    if (verified && unverified) {
      return <>{isEmailVerified ? verified : unverified}</>
    }
    return <>{authenticated}</>
  }

  return <>{unauthenticated}</>
}
