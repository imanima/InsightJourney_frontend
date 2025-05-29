"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import MobileLayout from "@/components/mobile-layout"
import { sessionsAPI } from "@/lib/api-client"
import InsightsTimeline from "@/components/charts/insights-timeline"
import EmotionTrends from "@/components/charts/emotion-trends"
import TopicKnowledgeGraph from "@/components/charts/topic-knowledge-graph"

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch sessions with their elements
        const sessionsResponse = await sessionsAPI.getSessions()
        if (sessionsResponse.data) {
          const sessionsData = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : []
          
          // For each session, fetch its analysis elements
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
      } catch (err) {
        console.error("Failed to fetch analytics data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <MobileLayout title="Advanced Analytics" showBackButton backUrl="/insights">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2">Loading analytics...</span>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Advanced Analytics" showBackButton backUrl="/insights">
      <div className="container px-4 py-6 pb-16">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold">Advanced Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            Deep dive into your personal development journey with detailed charts and insights
          </p>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No analytics data available</h3>
              <p className="text-gray-500 mb-6">Record some sessions to see advanced analytics and trends</p>
              <Button onClick={() => router.push("/record-insights")}>
                Record Your First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Timeline Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <InsightsTimeline 
                sessions={sessions} 
                onSessionClick={(sessionId: string) => router.push(`/session-analysis/${sessionId}`)}
              />
              <EmotionTrends 
                sessions={sessions}
                onSessionClick={(sessionId: string) => router.push(`/session-analysis/${sessionId}`)}
              />
            </div>
            
            {/* Knowledge Graph */}
            <TopicKnowledgeGraph 
              sessions={sessions}
              onTopicSelect={(topic: string, data: any) => {
                console.log('Selected topic:', topic, data)
                // Future: Could filter sessions or show detailed topic view
              }}
            />

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {sessions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {sessions.reduce((acc, session) => acc + (session.elements?.emotions?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Emotions Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {sessions.reduce((acc, session) => acc + (session.elements?.insights?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Insights Gained</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {sessions.reduce((acc, session) => acc + (session.elements?.action_items?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Action Items</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}

