import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DeleteButton } from '../DeleteButton'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

global.fetch = jest.fn()

describe('DeleteButton', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
    ;(global.fetch as jest.Mock).mockClear()
    global.confirm = jest.fn()
  })

  it('should render delete button', () => {
    render(
      <DeleteButton
        itemType="patient"
        itemId="patient-123"
        itemName="João Silva"
        redirectTo="/patients"
      />
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should show confirmation dialog when clicked', () => {
    ;(global.confirm as jest.Mock).mockReturnValue(false)

    render(
      <DeleteButton
        itemType="patient"
        itemId="patient-123"
        itemName="João Silva"
        redirectTo="/patients"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(global.confirm).toHaveBeenCalledWith(
      expect.stringContaining('João Silva')
    )
  })

  it('should not delete if user cancels confirmation', () => {
    ;(global.confirm as jest.Mock).mockReturnValue(false)

    render(
      <DeleteButton
        itemType="patient"
        itemId="patient-123"
        itemName="João Silva"
        redirectTo="/patients"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should delete patient successfully', async () => {
    ;(global.confirm as jest.Mock).mockReturnValue(true)
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(
      <DeleteButton
        itemType="patient"
        itemId="patient-123"
        itemName="João Silva"
        redirectTo="/patients"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/patients/patient-123', {
        method: 'DELETE',
      })
      expect(mockPush).toHaveBeenCalledWith('/patients')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('should delete note successfully', async () => {
    ;(global.confirm as jest.Mock).mockReturnValue(true)
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(
      <DeleteButton
        itemType="note"
        itemId="note-123"
        itemName="01/01/2024"
        redirectTo="/patients/patient-123"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/notes/note-123', {
        method: 'DELETE',
      })
    })
  })

  it('should handle delete error gracefully', async () => {
    ;(global.confirm as jest.Mock).mockReturnValue(true)
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Erro ao deletar' }),
    })

    global.alert = jest.fn()

    render(
      <DeleteButton
        itemType="patient"
        itemId="patient-123"
        itemName="João Silva"
        redirectTo="/patients"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Erro ao deletar')
    })
  })

  it('should handle network error', async () => {
    ;(global.confirm as jest.Mock).mockReturnValue(true)
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    global.alert = jest.fn()

    render(
      <DeleteButton
        itemType="patient"
        itemId="patient-123"
        itemName="João Silva"
        redirectTo="/patients"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Erro ao deletar')
    })
  })

  it('should disable button while deleting', async () => {
    ;(global.confirm as jest.Mock).mockReturnValue(true)
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true }),
      }), 100))
    )

    render(
      <DeleteButton
        itemType="patient"
        itemId="patient-123"
        itemName="João Silva"
        redirectTo="/patients"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Button should be disabled while deleting
    await waitFor(() => {
      expect(button).toBeDisabled()
    })
  })

  it('should have correct title attribute', () => {
    render(
      <DeleteButton
        itemType="patient"
        itemId="patient-123"
        itemName="João Silva"
        redirectTo="/patients"
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Excluir paciente')
  })
})
