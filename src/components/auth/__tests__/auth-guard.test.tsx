import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { AuthGuard, ProtectedRoute, PublicRoute, ConditionalAuth } from '../auth-guard'
import { useAuth } from '@/hooks/useAuth'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock useRouter
const mockPush = jest.fn()
jest.mocked(useRouter).mockReturnValue({
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
})

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { pathname: '/test-path' },
      writable: true,
    })
  })

  it('should render children when authenticated and auth required', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' } as any,
      session: { user: { id: '1' } } as any,
      loading: false,
      error: null,
      isAuthenticated: true,
      isEmailVerified: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <AuthGuard requireAuth={true}>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should show loading state when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      isEmailVerified: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <AuthGuard requireAuth={true}>
        <div>Protected Content</div>
      </AuthGuard>
    )

    // Should show loading state (AuthPageLoading component)
    expect(screen.getByText('GreenOps AI')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isEmailVerified: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <AuthGuard requireAuth={true}>
        <div>Protected Content</div>
      </AuthGuard>
    )

    // Should redirect to login
    expect(mockPush).toHaveBeenCalledWith('/login?redirectTo=%2Ftest-path')
  })

  it('should show error state when there is an error', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: 'Authentication failed',
      isAuthenticated: false,
      isEmailVerified: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <AuthGuard requireAuth={true}>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Authentication Error')).toBeInTheDocument()
  })

  it('should redirect to verify email when email verification required', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' } as any,
      session: { user: { id: '1' } } as any,
      loading: false,
      error: null,
      isAuthenticated: true,
      isEmailVerified: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <AuthGuard requireAuth={true} requireVerification={true}>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(mockPush).toHaveBeenCalledWith('/verify-email')
  })

  it('should render children when auth not required', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isEmailVerified: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <AuthGuard requireAuth={false}>
        <div>Public Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Public Content')).toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isEmailVerified: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <AuthGuard 
        requireAuth={true} 
        fallback={<div>Custom Fallback</div>}
      >
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
  })
})

describe('ProtectedRoute', () => {
  it('should render children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' } as any,
      session: { user: { id: '1' } } as any,
      loading: false,
      error: null,
      isAuthenticated: true,
      isEmailVerified: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})

describe('PublicRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render children when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isEmailVerified: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <PublicRoute>
        <div>Public Content</div>
      </PublicRoute>
    )

    expect(screen.getByText('Public Content')).toBeInTheDocument()
  })

  it('should redirect when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' } as any,
      session: { user: { id: '1' } } as any,
      loading: false,
      error: null,
      isAuthenticated: true,
      isEmailVerified: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <PublicRoute>
        <div>Public Content</div>
      </PublicRoute>
    )

    expect(mockPush).toHaveBeenCalledWith('/dashboard/default')
  })
})

describe('ConditionalAuth', () => {
  it('should render authenticated content when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' } as any,
      session: { user: { id: '1' } } as any,
      loading: false,
      error: null,
      isAuthenticated: true,
      isEmailVerified: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <ConditionalAuth
        authenticated={<div>Authenticated Content</div>}
        unauthenticated={<div>Unauthenticated Content</div>}
      />
    )

    expect(screen.getByText('Authenticated Content')).toBeInTheDocument()
    expect(screen.queryByText('Unauthenticated Content')).not.toBeInTheDocument()
  })

  it('should render unauthenticated content when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isEmailVerified: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <ConditionalAuth
        authenticated={<div>Authenticated Content</div>}
        unauthenticated={<div>Unauthenticated Content</div>}
      />
    )

    expect(screen.getByText('Unauthenticated Content')).toBeInTheDocument()
    expect(screen.queryByText('Authenticated Content')).not.toBeInTheDocument()
  })

  it('should render verified content when email is verified', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' } as any,
      session: { user: { id: '1' } } as any,
      loading: false,
      error: null,
      isAuthenticated: true,
      isEmailVerified: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <ConditionalAuth
        verified={<div>Verified Content</div>}
        unverified={<div>Unverified Content</div>}
      />
    )

    expect(screen.getByText('Verified Content')).toBeInTheDocument()
    expect(screen.queryByText('Unverified Content')).not.toBeInTheDocument()
  })

  it('should render loading content when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      isEmailVerified: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      getUserDisplayName: jest.fn(),
      getUserInitials: jest.fn(),
      clearError: jest.fn(),
      refreshSession: jest.fn(),
    })

    render(
      <ConditionalAuth
        authenticated={<div>Authenticated Content</div>}
        unauthenticated={<div>Unauthenticated Content</div>}
        loading={<div>Loading Content</div>}
      />
    )

    expect(screen.getByText('Loading Content')).toBeInTheDocument()
  })
})
