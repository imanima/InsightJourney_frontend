"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { authService } from "./api-services"

// Define the User type
export interface User {
  id: string
  name: string
  email: string
  is_admin: boolean
  settings?: {
    max_sessions: number
    max_duration: number
    allowed_file_types: string[]
    analysis_elements: Array<{
      name: string
      enabled: boolean
      description: string
      format_template: string
    }>
    gpt_settings: {
      model: string
      temperature: number
      max_tokens: number
    }
  }
}

// Define the AuthContextType
interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser()
        if (response.data?.user) {
          setUser(response.data.user)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Starting login process');
      setError(null)
      const response = await authService.login(email, password)
      console.log('AuthContext: Login response received:', response);
      
      if (response.data?.access_token && response.data?.user) {
        console.log('AuthContext: Setting user data:', response.data.user);
        setUser(response.data.user)
        // Redirect to home page after successful login
        window.location.href = '/';
      } else if (response.error) {
        console.log('AuthContext: Login error:', response.error);
        throw new Error(response.error)
      } else {
        console.log('AuthContext: No access token or user data received');
        throw new Error("Login failed: Invalid response from server")
      }
    } catch (error) {
      console.error("AuthContext: Login error caught:", error)
      setError(error instanceof Error ? error.message : "Login failed")
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
      setError(error instanceof Error ? error.message : "Logout failed")
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('AuthContext: Starting registration process');
      setError(null)
      const response = await authService.register(email, password, name)
      console.log('AuthContext: Registration response received:', response);
      
      if (response.data?.user) {
        console.log('AuthContext: Setting user data:', response.data.user);
        setUser(response.data.user)
      } else if (response.error) {
        console.log('AuthContext: Registration error:', response.error);
        throw new Error(response.error)
      } else {
        console.log('AuthContext: No user data received');
        throw new Error("Registration failed: No user data received")
      }
    } catch (error) {
      console.error("AuthContext: Registration error caught:", error)
      setError(error instanceof Error ? error.message : "Registration failed")
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

