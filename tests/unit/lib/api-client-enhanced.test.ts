/**
 * Unit tests for Enhanced API Client
 * Tests caching, retry logic, and error handling
 */

import { EnhancedAPIClient, APIError, NetworkError } from '@/lib/api-client-enhanced'

// Mock fetch globally
global.fetch = jest.fn()

describe('EnhancedAPIClient', () => {
  let client: EnhancedAPIClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    client = new EnhancedAPIClient()
    mockFetch.mockClear()
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('successful requests', () => {
    it('should fetch data successfully', async () => {
      const mockData = { id: 1, name: 'Test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      } as Response)

      const result = await client.get('/test')
      
      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle text responses', async () => {
      const mockText = 'Success message'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve(mockText),
      } as Response)

      const result = await client.get('/test')
      
      expect(result).toBe(mockText)
    })
  })

  describe('caching', () => {
    it('should cache GET requests when enabled', async () => {
      const mockData = { id: 1, name: 'Test' }
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      } as Response)

      // First request
      const result1 = await client.get('/test', { useCache: true })
      
      // Second request should use cache
      const result2 = await client.get('/test', { useCache: true })
      
      expect(result1).toEqual(mockData)
      expect(result2).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledTimes(1) // Only called once due to cache
    })

    it('should not cache when disabled', async () => {
      const mockData = { id: 1, name: 'Test' }
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      } as Response)

      // Two requests without cache
      await client.get('/test', { useCache: false })
      await client.get('/test', { useCache: false })
      
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('error handling', () => {
    it('should throw APIError for HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ detail: 'Not found' }),
      } as Response)

      await expect(client.get('/test')).rejects.toThrow(APIError)
      await expect(client.get('/test')).rejects.toThrow('Not found')
    })

    it('should handle 401 errors specially', async () => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          removeItem: jest.fn(),
        },
        writable: true,
      })

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ detail: 'Unauthorized' }),
      } as Response)

      await expect(client.get('/test')).rejects.toThrow(APIError)
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('retry logic', () => {
    it('should retry on network errors', async () => {
      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ success: true }),
        } as Response)

      const resultPromise = client.get('/test')
      
      // Fast-forward timers to handle retries
      jest.advanceTimersByTime(5000)
      
      const result = await resultPromise
      
      expect(result).toEqual({ success: true })
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should not retry on client errors (4xx)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ detail: 'Bad request' }),
      } as Response)

      await expect(client.get('/test')).rejects.toThrow(APIError)
      expect(mockFetch).toHaveBeenCalledTimes(1) // No retry
    })
  })

  describe('convenience methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true }),
      } as Response)
    })

    it('should handle POST requests', async () => {
      const data = { name: 'Test' }
      await client.post('/test', data)
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      )
    })

    it('should handle PUT requests', async () => {
      const data = { name: 'Updated' }
      await client.put('/test', data)
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        })
      )
    })

    it('should handle DELETE requests', async () => {
      await client.delete('/test')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('health check', () => {
    it('should return healthy status on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ status: 'ok' }),
      } as Response)

      const result = await client.healthCheck()
      
      expect(result.healthy).toBe(true)
      expect(result.responseTime).toBeGreaterThan(0)
    })

    it('should return unhealthy status on failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await client.healthCheck()
      
      expect(result.healthy).toBe(false)
      expect(result.responseTime).toBeGreaterThan(0)
    })
  })

  describe('cache management', () => {
    it('should clear cache', () => {
      // This is more of a smoke test since cache is private
      expect(() => client.clearCache()).not.toThrow()
    })

    it('should clear cache by pattern', () => {
      expect(() => client.clearCache('sessions')).not.toThrow()
    })
  })
}) 