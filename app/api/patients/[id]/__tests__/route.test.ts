import { GET, PUT, DELETE } from '../route'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/prisma')
jest.mock('@/lib/supabase/server')

describe('/api/patients/[id]', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const patientId = 'patient-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      })

      const request = new Request(`http://localhost:3000/api/patients/${patientId}`)
      const response = await GET(request, { params: Promise.resolve({ id: patientId }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autorizado')
    })

    it('should return patient for authenticated user', async () => {
      const now = new Date().toISOString()
      const mockPatient = {
        id: patientId,
        userId: mockUser.id,
        nome: 'João Silva',
        dataNascimento: '1990-01-01T00:00:00.000Z',
        createdAt: now,
        updatedAt: now,
        dailyNotes: [],
      }

      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(mockPatient)

      const request = new Request(`http://localhost:3000/api/patients/${patientId}`)
      const response = await GET(request, { params: Promise.resolve({ id: patientId }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPatient)
      expect(prisma.patient.findFirst).toHaveBeenCalledWith({
        where: {
          id: patientId,
          userId: mockUser.id,
        },
        include: {
          dailyNotes: {
            orderBy: { data: 'desc' },
            take: 10,
          },
        },
      })
    })

    it('should return 404 if patient not found', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(null)

      const request = new Request(`http://localhost:3000/api/patients/${patientId}`)
      const response = await GET(request, { params: Promise.resolve({ id: patientId }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Paciente não encontrado')
    })
  })

  describe('PUT', () => {
    it('should return 401 if user is not authenticated', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      })

      const request = new Request(`http://localhost:3000/api/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify({ nome: 'João Silva Atualizado' }),
      })

      const response = await PUT(request, { params: Promise.resolve({ id: patientId }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autorizado')
    })

    it('should return 404 if patient does not belong to user', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(null)

      const request = new Request(`http://localhost:3000/api/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify({ nome: 'João Silva Atualizado' }),
      })

      const response = await PUT(request, { params: Promise.resolve({ id: patientId }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Paciente não encontrado')
    })

    it('should update patient successfully', async () => {
      const now = new Date().toISOString()
      const existingPatient = {
        id: patientId,
        userId: mockUser.id,
        nome: 'João Silva',
        dataNascimento: '1990-01-01T00:00:00.000Z',
        createdAt: now,
        updatedAt: now,
      }

      const updatedPatient = {
        ...existingPatient,
        nome: 'João Silva Atualizado',
      }

      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(existingPatient)
      ;(prisma.patient.update as jest.Mock).mockResolvedValue(updatedPatient)

      const request = new Request(`http://localhost:3000/api/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify({
          nome: 'João Silva Atualizado',
          dataNascimento: '1990-01-01',
        }),
      })

      const response = await PUT(request, { params: Promise.resolve({ id: patientId }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(updatedPatient)
    })
  })

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      })

      const request = new Request(`http://localhost:3000/api/patients/${patientId}`, {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: patientId }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autorizado')
    })

    it('should return 404 if patient does not belong to user', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(null)

      const request = new Request(`http://localhost:3000/api/patients/${patientId}`, {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: patientId }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Paciente não encontrado')
    })

    it('should delete patient successfully', async () => {
      const now = new Date().toISOString()
      const existingPatient = {
        id: patientId,
        userId: mockUser.id,
        nome: 'João Silva',
        dataNascimento: '1990-01-01T00:00:00.000Z',
        createdAt: now,
        updatedAt: now,
      }

      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(existingPatient)
      ;(prisma.patient.delete as jest.Mock).mockResolvedValue(existingPatient)

      const request = new Request(`http://localhost:3000/api/patients/${patientId}`, {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: patientId }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(prisma.patient.delete).toHaveBeenCalledWith({
        where: { id: patientId },
      })
    })
  })
})
