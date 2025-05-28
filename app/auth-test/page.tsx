"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthTestPage() {
  const { user, isLoading, login, logout } = useAuth()
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("password")
  const [loginLoading, setLoginLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoginLoading(true)
    setError(null)

    try {
      const result = await login(email, password)

      if (!result.success) {
        setError(result.message || "Login failed")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Custom Auth Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Status:</h3>
              <p>{isLoading ? "Loading..." : user ? "Authenticated" : "Not authenticated"}</p>
            </div>

            {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">{error}</div>}

            {user ? (
              <div>
                <h3 className="font-medium">User Data:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-2">
                  {JSON.stringify(user, null, 2)}
                </pre>
                <Button onClick={logout} className="mt-4">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <Button onClick={handleLogin} disabled={loginLoading} className="w-full">
                  {loginLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

