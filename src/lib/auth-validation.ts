import { z } from 'zod'
import { validatePasswordStrength } from './auth'

/**
 * Authentication validation schemas using Zod
 * Following cursor rules and ShadCN form patterns
 */

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .transform((email) => email.trim().toLowerCase())

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .max(128, 'Password must be less than 128 characters')
  .refine(
    (password) => {
      const validation = validatePasswordStrength(password)
      return validation.isValid
    },
    {
      message: 'Password must contain at least 3 of the following: uppercase letter, lowercase letter, number, special character',
    }
  )

/**
 * Sign in form validation schema
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

export type SignInFormData = z.infer<typeof signInSchema>

/**
 * Sign up form validation schema
 */
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/**
 * Reset password form validation schema
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/**
 * Update profile form validation schema (for future use)
 */
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional(),
  email: emailSchema.optional(),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

/**
 * Change password form validation schema (for future use)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  try {
    emailSchema.parse(email)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || 'Invalid email' }
    }
    return { isValid: false, error: 'Invalid email' }
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; error?: string; strength?: any } {
  try {
    passwordSchema.parse(password)
    const strength = validatePasswordStrength(password)
    return { isValid: true, strength }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const strength = validatePasswordStrength(password)
      return { 
        isValid: false, 
        error: error.errors[0]?.message || 'Invalid password',
        strength 
      }
    }
    return { isValid: false, error: 'Invalid password' }
  }
}

/**
 * Common form field validation messages
 */
export const VALIDATION_MESSAGES = {
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address',
  },
  password: {
    required: 'Password is required',
    minLength: 'Password must be at least 6 characters long',
    weak: 'Password is too weak',
    mismatch: 'Passwords do not match',
  },
  terms: {
    required: 'You must accept the terms and conditions',
  },
  general: {
    required: 'This field is required',
    invalid: 'Please enter a valid value',
  },
} as const

/**
 * Password strength indicator helpers
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-500'
    case 2:
      return 'text-orange-500'
    case 3:
      return 'text-yellow-500'
    case 4:
      return 'text-green-500'
    default:
      return 'text-gray-500'
  }
}

export function getPasswordStrengthText(score: number): string {
  switch (score) {
    case 0:
      return 'Very Weak'
    case 1:
      return 'Weak'
    case 2:
      return 'Fair'
    case 3:
      return 'Good'
    case 4:
      return 'Strong'
    default:
      return 'Unknown'
  }
}

export function getPasswordStrengthWidth(score: number): string {
  switch (score) {
    case 0:
      return 'w-1/5'
    case 1:
      return 'w-2/5'
    case 2:
      return 'w-3/5'
    case 3:
      return 'w-4/5'
    case 4:
      return 'w-full'
    default:
      return 'w-0'
  }
}

// Re-export for consumers expecting this util from auth-validation module
export { validatePasswordStrength }
