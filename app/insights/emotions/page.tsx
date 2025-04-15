"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Calendar, Loader2 } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { insightsAPI } from "@/lib/api-client"

export default function EmotionsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emotions, setEmotions] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch insights
        const insightsResponse = await insightsAPI.getInsights()
        if (insightsResponse.data?.insights) {
          // Filter emotions
          setEmotions(insightsResponse.data.insights.filter((insight) => insight.type === "emotion"))
        }
      } catch (err) {
        console.error("Failed to fetch emotions:", err)
        setError("Failed to load emotions. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleEmotionClick = (sessionId: string) => {
    router.push(`/insights/${sessionId}`)
  }

  if (isLoading) {
    return (
      <MobileLayout title="Emotions" showBackButton backUrl="/insights">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading emotions...</span>
        </div>
      </MobileLayout>
    )
  }

  if (error) {
    return (
      <MobileLayout title="Emotions" showBackButton backUrl="/insights">
        <div className="container px-4 py-6">
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            {error}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Emotions" showBackButton backUrl="/insights">
      <div className="container px-4 py-6 pb-16">
        <div className="flex items-center mb-4">
          <Heart className="h-5 w-5 mr-2 text-red-500" />
          <h1 className="text-xl font-bold">All Emotions</h1>
        </div>

        {emotions.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No emotions found</p>
        ) : (
          <div className="space-y-4">
            {emotions.map((emotion) => (
              <Card key={emotion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="cursor-pointer" onClick={() => handleEmotionClick(emotion.sessionId)}>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{emotion.content}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                            Emotion
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {emotion.topic}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(emotion.timestamp)}
                      </div>
                    </div>
                    {emotion.additionalInfo && <p className="text-sm text-gray-600 mt-2">{emotion.additionalInfo}</p>}
                    <p className="text-xs text-gray-500 mt-2">From: {emotion.sessionTitle}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  )
}

