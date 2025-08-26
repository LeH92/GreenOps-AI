import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

/**
 * Auth Layout Component
 * Shared layout for all authentication pages
 * Following cursor rules and existing ShadCN patterns
 */

interface AuthLayoutProps {
  children: ReactNode
  title: string
  description: string
  showBackToLogin?: boolean
  footerContent?: ReactNode
}

export function AuthLayout({ 
  children, 
  title, 
  description, 
  showBackToLogin = false,
  footerContent 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="text-3xl">🌱</div>
            <h1 className="text-2xl font-bold text-primary">GreenOps AI</h1>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            FinOps & GreenOps platform for cloud cost monitoring and carbon footprint tracking
          </p>
        </div>

        {/* Main Auth Card */}
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {children}
          </CardContent>
        </Card>

        {/* Back to Login Link */}
        {showBackToLogin && (
          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        )}

        {/* Footer Content */}
        {footerContent && (
          <div className="text-center space-y-2">
            {footerContent}
          </div>
        )}

        {/* Footer Links */}
        <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <Link href="/support" className="hover:text-primary transition-colors">
            Support
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground">
          © 2025 GreenOps AI. All rights reserved.
        </div>
      </div>
    </div>
  )
}

/**
 * Auth Card Footer Component
 * Reusable footer for auth forms
 */
interface AuthCardFooterProps {
  children: ReactNode
}

export function AuthCardFooter({ children }: AuthCardFooterProps) {
  return (
    <div className="text-center text-sm text-muted-foreground space-y-2">
      {children}
    </div>
  )
}

/**
 * Auth Link Component
 * Styled link for auth pages
 */
interface AuthLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function AuthLink({ href, children, className = '' }: AuthLinkProps) {
  return (
    <Link 
      href={href} 
      className={`text-primary hover:text-primary/80 font-medium transition-colors ${className}`}
    >
      {children}
    </Link>
  )
}
