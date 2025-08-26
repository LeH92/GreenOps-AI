import type { Metadata } from 'next'
import { Suspense } from 'react'

import { AuthLayout, AuthCardFooter, AuthLink } from '@/components/auth/auth-layout'
import { LoginForm } from '@/components/auth/login-form'
import { AuthCardLoading } from '@/components/auth/loading-states'

/**
 * Login Page
 * User authentication page following App Router conventions
 * Following cursor rules and ShadCN patterns
 */

export const metadata: Metadata = {
  title: 'Sign In - GreenOps AI',
  description: 'Sign in to your GreenOps AI dashboard to monitor cloud costs and carbon footprint.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthCardLoading />}>
      <AuthLayout
        title="Welcome back"
        description="Sign in to your GreenOps AI account"
        footerContent={
          <AuthCardFooter>
            <p>
              New to GreenOps AI?{' '}
              <AuthLink href="/signup">
                Create an account
              </AuthLink>
            </p>
          </AuthCardFooter>
        }
      >
        <LoginForm />
      </AuthLayout>
    </Suspense>
  )
}

/**
 * Login Page with success/error messages
 * Handles URL parameters for messages
 */
export function LoginPageWithMessages() {
  return (
    <Suspense fallback={<AuthCardLoading />}>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageContent() {
  // This would handle URL search params for messages
  // For now, we'll use the basic login form
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your GreenOps AI account"
      footerContent={
        <AuthCardFooter>
          <p>
            New to GreenOps AI?{' '}
            <AuthLink href="/signup">
              Create an account
            </AuthLink>
          </p>
          <p className="text-xs">
            By signing in, you agree to our{' '}
            <AuthLink href="/terms" className="underline text-xs">
              Terms of Service
            </AuthLink>{' '}
            and{' '}
            <AuthLink href="/privacy" className="underline text-xs">
              Privacy Policy
            </AuthLink>
          </p>
        </AuthCardFooter>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
