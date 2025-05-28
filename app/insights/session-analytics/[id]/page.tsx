"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import EmotionAnalytics from "@/components/emotion-analytics"
import { sessionsAPI } from "@/lib/api-client"

export default function SessionAnalyticsPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()
  const sessionId = params.id

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true)
        const sessionResponse = await sessionsAPI.getSessionById(Number(sessionId))

        if (sessionResponse.data) {
          setSession(sessionResponse.data)
        } else {
          setError("Session not found")
        }
      } catch (err) {
        console.error("Failed to fetch session:", err)
        setError("Failed to load session data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  if (isLoading) {
    return (
      <MobileLayout title="Session Analytics" showBackButton backUrl="/insights">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading session analytics...</span>
        </div>
      </MobileLayout>
    )
  }

  if (error || !session) {
    return (
      <MobileLayout title="Session Analytics" showBackButton backUrl="/insights">
        <div className="container px-4 py-6">
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            {error || "Session not found"}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push("/insights")}>
              Back to Insights
            </Button>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Session Analytics" showBackButton backUrl="/insights">
      <div className="container px-4 py-6 pb-16">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>{session.title || `Session ${session.id}`}</CardTitle>
            <p className="text-sm text-gray-500">
              {formatDate(session.timestamp || session.date || new Date().toISOString())}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                {session.client_name && (
                  <p className="text-sm">
                    <span className="font-medium">Client:</span> {session.client_name}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push(`/insights/${sessionId}`)}>
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Session Emotion Analytics</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Pass the session ID to the EmotionAnalytics component */}
            <EmotionAnalytics sessionId={sessionId} />
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}

