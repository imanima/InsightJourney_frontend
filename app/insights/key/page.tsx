"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Calendar, Loader2 } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { insightsAPI } from "@/lib/api-client"

export default function KeyInsightsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [insights, setInsights] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch insights
        const insightsResponse = await insightsAPI.getInsights()
        if (insightsResponse.data?.insights) {
          // Filter key insights
          setInsights(insightsResponse.data.insights.filter((insight) => insight.type === "insight"))
        }
      } catch (err) {
        console.error("Failed to fetch insights:", err)
        setError("Failed to load insights. Please try again.")
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

  const handleInsightClick = (sessionId: string) => {
    router.push(`/insights/${sessionId}`)
  }

  if (isLoading) {
    return (
      <MobileLayout title="Key Insights" showBackButton backUrl="/insights">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading insights...</span>
        </div>
      </MobileLayout>
    )
  }

  if (error) {
    return (
      <MobileLayout title="Key Insights" showBackButton backUrl="/insights">
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
    <MobileLayout title="Key Insights" showBackButton backUrl="/insights">
      <div className="container px-4 py-6 pb-16">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          <h1 className="text-xl font-bold">All Key Insights</h1>
        </div>

        {insights.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No key insights found</p>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="cursor-pointer" onClick={() => handleInsightClick(insight.sessionId)}>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{insight.content}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                            Insight
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.topic}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(insight.timestamp)}
                      </div>
                    </div>
                    {insight.additionalInfo && <p className="text-sm text-gray-600 mt-2">{insight.additionalInfo}</p>}
                    <p className="text-xs text-gray-500 mt-2">From: {insight.sessionTitle}</p>
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

