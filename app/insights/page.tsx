"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Heart, Loader2, Brain, Sparkles, ArrowRight, TrendingUp } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { insightsAPI, sessionsAPI } from "@/lib/api-client"
import { toast } from "react-hot-toast"
import InsightsTimeline from "@/components/charts/insights-timeline"
import EmotionTrends from "@/components/charts/emotion-trends"
import TopicKnowledgeGraph from "@/components/charts/topic-knowledge-graph"

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
            sessionsData.map(async (session: any) => {
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
      <MobileLayout title="Your Journey">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your insights...</span>
        </div>
      </MobileLayout>
    )
  }

  if (error) {
    return (
      <MobileLayout title="Your Journey">
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
    <MobileLayout title="Your Journey">
      <div className="container px-4 py-6 pb-16">
        {/* Hero Section - Journey Invitation */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-0 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 via-purple-100/20 to-pink-100/20"></div>
            <CardContent className="p-8 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Continue Your Journey
                    </h1>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-md">
                    Every reflection adds depth to your story. Ready to explore more of yourself?
                  </p>
                  <Button
                    onClick={() => router.push("/analyze-insights")}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    Reflect & Discover
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-200/50 to-purple-200/50 rounded-full flex items-center justify-center">
                    <Brain className="h-16 w-16 text-indigo-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Journey Visualization */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Emotional Journey</h2>
              <p className="text-gray-600">Visual insights into your personal growth and emotional patterns</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/insights/analytics")} className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Deep Dive
            </Button>
          </div>
          
          {sessions.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Your Journey Awaits</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Begin your path of self-discovery. Each session reveals new insights about your inner world.
                </p>
                <Button onClick={() => router.push("/analyze-insights")} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Your First Reflection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Timeline Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Insights Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InsightsTimeline 
                      sessions={sessions} 
                      onSessionClick={(sessionId: string) => router.push(`/session-analysis/${sessionId}`)}
                    />
                  </CardContent>
                </Card>
                
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-red-50/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Heart className="h-5 w-5 text-red-600" />
                      Emotional Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EmotionTrends 
                      sessions={sessions}
                      onSessionClick={(sessionId: string) => router.push(`/session-analysis/${sessionId}`)}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Knowledge Graph */}
              <div className="mb-8">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Topics & Connections
                    </CardTitle>
                    <p className="text-sm text-gray-600">Discover how different themes connect in your journey</p>
                  </CardHeader>
                  <CardContent>
                    <TopicKnowledgeGraph 
                      sessions={sessions}
                      onTopicSelect={(topic: string, data: any) => {
                        console.log('Selected topic:', topic, data)
                        // Future: Could filter sessions by topic or show detailed view
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Recent Sessions - More Human */}
        {sessions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Recent Reflections</h2>
                <p className="text-gray-600 text-sm">Your latest moments of discovery</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/sessions")}>
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {sessions.slice(0, 3).map((session, index) => {
                const sessionId = session.id?.toString() || ""

                // Get emotions from this session's analysis elements
                const sessionElements = session.elements || {}
                const sessionEmotions = sessionElements.emotions || []
                const emotionsToShow = sessionEmotions.slice(0, 3)

                return (
                  <Card key={session.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-r from-white to-gray-50/50">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            <h3 className="font-semibold text-gray-800">{session.title || `Reflection ${index + 1}`}</h3>
                            <Badge variant="outline" className="text-xs bg-gray-100">
                              {formatDate(session.timestamp || session.date || new Date().toISOString())}
                            </Badge>
                          </div>

                          {/* Emotion Flow */}
                          {emotionsToShow.length > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-gray-700">Emotions experienced:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {emotionsToShow.map((emotion: any, idx: number) => (
                                  <div key={idx} className="px-3 py-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 rounded-full text-xs font-medium">
                                    {emotion.name || emotion.emotion || 'Unknown'}
                                  </div>
                                ))}
                                {sessionEmotions.length > 3 && (
                                  <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    +{sessionEmotions.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Insights Summary */}
                          <div className="flex gap-6 text-sm text-gray-600">
                            {sessionElements.insights && sessionElements.insights.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-yellow-500" />
                                {sessionElements.insights.length} insights
                              </span>
                            )}
                            {sessionElements.action_items && sessionElements.action_items.length > 0 && (
                              <span className="flex items-center gap-1">
                                <ArrowRight className="h-3 w-3 text-green-500" />
                                {sessionElements.action_items.length} actions
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:bg-indigo-50"
                            onClick={() => router.push(`/session-analysis/${sessionId}`)}
                          >
                            Explore
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {sessions.length > 3 && (
                <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                  <CardContent className="p-6 text-center">
                    <Button variant="ghost" className="w-full" onClick={() => router.push("/sessions")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      View All {sessions.length} Reflections
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}

