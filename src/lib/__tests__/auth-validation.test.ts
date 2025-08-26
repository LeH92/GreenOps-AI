import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateEmail,
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  getPasswordStrengthWidth
} from '../auth-validation'

describe('Auth Validation', () => {
  describe('signInSchema', () => {
    it('should validate correct sign in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      }

      const result = signInSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
        expect(result.data.rememberMe).toBe(true)
      }
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      }

      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      }

      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should set default rememberMe to false', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = signInSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.rememberMe).toBe(false)
      }
    })
  })

  describe('signUpSchema', () => {
    it('should validate correct sign up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'MyStr0ng!Password',
        confirmPassword: 'MyStr0ng!Password',
        acceptTerms: true
      }

      const result = signUpSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject weak passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        acceptTerms: true
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'MyStr0ng!Password',
        confirmPassword: 'DifferentPassword123!',
        acceptTerms: true
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message === 'Passwords do not match'
        )).toBe(true)
      }
    })

    it('should reject when terms not accepted', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'MyStr0ng!Password',
        confirmPassword: 'MyStr0ng!Password',
        acceptTerms: false
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const validData = { email: 'test@example.com' }
      const result = forgotPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = { email: 'invalid-email' }
      const result = forgotPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should transform email to lowercase', () => {
      const data = { email: 'TEST@EXAMPLE.COM' }
      const result = forgotPasswordSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
      }
    })
  })

  describe('resetPasswordSchema', () => {
    it('should validate matching strong passwords', () => {
      const validData = {
        password: 'MyStr0ng!Password',
        confirmPassword: 'MyStr0ng!Password'
      }

      const result = resetPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        password: 'MyStr0ng!Password',
        confirmPassword: 'Different!Password123'
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should return valid for correct email', () => {
      const result = validateEmail('test@example.com')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return invalid for incorrect email', () => {
      const result = validateEmail('invalid-email')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validatePassword', () => {
    it('should return valid for strong password', () => {
      const result = validatePassword('MyStr0ng!Password')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBeDefined()
      expect(result.strength.score).toBeGreaterThanOrEqual(3)
    })

    it('should return invalid for weak password', () => {
      const result = validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.strength).toBeDefined()
    })
  })

  describe('Password Strength Utilities', () => {
    describe('getPasswordStrengthColor', () => {
      it('should return correct colors for different scores', () => {
        expect(getPasswordStrengthColor(0)).toBe('text-red-500')
        expect(getPasswordStrengthColor(1)).toBe('text-red-500')
        expect(getPasswordStrengthColor(2)).toBe('text-orange-500')
        expect(getPasswordStrengthColor(3)).toBe('text-yellow-500')
        expect(getPasswordStrengthColor(4)).toBe('text-green-500')
      })
    })

    describe('getPasswordStrengthText', () => {
      it('should return correct text for different scores', () => {
        expect(getPasswordStrengthText(0)).toBe('Very Weak')
        expect(getPasswordStrengthText(1)).toBe('Weak')
        expect(getPasswordStrengthText(2)).toBe('Fair')
        expect(getPasswordStrengthText(3)).toBe('Good')
        expect(getPasswordStrengthText(4)).toBe('Strong')
      })
    })

    describe('getPasswordStrengthWidth', () => {
      it('should return correct width classes for different scores', () => {
        expect(getPasswordStrengthWidth(0)).toBe('w-1/5')
        expect(getPasswordStrengthWidth(1)).toBe('w-2/5')
        expect(getPasswordStrengthWidth(2)).toBe('w-3/5')
        expect(getPasswordStrengthWidth(3)).toBe('w-4/5')
        expect(getPasswordStrengthWidth(4)).toBe('w-full')
      })
    })
  })
})
