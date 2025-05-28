/**
 * Unit tests for useMobile hook
 */

import { renderHook } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => ({
  matches,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
})

describe('useIsMobile', () => {
  beforeEach(() => {
    // Reset window.matchMedia mock and innerWidth
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn(),
    })
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('should return true for mobile screen size', () => {
    // Mock mobile screen size
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true })
    ;(window.matchMedia as jest.Mock).mockImplementation(() => mockMatchMedia(true))

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('should return false for desktop screen size', () => {
    // Mock desktop screen size
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    ;(window.matchMedia as jest.Mock).mockImplementation(() => mockMatchMedia(false))

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('should use the correct media query', () => {
    ;(window.matchMedia as jest.Mock).mockImplementation(() => mockMatchMedia(false))

    renderHook(() => useIsMobile())
    
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })
}) 