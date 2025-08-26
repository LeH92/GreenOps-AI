import { render, screen, fireEvent } from '@testing-library/react'
import {
  AuthLoadingButton,
  AuthFormSkeleton,
  AuthPageLoading,
  InlineLoading,
  AuthProgress
} from '../loading-states'

describe('AuthLoadingButton', () => {
  it('should render button with text when not loading', () => {
    render(
      <AuthLoadingButton loading={false}>
        Sign in
      </AuthLoadingButton>
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('should show loading spinner when loading', () => {
    render(
      <AuthLoadingButton loading={true}>
        Sign in
      </AuthLoadingButton>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    // Check for loading spinner (Loader2 component)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <AuthLoadingButton loading={false} disabled={true}>
        Sign in
      </AuthLoadingButton>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should handle click events when not loading', () => {
    const handleClick = jest.fn()
    render(
      <AuthLoadingButton loading={false} onClick={handleClick}>
        Sign in
      </AuthLoadingButton>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not handle click events when loading', () => {
    const handleClick = jest.fn()
    render(
      <AuthLoadingButton loading={true} onClick={handleClick}>
        Sign in
      </AuthLoadingButton>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    render(
      <AuthLoadingButton loading={false} className="custom-class">
        Sign in
      </AuthLoadingButton>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should support different variants', () => {
    render(
      <AuthLoadingButton loading={false} variant="outline">
        Sign in
      </AuthLoadingButton>
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should support different sizes', () => {
    render(
      <AuthLoadingButton loading={false} size="sm">
        Sign in
      </AuthLoadingButton>
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should support submit type', () => {
    render(
      <AuthLoadingButton loading={false} type="submit">
        Submit
      </AuthLoadingButton>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})

describe('AuthFormSkeleton', () => {
  it('should render form skeleton structure', () => {
    render(<AuthFormSkeleton />)

    // Should render card structure with skeleton elements
    expect(document.querySelector('.rounded-lg')).toBeInTheDocument()
    // Check for multiple skeleton elements
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})

describe('AuthPageLoading', () => {
  it('should render page loading with GreenOps AI branding', () => {
    render(<AuthPageLoading />)

    expect(screen.getByText('🌱')).toBeInTheDocument()
    expect(screen.getByText('GreenOps AI')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })
})

describe('InlineLoading', () => {
  it('should render with default size', () => {
    render(<InlineLoading />)

    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-4', 'w-4')
  })

  it('should render with custom size', () => {
    render(<InlineLoading size="lg" />)

    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-5', 'w-5')
  })

  it('should apply custom className', () => {
    render(<InlineLoading className="custom-spinner" />)

    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('custom-spinner')
  })
})

describe('AuthProgress', () => {
  const mockSteps = ['Step 1', 'Step 2', 'Step 3']

  it('should render progress with correct step information', () => {
    render(<AuthProgress steps={mockSteps} currentStep={1} />)

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    expect(screen.getByText('67%')).toBeInTheDocument()
    expect(screen.getByText('Step 2')).toBeInTheDocument()
  })

  it('should render progress bar with correct width', () => {
    render(<AuthProgress steps={mockSteps} currentStep={0} />)

    const progressBar = document.querySelector('[style*="width"]')
    expect(progressBar).toBeInTheDocument()
    // First step should be 33.33% (1/3)
    expect(progressBar).toHaveStyle('width: 33.333333333333336%')
  })

  it('should handle first step correctly', () => {
    render(<AuthProgress steps={mockSteps} currentStep={0} />)

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('33%')).toBeInTheDocument()
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('should handle last step correctly', () => {
    render(<AuthProgress steps={mockSteps} currentStep={2} />)

    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('Step 3')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <AuthProgress steps={mockSteps} currentStep={1} className="custom-progress" />
    )

    expect(container.firstChild).toHaveClass('custom-progress')
  })
})
