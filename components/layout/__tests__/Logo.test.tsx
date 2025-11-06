import { render, screen } from '@testing-library/react'
import { Logo } from '../Logo'

describe('Logo', () => {
  it('should render logo link', () => {
    render(<Logo />)

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('should render Med Notes text', () => {
    render(<Logo />)

    expect(screen.getByText('Med Notes')).toBeInTheDocument()
    expect(screen.getByText('Anotações Médicas')).toBeInTheDocument()
  })

  it('should render stethoscope emoji', () => {
    render(<Logo />)

    expect(screen.getByText('🩺')).toBeInTheDocument()
  })

  it('should have correct styling classes', () => {
    render(<Logo />)

    const medNotesText = screen.getByText('Med Notes')
    expect(medNotesText).toHaveClass('font-bold', 'text-slate-100')
  })
})
