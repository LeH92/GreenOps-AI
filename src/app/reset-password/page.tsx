import type { Metadata } from 'next'
import { Suspense } from 'react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { ResetPasswordForm, ResetPasswordSecurityTips } from '@/components/auth/reset-password-form'
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

/**
 * Enhanced Reset Password Page with Security Tips
 * Includes security recommendations alongside the form
 */
export function ResetPasswordPageWithTips() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-8">
        {/* Left side - Form */}
        <div className="order-1">
          <Suspense fallback={<AuthCardLoading />}>
            <AuthLayout
              title="Create new password"
              description="Choose a strong password to keep your account secure"
            >
              <ResetPasswordForm />
            </AuthLayout>
          </Suspense>
        </div>

        {/* Right side - Security Tips */}
        <div className="order-2 space-y-6">
          <ResetPasswordSecurityTips />
          
          <div className="bg-card border rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="text-lg">🛡️</div>
                <h4 className="font-medium">Account Security</h4>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  After updating your password, we recommend:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Sign in to verify your new password works</li>
                  <li>Update your password manager if you use one</li>
                  <li>Review your account security settings</li>
                  <li>Sign out of other devices if needed</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/20 border rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="text-lg">❓</div>
                <h4 className="font-medium">Need Help?</h4>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  If you're having trouble resetting your password or have 
                  security concerns about your account, please contact our 
                  support team.
                </p>
                <p className="mt-2">
                  <a 
                    href="mailto:support@greenops.ai" 
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    support@greenops.ai
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Reset Password Success Page
 * Shown after successful password update
 */
export function ResetPasswordSuccessPage() {
  return (
    <Suspense fallback={<AuthCardLoading />}>
      <AuthLayout
        title="Password updated!"
        description="Your password has been successfully changed"
      >
        <div className="space-y-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your password has been successfully updated.
            </p>
            <p className="text-sm text-muted-foreground">
              You can now sign in with your new password.
            </p>
          </div>
          
          <div className="pt-4">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              Continue to sign in
            </a>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>For security reasons, you've been signed out of all devices.</p>
            <p>Please sign in again to access your dashboard.</p>
          </div>
        </div>
      </AuthLayout>
    </Suspense>
  )
}

/**
 * Password Reset Error Page
 * Shown when reset link is invalid or expired
 */
export function ResetPasswordErrorPage() {
  return (
    <Suspense fallback={<AuthCardLoading />}>
      <AuthLayout
        title="Reset link expired"
        description="This password reset link is no longer valid"
        showBackToLogin={true}
      >
        <div className="space-y-6 text-center">
          <div className="text-6xl mb-4">⏰</div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Password reset links expire after 1 hour for security reasons.
            </p>
            <p className="text-sm text-muted-foreground">
              Please request a new password reset email to continue.
            </p>
          </div>
          
          <div className="space-y-3 pt-4">
            <a
              href="/forgot-password"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              Request new reset email
            </a>
            
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            >
              Back to sign in
            </a>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>
              If you continue to have issues, please{' '}
              <a 
                href="mailto:support@greenops.ai" 
                className="text-primary hover:text-primary/80"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      </AuthLayout>
    </Suspense>
  )
}
