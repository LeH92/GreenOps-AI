import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthCallbackHandler } from '@/components/auth/auth-callback'
import { AuthPageLoading } from '@/components/auth/loading-states'

/**
 * Auth Callback Page
 * Handles authentication callbacks from Supabase
 * Following App Router conventions and cursor rules
 */

export const metadata: Metadata = {
  title: 'Authenticating - GreenOps AI',
  description: 'Completing your authentication...',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthPageLoading />}>
      <AuthCallbackHandler />
    </Suspense>
  )
}
