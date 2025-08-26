import type { Metadata } from 'next'
import { Suspense } from 'react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { AuthCardLoading } from '@/components/auth/loading-states'

/**
 * Reset Password Page
 * New password form page accessed via email link
 * Following App Router conventions and cursor rules
 */

export const metadata: Metadata = {
  title: 'Update Password - GreenOps AI',
  description: 'Create a new password for your GreenOps AI account.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthCardLoading />}>
      <AuthLayout
        title="Create new password"
        description="Enter a strong password to secure your account"
      >
        <ResetPasswordForm />
      </AuthLayout>
    </Suspense>
  )
}
