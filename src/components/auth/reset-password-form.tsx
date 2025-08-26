'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Progress } from '@/components/ui/progress'

import { useAuth } from '@/hooks/useAuth'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/auth-validation'
import { validatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthText } from '@/lib/auth-validation'
import { AuthError, AuthSuccess, AuthWarning } from './auth-errors'
import { AuthLoadingButton } from './loading-states'
import { AuthLink } from './auth-layout'

/**
 * Reset Password Form Component
 * New password form accessed via email link
 * Following ShadCN patterns and cursor rules
 */

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword, loading, error, clearError } = useAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  // Form setup with react-hook-form and zod validation
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const watchedPassword = form.watch('password')

  /**
   * Validate token on component mount
   */
  useEffect(() => {
    const checkToken = () => {
      // Check if we have the necessary URL parameters
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const type = searchParams.get('type')
      
      if (type === 'recovery' && accessToken && refreshToken) {
        setIsValidToken(true)
      } else {
        setIsValidToken(false)
      }
    }

    checkToken()
  }, [searchParams])

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      clearError()
      setSuccessMessage(null)

      const response = await updatePassword(data)

      if (response.success) {
        setSuccessMessage(response.message)
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login?message=password-updated')
        }, 2000)
      }
      // Error handling is done in the useAuth hook
    } catch (error) {
      console.error('Reset password form error:', error)
    }
  }

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  /**
   * Clear error when user starts typing
   */
  const handleInputChange = () => {
    if (error) {
      clearError()
    }
    if (successMessage) {
      setSuccessMessage(null)
    }
  }

  /**
   * Password Strength Indicator Component
   */
  const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    if (!password) return null

    const strength = validatePasswordStrength(password)
    const progressValue = (strength.score / 4) * 100

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className={`text-xs font-medium ${getPasswordStrengthColor(strength.score)}`}>
            {getPasswordStrengthText(strength.score)}
          </span>
        </div>
        <Progress value={progressValue} className="h-1" />
      </div>
    )
  }

  // Show loading state while validating token
  if (isValidToken === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    )
  }

  // Show error state for invalid token
  if (isValidToken === false) {
    return (
      <div className="space-y-4">
        <AuthError error="This password reset link is invalid or has expired." />
        
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Password reset links expire after 1 hour for security reasons.</p>
            <p>Please request a new password reset email.</p>
          </div>
          
          <div className="space-y-2">
            <AuthLink href="/forgot-password">
              <Button variant="outline" className="w-full">
                Request new reset email
              </Button>
            </AuthLink>
            
            <AuthLink href="/login" className="text-sm block">
              ← Back to login
            </AuthLink>
          </div>
        </div>
      </div>
    )
  }

  // Show success state
  if (successMessage) {
    return (
      <div className="space-y-4">
        <AuthSuccess message={successMessage} />
        
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Your password has been successfully updated.</p>
            <p>Redirecting you to the login page...</p>
          </div>
          
          <AuthLink href="/login">
            <Button className="w-full">
              Continue to login
            </Button>
          </AuthLink>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Message */}
        <AuthError error={error} />

        {/* Warning about password requirements */}
        <AuthWarning message="Choose a strong password that you haven't used before." />

        {/* New Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    disabled={loading}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      handleInputChange()
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
              <PasswordStrengthIndicator password={watchedPassword} />
            </FormItem>
          )}
        />

        {/* Confirm New Password Field */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    disabled={loading}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      handleInputChange()
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleConfirmPasswordVisibility}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <AuthLoadingButton
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Updating password...' : 'Update password'}
        </AuthLoadingButton>

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>After updating your password, you'll need to sign in again.</p>
          <p>This helps keep your account secure.</p>
        </div>
      </form>
    </Form>
  )
}

/**
 * Reset Password Security Tips
 * Security recommendations for password reset
 */
export function ResetPasswordSecurityTips() {
  return (
    <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="text-lg">🔒</div>
        <h4 className="font-medium">Security Tips</h4>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-2">
        <ul className="list-disc list-inside space-y-1">
          <li>Use a unique password you haven't used elsewhere</li>
          <li>Include uppercase, lowercase, numbers, and symbols</li>
          <li>Make it at least 12 characters long</li>
          <li>Consider using a password manager</li>
          <li>Don't share your password with anyone</li>
        </ul>
      </div>
    </div>
  )
}
