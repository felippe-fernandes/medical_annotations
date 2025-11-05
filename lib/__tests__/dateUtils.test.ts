import { parseLocalDate, formatLocalDate, adjustToLocalTimezone } from '../dateUtils'

describe('dateUtils', () => {
  describe('parseLocalDate', () => {
    it('should parse date string correctly', () => {
      const result = parseLocalDate('2024-01-15')

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // Janeiro = 0
      expect(result.getDate()).toBe(15)
      expect(result.getHours()).toBe(12) // Meio-dia para evitar problemas de fuso
    })

    it('should handle different months correctly', () => {
      const result = parseLocalDate('2024-12-31')

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(11) // Dezembro = 11
      expect(result.getDate()).toBe(31)
    })

    it('should handle first day of month', () => {
      const result = parseLocalDate('2024-03-01')

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(2) // Março = 2
      expect(result.getDate()).toBe(1)
    })

    it('should handle leap year dates', () => {
      const result = parseLocalDate('2024-02-29')

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(1) // Fevereiro = 1
      expect(result.getDate()).toBe(29)
    })

    it('should create date at noon to avoid timezone issues', () => {
      const result = parseLocalDate('2024-01-15')

      expect(result.getHours()).toBe(12)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })
  })

  describe('formatLocalDate', () => {
    it('should format date correctly', () => {
      const date = new Date(2024, 0, 15, 12, 0, 0, 0)
      const result = formatLocalDate(date)

      expect(result).toBe('2024-01-15')
    })

    it('should pad single digit months and days with zero', () => {
      const date = new Date(2024, 2, 5, 12, 0, 0, 0) // Março = 2, dia 5
      const result = formatLocalDate(date)

      expect(result).toBe('2024-03-05')
    })

    it('should handle last day of month', () => {
      const date = new Date(2024, 11, 31, 12, 0, 0, 0) // Dezembro 31
      const result = formatLocalDate(date)

      expect(result).toBe('2024-12-31')
    })

    it('should handle first day of year', () => {
      const date = new Date(2024, 0, 1, 12, 0, 0, 0)
      const result = formatLocalDate(date)

      expect(result).toBe('2024-01-01')
    })

    it('should be inverse of parseLocalDate', () => {
      const originalDateString = '2024-06-15'
      const parsed = parseLocalDate(originalDateString)
      const formatted = formatLocalDate(parsed)

      expect(formatted).toBe(originalDateString)
    })
  })

  describe('adjustToLocalTimezone', () => {
    it('should add 3 hours to compensate UTC-3', () => {
      const date = new Date('2024-01-15T00:00:00Z')
      const adjusted = adjustToLocalTimezone(date)

      expect(adjusted.getHours()).toBe(3)
    })

    it('should not mutate original date', () => {
      const original = new Date('2024-01-15T00:00:00Z')
      const originalTime = original.getTime()

      adjustToLocalTimezone(original)

      expect(original.getTime()).toBe(originalTime)
    })

    it('should handle dates that cross day boundary', () => {
      const date = new Date('2024-01-15T22:00:00Z')
      const adjusted = adjustToLocalTimezone(date)

      expect(adjusted.getDate()).toBe(16)
      expect(adjusted.getHours()).toBe(1) // 22 + 3 = 25 -> 1 (next day)
    })

    it('should handle midnight correctly', () => {
      const date = new Date('2024-01-15T00:00:00Z')
      const adjusted = adjustToLocalTimezone(date)

      expect(adjusted.getDate()).toBe(15)
      expect(adjusted.getHours()).toBe(3)
    })

    it('should handle noon correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const adjusted = adjustToLocalTimezone(date)

      expect(adjusted.getDate()).toBe(15)
      expect(adjusted.getHours()).toBe(15)
    })
  })

  describe('Integration tests', () => {
    it('should correctly round-trip date through parse and format', () => {
      const dates = [
        '2024-01-01',
        '2024-06-15',
        '2024-12-31',
        '2024-02-29', // leap year
      ]

      dates.forEach(dateString => {
        const parsed = parseLocalDate(dateString)
        const formatted = formatLocalDate(parsed)
        expect(formatted).toBe(dateString)
      })
    })

    it('should handle timezone adjustment consistently', () => {
      const dateString = '2024-01-15'
      const parsed = parseLocalDate(dateString)
      const utcDate = new Date(Date.UTC(2024, 0, 15, 0, 0, 0, 0))
      const adjusted = adjustToLocalTimezone(utcDate)

      // Both should represent the same local date
      expect(parsed.getFullYear()).toBe(adjusted.getFullYear())
      expect(parsed.getMonth()).toBe(adjusted.getMonth())
      expect(parsed.getDate()).toBe(adjusted.getDate())
    })
  })
})
