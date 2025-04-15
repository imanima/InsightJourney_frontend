"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Sun, LogOut, User, Shield, Download } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"

export default function SettingsPage() {
  const { user, logout } = useAuth() // Use our custom auth hook instead of useSession
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    dataExport: false,
    reminderFrequency: "weekly",
    privacyMode: false,
  })

  const handleToggle = (setting: string) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }))
  }

  const handleSignOut = () => {
    logout() // Use our custom logout function
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <MobileLayout title="Settings">
      <div className="container px-4 py-6 pb-16">
        {/* Profile Section */}
        {user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback>{user.name ? getInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href="#profile-settings">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </a>
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex flex-col gap-1">
                <span>Enable Notifications</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Receive notifications about insights and reminders
                </span>
              </Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={() => handleToggle("notifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reminderFrequency" className="flex flex-col gap-1">
                <span>Reminder Frequency</span>
                <span className="font-normal text-sm text-muted-foreground">
                  How often you want to receive reminders
                </span>
              </Label>
              <Select
                value={settings.reminderFrequency}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, reminderFrequency: value }))}
                disabled={!settings.notifications}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="flex flex-col gap-1">
                <span>Dark Mode</span>
                <span className="font-normal text-sm text-muted-foreground">Switch between light and dark theme</span>
              </Label>
              <Switch id="darkMode" checked={settings.darkMode} onCheckedChange={() => handleToggle("darkMode")} />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>Manage your data and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="privacyMode" className="flex flex-col gap-1">
                <span>Enhanced Privacy Mode</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Additional encryption for sensitive data
                </span>
              </Label>
              <Switch
                id="privacyMode"
                checked={settings.privacyMode}
                onCheckedChange={() => handleToggle("privacyMode")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dataExport" className="flex flex-col gap-1">
                <span>Data Export</span>
                <span className="font-normal text-sm text-muted-foreground">Download all your data and insights</span>
              </Label>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        {user && (
          <Button
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>
    </MobileLayout>
  )
}

