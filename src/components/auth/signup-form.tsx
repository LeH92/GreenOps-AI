'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Progress } from '@/components/ui/progress'

import { useAuth } from '@/hooks/useAuth'
import { signUpSchema, type SignUpFormData } from '@/lib/auth-validation'
import { validatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthText } from '@/lib/auth-validation'
import { AuthError, AuthSuccess, AuthInfo } from './auth-errors'
import { AuthLoadingButton } from './loading-states'
import { AuthLink } from './auth-layout'

/**
 * Signup Form Component
 * User registration form with password strength indicator
 * Following ShadCN patterns and cursor rules
 */

export function SignupForm() {
  const { signUp, loading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] })

  // Form setup with react-hook-form and zod validation
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const watchedPassword = form.watch('password')

  /**
   * Handle form submission
   */
  const onSubmit = async (data: SignUpFormData) => {
    try {
      clearError()
      setSuccessMessage(null)

      const response = await signUp(data)

      if (response.success) {
        setSuccessMessage(response.message)
        form.reset()
      }
      // Error handling is done in the useAuth hook
    } catch (error) {
      console.error('Signup form error:', error)
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
   * Handle password change and update strength indicator
   */
  const handlePasswordChange = (value: string) => {
    const strength = validatePasswordStrength(value)
    setPasswordStrength(strength)
    handleInputChange()
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
        {strength.feedback.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-1">
            {strength.feedback.map((feedback, index) => (
              <li key={index} className="flex items-center space-x-1">
                <X className="h-3 w-3 text-red-500" />
                <span>{feedback}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Success Message */}
        <AuthSuccess message={successMessage} />

        {/* Error Message */}
        <AuthError error={error} />

        {/* Info Message */}
        {!successMessage && !error && (
          <AuthInfo message="Create your GreenOps AI account to start monitoring your cloud costs and carbon footprint." />
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
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    disabled={loading}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      handlePasswordChange(e.target.value)
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

        {/* Confirm Password Field */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
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

        {/* Terms and Conditions */}
        <FormField
          control={form.control}
          name="acceptTerms"
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
                  I agree to the{' '}
                  <AuthLink href="/terms" className="underline">
                    Terms of Service
                  </AuthLink>{' '}
                  and{' '}
                  <AuthLink href="/privacy" className="underline">
                    Privacy Policy
                  </AuthLink>
                </FormLabel>
                <FormMessage />
              </div>
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
          {loading ? 'Creating account...' : 'Create account'}
        </AuthLoadingButton>

        {/* Sign In Link */}
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <AuthLink href="/login">
            Sign in
          </AuthLink>
        </div>
      </form>
    </Form>
  )
}

/**
 * Password Requirements Component
 * Shows password requirements checklist
 */
interface PasswordRequirementsProps {
  password: string
  className?: string
}

export function PasswordRequirements({ password, className = '' }: PasswordRequirementsProps) {
  const requirements = [
    { text: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { text: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { text: 'One number', test: (pwd: string) => /\d/.test(pwd) },
    { text: 'One special character', test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ]

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-muted-foreground">Password Requirements:</h4>
      <ul className="space-y-1">
        {requirements.map((req, index) => {
          const isValid = req.test(password)
          return (
            <li key={index} className="flex items-center space-x-2 text-xs">
              {isValid ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-red-500" />
              )}
              <span className={isValid ? 'text-green-600' : 'text-muted-foreground'}>
                {req.text}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
