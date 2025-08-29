'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { useAuth } from '@/hooks/useAuth'
import { signInSchema, type SignInFormData } from '@/lib/auth-validation'
import { AuthError } from './auth-errors'
import { AuthLoadingButton, AuthRedirectLoading } from './loading-states'
import { AuthLink } from './auth-layout'

/**
 * Login Form Component
 * Email/password authentication form following ShadCN patterns
 */

export function LoginForm() {
  const { signIn, loading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Form setup with react-hook-form and zod validation
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  /**
   * Handle form submission
   */
  const onSubmit = async (data: SignInFormData) => {
    try {
      clearError()

      console.log('🔐 Attempting sign in with:', { email: data.email, rememberMe: data.rememberMe })
      
      // Test avec des identifiants de démonstration
      if (data.email === 'test@example.com' && data.password === 'test123') {
        console.log('✅ Demo login successful, redirecting to dashboard...')
        setIsRedirecting(true)
        
        // Redirection directe pour les identifiants de test
        setTimeout(() => {
          console.log("🚀 Demo login - direct redirect to dashboard")
          window.location.href = "/dashboard/default"
        }, 1500)
        return
      }
      
      const response = await signIn(data)

      if (response.success) {
        setIsRedirecting(true)
        console.log('✅ Sign in successful, redirecting...')
        
        // Pas de redirection de secours - laisser useAuth gérer complètement
      } else {
        console.log('❌ Sign in failed:', response.message)
        // Error handling is done in the useAuth hook
      }
    } catch (error) {
      console.error('🚨 Login form error:', error)
    }
  }

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  /**
   * Clear error when user starts typing
   */
  const handleInputChange = () => {
    if (error) {
      clearError()
    }
  }

  // Si on est en train de rediriger, afficher seulement l'animation centrée
  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AuthRedirectLoading />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Message */}
        <AuthError error={error} />

        {/* Development Helper */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted/50 border rounded p-3 text-xs text-muted-foreground">
            <p><strong>Mode développement :</strong></p>
            <p>• <strong>Test rapide :</strong> test@example.com / test123</p>
            <p>• Comptes de test sur <a href="/test-accounts" className="text-primary hover:underline">/test-accounts</a></p>
            <p>• Tests complets sur <a href="/auth-test" className="text-primary hover:underline">/auth-test</a></p>
          </div>
        )}

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={loading}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    handleInputChange()
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="pr-10"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      handleInputChange()
                    }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    Remember me
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <AuthLink href="/forgot-password" className="text-sm">
            Forgot password?
          </AuthLink>
        </div>

        {/* Submit Button */}
        <AuthLoadingButton
          type="submit"
          loading={loading}
          disabled={loading || isRedirecting}
          className="w-full"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </AuthLoadingButton>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <AuthLink href="/signup">
            Sign up
          </AuthLink>
        </div>
      </form>
    </Form>
  )
}

/**
 * Login Form with Social Providers (for future implementation)
 */
export function LoginFormWithSocial() {
  return (
    <div className="space-y-4">
      <LoginForm />
      
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons (placeholder for future implementation) */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" disabled>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
        <Button variant="outline" disabled>
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </Button>
      </div>
    </div>
  )
}
