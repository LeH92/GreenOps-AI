import { render, screen } from '@testing-library/react'
import {
  AuthMessage,
  AuthError,
  AuthSuccess,
  AuthInfo,
  AuthWarning,
  getAuthErrorMessage,
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES
} from '../auth-errors'

describe('AuthMessage', () => {
  it('should render error message with correct styling', () => {
    render(<AuthMessage type="error" message="Test error message" />)
    
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should render success message with correct styling', () => {
    render(<AuthMessage type="success" message="Test success message" />)
    
    expect(screen.getByText('Test success message')).toBeInTheDocument()
  })

  it('should not render when message is empty', () => {
    const { container } = render(<AuthMessage type="error" message="" />)
    expect(container.firstChild).toBeNull()
  })

  it('should apply custom className', () => {
    render(<AuthMessage type="info" message="Test" className="custom-class" />)
    
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-class')
  })
})

describe('AuthError', () => {
  it('should render error message', () => {
    render(<AuthError error="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should not render when error is null', () => {
    const { container } = render(<AuthError error={null} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('AuthSuccess', () => {
  it('should render success message', () => {
    render(<AuthSuccess message="Operation successful" />)
    expect(screen.getByText('Operation successful')).toBeInTheDocument()
  })

  it('should not render when message is null', () => {
    const { container } = render(<AuthSuccess message={null} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('AuthInfo', () => {
  it('should render info message', () => {
    render(<AuthInfo message="Information message" />)
    expect(screen.getByText('Information message')).toBeInTheDocument()
  })
})

describe('AuthWarning', () => {
  it('should render warning message', () => {
    render(<AuthWarning message="Warning message" />)
    expect(screen.getByText('Warning message')).toBeInTheDocument()
  })
})

describe('getAuthErrorMessage', () => {
  it('should return user-friendly message for string errors', () => {
    expect(getAuthErrorMessage('Invalid login credentials')).toBe(
      AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
    )
  })

  it('should map common Supabase error messages', () => {
    const testCases = [
      {
        input: { message: 'email not confirmed' },
        expected: AUTH_ERROR_MESSAGES.EMAIL_NOT_CONFIRMED
      },
      {
        input: { message: 'user already registered' },
        expected: AUTH_ERROR_MESSAGES.USER_ALREADY_EXISTS
      },
      {
        input: { message: 'rate limit exceeded' },
        expected: AUTH_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
      }
    ]

    testCases.forEach(({ input, expected }) => {
      expect(getAuthErrorMessage(input)).toBe(expected)
    })
  })

  it('should return original message for unknown errors', () => {
    const customError = { message: 'Custom error' }
    expect(getAuthErrorMessage(customError)).toBe('Custom error')
  })

  it('should return default message for invalid input', () => {
    expect(getAuthErrorMessage(null)).toBe(AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR)
    expect(getAuthErrorMessage({})).toBe(AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR)
  })
})

describe('Error Message Constants', () => {
  it('should have all required error messages', () => {
    expect(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS).toBeDefined()
    expect(AUTH_ERROR_MESSAGES.EMAIL_NOT_CONFIRMED).toBeDefined()
    expect(AUTH_ERROR_MESSAGES.USER_ALREADY_EXISTS).toBeDefined()
    expect(AUTH_ERROR_MESSAGES.WEAK_PASSWORD).toBeDefined()
    expect(AUTH_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED).toBeDefined()
    expect(AUTH_ERROR_MESSAGES.INVALID_EMAIL).toBeDefined()
    expect(AUTH_ERROR_MESSAGES.SIGNUP_DISABLED).toBeDefined()
    expect(AUTH_ERROR_MESSAGES.EXPIRED_LINK).toBeDefined()
    expect(AUTH_ERROR_MESSAGES.INVALID_TOKEN).toBeDefined()
    expect(AUTH_ERROR_MESSAGES.PASSWORD_SAME).toBeDefined()
    expect(AUTH_ERROR_MESSAGES.NETWORK_ERROR).toBeDefined()
    expect(AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR).toBeDefined()
  })

  it('should have all required success messages', () => {
    expect(AUTH_SUCCESS_MESSAGES.SIGNED_IN).toBeDefined()
    expect(AUTH_SUCCESS_MESSAGES.SIGNED_UP).toBeDefined()
    expect(AUTH_SUCCESS_MESSAGES.SIGNED_OUT).toBeDefined()
    expect(AUTH_SUCCESS_MESSAGES.PASSWORD_RESET_SENT).toBeDefined()
    expect(AUTH_SUCCESS_MESSAGES.PASSWORD_UPDATED).toBeDefined()
    expect(AUTH_SUCCESS_MESSAGES.EMAIL_VERIFIED).toBeDefined()
    expect(AUTH_SUCCESS_MESSAGES.PROFILE_UPDATED).toBeDefined()
  })
})
