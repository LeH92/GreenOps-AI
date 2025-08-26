import type { Metadata } from 'next'
import { Suspense } from 'react'

import { AuthLayout, AuthCardFooter, AuthLink } from '@/components/auth/auth-layout'
import { SignupForm } from '@/components/auth/signup-form'
import { AuthCardLoading } from '@/components/auth/loading-states'

/**
 * Signup Page
 * User registration page following App Router conventions
 * Following cursor rules and ShadCN patterns
 */

export const metadata: Metadata = {
  title: 'Create Account - GreenOps AI',
  description: 'Create your GreenOps AI account to start monitoring cloud costs and carbon footprint.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthCardLoading />}>
      <AuthLayout
        title="Create your account"
        description="Join GreenOps AI and start optimizing your cloud costs"
        footerContent={
          <AuthCardFooter>
            <div className="space-y-2">
              <p>
                Already have an account?{' '}
                <AuthLink href="/login">
                  Sign in
                </AuthLink>
              </p>
              <p className="text-xs">
                By creating an account, you agree to our{' '}
                <AuthLink href="/terms" className="underline text-xs">
                  Terms of Service
                </AuthLink>{' '}
                and{' '}
                <AuthLink href="/privacy" className="underline text-xs">
                  Privacy Policy
                </AuthLink>
              </p>
            </div>
          </AuthCardFooter>
        }
      >
        <SignupForm />
      </AuthLayout>
    </Suspense>
  )
}


