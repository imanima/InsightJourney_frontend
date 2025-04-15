"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import BaseLayout from "@/components/base-layout"
import { useAuth } from "@/lib/auth-context"
import { AnalysisData, analysisService } from "@/lib/analysis-service"

export default function AnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth() // Use our custom auth hook instead of session

  // Get username from our auth context
  const username = user?.name || "Demo User"

  useEffect(() => {
    // Check if there's a pending analysis in session storage
    const pendingAnalysisId = sessionStorage.getItem("pendingAnalysisId")
    const pendingAnalysis = sessionStorage.getItem("pendingAnalysis")

    const fetchAnalysisData = async (sessionId: string) => {
      try {
        // Start by polling for the analysis status
        const analysisResult = await analysisService.pollAnalysisStatus(sessionId)
        
        if (analysisResult.success && analysisResult.data) {
          // Convert the SessionAnalysis data to AnalysisData format
          const data: AnalysisData = {
            emotions: analysisResult.data.elements.emotions || [],
            challenges: analysisResult.data.elements.challenges || [],
            commitments: analysisResult.data.elements.commitments || [],
          }
          setAnalysisData(data)
          
          // Clear the pending analysis flags
          sessionStorage.removeItem("pendingAnalysis")
          sessionStorage.removeItem("pendingAnalysisId")
        } else {
          setError(analysisResult.error || "Failed to fetch analysis data")
        }
      } catch (err) {
        console.error("Error fetching analysis:", err)
        setError("An error occurred while fetching analysis data")
      } finally {
        setLoading(false)
      }
    }

    if (pendingAnalysisId && pendingAnalysis === "true") {
      // If there's a pending analysis, fetch the data
      fetchAnalysisData(pendingAnalysisId)
    } else {
      // If no pending analysis, show content immediately with mock data for demo
      // In a real app, you might want to redirect to a page to select a session
      setTimeout(() => {
        setAnalysisData({
          emotions: [
            {
              emotion: "Joy",
              intensity: 4,
              topic: "Work",
              timestamp: new Date().toISOString(),
              context: "I felt really happy about completing the project ahead of schedule.",
            },
            {
              emotion: "Anxiety",
              intensity: 3,
              topic: "Relationships",
              timestamp: new Date().toISOString(),
              context: "I was worried about how my presentation would be received by the team.",
            },
          ],
          challenges: [
            {
              challenge: "Finding time for self-care with my busy schedule",
              topic: "Health",
              timestamp: new Date().toISOString(),
              impact: "I feel constantly tired and don't have energy for things I enjoy",
            },
            {
              challenge: "Balancing work and personal life",
              topic: "Work",
              timestamp: new Date().toISOString(),
              impact: "I often feel guilty when I'm not working",
            },
          ],
          commitments: [
            {
              commitment: "Schedule at least 30 minutes of exercise three times per week",
              topic: "Health",
              due_date: "2023-12-31",
              status: "Not Started",
              timestamp: new Date().toISOString(),
            },
            {
              commitment: "Practice mindfulness meditation for 10 minutes daily",
              topic: "Health",
              due_date: "2023-12-15",
              status: "In Progress",
              timestamp: new Date().toISOString(),
            },
          ],
        })
        setLoading(false)
      }, 1000)
    }
  }, [])

  if (loading) {
    return (
      <BaseLayout username={username}>
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
          <div className="text-center">
            <div className="mb-4">
              <div className="animate-spin inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
            <h4 className="text-xl font-medium mb-2">Analyzing Your Insights</h4>
            <p className="text-muted-foreground">Please wait while we process your input...</p>
            <div className="mt-4 w-48 mx-auto">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse rounded-full w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </BaseLayout>
    )
  }

  if (error) {
    return (
      <BaseLayout username={username}>
        <div className="container py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Analysis</h2>
            <p className="mb-6 text-red-500">{error}</p>
            <Link 
              href="/record-insights" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
            >
              Record New Insights
            </Link>
          </div>
        </div>
      </BaseLayout>
    )
  }

  if (!analysisData) {
    return (
      <BaseLayout username={username}>
        <div className="container py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Analysis Not Found</h2>
            <p className="mb-6">We couldn't find the analysis you're looking for.</p>
            <Link 
              href="/record-insights" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
            >
              Record New Insights
            </Link>
          </div>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout username={username}>
      <div className="container py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Analysis Results</h1>
            <p className="text-muted-foreground">Here are the insights from your session</p>
          </div>
          <Link
            href="/record-insights"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
          >
            <i className="fas fa-plus mr-2"></i>New Session
          </Link>
        </div>

        {/* Extracted Elements */}
        <div className="space-y-6">
          {/* Emotions Section */}
          {analysisData.emotions && analysisData.emotions.length > 0 && (
            <Card>
              <CardHeader className="bg-white">
                <h5 className="text-lg font-medium flex items-center">
                  <i className="fas fa-heart mr-2 text-red-500"></i>Emotions
                </h5>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisData.emotions.map((emotion, index) => (
                    <div key={index} className="p-4 rounded-md bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h6 className="font-medium">{emotion.emotion}</h6>
                        <Badge variant={emotion.intensity > 3 ? "default" : "secondary"}>
                          {emotion.topic || "General"}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted-foreground">Intensity:</small>
                        <div className="inline-block ml-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-circle text-xs ${i < emotion.intensity ? "text-primary" : "text-gray-300"}`}
                              style={{ fontSize: "0.5rem" }}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="mb-0 text-sm">
                        <small className="text-muted-foreground">Context:</small> {emotion.context}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Challenges Section */}
          {analysisData.challenges && analysisData.challenges.length > 0 && (
            <Card>
              <CardHeader className="bg-white">
                <h5 className="text-lg font-medium flex items-center">
                  <i className="fas fa-mountain mr-2 text-yellow-500"></i>Challenges
                </h5>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisData.challenges.map((challenge, index) => (
                    <div key={index} className="p-4 rounded-md bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <small className="text-muted-foreground">Topic:</small>
                        <Badge variant="outline">{challenge.topic || "General"}</Badge>
                      </div>
                      <p className="mb-1 text-sm font-medium">{challenge.challenge}</p>
                      <p className="mb-0 text-sm">
                        <small className="text-muted-foreground">Impact:</small> {challenge.impact}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Commitments Section */}
          {analysisData.commitments && analysisData.commitments.length > 0 && (
            <Card>
              <CardHeader className="bg-white">
                <h5 className="text-lg font-medium flex items-center">
                  <i className="fas fa-flag mr-2 text-green-500"></i>Commitments
                </h5>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisData.commitments.map((commitment, index) => (
                    <div key={index} className="p-4 rounded-md bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <small className="text-muted-foreground">Topic:</small>
                        <Badge variant="outline">{commitment.topic || "General"}</Badge>
                      </div>
                      <p className="mb-1 text-sm font-medium">{commitment.commitment}</p>
                      <div className="flex justify-between">
                        <p className="mb-0 text-sm">
                          <small className="text-muted-foreground">Due:</small> {commitment.due_date}
                        </p>
                        <Badge variant={commitment.status === "Completed" ? "default" : "secondary"}>
                          {commitment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </BaseLayout>
  )
}

