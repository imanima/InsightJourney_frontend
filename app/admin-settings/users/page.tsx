"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Heart, Users, Settings } from "lucide-react"
import { toast } from "react-hot-toast"
import BaseLayout from "@/components/base-layout"
import { useAuth } from "@/lib/auth-context"
import { settingsAPI, User } from "@/lib/api-client"

export default function AdminUserManagementPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await settingsAPI.getAllUsers()
      if (response.users) {
        setUsers(response.users as User[])
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const updateUserHomePageVersion = async (userId: string, version: string) => {
    if (updating.has(userId)) return

    try {
      setUpdating(prev => new Set([...prev, userId]))
      
      const response = await settingsAPI.updateUser(userId, { home_page_version: version })
      
      if (response.error) {
        throw new Error(response.error)
      }

      toast.success(`Updated home page version to ${version}`)
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, home_page_version: version } 
          : u
      ))
    } catch (error) {
      console.error("Failed to update user home page version:", error)
      toast.error("Failed to update home page version")
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const getVersionBadge = (version?: string) => {
    if (version === "therapy") {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Heart className="w-3 h-3 mr-1" />
          Mental Health
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        <Sparkles className="w-3 h-3 mr-1" />
        Personal Growth
      </Badge>
    )
  }

  if (!user?.is_admin) {
    return (
      <BaseLayout username={user?.name || "User"}>
        <div className="container py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You need admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout username={user?.name || "Admin"}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage user settings including home page experience preferences
          </p>
        </div>

        {/* Home Page Version Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Home Page Version Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Personal Growth</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Empowerment-focused messaging that emphasizes self-discovery, 
                  emotional intelligence, and personal agency.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Mental Health</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Clinical and therapeutic approach with professional language 
                  and evidence-based mental health support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map(user => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {user.is_admin && (
                            <Badge variant="secondary">Admin</Badge>
                          )}
                          {getVersionBadge((user as any).home_page_version)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <label className="text-sm font-medium block mb-1">
                          Home Page Version
                        </label>
                        <Select
                          value={(user as any).home_page_version || "empowerment"}
                          onValueChange={(value) => updateUserHomePageVersion(user.id, value)}
                          disabled={updating.has(user.id)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="empowerment">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Personal Growth
                              </div>
                            </SelectItem>
                            <SelectItem value="therapy">
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4" />
                                Mental Health
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {updating.has(user.id) && (
                        <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{users.length}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-800">
                  {users.filter(u => !(u as any).home_page_version || (u as any).home_page_version === "empowerment").length}
                </div>
                <div className="text-sm text-purple-600">Personal Growth Users</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">
                  {users.filter(u => (u as any).home_page_version === "therapy").length}
                </div>
                <div className="text-sm text-blue-600">Mental Health Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
} 