import { GET, POST } from '../route'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/prisma')
jest.mock('@/lib/supabase/server')

describe('/api/patients', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      (createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autorizado')
    })

    it('should return patients for authenticated user', async () => {
      const mockPatients = [
        {
          id: 'patient-1',
          userId: mockUser.id,
          nome: 'João Silva',
          dataNascimento: new Date('1990-01-01'),
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { dailyNotes: 5 },
        },
      ]

      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findMany as jest.Mock).mockResolvedValue(mockPatients)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPatients)
      expect(prisma.patient.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { dailyNotes: true },
          },
        },
      })
    })

    it('should return 500 on database error', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erro ao buscar pacientes')
    })
  })

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      })

      const request = new Request('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify({ nome: 'João Silva' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autorizado')
    })

    it('should return 400 if name is missing', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      const request = new Request('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Nome é obrigatório')
    })

    it('should create patient successfully', async () => {
      const mockPatient = {
        id: 'patient-1',
        userId: mockUser.id,
        nome: 'João Silva',
        dataNascimento: new Date('1990-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.create as jest.Mock).mockResolvedValue(mockPatient)

      const request = new Request('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify({
          nome: 'João Silva',
          dataNascimento: '1990-01-01',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockPatient)
      expect(prisma.patient.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          nome: 'João Silva',
          dataNascimento: expect.any(Date),
        },
      })
    })

    it('should handle patient creation without birth date', async () => {
      const mockPatient = {
        id: 'patient-1',
        userId: mockUser.id,
        nome: 'João Silva',
        dataNascimento: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.create as jest.Mock).mockResolvedValue(mockPatient)

      const request = new Request('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify({ nome: 'João Silva' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.dataNascimento).toBeNull()
    })

    it('should return 500 on database error', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify({ nome: 'João Silva' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erro ao criar paciente')
    })
  })
})
