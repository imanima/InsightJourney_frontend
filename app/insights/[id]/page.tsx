"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Lightbulb, CheckSquare, Clock, Calendar, Loader2 } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { sessionsAPI, insightsAPI, actionItemsAPI } from "@/lib/api-client"

export default function SessionInsightsPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [emotions, setEmotions] = useState<any[]>([])
  const [actionItems, setActionItems] = useState<any[]>([])
  const router = useRouter()
  const sessionId = params.id

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch session details
        const sessionResponse = await sessionsAPI.getSessionById(Number(sessionId))
        if (sessionResponse.data) {
          setSession(sessionResponse.data)
        }

        // Fetch insights for this session
        const insightsResponse = await insightsAPI.getInsights()
        if (insightsResponse.data?.insights) {
          const sessionInsights = insightsResponse.data.insights.filter((insight) => insight.sessionId === sessionId)
          setInsights(sessionInsights)

          // Filter emotions
          setEmotions(sessionInsights.filter((insight) => insight.type === "emotion"))
        }

        // Fetch action items for this session
        const actionItemsResponse = await actionItemsAPI.getActionItems()
        if (actionItemsResponse.actionItems) {
          const sessionActionItems = actionItemsResponse.actionItems.filter((item) => item.sessionId === sessionId)
          setActionItems(sessionActionItems)
        }
      } catch (err) {
        console.error("Failed to fetch session data:", err)
        setError("Failed to load session insights. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [sessionId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  // Sort emotions by timestamp to show progression over time
  const sortedEmotions = [...emotions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  if (isLoading) {
    return (
      <MobileLayout showBackButton backUrl="/insights" title="Session Insights">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading session insights...</span>
        </div>
      </MobileLayout>
    )
  }

  if (error || !session) {
    return (
      <MobileLayout showBackButton backUrl="/insights" title="Session Insights">
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
    <MobileLayout showBackButton backUrl="/insights" title="Session Insights">
      <div className="container px-4 py-6 pb-16">
        {/* Session Header */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h1 className="text-xl font-bold">{session.title || `Session ${session.id}`}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(session.timestamp || session.date)}</span>
            </div>
            {session.client_name && (
              <p className="text-sm mt-2">
                <span className="font-medium">Client:</span> {session.client_name}
              </p>
            )}
            {session.notes && (
              <p className="text-sm mt-2">
                <span className="font-medium">Notes:</span> {session.notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tabs for different insight types */}
        <Tabs defaultValue="emotions">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="emotions" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>Emotions</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-1">
              <CheckSquare className="h-4 w-4" />
              <span>Actions</span>
            </TabsTrigger>
          </TabsList>

          {/* Emotions Timeline */}
          <TabsContent value="emotions">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Emotions Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedEmotions.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No emotions recorded in this session</p>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    {/* Emotion entries */}
                    <div className="space-y-4">
                      {sortedEmotions.map((emotion, index) => (
                        <div key={emotion.id} className="flex ml-4 pl-6 relative">
                          {/* Timeline dot */}
                          <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-red-500"></div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between">
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
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(emotion.timestamp)}
                              </div>
                            </div>
                            {emotion.additionalInfo && (
                              <p className="text-sm text-gray-600 mt-1">{emotion.additionalInfo}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights List */}
          <TabsContent value="insights">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                {insights.filter((i) => i.type === "insight" || i.type === "context").length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No insights recorded in this session</p>
                ) : (
                  <div className="space-y-4">
                    {insights
                      .filter((i) => i.type === "insight" || i.type === "context")
                      .map((insight) => (
                        <div key={insight.id} className="p-3 border rounded-md">
                          <div>
                            <h3 className="font-medium">{insight.content}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  insight.type === "insight"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {insight.type === "insight" ? "Insight" : "Context"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {insight.topic}
                              </Badge>
                            </div>
                          </div>
                          {insight.additionalInfo && (
                            <p className="text-sm text-gray-600 mt-2">{insight.additionalInfo}</p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Items */}
          <TabsContent value="actions">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                {actionItems.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No action items from this session</p>
                ) : (
                  <div className="space-y-4">
                    {actionItems.map((item) => (
                      <div key={item.id} className="p-3 border rounded-md">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                item.status === "completed"
                                  ? "bg-green-50 text-green-700"
                                  : item.status === "in_progress"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-gray-50 text-gray-700"
                              }`}
                            >
                              {item.status === "completed"
                                ? "Completed"
                                : item.status === "in_progress"
                                  ? "In Progress"
                                  : "Not Started"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.topic}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                item.priority === "high"
                                  ? "bg-red-50 text-red-700"
                                  : item.priority === "medium"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-green-50 text-green-700"
                              }`}
                            >
                              {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-2">Due: {formatDate(item.dueDate)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  )
}

