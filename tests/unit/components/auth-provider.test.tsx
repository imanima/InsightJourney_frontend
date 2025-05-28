/**
 * Unit tests for AuthProvider component
 * Tests authentication context functionality
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/lib/auth-context'

// Test component that uses auth context
const TestComponent = () => {
  const { user, isLoading, login, logout, register } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login('test@example.com', 'password')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
      <button 
        data-testid="register-btn" 
        onClick={() => register('Test User', 'test@example.com', 'password')}
      >
        Register
      </button>
    </div>
  )
}

const renderWithAuthProvider = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    // Reset localStorage and mocks
    localStorage.clear()
    fetchMock.resetMocks()
  })

  it('should render children correctly', () => {
    renderWithAuthProvider(<TestComponent />)
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    expect(screen.getByTestId('user')).toHaveTextContent('No User')
  })

  it('should handle successful login', async () => {
    const user = userEvent.setup()
    
    // Mock successful login response
    fetchMock
      .mockResponseOnce(JSON.stringify({ access_token: 'fake-token', token_type: 'bearer' }))
      .mockResponseOnce(JSON.stringify({ 
        id: '1', 
        email: 'test@example.com', 
        name: 'Test User',
        is_admin: false 
      }))

    renderWithAuthProvider(<TestComponent />)
    
    await user.click(screen.getByTestId('login-btn'))
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('should handle login failure', async () => {
    const user = userEvent.setup()
    
    // Mock failed login response
    fetchMock.mockResponseOnce(
      JSON.stringify({ detail: 'Invalid credentials' }), 
      { status: 401 }
    )

    renderWithAuthProvider(<TestComponent />)
    
    await user.click(screen.getByTestId('login-btn'))
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User')
    })
  })

  it('should handle logout', async () => {
    const user = userEvent.setup()
    
    // Mock login first
    localStorage.setItem('auth_token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ 
      id: '1', 
      email: 'test@example.com', 
      name: 'Test User' 
    }))

    // Mock logout response
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Logged out' }))

    renderWithAuthProvider(<TestComponent />)
    
    await user.click(screen.getByTestId('logout-btn'))
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User')
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  it('should handle registration', async () => {
    const user = userEvent.setup()
    
    // Mock successful registration and login
    fetchMock
      .mockResponseOnce(JSON.stringify({ 
        id: '1', 
        email: 'test@example.com', 
        name: 'Test User' 
      }))
      .mockResponseOnce(JSON.stringify({ access_token: 'fake-token', token_type: 'bearer' }))
      .mockResponseOnce(JSON.stringify({ 
        id: '1', 
        email: 'test@example.com', 
        name: 'Test User',
        is_admin: false 
      }))

    renderWithAuthProvider(<TestComponent />)
    
    await user.click(screen.getByTestId('register-btn'))
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('should restore user from localStorage on mount', async () => {
    // Pre-populate localStorage
    localStorage.setItem('auth_token', 'fake-token')
    
    // Mock successful user data fetch
    fetchMock.mockResponseOnce(JSON.stringify({ 
      id: '1', 
      email: 'test@example.com', 
      name: 'Test User',
      is_admin: false 
    }))

    renderWithAuthProvider(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('should clear invalid token on mount', async () => {
    // Pre-populate localStorage with invalid token
    localStorage.setItem('auth_token', 'invalid-token')
    
    // Mock failed user data fetch
    fetchMock.mockResponseOnce(
      JSON.stringify({ detail: 'Invalid token' }), 
      { status: 401 }
    )

    renderWithAuthProvider(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User')
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })
}) 