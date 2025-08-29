import type { Metadata } from 'next'

import { AuthLayout, AuthCardFooter } from '@/components/auth/auth-layout'
import { LoginForm } from '@/components/auth/login-form'

/**
 * Login Page
 * User authentication page with full workflow support
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
    <AuthLayout
      title="Welcome back"
      description="Sign in to your GreenOps AI account"
    >
      <LoginForm />
    </AuthLayout>
  )
}