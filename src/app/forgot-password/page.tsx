import type { Metadata } from 'next'
import { Suspense } from 'react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { ForgotPasswordForm, ForgotPasswordInstructions, ForgotPasswordHelp } from '@/components/auth/forgot-password-form'
import { AuthCardLoading } from '@/components/auth/loading-states'

/**
 * Forgot Password Page
 * Password reset request page following App Router conventions
 * Following cursor rules and ShadCN patterns
 */

export const metadata: Metadata = {
  title: 'Reset Password - GreenOps AI',
  description: 'Reset your GreenOps AI account password to regain access to your dashboard.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthCardLoading />}>
      <AuthLayout
        title="Reset your password"
        description="Enter your email address and we'll send you a reset link"
        showBackToLogin={true}
      >
        <ForgotPasswordForm />
      </AuthLayout>
    </Suspense>
  )
}

/**
 * Enhanced Forgot Password Page with Instructions
 * Includes detailed instructions and help
 */
export function ForgotPasswordPageWithHelp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-8">
        {/* Left side - Form */}
        <div className="order-1">
          <Suspense fallback={<AuthCardLoading />}>
            <AuthLayout
              title="Reset your password"
              description="We'll help you get back into your account"
              showBackToLogin={true}
            >
              <ForgotPasswordForm />
            </AuthLayout>
          </Suspense>
        </div>

        {/* Right side - Instructions and Help */}
        <div className="order-2 space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <ForgotPasswordInstructions />
          </div>
          
          <ForgotPasswordHelp />
        </div>
      </div>
    </div>
  )
}

/**
 * Forgot Password Success Page
 * Shown after successful password reset request
 */
export function ForgotPasswordSuccessPage() {
  return (
    <Suspense fallback={<AuthCardLoading />}>
      <AuthLayout
        title="Check your email"
        description="We've sent you a password reset link"
        showBackToLogin={true}
      >
        <div className="space-y-4 text-center">
          <div className="text-6xl mb-4">📧</div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to your email address.
            </p>
            <p className="text-sm text-muted-foreground">
              Please check your inbox and follow the instructions.
            </p>
          </div>
          
          <div className="space-y-2 pt-4">
            <p className="text-xs text-muted-foreground">
              Didn't receive the email?
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• The link expires in 1 hour</li>
            </ul>
          </div>
        </div>
      </AuthLayout>
    </Suspense>
  )
}

/**
 * Common issues and solutions for password reset
 */
export function ForgotPasswordTroubleshooting() {
  const issues = [
    {
      problem: "I'm not receiving the reset email",
      solutions: [
        "Check your spam/junk folder",
        "Verify you entered the correct email address",
        "Try requesting another reset email",
        "Contact support if the issue persists"
      ]
    },
    {
      problem: "The reset link doesn't work",
      solutions: [
        "Make sure you're clicking the most recent link",
        "Reset links expire after 1 hour",
        "Request a new reset email",
        "Try copying and pasting the link directly"
      ]
    },
    {
      problem: "I forgot which email I used",
      solutions: [
        "Try all email addresses you commonly use",
        "Check your email for previous GreenOps AI messages",
        "Contact our support team for assistance"
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Common Issues</h3>
      
      {issues.map((issue, index) => (
        <div key={index} className="space-y-2">
          <h4 className="font-medium text-sm">{issue.problem}</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            {issue.solutions.map((solution, solutionIndex) => (
              <li key={solutionIndex} className="list-disc">
                {solution}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
