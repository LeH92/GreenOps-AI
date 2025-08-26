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

/**
 * Signup Benefits Component
 * Highlights the value proposition of GreenOps AI
 */
export function SignupBenefits() {
  const benefits = [
    {
      icon: '💰',
      title: 'Cost Optimization',
      description: 'Monitor and reduce your cloud spending across all providers'
    },
    {
      icon: '🌱',
      title: 'Carbon Tracking',
      description: 'Track and minimize your cloud carbon footprint'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Get insights with comprehensive dashboards and reports'
    },
    {
      icon: '🚨',
      title: 'Smart Alerts',
      description: 'Receive notifications when budgets or thresholds are exceeded'
    }
  ]

  return (
    <div className="space-y-6 p-6 bg-muted/20 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Why choose GreenOps AI?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The complete FinOps and GreenOps solution
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="text-2xl">{benefit.icon}</div>
            <div>
              <h4 className="font-medium text-sm">{benefit.title}</h4>
              <p className="text-xs text-muted-foreground">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Enhanced Signup Page with Benefits
 * Includes value proposition alongside the form
 */
export function SignupPageWithBenefits() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-screen">
        {/* Left side - Benefits */}
        <div className="space-y-6 order-2 lg:order-1">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
              <div className="text-3xl">🌱</div>
              <h1 className="text-2xl font-bold text-primary">GreenOps AI</h1>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Optimize costs,<br />minimize carbon footprint
            </h2>
            <p className="text-muted-foreground">
              Join thousands of companies using GreenOps AI to reduce cloud costs 
              and environmental impact.
            </p>
          </div>
          
          <SignupBenefits />
          
          <div className="text-center lg:text-left">
            <p className="text-sm text-muted-foreground">
              Trusted by companies worldwide to manage their cloud sustainability
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="order-1 lg:order-2">
          <Suspense fallback={<AuthCardLoading />}>
            <AuthLayout
              title="Create your account"
              description="Start your journey towards sustainable cloud operations"
              footerContent={
                <AuthCardFooter>
                  <p>
                    Already have an account?{' '}
                    <AuthLink href="/login">
                      Sign in
                    </AuthLink>
                  </p>
                </AuthCardFooter>
              }
            >
              <SignupForm />
            </AuthLayout>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
