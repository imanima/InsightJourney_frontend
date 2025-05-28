/**
 * Unit tests for utility functions
 */

import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class')
      expect(result).toBe('base-class additional-class')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', false && 'hidden-class', 'visible-class')
      expect(result).toBe('base-class visible-class')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'end-class')
      expect(result).toBe('base-class end-class')
    })

    it('should work with empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })
}) 