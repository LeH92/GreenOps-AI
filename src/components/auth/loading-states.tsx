import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Loading States Components for Authentication
 * Consistent loading indicators following ShadCN patterns
 */

/**
 * Auth Button Loading State
 * Button with loading spinner
 */
interface AuthLoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

export function AuthLoadingButton({
  loading,
  children,
  className = '',
  variant = 'default',
  size = 'default',
  disabled = false,
  type = 'button',
  onClick,
}: AuthLoadingButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      className={`w-full ${className}`}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}

/**
 * Auth Form Loading Skeleton
 * Skeleton loader for auth forms
 */
export function AuthFormSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="text-center">
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Auth Page Loading Spinner
 * Full page loading indicator
 */
export function AuthPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <div className="text-3xl">🌱</div>
          <h1 className="text-2xl font-bold text-primary">GreenOps AI</h1>
        </div>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline Loading Spinner
 * Small inline spinner for form elements
 */
interface InlineLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function InlineLoading({ size = 'md', className = '' }: InlineLoadingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

/**
 * Auth Field Loading State
 * Loading state for individual form fields
 */
interface AuthFieldLoadingProps {
  label: string
  className?: string
}

export function AuthFieldLoading({ label, className = '' }: AuthFieldLoadingProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

/**
 * Auth Card Loading State
 * Loading state for the entire auth card
 */
export function AuthCardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Skeleton */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Form Skeleton */}
        <AuthFormSkeleton />

        {/* Footer Skeleton */}
        <div className="flex justify-center space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

/**
 * Progress Indicator
 * Shows progress for multi-step processes
 */
interface AuthProgressProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function AuthProgress({ steps, currentStep, className = '' }: AuthProgressProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Step {currentStep + 1} of {steps.length}</span>
        <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="text-sm font-medium text-center">
        {steps[currentStep]}
      </div>
    </div>
  )
}

/**
 * Delayed Loading Component
 * Shows loading after a delay to prevent flash
 */
interface DelayedLoadingProps {
  delay?: number
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function DelayedLoading({ 
  delay = 200, 
  children, 
  fallback = <InlineLoading /> 
}: DelayedLoadingProps) {
  const [showLoading, setShowLoading] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!showLoading) {
    return null
  }

  return <>{fallback}</>
}

// Fix React import
import React from 'react'
