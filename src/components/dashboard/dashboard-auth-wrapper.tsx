'use client'

import { ReactNode } from 'react'
import { ProtectedRoute } from '@/components/auth/auth-guard'
import { AuthProvider } from '@/components/auth/auth-provider'

/**
 * Dashboard Auth Wrapper
 * Wraps the dashboard with authentication providers and guards
 * Following cursor rules and Next.js patterns
 */

interface DashboardAuthWrapperProps {
  children: ReactNode
}

export function DashboardAuthWrapper({ children }: DashboardAuthWrapperProps) {
  return (
    <AuthProvider>
      {/* ProtectedRoute temporairement désactivé - protection gérée côté useAuth */}
      {children}
    </AuthProvider>
  )
}
