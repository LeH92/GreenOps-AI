'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { useAuth } from '@/hooks/useAuth'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/auth-validation'
import { AuthError, AuthSuccess, AuthInfo, AUTH_INFO_MESSAGES } from './auth-errors'
import { AuthLoadingButton } from './loading-states'
import { AuthLink } from './auth-layout'

/**
 * Forgot Password Form Component
 * Password reset request form following ShadCN patterns
 */

export function ForgotPasswordForm() {
  const { resetPassword, loading, error, clearError } = useAuth()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  // Form setup with react-hook-form and zod validation
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      clearError()
      setSuccessMessage(null)

      const response = await resetPassword(data)

      if (response.success) {
        setSuccessMessage(response.message)
        setEmailSent(true)
        form.reset()
      }
      // Error handling is done in the useAuth hook
    } catch (error) {
      console.error('Forgot password form error:', error)
    }
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
   * Reset form to send another email
   */
  const handleSendAnother = () => {
    setEmailSent(false)
    setSuccessMessage(null)
    clearError()
    form.reset()
  }

  // Show success state after email is sent
  if (emailSent && successMessage) {
    return (
      <div className="space-y-4">
        <AuthSuccess message={successMessage} />
        
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>We've sent a password reset link to your email address.</p>
            <p>Please check your inbox and follow the instructions.</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSendAnother}
              disabled={loading}
            >
              Send another email
            </Button>
          </div>
        </div>

        <div className="text-center">
          <AuthLink href="/login" className="text-sm">
            ← Back to login
          </AuthLink>
        </div>
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
          <AuthInfo message={AUTH_INFO_MESSAGES.PASSWORD_RESET_INSTRUCTIONS} />
        )}

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email address"
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

        {/* Submit Button */}
        <AuthLoadingButton
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Sending reset email...' : 'Send reset email'}
        </AuthLoadingButton>

        {/* Back to Login Link */}
        <div className="text-center">
          <AuthLink href="/login" className="text-sm">
            ← Back to login
          </AuthLink>
        </div>

        {/* Additional Help */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Need help? Contact our{' '}
            <AuthLink href="/support" className="underline text-xs">
              support team
            </AuthLink>
          </p>
        </div>
      </form>
    </Form>
  )
}

/**
 * Forgot Password Instructions Component
 * Additional instructions for password reset
 */
export function ForgotPasswordInstructions() {
  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      <div>
        <h4 className="font-medium text-foreground mb-2">What happens next?</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>We'll send a password reset link to your email</li>
          <li>Click the link in the email (check spam if needed)</li>
          <li>Create a new password</li>
          <li>Sign in with your new password</li>
        </ol>
      </div>
      
      <div>
        <h4 className="font-medium text-foreground mb-2">Troubleshooting</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Make sure you entered the correct email address</li>
          <li>Check your spam/junk folder</li>
          <li>The reset link expires in 1 hour</li>
          <li>You can request multiple reset emails if needed</li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Forgot Password Help Component
 * Additional help and contact information
 */
export function ForgotPasswordHelp() {
  return (
    <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="text-lg">💡</div>
        <h4 className="font-medium">Still having trouble?</h4>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-2">
        <p>If you're unable to reset your password, our support team is here to help.</p>
        
        <div className="flex flex-col space-y-1">
          <p>Contact us at:</p>
          <AuthLink href="mailto:support@greenops.ai" className="text-sm">
            support@greenops.ai
          </AuthLink>
        </div>
        
        <p className="text-xs">
          Please include your email address and a description of the issue.
        </p>
      </div>
    </div>
  )
}
