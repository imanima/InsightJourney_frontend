"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAuthToken } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Sun, LogOut, User, Shield, Download, Save, Loader2, X, Sparkles, Heart } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { toast } from "react-hot-toast"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

interface UserSettings {
  notifications: boolean
  dark_mode: boolean
  reminder_frequency: string
  privacy_mode: boolean
  max_sessions: number
  max_duration: number
  allowed_file_types: string[]
  gpt_model: string
  transcription_model: string
  max_tokens: number
  temperature: number
  system_prompt_template?: string
  analysis_prompt_template?: string
  home_page_version?: string
}

// GPT Model options - Updated with current OpenAI models (2024/2025)
const GPT_MODEL_OPTIONS = [
  // Reasoning models (o-series) - Best for complex analysis
  { value: "o3", label: "o3 (Most Powerful)", description: "Most powerful reasoning model for complex analysis" },
  { value: "o3-mini", label: "o3 Mini", description: "Small but powerful reasoning model" },
  { value: "o4-mini", label: "o4 Mini", description: "Faster, more affordable reasoning model" },
  { value: "o1", label: "o1", description: "Previous full reasoning model" },
  { value: "o1-pro", label: "o1 Pro", description: "Enhanced o1 with more compute power" },
  
  // Flagship chat models - Versatile and high-intelligence
  { value: "gpt-4.1", label: "GPT-4.1 (Latest Flagship)", description: "Latest flagship GPT model for complex tasks" },
  { value: "gpt-4o", label: "GPT-4o", description: "Fast, intelligent, flexible GPT model" },
  { value: "chatgpt-4o-latest", label: "ChatGPT-4o Latest", description: "GPT-4o model used in ChatGPT" },
  { value: "gpt-4o-audio-preview", label: "GPT-4o Audio Preview", description: "GPT-4o with audio capabilities" },
  
  // Cost-optimized models - Balanced performance and cost
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini", description: "Balanced for intelligence, speed, and cost" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano", description: "Fastest, most cost-effective GPT-4.1 model" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", description: "Fast, affordable small model for focused tasks" },
  { value: "gpt-4o-mini-audio-preview", label: "GPT-4o Mini Audio", description: "Smaller model with audio capabilities" },
  
  // Legacy models (still useful)
  { value: "gpt-4-turbo", label: "GPT-4 Turbo (Legacy)", description: "High performance, 128k context" },
  { value: "gpt-4", label: "GPT-4 (Legacy)", description: "Original GPT-4, reliable and tested" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Legacy)", description: "Fast and cost-effective legacy model" },
]

// Transcription Model options
const TRANSCRIPTION_MODEL_OPTIONS = [
  // GPT-4o transcription models (latest)
  { value: "gpt-4o-transcribe", label: "GPT-4o Transcribe", description: "Speech-to-text model powered by GPT-4o" },
  { value: "gpt-4o-mini-transcribe", label: "GPT-4o Mini Transcribe", description: "Speech-to-text model powered by GPT-4o mini" },
  
  // Whisper models (proven and reliable)
  { value: "whisper-1", label: "Whisper-1", description: "General-purpose speech recognition model" },
]

// Temperature options with descriptions
const TEMPERATURE_OPTIONS = [
  { value: 0.0, label: "0.0 - Deterministic", description: "Most focused and consistent" },
  { value: 0.1, label: "0.1 - Very Low", description: "Highly focused" },
  { value: 0.3, label: "0.3 - Low", description: "Focused with slight variation" },
  { value: 0.5, label: "0.5 - Balanced", description: "Good balance" },
  { value: 0.7, label: "0.7 - Creative", description: "More creative responses" },
  { value: 0.9, label: "0.9 - High", description: "Very creative" },
  { value: 1.0, label: "1.0 - Maximum", description: "Most creative and varied" },
]

// Max tokens options
const MAX_TOKENS_OPTIONS = [
  { value: 500, label: "500 tokens", description: "Short responses" },
  { value: 1000, label: "1000 tokens", description: "Medium responses" },
  { value: 1500, label: "1500 tokens", description: "Detailed responses" },
  { value: 2000, label: "2000 tokens", description: "Long responses" },
  { value: 3000, label: "3000 tokens", description: "Very detailed" },
  { value: 4000, label: "4000 tokens", description: "Maximum detail" },
]

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    dark_mode: false,
    reminder_frequency: "weekly",
    privacy_mode: false,
    max_sessions: 10,
    max_duration: 3600,
    allowed_file_types: ["mp3", "wav", "m4a", "txt"],
    gpt_model: "gpt-4.1-mini",
    transcription_model: "gpt-4o-transcribe",
    max_tokens: 1500,
    temperature: 0.7,
    system_prompt_template: "",
    analysis_prompt_template: "",
    home_page_version: "empowerment",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(null)
  const [defaultPrompt, setDefaultPrompt] = useState<string>("")
  const [loadingDefaultPrompt, setLoadingDefaultPrompt] = useState(false)

  // Load user settings on component mount
  useEffect(() => {
    loadUserSettings()
  }, [])

  // Track changes - improved logic
  useEffect(() => {
    if (originalSettings) {
      // Deep comparison of settings objects
      const currentSettingsString = JSON.stringify(settings)
      const originalSettingsString = JSON.stringify(originalSettings)
      const changed = currentSettingsString !== originalSettingsString
      
      console.log('🔍 Change Detection:', {
        hasOriginal: !!originalSettings,
        currentLength: currentSettingsString.length,
        originalLength: originalSettingsString.length,
        changed,
        currentGPT: settings.gpt_model,
        originalGPT: originalSettings.gpt_model
      })
      
      setHasChanges(changed)
    }
  }, [settings, originalSettings])

  const loadUserSettings = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      
      if (!token) {
        toast.error('Please log in to access settings')
        return
      }

      const response = await fetch(`${API_BASE_URL}/settings/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📋 Loaded settings from API:', data)
        setSettings(data)
        setOriginalSettings(JSON.parse(JSON.stringify(data))) // Deep copy
      } else if (response.status === 401) {
        toast.error('Session expired. Please log in again.')
        logout()
      } else {
        // Use default settings if none exist
        console.log('📋 No settings found, using defaults')
        const defaultSettings = {
          notifications: true,
          dark_mode: false,
          reminder_frequency: "weekly",
          privacy_mode: false,
          max_sessions: 10,
          max_duration: 3600,
          allowed_file_types: ["mp3", "wav", "m4a", "txt"],
          gpt_model: "gpt-4.1-mini",
          transcription_model: "gpt-4o-transcribe",
          max_tokens: 1500,
          temperature: 0.7,
          system_prompt_template: "",
          analysis_prompt_template: "",
          home_page_version: "empowerment",
        }
        setSettings(defaultSettings)
        setOriginalSettings(JSON.parse(JSON.stringify(defaultSettings))) // Deep copy
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const token = getAuthToken()
      
      if (!token) {
        toast.error('Please log in to save settings')
        return
      }

      console.log('💾 Saving settings:', settings)

      const response = await fetch(`${API_BASE_URL}/settings/user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('Settings saved successfully!')
        setOriginalSettings(JSON.parse(JSON.stringify(settings))) // Deep copy
        setHasChanges(false)
        console.log('✅ Settings saved successfully')
      } else if (response.status === 401) {
        toast.error('Session expired. Please log in again.')
        logout()
      } else {
        const errorData = await response.json()
        toast.error(errorData.detail || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (setting: keyof UserSettings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }))
  }

  const handleSelectChange = (field: keyof UserSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSignOut = () => {
    logout()
  }

  const exportData = async () => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        toast.error('Please log in to export data')
        return
      }

      // This would be implemented as a separate API endpoint
      toast.success('Data export feature coming soon!')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    }
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

  const loadDefaultPrompt = async () => {
    try {
      setLoadingDefaultPrompt(true)
      const token = getAuthToken()
      
      if (!token) {
        toast.error('Please log in to load default prompt')
        return
      }

      const response = await fetch(`${API_BASE_URL}/settings/default-prompt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📋 Loaded default prompt from API:', data)
        setDefaultPrompt(data.analysis_prompt_template)
        
        // Optionally set it as the current analysis prompt template
        setSettings(prev => ({
          ...prev,
          analysis_prompt_template: data.analysis_prompt_template
        }))
        
        toast.success('Default prompt template loaded!')
      } else if (response.status === 401) {
        toast.error('Session expired. Please log in again.')
        logout()
      } else {
        toast.error('Failed to load default prompt template')
      }
    } catch (error) {
      console.error('Error loading default prompt:', error)
      toast.error('Failed to load default prompt template')
    } finally {
      setLoadingDefaultPrompt(false)
    }
  }

  if (loading) {
    return (
      <MobileLayout title="Settings">
        <div className="container px-4 py-6 pb-16 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading settings...</span>
          </div>
        </div>
      </MobileLayout>
    )
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
                {user.is_admin && (
                  <p className="text-xs text-blue-600 font-medium">Administrator</p>
                )}
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
                value={settings.reminder_frequency}
                onValueChange={(value) => handleSelectChange("reminder_frequency", value)}
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
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="flex flex-col gap-1">
                <span>Dark Mode</span>
                <span className="font-normal text-sm text-muted-foreground">Switch between light and dark theme</span>
              </Label>
              <Switch 
                id="darkMode" 
                checked={settings.dark_mode} 
                onCheckedChange={() => handleToggle("dark_mode")} 
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="homePageVersion" className="flex flex-col gap-1">
                <span>Home Page Experience</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Choose your preferred home page messaging style
                </span>
              </Label>
              <Select
                value={settings.home_page_version || "empowerment"}
                onValueChange={(value) => handleSelectChange("home_page_version", value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empowerment">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <div className="flex flex-col">
                        <span className="font-medium">Personal Growth</span>
                        <span className="text-xs text-muted-foreground">Self-discovery focused</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="therapy">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-blue-600" />
                      <div className="flex flex-col">
                        <span className="font-medium">Mental Health</span>
                        <span className="text-xs text-muted-foreground">Clinical approach</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Home page version explanation */}
            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-md">
              {(settings.home_page_version || "empowerment") === "empowerment" ? (
                <span>🌟 <strong>Personal Growth</strong> uses empowering language focused on self-discovery and emotional intelligence.</span>
              ) : (
                <span>🏥 <strong>Mental Health</strong> uses clinical language with therapeutic frameworks and professional support messaging.</span>
              )}
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
                checked={settings.privacy_mode}
                onCheckedChange={() => handleToggle("privacy_mode")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dataExport" className="flex flex-col gap-1">
                <span>Data Export</span>
                <span className="font-normal text-sm text-muted-foreground">Download all your data and insights</span>
              </Label>
              <Button variant="outline" size="sm" className="gap-1" onClick={exportData}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session Limits */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Session Limits</CardTitle>
            <CardDescription>Configure your session preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1">
                <span>Max Sessions</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Maximum number of sessions you can create
                </span>
              </Label>
              <span className="text-sm font-medium">{settings.max_sessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1">
                <span>Max Duration</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Maximum session duration in seconds
                </span>
              </Label>
              <span className="text-sm font-medium">{Math.floor(settings.max_duration / 60)} minutes</span>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Analysis Settings
            </CardTitle>
            <CardDescription>Configure AI analysis parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="flex flex-col gap-1">
                <span>GPT Model</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Choose the AI model for analysis
                </span>
              </Label>
              <Select
                value={settings.gpt_model}
                onValueChange={(value) => handleSelectChange("gpt_model", value)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select GPT model" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {GPT_MODEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="flex flex-col gap-1">
                <span>Transcription Model</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Choose the AI model for audio transcription
                </span>
              </Label>
              <Select
                value={settings.transcription_model}
                onValueChange={(value) => handleSelectChange("transcription_model", value)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select transcription model" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSCRIPTION_MODEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Transcription model recommendation */}
            <div className="text-xs text-muted-foreground bg-purple-50 p-3 rounded-md">
              {settings.transcription_model.includes('gpt-4o-transcribe') && (
                <span>🎯 <strong>GPT-4o Transcribe</strong> offers the highest accuracy for speech-to-text conversion.</span>
              )}
              {settings.transcription_model.includes('gpt-4o-mini-transcribe') && (
                <span>⚡ <strong>GPT-4o Mini Transcribe</strong> provides fast, cost-effective transcription with good accuracy.</span>
              )}
              {settings.transcription_model.includes('whisper') && (
                <span>🔧 <strong>Whisper</strong> is the proven, reliable general-purpose speech recognition model.</span>
              )}
            </div>

            {/* Model recommendation based on selection */}
            <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
              {(settings.gpt_model.includes('o3') || settings.gpt_model.includes('o4') || settings.gpt_model.includes('o1')) && (
                <span>🧠 <strong>Reasoning Models</strong> excel at complex analysis and deep insights - perfect for therapy sessions.</span>
              )}
              {settings.gpt_model.includes('gpt-4.1') && (
                <span>🚀 <strong>GPT-4.1</strong> is the latest flagship model with excellent performance for complex tasks.</span>
              )}
              {settings.gpt_model === 'gpt-4o' && (
                <span>⚡ <strong>GPT-4o</strong> offers fast, intelligent, and flexible analysis with great balance.</span>
              )}
              {settings.gpt_model.includes('chatgpt-4o') && (
                <span>💬 <strong>ChatGPT-4o</strong> uses the same model as ChatGPT for familiar, conversational analysis.</span>
              )}
              {settings.gpt_model.includes('mini') && !settings.gpt_model.includes('o') && (
                <span>💰 <strong>Mini Models</strong> offer great cost-effectiveness while maintaining good quality.</span>
              )}
              {settings.gpt_model.includes('nano') && (
                <span>🏃 <strong>Nano Models</strong> are the fastest and most cost-effective for quick analysis.</span>
              )}
              {settings.gpt_model.includes('audio') && (
                <span>🎵 <strong>Audio Models</strong> can process audio inputs directly - great for voice recordings.</span>
              )}
              {settings.gpt_model.includes('gpt-4-turbo') && (
                <span>🔧 <strong>GPT-4 Turbo</strong> is a reliable legacy model with large context window.</span>
              )}
              {settings.gpt_model === 'gpt-4' && (
                <span>🎯 <strong>GPT-4</strong> is the original, well-tested model with proven reliability.</span>
              )}
              {settings.gpt_model.includes('gpt-3.5') && (
                <span>💸 <strong>GPT-3.5</strong> is the most cost-effective option for basic analysis needs.</span>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex flex-col gap-1">
                <span>Temperature</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Controls creativity vs consistency (0.0 = focused, 1.0 = creative)
                </span>
              </Label>
              <Select
                value={settings.temperature.toString()}
                onValueChange={(value) => setSettings(prev => ({ ...prev, temperature: parseFloat(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select temperature" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPERATURE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded-md">
                💡 <strong>Recommended:</strong> 0.3-0.7 for therapy analysis (balanced focus and insight)
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex flex-col gap-1">
                <span>Max Tokens</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Maximum length of AI responses (more tokens = longer responses)
                </span>
              </Label>
              <Select
                value={settings.max_tokens.toString()}
                onValueChange={(value) => handleSelectChange("max_tokens", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select max tokens" />
                </SelectTrigger>
                <SelectContent>
                  {MAX_TOKENS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded-md">
                💡 <strong>Recommended:</strong> 1500-2000 tokens for detailed therapy insights
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="flex flex-col gap-1">
                <span>Custom System Prompt (Optional)</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Override the default system instructions
                </span>
              </Label>
              <textarea
                id="systemPrompt"
                rows={3}
                value={settings.system_prompt_template || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, system_prompt_template: e.target.value }))}
                placeholder="You are a helpful therapy analysis assistant..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="analysisPrompt" className="flex flex-col gap-1">
                <span>Custom Analysis Prompt (Optional)</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Override the default analysis template
                </span>
              </Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadDefaultPrompt}
                  disabled={loadingDefaultPrompt}
                  className="flex items-center gap-1"
                >
                  {loadingDefaultPrompt ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  {loadingDefaultPrompt ? 'Loading...' : 'Load Default Template'}
                </Button>
                {settings.analysis_prompt_template && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, analysis_prompt_template: "" }))}
                    className="flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </Button>
                )}
              </div>
              <textarea
                id="analysisPrompt"
                rows={12}
                value={settings.analysis_prompt_template || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, analysis_prompt_template: e.target.value }))}
                placeholder="Click 'Load Default Template' to see the default analysis prompt, or write your own custom prompt..."
                className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
              <div className="text-xs text-muted-foreground bg-amber-50 p-3 rounded-md">
                💡 <strong>Tip:</strong> The analysis prompt controls how AI extracts emotions, beliefs, insights, challenges, and action items from session transcripts. 
                Use <code>{"{transcript}"}</code> as a placeholder for the actual transcript content.
                {settings.analysis_prompt_template && (
                  <div className="mt-2">
                    <strong>Current template length:</strong> {settings.analysis_prompt_template.length} characters
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Changes Button - Always visible for better UX */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  {hasChanges ? "You have unsaved changes" : "Save your settings"}
                </p>
                <p className="text-sm text-blue-700">
                  {hasChanges ? "Save your settings to apply changes" : "Click to save current settings to Neo4j"}
                </p>
              </div>
              <Button 
                onClick={saveSettings} 
                disabled={saving} 
                className="gap-2"
                variant={hasChanges ? "default" : "outline"}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info - Temporary for troubleshooting */}
        <Card className="mb-6 border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="text-xs text-gray-600">
              <p><strong>Debug Info:</strong></p>
              <p>Has Changes: {hasChanges ? 'Yes' : 'No'}</p>
              <p>Original Settings Loaded: {originalSettings ? 'Yes' : 'No'}</p>
              <p>Current GPT Model: {settings.gpt_model}</p>
              <p>Current Transcription Model: {settings.transcription_model}</p>
              <p>Original GPT Model: {originalSettings?.gpt_model || 'Not loaded'}</p>
              <p>Original Transcription Model: {originalSettings?.transcription_model || 'Not loaded'}</p>
              <p>Settings JSON: {JSON.stringify(settings, null, 2).substring(0, 100)}...</p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Settings Link */}
        {user?.is_admin && (
          <Card className="mb-6 border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-purple-900">Administrator</p>
                  <p className="text-sm text-purple-700">Access advanced admin settings</p>
                </div>
                <Button variant="outline" asChild>
                  <a href="/admin-settings">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Settings
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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

