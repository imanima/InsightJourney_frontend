/**
 * Enhanced API Client for Insight Journey Frontend
 * Features: Retry logic, caching, performance optimization, comprehensive error handling
 */

import { getAuthToken, clearAuthToken } from "./auth-utils"
import { APIConfigChecker } from "./api-config-check"

// Enhanced configuration
const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RATE_LIMIT_DELAY: 100, // 100ms between requests
};

// Enhanced error types
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Request cache
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = CONFIG.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Rate limiter
class RateLimiter {
  private lastRequest = 0;

  async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < CONFIG.RATE_LIMIT_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }
    
    this.lastRequest = Date.now();
  }
}

// Enhanced API client
export class EnhancedAPIClient {
  private cache = new APICache();
  private rateLimiter = new RateLimiter();
  private baseURL = APIConfigChecker.getApiUrl();

  // Enhanced fetch with retry logic, timeout, and error handling
  async fetch<T>(
    endpoint: string,
    options: RequestInit & { 
      useCache?: boolean; 
      cacheTTL?: number;
      retries?: number;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const {
      useCache = false,
      cacheTTL = CONFIG.CACHE_TTL,
      retries = CONFIG.MAX_RETRIES,
      timeout = CONFIG.REQUEST_TIMEOUT,
      ...fetchOptions
    } = options;

    // Generate cache key
    const cacheKey = `${fetchOptions.method || 'GET'}:${endpoint}:${JSON.stringify(fetchOptions.body || {})}`;
    
    // Check cache for GET requests
    if (useCache && !fetchOptions.method || fetchOptions.method === 'GET') {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`📦 Cache hit for ${endpoint}`);
        return cached;
      }
    }

    // Apply rate limiting
    await this.rateLimiter.throttle();

    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // Add auth token if available
    const authToken = getAuthToken();
    if (authToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      (headers as any)['Authorization'] = `Bearer ${authToken}`;
    }

    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🚀 API Request: ${fetchOptions.method || 'GET'} ${url} (attempt ${attempt + 1})`);
        
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
          credentials: 'include',
        });

        clearTimeout(timeoutId);

        // Handle authentication errors
        if (response.status === 401) {
          clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new APIError('Authentication required', 401, 'AUTH_REQUIRED');
        }

        // Parse response
        const contentType = response.headers.get('content-type');
        let data: any;
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        // Handle error responses
        if (!response.ok) {
          throw new APIError(
            data.detail || data.message || `HTTP ${response.status}`,
            response.status,
            data.code,
            data
          );
        }

        // Cache successful GET requests
        if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
          this.cache.set(cacheKey, data, cacheTTL);
        }

        console.log(`✅ API Success: ${endpoint}`);
        return data;

      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;

        // Don't retry on auth errors or client errors (4xx)
        if (error instanceof APIError) {
          if (error.status >= 400 && error.status < 500) {
            throw error;
          }
        }

        // Don't retry on the last attempt
        if (attempt === retries) {
          break;
        }

        // Wait before retry
        const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt); // Exponential backoff
        console.log(`⏳ Retrying ${endpoint} in ${delay}ms (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // If we get here, all retries failed
    if (lastError instanceof APIError) {
      throw lastError;
    } else {
      throw new NetworkError(`Failed to fetch ${endpoint} after ${retries + 1} attempts`, lastError);
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, options: { useCache?: boolean; cacheTTL?: number } = {}): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET', ...options });
  }

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE', ...options });
  }

  // Cache management
  clearCache(pattern?: string): void {
    if (pattern) {
      this.cache.delete(pattern);
    } else {
      this.cache.clear();
    }
  }

  // Health check
  async healthCheck(): Promise<{ healthy: boolean; responseTime: number }> {
    const start = Date.now();
    try {
      await this.get('/health');
      return { healthy: true, responseTime: Date.now() - start };
    } catch {
      return { healthy: false, responseTime: Date.now() - start };
    }
  }
}

// Export singleton instance
export const apiClient = new EnhancedAPIClient();

// Enhanced API modules using the new client
export const enhancedAuthAPI = {
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    return apiClient.fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
  },

  async register(userData: { name: string; email: string; password: string }) {
    return apiClient.post('/auth/register', userData);
  },

  async getCurrentUser() {
    return apiClient.get('/auth/me', { useCache: true, cacheTTL: 10 * 60 * 1000 }); // 10 min cache
  },

  async logout() {
    apiClient.clearCache(); // Clear cache on logout
    return apiClient.get('/auth/logout');
  },
};

export const enhancedSessionsAPI = {
  async getSessions() {
    return apiClient.get('/sessions', { useCache: true });
  },

  async getSession(id: string) {
    return apiClient.get(`/sessions/${id}`, { useCache: true });
  },

  async createSession(data: any) {
    apiClient.clearCache('sessions'); // Invalidate sessions cache
    return apiClient.post('/sessions', data);
  },

  async deleteSession(id: string) {
    apiClient.clearCache('sessions'); // Invalidate sessions cache
    return apiClient.delete(`/sessions/${id}`);
  },
};

export const enhancedInsightsAPI = {
  async getAllInsights() {
    return apiClient.get('/insights/all', { useCache: true });
  },

  async getTurningPoint(emotion?: string) {
    const endpoint = emotion ? `/insights/turning-point?emotion=${emotion}` : '/insights/turning-point';
    return apiClient.get(endpoint, { useCache: true });
  },

  async getCorrelations(limit?: number) {
    const endpoint = limit ? `/insights/correlations?limit=${limit}` : '/insights/correlations';
    return apiClient.get(endpoint, { useCache: true });
  },

  async getCascadeMap() {
    return apiClient.get('/insights/cascade-map', { useCache: true });
  },

  async getFuturePrediction() {
    return apiClient.get('/insights/future-prediction', { useCache: true });
  },
}; 