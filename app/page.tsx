"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import MobileLayout from "@/components/mobile-layout"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Heart, Sparkles } from "lucide-react"
import HomeEmpowermentVersion from "@/components/home-empowerment-version"
import HomeTherapyVersion from "@/components/home-therapy-version"
import { useAuth } from "@/lib/auth-context"
import { userAPI } from "@/lib/api-client"

type HomeVersion = "empowerment" | "therapy"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const [homeVersion, setHomeVersion] = useState<HomeVersion>("empowerment")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preference from backend settings or localStorage on mount
  useEffect(() => {
    async function loadHomePageVersion() {
      if (isLoading) return
      
      if (user) {
        // User is authenticated - fetch from backend settings
        try {
          const response = await userAPI.getSettings()
          const settings = response.data as any
          if (settings?.home_page_version) {
            const backendVersion = settings.home_page_version as HomeVersion
            if (backendVersion === "empowerment" || backendVersion === "therapy") {
              setHomeVersion(backendVersion)
            }
          }
        } catch (error) {
          console.log("Could not fetch user settings, using default")
          // Fall back to localStorage for now if backend fails
          const savedVersion = localStorage.getItem("homePageVersion") as HomeVersion
          if (savedVersion && (savedVersion === "empowerment" || savedVersion === "therapy")) {
            setHomeVersion(savedVersion)
          }
        }
      } else {
        // User is not authenticated - use localStorage
        const savedVersion = localStorage.getItem("homePageVersion") as HomeVersion
        if (savedVersion && (savedVersion === "empowerment" || savedVersion === "therapy")) {
          setHomeVersion(savedVersion)
        }
      }
      
      setIsLoaded(true)
    }
    
    loadHomePageVersion()
  }, [user, isLoading])

  // Save preference to backend settings and localStorage when changed
  const handleVersionChange = async (value: string) => {
    const newVersion = value as HomeVersion
    setHomeVersion(newVersion)
    
    // Always save to localStorage as backup
    localStorage.setItem("homePageVersion", newVersion)
    
    // If user is authenticated, also save to backend
    if (user) {
      try {
        // Get current settings
        const currentSettings = await userAPI.getSettings()
        const settings = (currentSettings.data as any) || {}
        
        // Update with new home page version
        const updatedSettings = {
          ...settings,
          home_page_version: newVersion
        }
        
        // Save updated settings
        await userAPI.updateSettings(updatedSettings)
      } catch (error) {
        console.error("Failed to save home page version to backend:", error)
        // Continue anyway since we saved to localStorage
      }
    }
  }

  // Don't render until we've loaded the preference
  if (!isLoaded) {
    return (
      <MobileLayout>
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      {/* Version Toggle - Fixed at top */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Choose your approach:</div>
            <ToggleGroup 
              type="single" 
              value={homeVersion} 
              onValueChange={handleVersionChange}
              className="bg-gray-100 rounded-full p-1"
            >
              <ToggleGroupItem 
                value="empowerment" 
                className="data-[state=on]:bg-white data-[state=on]:text-indigo-600 data-[state=on]:shadow-sm rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Personal Growth
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="therapy" 
                className="data-[state=on]:bg-white data-[state=on]:text-blue-600 data-[state=on]:shadow-sm rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
              >
                <Heart className="w-4 h-4 mr-2" />
                Mental Health
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {/* Render the selected version */}
      <div className="transition-all duration-500 ease-in-out">
        {homeVersion === "empowerment" ? (
          <HomeEmpowermentVersion />
        ) : (
          <HomeTherapyVersion />
        )}
      </div>

      {/* Version Info Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-8 text-center">
        <div className="container px-4">
          <p className="text-sm text-gray-600 mb-4">
            You can switch between approaches anytime. Both versions offer the same powerful insights.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              <span>Personal Growth: Empowerment & self-discovery focused</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3" />
              <span>Mental Health: Clinical & therapeutic approach</span>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}

