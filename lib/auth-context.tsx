"use client"

// Explicitly import React types
import * as React from "react"
import { authAPI } from "./api-client"
import { 
  AuthUser, 
  setAuthToken, 
  clearAuthToken, 
  getAuthToken, 
  getAuthUser, 
  setAuthUser, 
  isAuthenticated, 
  isTokenExpired 
} from "./auth-utils"

// Use our AuthUser type and extend it slightly
export interface User extends AuthUser {
  image?: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
}

// Create the AuthContext
const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  // Login function
  const login = async (email: string, password: string) => {
    setError('')
    setIsLoading(true)
    console.log('Login attempt with email:', email)

    try {
      console.log('Sending login request to auth API')
      const response = await authAPI.login(email, password)
      console.log('Login response received:', JSON.stringify(response, null, 2))
      
      if (response.error || !response.data) {
        const errorMsg = 'Invalid credentials or server error - no token in response';
        setError(errorMsg)
        console.error('[ERROR] Login failed:', errorMsg, 'Response:', response)
        return { success: false, message: errorMsg }
      }
      
      // Get user data from the token
      const userResponse = await authAPI.getCurrentUser()
      if (userResponse.error || !userResponse.data) {
        const errorMsg = 'Failed to get user data';
        setError(errorMsg)
        console.error('[ERROR] Login failed:', errorMsg, 'Response:', userResponse)
        return { success: false, message: errorMsg }
      }
      
      // Convert API user to our User format
      const authUser = userResponse.data as AuthUser
      const user: User = {
        ...authUser,
        image: undefined // No direct mapping for image, can be added if needed
      }
      
      setUser(user)
      localStorage.setItem("redirectAfterLogin", "/insights")
      
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: error instanceof Error ? error.message : "An error occurred during login" }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)
    try {
      // Call logout API to clear the token
      await authAPI.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authAPI.register({
        name,
        email,
        password
      })
      
      if (response.error || !response.data) {
        return { success: false, message: response.error || "Registration failed" }
      }
      
      // If registration successful, log in automatically
      const loginResult = await login(email, password)
      return loginResult
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: error instanceof Error ? error.message : "An error occurred during registration" }
    } finally {
      setIsLoading(false)
    }
  }

  // Check if the user is logged in on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          setUser(null)
          setIsLoading(false)
          return
        }
        
        // Try to get user data from the API
        const response = await authAPI.getCurrentUser()
        if (response.error || !response.data) {
          // If token is invalid, log out
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user")
          setUser(null)
        } else {
          // Convert API user to our User format
          const authUser = response.data as AuthUser
          const user: User = {
            ...authUser,
            image: undefined // No direct mapping for image, can be added if needed
          }
          setUser(user)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Add this effect to persist the user to localStorage
  React.useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [user])

  // Create the context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Create a hook to use the AuthContext
export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

