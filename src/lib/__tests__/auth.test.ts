import { 
  isValidEmail, 
  validatePasswordStrength, 
  getAuthErrorMessage,
  getUserDisplayName,
  getUserInitials,
  isSessionExpiringSoon
} from '../auth'
import type { User, Session } from '@supabase/supabase-js'

describe('Auth Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(isValidEmail('user123@test-domain.com')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('test.domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidEmail('   test@example.com   ')).toBe(true) // Trimmed
      expect(isValidEmail('TEST@EXAMPLE.COM')).toBe(true) // Case insensitive
    })
  })

  describe('validatePasswordStrength', () => {
    it('should return strong password for complex passwords', () => {
      const result = validatePasswordStrength('MyStr0ng!Password')
      expect(result.isValid).toBe(true)
      expect(result.score).toBe(4)
      expect(result.feedback).toHaveLength(0)
    })

    it('should return weak password for simple passwords', () => {
      const result = validatePasswordStrength('password')
      expect(result.isValid).toBe(false)
      expect(result.score).toBeLessThan(3)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should provide specific feedback for missing requirements', () => {
      const result = validatePasswordStrength('lowercase')
      expect(result.feedback).toContain('Include at least one uppercase letter')
      expect(result.feedback).toContain('Include at least one number')
      expect(result.feedback).toContain('Include at least one special character')
    })

    it('should handle minimum length requirement', () => {
      const result = validatePasswordStrength('Ab1!')
      expect(result.feedback).toContain('Password must be at least 8 characters long')
    })
  })

  describe('getAuthErrorMessage', () => {
    it('should return user-friendly messages for common Supabase errors', () => {
      const testCases = [
        {
          input: { message: 'Invalid login credentials' },
          expected: 'Invalid email or password. Please check your credentials and try again.'
        },
        {
          input: { message: 'Email not confirmed' },
          expected: 'Please check your email and click the confirmation link before signing in.'
        },
        {
          input: { message: 'User already registered' },
          expected: 'An account with this email already exists. Try signing in instead.'
        },
      ]

      testCases.forEach(({ input, expected }) => {
        expect(getAuthErrorMessage(input)).toBe(expected)
      })
    })

    it('should return original message for unknown errors', () => {
      const customError = { message: 'Custom error message' }
      expect(getAuthErrorMessage(customError)).toBe('Custom error message')
    })

    it('should return default message for errors without message', () => {
      expect(getAuthErrorMessage({})).toBe('An unexpected error occurred. Please try again.')
      expect(getAuthErrorMessage(null)).toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('getUserDisplayName', () => {
    it('should return full name from user metadata', () => {
      const user = {
        user_metadata: { full_name: 'John Doe' },
        email: 'john@example.com'
      } as User

      expect(getUserDisplayName(user)).toBe('John Doe')
    })

    it('should return name from user metadata if no full_name', () => {
      const user = {
        user_metadata: { name: 'Jane Smith' },
        email: 'jane@example.com'
      } as User

      expect(getUserDisplayName(user)).toBe('Jane Smith')
    })

    it('should return email prefix if no name metadata', () => {
      const user = {
        user_metadata: {},
        email: 'test.user@example.com'
      } as User

      expect(getUserDisplayName(user)).toBe('test.user')
    })

    it('should return "Guest" for null user', () => {
      expect(getUserDisplayName(null)).toBe('Guest')
    })

    it('should return "User" if no email or name', () => {
      const user = {
        user_metadata: {},
        email: null
      } as User

      expect(getUserDisplayName(user)).toBe('User')
    })
  })

  describe('getUserInitials', () => {
    it('should return initials from full name', () => {
      const user = {
        user_metadata: { full_name: 'John Doe Smith' },
        email: 'john@example.com'
      } as User

      expect(getUserInitials(user)).toBe('JD')
    })

    it('should return first two characters of single name', () => {
      const user = {
        user_metadata: { name: 'Madonna' },
        email: 'madonna@example.com'
      } as User

      expect(getUserInitials(user)).toBe('MA')
    })

    it('should return first letter of email if no name', () => {
      const user = {
        user_metadata: {},
        email: 'test@example.com'
      } as User

      expect(getUserInitials(user)).toBe('T')
    })

    it('should return "G" for null user', () => {
      expect(getUserInitials(null)).toBe('G')
    })
  })

  describe('isSessionExpiringSoon', () => {
    it('should return true for sessions expiring soon', () => {
      const now = Math.floor(Date.now() / 1000)
      const session = {
        expires_at: now + 200 // 200 seconds from now (less than 5 minutes)
      } as Session

      expect(isSessionExpiringSoon(session)).toBe(true)
    })

    it('should return false for sessions with plenty of time', () => {
      const now = Math.floor(Date.now() / 1000)
      const session = {
        expires_at: now + 3600 // 1 hour from now
      } as Session

      expect(isSessionExpiringSoon(session)).toBe(false)
    })

    it('should return false for null session', () => {
      expect(isSessionExpiringSoon(null)).toBe(false)
    })

    it('should return false for session without expires_at', () => {
      const session = {} as Session
      expect(isSessionExpiringSoon(session)).toBe(false)
    })
  })
})
