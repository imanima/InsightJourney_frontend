"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Heart, Loader2, Brain, BarChart2, PieChart, LineChart, Trash2 } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { insightsAPI, sessionsAPI } from "@/lib/api-client"
import InsightsOverviewAnalytics from "@/components/insights-overview-analytics"
import EmotionPieChart from "@/components/emotion-pie-chart"
import EmotionTrendsChart from "@/components/emotion-trends-chart"
import { toast } from "react-hot-toast"

export default function InsightsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch sessions
        const sessionsResponse = await sessionsAPI.getSessions()
        if (sessionsResponse.data) {
          const sessionsData = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : []
          
          // For each session, fetch its analysis elements to get emotions/insights
          const sessionsWithElements = await Promise.all(
            sessionsData.slice(0, 5).map(async (session: any) => {
              try {
                const elementsResponse = await sessionsAPI.getSessionElements(session.id)
                return {
                  ...session,
                  elements: elementsResponse.data || {}
                }
              } catch (error) {
                console.warn(`Failed to fetch elements for session ${session.id}:`, error)
                return {
                  ...session,
                  elements: {}
                }
              }
            })
          )
          
          setSessions(sessionsWithElements)
        }

        // Fetch user-level insights for analytics
        const insightsResponse = await insightsAPI.getInsights()
        if (insightsResponse.data) {
          setInsights(Array.isArray(insightsResponse.data) ? insightsResponse.data : [])
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

  const handleDeleteSession = async (sessionId: string, sessionTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${sessionTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingSessionId(sessionId)
      toast.loading('Deleting session...', { id: 'delete-session' })

      const response = await sessionsAPI.deleteSession(sessionId)
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Remove the session from the local state
      setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId))
      
      toast.success('Session deleted successfully', { id: 'delete-session' })
    } catch (error) {
      console.error('Error deleting session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete session'
      toast.error(errorMessage, { id: 'delete-session' })
    } finally {
      setDeletingSessionId(null)
    }
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

                // Get emotions from this session's analysis elements
                const sessionElements = session.elements || {}
                const sessionEmotions = sessionElements.emotions || []
                const emotionsToShow = sessionEmotions.slice(0, 2)
                const emotionsCount = sessionEmotions.length

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
                            onClick={() => router.push(`/session-analysis/${sessionId}`)}
                          >
                            View Analysis
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDeleteSession(sessionId, session.title || `Session ${session.id}`)}
                            disabled={deletingSessionId === sessionId}
                          >
                            {deletingSessionId === sessionId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Compact Emotions Summary */}
                      {emotionsToShow.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center text-sm">
                            <Heart className="h-3 w-3 mr-1 text-red-500" />
                            <span className="font-medium text-sm">Emotions:</span>
                            <div className="flex flex-wrap gap-1 ml-2">
                              {emotionsToShow.map((emotion: any, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700">
                                  {emotion.name || emotion.emotion || 'Unknown'}
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
                      
                      {/* Show insights and action items count */}
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        {sessionElements.insights && sessionElements.insights.length > 0 && (
                          <span>{sessionElements.insights.length} insights</span>
                        )}
                        {sessionElements.action_items && sessionElements.action_items.length > 0 && (
                          <span>{sessionElements.action_items.length} action items</span>
                        )}
                      </div>
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

        {/* Analytics Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-purple-500" />
              <h2 className="text-xl font-bold">Analytics Overview</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/insights/analytics")}>
              Full Analytics
            </Button>
          </div>

          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Emotion Insights</h3>
              <div className="h-64">
                <InsightsOverviewAnalytics />
              </div>
            </CardContent>
          </Card>

          {/* Mobile-friendly Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="overflow-hidden">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm flex items-center">
                  <PieChart className="h-4 w-4 mr-1 text-red-500" />
                  Emotion Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-28 flex items-center justify-center">
                  <div className="w-full h-full">
                    <EmotionPieChart
                      data={[
                        { emotion: "Anxiety", count: 24, percentage: 19.35 },
                        { emotion: "Frustration", count: 20, percentage: 16.13 },
                        { emotion: "Fear", count: 15, percentage: 12.37 },
                        { emotion: "Happiness", count: 7, percentage: 5.91 },
                        { emotion: "Other", count: 34, percentage: 46.24 },
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm flex items-center">
                  <LineChart className="h-4 w-4 mr-1 text-blue-500" />
                  Emotion Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-28 flex items-center justify-center">
                  <div className="w-full h-full">
                    <EmotionTrendsChart
                      data={[
                        { session: "S1", date: "10-01", emotion: "Anxiety", intensity: 4.0 },
                        { session: "S2", date: "10-08", emotion: "Anxiety", intensity: 3.5 },
                        { session: "S3", date: "10-15", emotion: "Anxiety", intensity: 3.0 },
                        { session: "S4", date: "10-22", emotion: "Anxiety", intensity: 2.5 },
                        { session: "S5", date: "10-29", emotion: "Anxiety", intensity: 2.0 },
                      ]}
                    />
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

