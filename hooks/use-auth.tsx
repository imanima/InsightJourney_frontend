/**
 * Authentication context and hook for Insight Journey
 * Provides auth state management and authentication methods
 */
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api-client';
import { 
  AuthUser, 
  AuthState, 
  getAuthToken, 
  isAuthenticated, 
  clearAuthToken,
  getAuthUser 
} from '@/lib/auth-utils';

// Create auth context with initial state
const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}>({
  state: {
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  },
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
});

// Auth Provider component that wraps the application
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  // Function to initialize auth state from storage
  const initAuthState = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Check if token exists in storage
      if (isAuthenticated()) {
        // If we have a cached user, use it immediately
        const cachedUser = getAuthUser();
        if (cachedUser) {
          setState({
            isAuthenticated: true,
            user: cachedUser,
            loading: false,
            error: null,
          });
        }

        // Then try to refresh user data from API
        try {
          const response = await authAPI.getCurrentUser();
          if (response.data) {
            setState({
              isAuthenticated: true,
              user: response.data,
              loading: false,
              error: null,
            });
          } else if (response.error) {
            // If API call fails, clear token and set unauthenticated
            clearAuthToken();
            setState({
              isAuthenticated: false,
              user: null,
              loading: false,
              error: response.error,
            });
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to authenticate with server',
          }));
        }
      } else {
        // No token found, set unauthenticated
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Failed to initialize authentication',
      });
    }
  };

  // Initialize auth state on component mount
  useEffect(() => {
    initAuthState();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authAPI.login(email, password);
      
      if (response.error || !response.data) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Login failed',
        }));
        return false;
      }
      
      // Get user details after successful login
      const userResponse = await authAPI.getCurrentUser();
      
      if (userResponse.error || !userResponse.data) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: userResponse.error || 'Failed to get user details',
        }));
        return false;
      }
      
      // Update state with user data
      setState({
        isAuthenticated: true,
        user: userResponse.data,
        loading: false,
        error: null,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
      return false;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authAPI.register({ name, email, password });
      
      if (response.error || !response.data) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Registration failed',
        }));
        return false;
      }
      
      // After registration, try to login automatically
      return await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await authAPI.logout();
      
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
    }
  };

  // Function to refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await authAPI.getCurrentUser();
      
      if (response.data) {
        setState({
          isAuthenticated: true,
          user: response.data,
          loading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Failed to refresh user data',
        }));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
