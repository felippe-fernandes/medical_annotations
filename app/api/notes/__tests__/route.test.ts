import { POST } from '../route'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/prisma')
jest.mock('@/lib/supabase/server')

describe('/api/notes', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const patientId = 'patient-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      })

      const request = new Request('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          data: '2024-01-01',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autorizado')
    })

    it('should return 400 if patientId or data is missing', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      const request = new Request('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('PatientId e data são obrigatórios')
    })

    it('should return 404 if patient does not belong to user', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          data: '2024-01-01',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Paciente não encontrado')
    })

    it('should return 400 if note already exists for the day', async () => {
      const mockPatient = {
        id: patientId,
        userId: mockUser.id,
        nome: 'João Silva',
      }

      const existingNote = {
        id: 'note-123',
        patientId,
        data: '2024-01-01T00:00:00.000Z',
      }

      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(mockPatient)
      ;(prisma.dailyNote.findFirst as jest.Mock).mockResolvedValue(existingNote)

      const request = new Request('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          data: '2024-01-01',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Já existe uma anotação')
    })

    it('should create note successfully', async () => {
      const mockPatient = {
        id: patientId,
        userId: mockUser.id,
        nome: 'João Silva',
      }

      const mockNote = {
        id: 'note-123',
        patientId,
        data: '2024-01-01T00:00:00.000Z',
        horaDormiu: '22:00',
        horaAcordou: '07:00',
        humor: 4,
        detalhesExtras: 'Dia bom',
        tags: [],
      }

      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(mockPatient)
      ;(prisma.dailyNote.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.dailyNote.create as jest.Mock).mockResolvedValue(mockNote)

      const request = new Request('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          data: '2024-01-01',
          horaDormiu: '22:00',
          horaAcordou: '07:00',
          humor: 4,
          detalhesExtras: 'Dia bom',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockNote)
    })

    it('should create note with tags', async () => {
      const mockPatient = {
        id: patientId,
        userId: mockUser.id,
        nome: 'João Silva',
      }

      const tags = ['Ansiedade', 'Estresse']

      const mockNote = {
        id: 'note-123',
        patientId,
        data: '2024-01-01T00:00:00.000Z',
        tags: ['Ansiedade', 'Estresse'],
      }

      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(mockPatient)
      ;(prisma.dailyNote.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.dailyNote.create as jest.Mock).mockResolvedValue(mockNote)

      const request = new Request('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          data: '2024-01-01',
          tags,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(prisma.dailyNote.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: ['Ansiedade', 'Estresse'],
          }),
        })
      )
    })

    it('should create note without optional fields', async () => {
      const mockPatient = {
        id: patientId,
        userId: mockUser.id,
        nome: 'João Silva',
      }

      const mockNote = {
        id: 'note-123',
        patientId,
        data: '2024-01-01T00:00:00.000Z',
        horaDormiu: null,
        horaAcordou: null,
        humor: null,
        detalhesExtras: null,
        tags: [],
      }

      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(mockPatient)
      ;(prisma.dailyNote.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.dailyNote.create as jest.Mock).mockResolvedValue(mockNote)

      const request = new Request('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          data: '2024-01-01',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.horaDormiu).toBeNull()
      expect(data.horaAcordou).toBeNull()
      expect(data.humor).toBeNull()
    })

    it('should return 500 on database error', async () => {
      const mockPatient = {
        id: patientId,
        userId: mockUser.id,
        nome: 'João Silva',
      }

      ;(createClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
      })

      ;(prisma.patient.findFirst as jest.Mock).mockResolvedValue(mockPatient)
      ;(prisma.dailyNote.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.dailyNote.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          data: '2024-01-01',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erro ao criar anotação')
    })
  })
})
