"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Heart, Loader2, Brain, BarChart2, PieChart } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { insightsAPI, sessionsAPI } from "@/lib/api-client"
import EmotionAnalytics from "@/components/emotion-analytics"

export default function InsightsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch sessions
        const sessionsResponse = await sessionsAPI.getSessions()
        if (sessionsResponse.data) {
          setSessions(sessionsResponse.data)
        }

        // Fetch insights
        const insightsResponse = await insightsAPI.getInsights()
        if (insightsResponse.data?.insights) {
          setInsights(insightsResponse.data.insights)
        }
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load insights data. Please try again.")
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

  const handleSessionClick = (sessionId: string) => {
    router.push(`/insights/${sessionId}`)
  }

  if (isLoading) {
    return (
      <MobileLayout title="Insights">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading insights...</span>
        </div>
      </MobileLayout>
    )
  }

  if (error) {
    return (
      <MobileLayout title="Insights">
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
    <MobileLayout title="Insights">
      <div className="container px-4 py-6 pb-16">
        {/* Improved Analyze Session Button */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg mb-1">Ready to capture new insights?</h3>
                  <p className="text-sm text-muted-foreground">Record and analyze your next session</p>
                </div>
                <Button
                  onClick={() => router.push("/record-insights")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Analyze a New Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions with Summaries */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              <h2 className="text-xl font-bold">Recent Sessions</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/sessions")}>
              View All
            </Button>
          </div>

          {sessions.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No sessions found</p>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 3).map((session) => {
                const sessionId = session.id?.toString() || ""

                // Filter insights and action items for this session
                const sessionEmotions = insights
                  .filter((i) => i.sessionId === sessionId && i.type === "emotion")
                  .slice(0, 2)

                const emotionsCount = insights.filter((i) => i.sessionId === sessionId && i.type === "emotion").length

                return (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{session.title || `Session ${session.id}`}</h3>
                          <p className="text-xs text-gray-500">
                            {formatDate(session.timestamp || session.date || new Date().toISOString())}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-500"
                            onClick={() => router.push(`/insights/session-analytics/${sessionId}`)}
                          >
                            Analytics
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleSessionClick(sessionId)}>
                            Details
                          </Button>
                        </div>
                      </div>

                      {/* Compact Emotions Summary */}
                      {sessionEmotions.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center text-sm">
                            <Heart className="h-3 w-3 mr-1 text-red-500" />
                            <span className="font-medium text-sm">Emotions:</span>
                            <div className="flex flex-wrap gap-1 ml-2">
                              {sessionEmotions.map((emotion) => (
                                <Badge key={emotion.id} variant="outline" className="text-xs bg-red-50 text-red-700">
                                  {(emotion.content || "").split(" ")[0]}
                                </Badge>
                              ))}
                              {emotionsCount > 2 && (
                                <Badge variant="outline" className="text-xs bg-gray-100">
                                  +{emotionsCount - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}

              {sessions.length > 3 && (
                <Button variant="outline" className="w-full" onClick={() => router.push("/sessions")}>
                  View All Sessions
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Session Emotion Analytics Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-purple-500" />
              <h2 className="text-xl font-bold">Emotion Analytics</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/insights/analytics")}>
              Full Analytics
            </Button>
          </div>

          <Card className="mb-4">
            <CardContent className="p-4">
              <EmotionAnalytics showSummary={true} showTabs={true} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            <Card className="overflow-hidden">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm flex items-center">
                  <Heart className="h-4 w-4 mr-1 text-red-500" />
                  Top Emotions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-1">
                  {["Anxiety", "Frustration", "Fear", "Excitement", "Joy"].map((emotion) => (
                    <Badge key={emotion} variant="outline" className="text-xs bg-red-50 text-red-700">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm flex items-center">
                  <PieChart className="h-4 w-4 mr-1 text-blue-500" />
                  Emotion by Topic
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Work:</span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Health:</span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Relationships:</span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}

