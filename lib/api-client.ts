// API client for making requests to the Insight Journey backend
// Import auth utilities
import { 
  getAuthToken, 
  setAuthToken, 
  clearAuthToken, 
  setAuthUser, 
  getAuthUser,
  AuthUser,
  TokenResponse 
} from "./auth-utils"

// Import API configuration checker
import { APIConfigChecker } from "./api-config-check"

// Import mock data for fallback and development
import { mockUsers, findUserByEmail, createUser, createGoogleUser, updateUserRole, deleteUser } from "./mock/auth-mock"
import {
  mockSessions,
  mockSessionAnalyses,
  mockTranscripts,
  findSessionById,
  createSession as createMockSession,
  uploadRecording,
  startAnalysis,
  deleteSession as deleteMockSession,
} from "./mock/sessions-mock"
import { mockAdminSettings, getAnalysisElements, updateAdminSettings } from "./mock/admin-mock"
import { getUserSettings, updateUserSettings } from "./mock/user-mock"
import { mockActionItems, updateActionItem, deleteActionItem } from "./mock/action-items-mock"
import { mockInsights } from "./mock/insights-mock"

// Base URL for API requests
// Production backend API URL
const PRODUCTION_API_URL = "https://insight-journey-a47jf6g6sa-uc.a.run.app/api/v1"
const LOCAL_API_URL = "http://localhost:8080/api/v1"

// Determine API base URL based on environment
// Always use proxy route in development to avoid CORS issues
const API_BASE_URL = typeof window !== 'undefined' ? 
  (process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : '/api/proxy') : 
  PRODUCTION_API_URL

// Flag to use mock data instead of real API
// Set to false to use the real API (ALWAYS FALSE for production)
const USE_MOCK_DATA = false

// Add debug flag to provide verbose logging
const DEBUG_API = true

console.log('🔧 API Configuration:', {
  API_BASE_URL: API_BASE_URL,
  USE_MOCK_DATA,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  ENVIRONMENT: typeof window !== 'undefined' ? 'CLIENT' : 'SERVER',
  ACTUAL_URL_USED: typeof window !== 'undefined' ? 
    (process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : '/api/proxy') : 
    'SERVER_SIDE_RENDERING'
})

// Types for API responses
type ApiResponse<T> = {
  data?: T
  error?: string
  status: number
}

// Helper function for making API requests
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  if (USE_MOCK_DATA) {
    return mockFetchAPI<T>(endpoint, options)
  }

  // Ensure endpoint starts with a slash if the base URL doesn't end with one
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`

  // Get auth token using the utility function
  const authToken = getAuthToken()
  
  // Default headers - but don't set Content-Type if we're sending FormData
  const headers: Record<string, string> = {}
  
  // Add custom headers from options if they exist
  if (options.headers) {
    Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
      headers[key] = value
    })
  }
  
  // Only set Content-Type to JSON if we're not sending FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }
  
  // Add Authorization header if token exists and it's not the login or register endpoint
  if (authToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
    headers["Authorization"] = `Bearer ${authToken}`
  }

  try {
    if (DEBUG_API) {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`, {
        headers,
        bodyType: options.body instanceof FormData ? 'FormData' : typeof options.body,
        bodyPreview: options.body instanceof FormData ? 'FormData with files' : options.body
      })
    }

    const response = await fetch(url, {
      ...options,
      headers,
      // Include credentials for CORS requests if needed
      credentials: "include",
    })

    if (DEBUG_API) {
      console.log(`📡 API Response: ${response.status} ${response.statusText}`)
    }

    // Handle 401 Unauthorized by clearing token and redirecting to login
    if (response.status === 401 && typeof window !== 'undefined') {
      clearAuthToken()
      localStorage.removeItem('user')
      // Redirect to login page if we're in the browser
      window.location.href = '/login'
      return {
        error: "Authentication required. Please log in again.",
        status: response.status,
      }
    }

    // Parse JSON response
    const data = await response.json().catch(() => ({}))

    // Handle error responses
    if (!response.ok) {
      let errorMessage = "An error occurred"
      
      if (data.detail) {
        // If it's a FastAPI validation error array
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => err.msg || err.message || String(err)).join(', ')
        } else {
          errorMessage = data.detail
        }
      } else if (data.error) {
        errorMessage = data.error
      } else if (typeof data === 'string') {
        errorMessage = data
      }
      
      if (DEBUG_API) {
        console.error(`❌ API Error: ${response.status} - ${errorMessage}`)
        console.error('Full error details:', data)
      }
      return {
        error: errorMessage,
        status: response.status,
      }
    }

    if (DEBUG_API) {
      console.log(`✅ API Success:`, data)
    }

    return {
      data,
      status: response.status,
    }
  } catch (error) {
    console.error(`💥 API request failed: ${url}`, error)
    
    // Provide more specific error messages
    let errorMessage = "Network error"
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      errorMessage = "CORS error or API server unreachable. Please check network settings or try again later."
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return {
      error: errorMessage,
      status: 0,
    }
  }
}

// Mock implementation of fetchAPI for development
async function mockFetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Parse the endpoint and method
  const method = options.method || "GET"

  // Auth endpoints
  if (endpoint === "/auth/login" && method === "POST") {
    const body = JSON.parse(options.body as string)
    const { email, password } = body

    const user = findUserByEmail(email)
    if (!user || user.password !== password) {
      return { error: "Invalid email or password", status: 401 }
    }

    const { password: _, ...userWithoutPassword } = user
    return {
      data: { message: "Login successful", user: userWithoutPassword } as unknown as T,
      status: 200,
    }
  }

  if (endpoint === "/auth/register" && method === "POST") {
    const body = JSON.parse(options.body as string)
    const { name, email, password } = body

    if (!name || !email || !password) {
      return { error: "Name, email, and password are required", status: 400 }
    }

    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return { error: "User with this email already exists", status: 409 }
    }

    const newUser = createUser(name, email, password)
    const { password: _, ...userWithoutPassword } = newUser

    return {
      data: { message: "Registration successful", user: userWithoutPassword } as unknown as T,
      status: 201,
    }
  }

  if (endpoint === "/auth/google" && method === "POST") {
    const body = JSON.parse(options.body as string)
    const { email, name, picture, googleId } = body

    if (!email || !name || !googleId) {
      return { error: "Email, name, and googleId are required", status: 400 }
    }

    const user = createGoogleUser(email, name, picture, googleId)
    const { password: _, ...userWithoutPassword } = user

    return {
      data: { message: "Google authentication successful", user: userWithoutPassword } as unknown as T,
      status: 200,
    }
  }

  if (endpoint === "/auth/logout" && method === "GET") {
    return {
      data: { message: "Logged out successfully" } as unknown as T,
      status: 200,
    }
  }

  if (endpoint === "/auth/me" && method === "GET") {
    // In a real app, this would use the session to identify the user
    // For mock purposes, we'll return the first user
    const user = mockUsers[0]
    const { password: _, ...userWithoutPassword } = user

    return {
      data: { user: userWithoutPassword } as unknown as T,
      status: 200,
    }
  }

  // Admin endpoints
  if (endpoint === "/admin/settings" && method === "GET") {
    return {
      data: mockAdminSettings as unknown as T,
      status: 200,
    }
  }

  if (endpoint === "/admin/settings" && method === "PUT") {
    const newSettings = JSON.parse(options.body as string)
    const updatedSettings = updateAdminSettings(newSettings)

    return {
      data: { message: "Settings updated successfully", settings: updatedSettings } as unknown as T,
      status: 200,
    }
  }

  if (endpoint === "/admin/analysis-elements" && method === "GET") {
    return {
      data: getAnalysisElements() as unknown as T,
      status: 200,
    }
  }

  if (endpoint === "/admin/users" && method === "GET") {
    const usersWithoutPasswords = mockUsers.map((user) => {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return {
      data: usersWithoutPasswords as unknown as T,
      status: 200,
    }
  }

  if (endpoint.match(/^\/admin\/users\/\d+$/) && method === "PUT") {
    const id = Number.parseInt(endpoint.split("/").pop() || "0")
    const body = JSON.parse(options.body as string)
    const success = updateUserRole(id, body.role)

    if (!success) {
      return { error: "User not found", status: 404 }
    }

    return {
      data: { message: "User role updated successfully" } as unknown as T,
      status: 200,
    }
  }

  if (endpoint.match(/^\/admin\/users\/\d+$/) && method === "DELETE") {
    const id = Number.parseInt(endpoint.split("/").pop() || "0")
    const success = deleteUser(id)

    if (!success) {
      return { error: "User not found", status: 404 }
    }

    return {
      data: { message: "User deleted successfully" } as unknown as T,
      status: 200,
    }
  }

  // Sessions endpoints
  if (endpoint === "/sessions" && method === "GET") {
    return {
      data: mockSessions as unknown as T,
      status: 200,
    }
  }

  if (endpoint.match(/^\/sessions\/\d+$/) && method === "GET") {
    const id = Number.parseInt(endpoint.split("/").pop() || "0")
    const session = findSessionById(id)

    if (!session) {
      return { error: "Session not found", status: 404 }
    }

    return {
      data: session as unknown as T,
      status: 200,
    }
  }

  if (endpoint === "/sessions" && method === "POST") {
    // For mock purposes, we'll parse the FormData if it's available
    let sessionData
    if (options.body instanceof FormData) {
      sessionData = {
        title: options.body.get("title"),
        date: options.body.get("date"),
        client_name: options.body.get("client_name"),
        notes: options.body.get("notes"),
        file: options.body.get("file"),
      }
    } else {
      // If it's JSON
      sessionData = options.body ? JSON.parse(options.body as string) : {}
    }

    const newSession = createMockSession(sessionData)
    return {
      data: newSession as unknown as T,
      status: 201,
    }
  }

  if (endpoint.match(/^\/sessions\/\d+\/upload$/) && method === "POST") {
    const id = Number.parseInt(endpoint.split("/")[2])
    const file = options.body instanceof FormData ? options.body.get("file") : null

    if (!file) {
      return { error: "No file provided", status: 400 }
    }

    const result = uploadRecording(id, file)

    if (!result) {
      return { error: "Session not found", status: 404 }
    }

    return {
      data: result as unknown as T,
      status: 200,
    }
  }

  if (endpoint.match(/^\/sessions\/\d+\/analyze$/) && method === "POST") {
    const id = Number.parseInt(endpoint.split("/")[2])
    const result = startAnalysis(id)

    if (!result) {
      return { error: "Session not found", status: 404 }
    }

    return {
      data: result as unknown as T,
      status: 200,
    }
  }

  if (endpoint.match(/^\/sessions\/\d+\/analysis$/) && method === "GET") {
    const id = Number.parseInt(endpoint.split("/")[2])
    const analysis = mockSessionAnalyses[id as keyof typeof mockSessionAnalyses]

    if (!analysis) {
      return { error: "Analysis not found", status: 404 }
    }

    return {
      data: analysis as unknown as T,
      status: 200,
    }
  }

  if (endpoint.match(/^\/sessions\/\d+\/transcript$/) && method === "GET") {
    const id = Number.parseInt(endpoint.split("/")[2])
    const transcript = mockTranscripts[id as keyof typeof mockTranscripts]

    if (!transcript) {
      return { error: "Transcript not found", status: 404 }
    }

    return {
      data: transcript as unknown as T,
      status: 200,
    }
  }

  if (endpoint.match(/^\/sessions\/\d+\/elements$/) && method === "GET") {
    const id = Number.parseInt(endpoint.split("/")[2])
    const analysis = mockSessionAnalyses[id as keyof typeof mockSessionAnalyses]

    if (!analysis) {
      return { error: "Elements not found", status: 404 }
    }

    return {
      data: { elements: analysis.elements } as unknown as T,
      status: 200,
    }
  }

  if (endpoint.match(/^\/sessions\/\d+$/) && method === "DELETE") {
    const id = Number.parseInt(endpoint.split("/").pop() || "0")
    const success = deleteMockSession(id)

    if (!success) {
      return { error: "Session not found", status: 404 }
    }

    return {
      data: { message: "Session deleted successfully" } as unknown as T,
      status: 200,
    }
  }

  // User settings endpoints
  if (endpoint === "/user/profile" && method === "GET") {
    // In a real app, this would use the session to identify the user
    const user = mockUsers[0]
    const { password: _, ...userWithoutPassword } = user
    const settings = getUserSettings(user.id)

    return {
      data: { ...userWithoutPassword, settings } as unknown as T,
      status: 200,
    }
  }

  if (endpoint === "/user/settings" && method === "PUT") {
    // In a real app, this would use the session to identify the user
    const user = mockUsers[0]
    const newSettings = JSON.parse(options.body as string)
    const updatedSettings = updateUserSettings(user.id, newSettings)

    return {
      data: { message: "Settings updated successfully", settings: updatedSettings } as unknown as T,
      status: 200,
    }
  }

  // Action Items endpoints
  if (endpoint === "/action-items" && method === "GET") {
    return {
      data: { actionItems: mockActionItems } as unknown as T,
      status: 200,
    }
  }

  if (endpoint.match(/^\/action-items\/\d+$/) && method === "PATCH") {
    const id = endpoint.split("/").pop() || ""
    const updates = JSON.parse(options.body as string)
    const updatedItem = updateActionItem(id, updates)

    if (!updatedItem) {
      return { error: "Action item not found", status: 404 }
    }

    return {
      data: { actionItem: updatedItem } as unknown as T,
      status: 200,
    }
  }

  // Inside the mockFetchAPI function, add this condition:
  if (endpoint.match(/^\/action-items\/\d+$/) && method === "DELETE") {
    const id = endpoint.split("/").pop() || ""
    const success = deleteActionItem(id)

    if (!success) {
      return { error: "Action item not found", status: 404 }
    }

    return {
      data: { message: "Action item deleted successfully" } as unknown as T,
      status: 200,
    }
  }

  // Insights endpoints
  if (endpoint === "/insights" && method === "GET") {
    return {
      data: { insights: mockInsights } as unknown as T,
      status: 200,
    }
  }

  // Health check endpoint
  if (endpoint === "/health" && method === "GET") {
    return {
      data: {
        status: "healthy",
        database: "connected",
        services: ["auth", "sessions", "admin"],
      } as unknown as T,
      status: 200,
    }
  }

  // If no matching endpoint is found
  return { error: "Endpoint not found", status: 404 }
}
// Auth API
export const authAPI = {
  /**
   * Login using form-urlencoded format as required by the API
   * @param email User's email address
   * @param password User's password
   * @returns API response with access token or error
   */
  async login(email: string, password: string): Promise<ApiResponse<TokenResponse>> {
    if (USE_MOCK_DATA) {
      return fetchAPI<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
    }
    
    // Enhanced debugging and direct API access
    const USE_DIRECT_API = false // Use proxy by default as it handles CORS issues
    const DIRECT_API_URL = "https://insight-journey-a47jf6g6sa-uc.a.run.app/api/v1"
    
    if (DEBUG_API) {
      console.log("========== AUTHENTICATION ATTEMPT ==========")
      console.log(`Login attempt for email: ${email}`)
      console.log(`Using ${USE_DIRECT_API ? 'direct API' : 'proxy'} for first attempt`)
    }
    
    // Try both direct API and proxy approaches
    const attemptLogin = async (useDirectApi: boolean): Promise<ApiResponse<TokenResponse>> => {
      try {
        // Prepare form data according to API spec
        // API explicitly requires username/password as form-urlencoded format
        const formData = new URLSearchParams()
        formData.append('username', email) // API expects 'username' parameter, not 'email'
        formData.append('password', password)
        
        // Determine endpoint URL based on approach
        const apiUrl = useDirectApi 
          ? `${DIRECT_API_URL}/auth/login`
          : `${API_BASE_URL}/auth/login`
        
        if (DEBUG_API) {
          console.log(`Attempting login with ${useDirectApi ? 'direct API' : 'proxy'} at: ${apiUrl}`)
          console.log(`Request payload: ${formData.toString()}`)
        }
        
        // Make the authentication request
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
          },
          // For direct API calls, use credentials inclusion to handle cookies if needed
          ...(useDirectApi ? { credentials: "include" } : {}),
          body: formData
        })
        
        if (DEBUG_API) {
          console.log(`Response status: ${response.status}`)
        }
        
        // Get response body
        let data: TokenResponse = { access_token: "", token_type: "" }
        let responseText = ""
        
        try {
          // First capture the raw text for debugging
          responseText = await response.clone().text()
          if (DEBUG_API) {
            console.log(`Raw response: ${responseText}`)
          }
          
          // Then try to parse as JSON
          data = await response.json()
          if (DEBUG_API) {
            console.log(`Parsed response data:`, data)
          }
        } catch (jsonError) {
          console.error("Failed to parse JSON response:", jsonError)
          console.log("Response as text:", responseText)
          return {
            error: "Invalid response format from server",
            status: response.status,
          }
        }
        
        if (!response.ok) {
          const errorDetail = data as unknown as { detail?: string }
          const errorMsg = errorDetail.detail || `Login failed with status: ${response.status}`
          console.error(`Login error details (${useDirectApi ? 'direct API' : 'proxy'}):`, errorMsg)
          return {
            error: errorMsg,
            status: response.status,
          }
        }
        
        // Store the token using our utility function
        if (data.access_token) {
          if (DEBUG_API) {
            console.log("Successfully obtained access token")
          }
          setAuthToken(data.access_token)
          
          // After successful login, fetch user data
          try {
            const userResponse = await this.getCurrentUser()
            if (userResponse.data && !userResponse.error) {
              setAuthUser(userResponse.data as AuthUser)
            }
          } catch (userError) {
            console.error("Error fetching user data after login:", userError)
          }
          
          return {
            data,
            status: response.status,
          }
        } else {
          console.error("No access token in successful response")
          return {
            error: "Server response missing access token",
            status: response.status,
          }
        }
      } catch (error) {
        console.error(`Login network error (${useDirectApi ? 'direct API' : 'proxy'}):`, error)
        let errorMessage = "Network error connecting to authentication service"
        
        if (error instanceof TypeError && error.message === "Failed to fetch") {
          errorMessage = "CORS error or API server unreachable. Please check network settings or try again later."
        } else if (error instanceof Error) {
          errorMessage = `${error.name}: ${error.message}`
        }
        
        return {
          error: errorMessage,
          status: 0
        }
      }
    }
    
    // First try direct API call
    if (USE_DIRECT_API) {
      const directResult = await attemptLogin(true)
      if (directResult.data) {
        return directResult
      }
      
      console.log("Direct API call failed, falling back to proxy...")
    }
    
    // Fall back to proxy if direct call fails or is disabled
    return attemptLogin(false)
  },

  /**
   * Register a new user with the API
   * @param userData User registration data
   * @returns API response with user data or error
   */
  async register(userData: RegisterData): Promise<ApiResponse<AuthUser>> {
    if (USE_MOCK_DATA) {
      return fetchAPI<AuthUser>("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      })
    }
    
    if (DEBUG_API) {
      console.log("========== REGISTRATION ATTEMPT ==========")
      console.log("Attempting to register with API at:", `${API_BASE_URL}/auth/register`)
      console.log("Registration data:", { email: userData.email, name: userData.name })
    }
    
    try {
      // Send the request through our proxy (API expects JSON format for registration)
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(userData)
      })
      
      if (DEBUG_API) {
        console.log("Registration response status:", response.status)
      }
      
      // Get response body
      let data: Partial<AuthUser> = {}
      try {
        data = await response.json()
        if (DEBUG_API) {
          console.log("Registration response data:", data)
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError)
        const textResponse = await response.text().catch(() => "No text response")
        if (DEBUG_API) {
          console.log("Response as text:", textResponse)
        }
        return {
          error: "Invalid response format from server",
          status: response.status,
        }
      }
      
      if (!response.ok) {
        const errorDetail = data as unknown as { detail?: string }
        const errorMsg = errorDetail.detail || `Registration failed with status: ${response.status}`
        console.error("Registration error details:", errorMsg)
        return {
          error: errorMsg,
          status: response.status,
        }
      }
      
      // Check if we have a complete user object
      if (data.id && data.email && data.name) {
        return {
          data: data as AuthUser,
          status: response.status,
        }
      } else {
        return {
          error: "Incomplete user data returned from server",
          status: response.status,
        }
      }
    } catch (error) {
      console.error("Registration network error:", error)
      
      // Provide more detailed error information based on error type
      let errorMessage = "Network error connecting to registration service";
      
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = "CORS error or API server unreachable. Please check network settings or try again later.";
      } else if (error instanceof Error) {
        errorMessage = `${error.name}: ${error.message}`;
      }
      
      return {
        error: errorMessage,
        status: 0,
      }
    }
  },

  /**
   * Update user password
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns API response
   */
  updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{message: string}>> {
    return fetchAPI<{message: string}>("/auth/credentials/password", {
      method: "PUT",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    })
  },

  /**
   * Generate a new API key for the user
   * @returns API response with new API key
   */
  generateApiKey(): Promise<ApiResponse<{api_key: string, expires_at: string}>> {
    return fetchAPI<{api_key: string, expires_at: string}>("/auth/credentials/api-key", {
      method: "POST",
    })
  },

  /**
   * Get user credentials information
   * @returns API response with credentials info
   */
  getCredentials(): Promise<ApiResponse<Array<{type: string, value: string, expires_at: string | null}>>> {
    return fetchAPI<Array<{type: string, value: string, expires_at: string | null}>>("/auth/credentials")
  },
  
  /**
   * Google auth is not in the API docs, but kept for backward compatibility
   * @param googleData Google auth data
   * @returns API response
   */
  googleAuth(googleData: GoogleAuthData): Promise<ApiResponse<any>> {
    return fetchAPI("/auth/google", {
      method: "POST",
      body: JSON.stringify(googleData),
    })
  },

  /**
   * Logout user by clearing token and making logout API call
   * @returns API response
   */
  async logout(): Promise<ApiResponse<{message: string}>> {
    // Call the logout endpoint first (if available)
    try {
      await fetchAPI("/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Error during logout API call:", error)
    }

    // Always clear tokens regardless of API call success
    clearAuthToken()
    
    return {
      data: { message: "Logged out successfully" },
      status: 200,
    }
  },

  /**
   * Get current user data
   * @returns API response with user data
   */
  getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    return fetchAPI<AuthUser>("/auth/me")
  },
}

// Sessions API
export const sessionsAPI = {
  // Get all sessions
  getSessions() {
    return fetchAPI("/sessions")
  },

  // Get session by ID
  getSessionById(id: string) {
    return fetchAPI(`/sessions/${id}`)
  },

  // Create a new session
  createSession(sessionData: any) {
    // If we have a transcript in the data, use it directly
    if (sessionData.transcript) {
      return fetchAPI("/sessions", {
        method: "POST",
        body: JSON.stringify({
          title: sessionData.title,
          date: sessionData.date,
          description: sessionData.description || sessionData.notes,
          duration: sessionData.duration || 60,
          transcript: sessionData.transcript
        }),
      })
    }
    
    // If we have a file, handle it as a multipart form
    if (sessionData instanceof FormData && sessionData.has("recording_file")) {
      // First create the session
      const title = sessionData.get("title") as string
      const date = sessionData.get("date") as string
      const description = sessionData.get("notes") as string || "Session recording"
      const duration = Number(sessionData.get("duration")) || 60
      
      return fetchAPI("/sessions", {
        method: "POST",
        body: JSON.stringify({
          title,
          date,
          description,
          duration
        }),
      }).then(async (response) => {
        if (!response.data || response.error) {
          return response
        }
        
        // Safely access the ID, providing a default if not available
        const responseData = response.data as { id?: string } | undefined
        const sessionId = responseData?.id || ''
        const file = sessionData.get("recording_file") as File
        
        // Then upload the recording to the session
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)
        
        // Upload the file for transcription and link it to the session
        return fetchAPI(`/audio/transcribe/${sessionId}`, {
          method: "POST",
          body: uploadFormData,
          headers: {}, // Let the browser set the correct Content-Type
        })
      })
    }

    // Otherwise, handle it as a JSON request
    return fetchAPI("/sessions", {
      method: "POST",
      body: JSON.stringify(sessionData),
    })
  },

  // Upload a recording for transcription
  uploadRecording(sessionId: string, file: File) {
    const formData = new FormData()
    formData.append("file", file)

    return fetchAPI(`/audio/transcribe/${sessionId}`, {
      method: "POST",
      body: formData,
      headers: {}, // Let the browser set the correct Content-Type
    })
  },

  // Start analysis on a session
  startAnalysis(sessionId: string) {
    // First get the session to retrieve the transcript
    return this.getSessionById(sessionId).then(async (sessionResponse) => {
      if (sessionResponse.error || !sessionResponse.data) {
        return sessionResponse
      }
      
      const session = sessionResponse.data as any
      const transcript = session.transcript
      
      if (!transcript) {
        return {
          error: "No transcript found for this session",
          status: 400
        }
      }
      
      // Now call the analysis endpoint with the transcript
      return fetchAPI(`/analysis/analyze`, {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          transcript: transcript
        }),
      })
    })
  },

  // Get session analysis results
  getAnalysisResults(sessionId: string) {
    return fetchAPI(`/analysis/${sessionId}/results`)
  },

  // Get session elements (emotions, insights, etc.)
  getSessionElements(sessionId: string) {
    return fetchAPI(`/analysis/${sessionId}/elements`)
  },

  // Update session elements (emotions, insights, etc.)
  updateSessionElements(sessionId: string, updateData: any) {
    return fetchAPI(`/analysis/${sessionId}/elements`, {
      method: "PUT",
      body: JSON.stringify(updateData), // Send the complete update data with elements wrapper
    })
  },

  // Get session transcript
  getSessionTranscript(sessionId: string) {
    return fetchAPI(`/sessions/${sessionId}/transcript`)
  },

  // Delete a session
  deleteSession(sessionId: string) {
    return fetchAPI(`/sessions/${sessionId}`, {
      method: "DELETE",
    })
  },
  
  // Direct analysis of a transcript
  directAnalysis(transcript: string) {
    // Since the backend doesn't have a direct analysis endpoint,
    // we need to create a session first with the transcript, then analyze it
    return fetchAPI("/sessions", {
      method: "POST",
      body: JSON.stringify({
        title: "Direct Text Analysis",
        date: new Date().toISOString(),
        description: "Direct transcript analysis",
        duration: 0,
        transcript: transcript
      }),
    }).then(async (sessionResponse) => {
      if (sessionResponse.error || !sessionResponse.data) {
        return sessionResponse
      }
      
      const sessionId = (sessionResponse.data as any)?.id
      if (!sessionId) {
        return {
          error: "Failed to create session for analysis",
          status: 500
        }
      }
      
      // Now call the analysis endpoint
      return fetchAPI(`/analysis/analyze`, {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          transcript: transcript
        }),
      })
    })
  },
}

// Admin API
export const adminAPI = {
  // Get all users
  getUsers() {
    return fetchAPI("/users")
  },

  // Get a user by ID
  getUserById(id: string) {
    return fetchAPI(`/users/${id}`)
  },

  // Update a user's role
  updateUserRole(id: string, role: string) {
    return fetchAPI(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    })
  },

  // Delete a user
  deleteUser(id: string) {
    return fetchAPI(`/users/${id}`, {
      method: "DELETE",
    })
  },
}

// User API
export const userAPI = {
  // Get current user profile
  getProfile() {
    return fetchAPI("/auth/me")
  },

  // Update user settings
  updateSettings(settings: UserSettings) {
    return fetchAPI("/users/me/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    })
  },
}

// Action Items API
export const actionItemsAPI = {
  // Get all action items for the current user across all sessions
  getAllActionItems() {
    return fetchAPI("/action-items")
  },

  // Get all action items for a session
  getActionItems(sessionId: string) {
    return fetchAPI(`/sessions/${sessionId}/action-items`)
  },

  // Update an action item
  updateActionItem(sessionId: string, actionItemId: string, data: Partial<ActionItem>) {
    return fetchAPI(`/sessions/${sessionId}/action-items/${actionItemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // Create a new action item
  createActionItem(sessionId: string, data: Partial<ActionItem>) {
    return fetchAPI(`/sessions/${sessionId}/action-items`, {
      method: "POST",
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
        priority: data.priority,
        status: data.status
      }),
    })
  },

  // Get a specific action item
  getActionItem(sessionId: string, actionItemId: string) {
    return fetchAPI(`/sessions/${sessionId}/action-items/${actionItemId}`)
  },

  // Delete an action item
  deleteActionItem(sessionId: string, actionItemId: string) {
    return fetchAPI(`/sessions/${sessionId}/action-items/${actionItemId}`, {
      method: "DELETE",
    })
  },
}

// Advanced Insights API - NEW SECTION
export const insightsAPI = {
  // Get insights for current user
  getInsights() {
    return fetchAPI("/insights/all")
  },

  // Get turning point analysis
  getTurningPoint(emotion: string = "Anxiety") {
    return fetchAPI(`/insights/turning-point?emotion=${emotion}`)
  },

  // Get emotion-topic correlations
  getCorrelations(limit: number = 5) {
    return fetchAPI(`/insights/correlations?limit=${limit}`)
  },

  // Get cascade map showing insight connections
  getCascadeMap() {
    return fetchAPI("/insights/cascade-map")
  },

  // Get future predictions
  getFuturePrediction() {
    return fetchAPI("/insights/future-prediction")
  },

  // Get challenge persistence tracking
  getChallengePersistence() {
    return fetchAPI("/insights/challenge-persistence")
  },

  // Get therapist snapshot
  getTherapistSnapshot() {
    return fetchAPI("/insights/therapist-snapshot")
  },

  // Add reflection
  addReflection(reflection: string) {
    return fetchAPI("/insights/reflection", {
      method: "POST",
      body: JSON.stringify({ reflection }),
    })
  },

  // Get all insights combined
  getAllInsights() {
    return fetchAPI("/insights/all")
  },
}

// Analysis API - Enhanced with missing endpoints
export const analysisAPI = {
  // Start analysis on a session
  startAnalysis(sessionId: string) {
    return fetchAPI(`/sessions/${sessionId}/analyze`, {
      method: "POST",
    })
  },

  // Get session analysis results
  getAnalysisResults(sessionId: string) {
    return fetchAPI(`/sessions/${sessionId}/analysis`)
  },

  // Get session elements (emotions, insights, etc.)
  getSessionElements(sessionId: string) {
    return fetchAPI(`/sessions/${sessionId}/elements`)
  },

  // Run Neo4j query - Enhanced version
  runNeo4jQuery(query: string, parameters: Record<string, any> = {}) {
    return fetchAPI("/analysis/neo4j-query", {
      method: "POST",
      body: JSON.stringify({ query, parameters }),
    })
  },

  // Direct analysis of transcript text
  directAnalysis(transcript: string) {
    // Since the backend doesn't have a direct analysis endpoint,
    // we need to create a session first with the transcript, then analyze it
    return fetchAPI("/sessions", {
      method: "POST",
      body: JSON.stringify({
        title: "Direct Text Analysis",
        date: new Date().toISOString(),
        description: "Direct transcript analysis",
        duration: 0,
        transcript: transcript
      }),
    }).then(async (sessionResponse) => {
      if (sessionResponse.error || !sessionResponse.data) {
        return sessionResponse
      }
      
      const sessionId = (sessionResponse.data as any)?.id
      if (!sessionId) {
        return {
          error: "Failed to create session for analysis",
          status: 500
        }
      }
      
      // Now call the analysis endpoint
      return fetchAPI(`/analysis/analyze`, {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          transcript: transcript
        }),
      })
    })
  },
}

// Transcription API - Enhanced with missing endpoints
export const transcriptionAPI = {
  // Upload audio for transcription
  uploadAudio(file: File, sessionId?: string, options?: any) {
    const formData = new FormData()
    formData.append("audio", file) // Backend expects "audio" not "file"
    
    if (options?.language) {
      formData.append("language", options.language)
    }
    if (options?.format) {
      formData.append("format", options.format)
    }
    if (options?.speaker_detection !== undefined) {
      formData.append("speaker_detection", options.speaker_detection.toString())
    }

    if (DEBUG_API) {
      console.log("🎵 Transcription Upload Debug:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => [
          key, 
          value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
        ])
      })
    }

    // Use the correct endpoint from backend transcription_routes.py
    return fetchAPI("/transcribe", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  },

  // Get transcription status
  getTranscriptionStatus(transcriptionId: string) {
    return fetchAPI(`/transcribe/${transcriptionId}`)
  },

  // Get transcription result
  getTranscriptionResult(transcriptionId: string) {
    return fetchAPI(`/transcribe/${transcriptionId}/result`)
  },

  // Link transcription to session
  linkToSession(transcriptionId: string, sessionId: string) {
    return fetchAPI(`/transcribe/${transcriptionId}/link`, {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    })
  },
}

// Types
export interface User {
  id: string
  name: string
  email: string
  is_admin: boolean
  role?: string
  picture?: string
  created_at?: string
  disabled?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface GoogleAuthData {
  email: string
  name: string
  picture: string
  googleId: string
}

export interface Session {
  id: string
  title: string
  date: string
  description?: string
  duration?: number
  transcript?: string
  status?: string
  analysis_status?: string
  created_at?: string
  updated_at?: string
  user_id?: string
}

export interface SessionAnalysis {
  insights: string[]
  action_items: string[]
  sentiment: string
  topics: string[]
  elements: SessionElements
}

export interface SessionElements {
  emotions: Emotion[]
  contexts: Context[]
  practices: Practice[]
  challenges: Challenge[]
  commitments: Commitment[]
  insights: SessionInsight[]
}

export interface Emotion {
  emotion: string
  intensity: number
  topic: string
  timestamp: string
  context: string
}

export interface Context {
  category: string
  belief: string
  topic: string
  timestamp: string
  explanation: string
}

export interface Practice {
  practice: string
  topic: string
  timestamp: string
  frequency: string
  related_insight: string
}

export interface Challenge {
  challenge: string
  topic: string
  timestamp: string
  impact: string
}

export interface Commitment {
  commitment: string
  topic: string
  timestamp: string
  due_date: string
  status: string
}

export interface SessionInsight {
  insight: string
  topic: string
  timestamp: string
  implications: string
  potential_practice: string
}

export interface SessionTranscript {
  text: string
  segments: TranscriptSegment[]
}

export interface TranscriptSegment {
  start: number
  end: number
  text: string
  speaker: string
}

export interface AdminSettings {
  max_sessions: number
  max_duration: number
  allowed_file_types: string[]
  analysis_elements: AnalysisElement[]
}

export interface AnalysisElement {
  name: string
  enabled: boolean
  description: string
  categories: string[]
  format_template: string
  system_instructions?: string
  analysis_instructions?: string
}

export interface UserProfile {
  settings: UserSettings
}

export interface UserSettings {
  max_sessions: number
  max_duration: number
  allowed_file_types: string[]
  analysis_prompt_template?: string
  notification_preferences?: {
    email: boolean
    push: boolean
  }
}

// Additional types for existing components
export interface ActionItem {
  id: string
  title: string
  description: string
  dueDate: string
  status: "completed" | "in_progress" | "not_started"
  priority: "high" | "medium" | "low"
  topic?: string
  sessionId: string
  sessionTitle?: string
  due_date?: string // API uses snake_case
  notes?: string
}

export interface InsightItem {
  id: string
  type: "emotion" | "context" | "commitment" | "challenge" | "insight"
  content: string
  topic: string
  timestamp: string
  sessionId: string
  sessionTitle: string
  additionalInfo?: string
}

export interface TranscriptionRequest {
  file: File
  session_id?: string
}

export interface AnalysisRequest {
  transcript: string
}

// Settings API
export const settingsAPI = {
  // User settings
  getUserSettings: async (): Promise<any> => {
    const token = getAuthToken()
    if (!token) throw new Error('No authentication token')

    const response = await fetch(`${API_BASE_URL}/settings/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get user settings: ${response.statusText}`)
    }

    return response.json()
  },

  updateUserSettings: async (settings: any): Promise<any> => {
    const token = getAuthToken()
    if (!token) throw new Error('No authentication token')

    const response = await fetch(`${API_BASE_URL}/settings/user`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      throw new Error(`Failed to update user settings: ${response.statusText}`)
    }

    return response.json()
  },

  // Admin settings (admin only)
  getAdminSettings: async (): Promise<any> => {
    const token = getAuthToken()
    if (!token) throw new Error('No authentication token')

    const response = await fetch(`${API_BASE_URL}/settings/admin`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get admin settings: ${response.statusText}`)
    }

    return response.json()
  },

  updateAdminSettings: async (settings: any): Promise<any> => {
    const token = getAuthToken()
    if (!token) throw new Error('No authentication token')

    const response = await fetch(`${API_BASE_URL}/settings/admin`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      throw new Error(`Failed to update admin settings: ${response.statusText}`)
    }

    return response.json()
  },

  // Admin user management
  getAllUsers: async (): Promise<any> => {
    const token = getAuthToken()
    if (!token) throw new Error('No authentication token')

    const response = await fetch(`${API_BASE_URL}/settings/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get users: ${response.statusText}`)
    }

    return response.json()
  },

  updateUser: async (userId: string, userData: any): Promise<any> => {
    const token = getAuthToken()
    if (!token) throw new Error('No authentication token')

    const response = await fetch(`${API_BASE_URL}/settings/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`)
    }

    return response.json()
  },

  getAdminStats: async (): Promise<any> => {
    const token = getAuthToken()
    if (!token) throw new Error('No authentication token')

    const response = await fetch(`${API_BASE_URL}/settings/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get admin stats: ${response.statusText}`)
    }

    return response.json()
  },
}
