import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PatientForm } from '../PatientForm'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('PatientForm', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Create Mode', () => {
    it('should render form with empty fields', () => {
      render(<PatientForm />)

      expect(screen.getByLabelText(/nome \*/i)).toHaveValue('')
      expect(screen.getByLabelText(/data de nascimento/i)).toHaveValue('')
      expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument()
    })

    it('should show error when submitting without name', async () => {
      render(<PatientForm />)

      const submitButton = screen.getByRole('button', { name: /criar/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
      })
    })

    it('should create patient successfully', async () => {
      const mockPatient = {
        id: 'patient-123',
        nome: 'João Silva',
        dataNascimento: '1990-01-01',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPatient,
      })

      render(<PatientForm />)

      const nameInput = screen.getByLabelText(/nome \*/i)
      const dateInput = screen.getByLabelText(/data de nascimento/i)

      await userEvent.type(nameInput, 'João Silva')
      await userEvent.type(dateInput, '1990-01-01')

      const submitButton = screen.getByRole('button', { name: /criar/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: 'João Silva',
            dataNascimento: '1990-01-01',
          }),
        })
        expect(mockPush).toHaveBeenCalledWith('/patients/patient-123')
      })
    })

    it('should allow submission without birth date', async () => {
      const mockPatient = {
        id: 'patient-123',
        nome: 'João Silva',
        dataNascimento: null,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPatient,
      })

      render(<PatientForm />)

      const nameInput = screen.getByLabelText(/nome \*/i)
      await userEvent.type(nameInput, 'João Silva')

      const submitButton = screen.getByRole('button', { name: /criar/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: 'João Silva',
            dataNascimento: '',
          }),
        })
      })
    })
  })

  describe('Edit Mode', () => {
    const initialData = {
      id: 'patient-123',
      nome: 'João Silva',
      dataNascimento: new Date('1990-01-01'),
    }

    it('should render form with initial data', () => {
      render(<PatientForm initialData={initialData} />)

      expect(screen.getByLabelText(/nome \*/i)).toHaveValue('João Silva')
      expect(screen.getByLabelText(/data de nascimento/i)).toHaveValue('1990-01-01')
      expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
    })

    it('should update patient successfully', async () => {
      const updatedPatient = {
        ...initialData,
        nome: 'João Silva Atualizado',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedPatient,
      })

      render(<PatientForm initialData={initialData} />)

      const nameInput = screen.getByLabelText(/nome \*/i)
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'João Silva Atualizado')

      const submitButton = screen.getByRole('button', { name: /atualizar/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/patients/patient-123', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: 'João Silva Atualizado',
            dataNascimento: '1990-01-01',
          }),
        })
        expect(mockPush).toHaveBeenCalledWith('/patients/patient-123')
      })
    })

    it('should disable button while submitting', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ id: 'patient-123', nome: 'João Silva' }),
        }), 100))
      )

      render(<PatientForm />)

      const nameInput = screen.getByLabelText(/nome \*/i)
      await userEvent.type(nameInput, 'João Silva')

      const submitButton = screen.getByRole('button', { name: /criar/i })
      fireEvent.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/salvando/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error for empty name', async () => {
      render(<PatientForm />)

      const submitButton = screen.getByRole('button', { name: /criar/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
      })
    })
  })
})
