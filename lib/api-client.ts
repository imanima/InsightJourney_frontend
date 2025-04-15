// API client for making requests to the Insight Journey backend

// Base URL for API requests - can be configured based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1"

// Types for API responses
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

// Session type
interface Session {
  id: string
  title: string
  created_at: string
  status: string
  user_id: string
}

// Insight type
interface Insight {
  id: string
  content: string
  category: string
  created_at: string
  session_id: string
}

// Helper function for making API requests
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
  const url = `${baseURL}${endpoint}`;
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Add authorization header if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Log token for debugging (remove in production)
  if (token) {
    console.log('Using token:', token.substring(0, 15) + '...');
    console.log('Auth header:', `Bearer ${token.substring(0, 15)}...`);
  } else {
    console.log('No token available for request');
  }

  try {
    console.log(`Making request to: ${url}`);
    console.log('Request headers:', headers);
    console.log('Request method:', options.method || 'GET');
    
    // For FormData, let browser set the content type with boundary
    const requestOptions = { ...options };
    
    if (options.body instanceof FormData) {
      // For FormData, we need to omit the Content-Type and let browser set it
      const { 'Content-Type': _, ...headersWithoutContentType } = headers;
      requestOptions.headers = headersWithoutContentType;
    } else {
      requestOptions.headers = headers;
    }
    
    const response = await fetch(url, {
      ...requestOptions,
      credentials: 'include', // Important for CORS with credentials
      mode: 'cors', // Explicitly set CORS mode
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

    if (!response.ok) {
      let errorData;
      try {
        // Try to parse as JSON first
        errorData = await response.json();
      } catch (e) {
        // If not JSON, get as text
        errorData = { error: await response.text() };
      }
      
      console.error('Server error response:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      
      if (response.status === 401) {
        // Handle unauthorized access
        console.warn('Authentication failed - clearing token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Don't automatically redirect as it can cause loops
          // window.location.href = '/auth/signin';
        }
      }
      
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`,
        status: response.status
      };
    }

    const data = await response.json();
    console.log('Response data:', data);
    return {
      success: true,
      data,
      status: response.status
    };
  } catch (error) {
    console.error('Network error:', error);
    return {
      success: false,
      error: 'Failed to connect to server',
      status: 0
    };
  }
}

// Sessions API
export const sessionsAPI = {
  createSession: async (title: string, content: string | Blob, inputMethod: 'audio' | 'text', language: string = 'en') => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('inputMethod', inputMethod);
    formData.append('language', language);
    
    if (inputMethod === 'audio' && content instanceof Blob) {
      formData.append('audio', content);
    } else {
      formData.append('text', content as string);
    }

    return fetchAPI<{ sessionId: string }>('/sessions', {
      method: 'POST',
      body: formData,
    });
  },
  getSession: (id: string) => fetchAPI<Session>(`/sessions/${id}`),
  listSessions: () => fetchAPI<Session[]>('/sessions'),
  deleteSession: (id: string) => fetchAPI<void>(`/sessions/${id}`, { method: 'DELETE' }),
  startAnalysis: (id: string) => fetchAPI<{ message: string }>(`/sessions/${id}/analyze`, { method: 'POST' }),
  getAnalysis: (id: string) => fetchAPI<{ status: string; result?: any }>(`/sessions/${id}/analysis`)
};

// Insights API
export const insightsAPI = {
  getInsights: (sessionId: string) => fetchAPI<Insight[]>(`/sessions/${sessionId}/insights`),
  createInsight: (sessionId: string, data: { content: string; category: string }) => 
    fetchAPI<Insight>(`/sessions/${sessionId}/insights`, { method: 'POST', body: JSON.stringify(data) })
};

// Export the fetchAPI function and other exports
export { fetchAPI, API_BASE_URL };

