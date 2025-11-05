import { render, screen } from '@testing-library/react'
import { Logo } from '../Logo'

describe('Logo', () => {
  it('should render logo with default size', () => {
    render(<Logo />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('🩺 Med Notes')
    expect(heading).toHaveClass('text-2xl')
  })

  it('should render logo with custom size', () => {
    render(<Logo size="lg" />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-3xl')
  })

  it('should render logo with small size', () => {
    render(<Logo size="sm" />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-xl')
  })

  it('should have correct styling classes', () => {
    render(<Logo />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('font-bold', 'text-slate-100')
  })

  it('should render stethoscope emoji', () => {
    render(<Logo />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('🩺')
  })
})
