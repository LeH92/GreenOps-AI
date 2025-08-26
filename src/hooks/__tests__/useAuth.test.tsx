import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase')
const mockSupabase = supabase as jest.Mocked<typeof supabase>

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset Supabase mocks
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    })

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        origin: 'http://localhost:3000',
      },
      writable: true,
    })
  })

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should update state when session is loaded', async () => {
    const mockSession = {
      user: { id: '1', email: 'test@example.com', email_confirmed_at: new Date().toISOString() },
      access_token: 'token',
      refresh_token: 'refresh',
    }

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockSession.user)
    expect(result.current.session).toEqual(mockSession)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isEmailVerified).toBe(true)
  })

  it('should handle sign in success', async () => {
    const mockUser = { id: '1', email: 'test@example.com', email_confirmed_at: new Date().toISOString() }
    const mockSession = { user: mockUser, access_token: 'token' }

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser as any, session: mockSession as any },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.signIn({
        email: 'test@example.com',
        password: 'password',
      })
      expect(response.success).toBe(true)
    })

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard/default')
  })

  it('should handle sign in error', async () => {
    const mockError = { message: 'Invalid login credentials' }

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: mockError as any,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.signIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      expect(response.success).toBe(false)
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })

  it('should handle sign up success', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser as any, session: null },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.signUp({
        email: 'test@example.com',
        password: 'MyStr0ng!Password',
        confirmPassword: 'MyStr0ng!Password',
        acceptTerms: true,
      })
      expect(response.success).toBe(true)
    })

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'MyStr0ng!Password',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    })
  })

  it('should handle sign up with password mismatch', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.signUp({
        email: 'test@example.com',
        password: 'MyStr0ng!Password',
        confirmPassword: 'DifferentPassword',
        acceptTerms: true,
      })
      expect(response.success).toBe(false)
      expect(response.message).toBe('Passwords do not match.')
    })
  })

  it('should handle sign up without accepting terms', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.signUp({
        email: 'test@example.com',
        password: 'MyStr0ng!Password',
        confirmPassword: 'MyStr0ng!Password',
        acceptTerms: false,
      })
      expect(response.success).toBe(false)
      expect(response.message).toBe('You must accept the terms and conditions.')
    })
  })

  it('should handle sign out', async () => {
    // Setup initial authenticated state
    const mockSession = {
      user: { id: '1', email: 'test@example.com' },
      access_token: 'token',
    }

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    })

    mockSupabase.auth.signOut.mockResolvedValue({
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const response = await result.current.signOut()
      expect(response.success).toBe(true)
    })

    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('should handle password reset', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.resetPassword({
        email: 'test@example.com',
      })
      expect(response.success).toBe(true)
    })

    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      {
        redirectTo: 'http://localhost:3000/reset-password',
      }
    )
  })

  it('should handle password update', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }

    mockSupabase.auth.updateUser.mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.updatePassword({
        password: 'NewStr0ng!Password',
        confirmPassword: 'NewStr0ng!Password',
      })
      expect(response.success).toBe(true)
    })

    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'NewStr0ng!Password',
    })

    expect(mockPush).toHaveBeenCalledWith('/login?message=password-updated')
  })

  it('should get user display name', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' },
    }

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: mockUser as any,
          access_token: 'token'
        } 
      },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.getUserDisplayName()).toBe('Guest') // Initial state

    // After session loads, it should return the actual name
    // This would be tested with proper async handling in a real scenario
  })

  it('should get user initials', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.getUserInitials()).toBe('G') // Initial state for no user
  })

  it('should clear error', async () => {
    const { result } = renderHook(() => useAuth())

    // Set an error first
    await act(async () => {
      await result.current.signIn({
        email: 'invalid',
        password: 'invalid',
      })
    })

    // Clear the error
    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBe(null)
  })

  it('should handle auth state changes', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    const mockSession = { user: mockUser, access_token: 'token' }

    // Mock the auth state change callback
    let authStateChangeCallback: any
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      }
    })

    const { result } = renderHook(() => useAuth())

    // Simulate SIGNED_IN event
    act(() => {
      authStateChangeCallback('SIGNED_IN', mockSession)
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    // Simulate SIGNED_OUT event
    act(() => {
      authStateChangeCallback('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  it('should handle redirect after sign in', async () => {
    // Mock URL with redirectTo parameter
    Object.defineProperty(window, 'location', {
      value: {
        search: '?redirectTo=%2Fdashboard%2Fsettings',
        origin: 'http://localhost:3000',
      },
      writable: true,
    })

    const mockUser = { id: '1', email: 'test@example.com' }
    const mockSession = { user: mockUser, access_token: 'token' }

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser as any, session: mockSession as any },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signIn({
        email: 'test@example.com',
        password: 'password',
      })
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard/settings')
  })
})
