"use client"

import { useState } from 'react'
import { authService } from '@/lib/api-services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AuthTestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await authService.register(email, password, name)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Registration successful. Please log in.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Registration failed' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await authService.login(email, password)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setUserData(result.data?.user)
        setIsLoggedIn(true)
        setMessage({ type: 'success', text: 'Login successful!' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Login failed' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUserData(null)
      setIsLoggedIn(false)
      setMessage({ type: 'success', text: 'Logged out successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Logout failed' })
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentUser = async () => {
    setIsLoading(true)
    try {
      const response = await authService.getCurrentUser()
      
      if (response.error) {
        setMessage({ type: 'error', text: response.error })
      } else if (response.data?.user) {
        setUserData(response.data.user)
        setMessage({ type: 'success', text: 'User data retrieved successfully' })
      } else {
        setMessage({ type: 'error', text: 'No user data returned' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to get user data' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Authentication API Test</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create a new account to test the API</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Name</Label>
                <Input 
                  id="register-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input 
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input 
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Login with your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input 
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input 
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* User Info & Actions */}
      {isLoggedIn && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Details of the currently logged in user</CardDescription>
          </CardHeader>
          <CardContent>
            {userData && (
              <div className="p-4 bg-gray-50 rounded-md">
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(userData, null, 2)}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button onClick={getCurrentUser} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Get Current User'}
            </Button>
            <Button onClick={handleLogout} disabled={isLoading} variant="destructive">
              {isLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Message Display */}
      {message && (
        <Alert className={`mt-6 ${message.type === 'error' ? 'bg-red-100' : 'bg-green-100'}`}>
          <AlertTitle>{message.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

