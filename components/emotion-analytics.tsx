"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { insightsAPI } from "@/lib/api-client"

// Mock data for emotion analytics
const mockEmotionFrequency = [
  { emotion: "Anxiety", count: 24, percentage: 19.35 },
  { emotion: "Frustration", count: 20, percentage: 16.13 },
  { emotion: "Fear", count: 15, percentage: 12.37 },
  { emotion: "Confidence", count: 8, percentage: 6.99 },
  { emotion: "Happiness", count: 7, percentage: 5.91 },
  { emotion: "Gratitude", count: 6, percentage: 4.84 },
  { emotion: "Overwhelm", count: 5, percentage: 3.76 },
  { emotion: "Excitement", count: 24, percentage: 19.35 },
  { emotion: "Motivation", count: 4, percentage: 3.23 },
  { emotion: "Sleepiness", count: 4, percentage: 3.23 },
  { emotion: "Other", count: 6, percentage: 4.84 },
]

const mockEmotionIntensity = [
  { emotion: "Anxiety", intensity: 4.0 },
  { emotion: "Frustration", intensity: 3.8 },
  { emotion: "Fear", intensity: 3.5 },
  { emotion: "Sadness", intensity: 3.2 },
  { emotion: "Anger", intensity: 4.1 },
  { emotion: "Disappointment", intensity: 3.7 },
  { emotion: "Overwhelm", intensity: 4.2 },
  { emotion: "Stress", intensity: 4.3 },
  { emotion: "Worry", intensity: 3.9 },
  { emotion: "Confusion", intensity: 3.0 },
  { emotion: "Excitement", intensity: 4.0 },
  { emotion: "Happiness", intensity: 3.8 },
  { emotion: "Joy", intensity: 4.2 },
  { emotion: "Gratitude", intensity: 3.9 },
  { emotion: "Pride", intensity: 3.7 },
  { emotion: "Confidence", intensity: 3.5 },
  { emotion: "Relief", intensity: 3.3 },
  { emotion: "Hope", intensity: 3.6 },
  { emotion: "Curiosity", intensity: 3.4 },
  { emotion: "Surprise", intensity: 3.0 },
  { emotion: "Boredom", intensity: 2.0 },
]

const mockEmotionJourney = [
  { session: "Session 1", date: "2023-10-01", emotion: "Anxiety", intensity: 4.0 },
  { session: "Session 2", date: "2023-10-08", emotion: "Anxiety", intensity: 3.0 },
  { session: "Session 3", date: "2023-10-15", emotion: "Anxiety", intensity: 4.0 },
  { session: "Session 4", date: "2023-10-22", emotion: "Anxiety", intensity: 3.2 },
  { session: "Session 5", date: "2023-10-29", emotion: "Anxiety", intensity: 3.0 },
  { session: "Session 6", date: "2023-11-05", emotion: "Anxiety", intensity: 3.5 },
  { session: "Session 7", date: "2023-11-12", emotion: "Anxiety", intensity: 3.0 },
  { session: "Session 8", date: "2023-11-19", emotion: "Anxiety", intensity: 3.0 },
  { session: "Session 9", date: "2023-11-26", emotion: "Anxiety", intensity: 2.5 },
  { session: "Session 10", date: "2023-12-03", emotion: "Anxiety", intensity: 3.0 },
]

const mockSessionEmotions = [
  { time: "00:05", emotion: "Anxiety", intensity: 2 },
  { time: "00:12", emotion: "Frustration", intensity: 3 },
  { time: "00:18", emotion: "Fear", intensity: 3 },
  { time: "00:24", emotion: "Joy", intensity: 4 },
  { time: "00:31", emotion: "Worry", intensity: 3 },
  { time: "00:37", emotion: "Hope", intensity: 3 },
  { time: "00:43", emotion: "Relief", intensity: 3 },
  { time: "00:49", emotion: "Confidence", intensity: 3 },
]

const mockEmotionContexts = [
  {
    emotion: "Anxiety",
    intensity: 2,
    context: "The client expressed mild anxiety while trying to figure out an issue with their project timeline.",
  },
  {
    emotion: "Anxiety",
    intensity: 3,
    context: "The client expressed anxiety about setting up calls with potential clients due to fear of rejection.",
  },
  {
    emotion: "Anxiety",
    intensity: 3,
    context: "The client expressed anxiety about the time they are spending on personal expenses tracking.",
  },
  {
    emotion: "Anxiety",
    intensity: 4,
    context: "The client expressed feeling anxious due to their full-time job.",
  },
  {
    emotion: "Anxiety",
    intensity: 3,
    context:
      "The client is anxious about the time commitment required for travel, especially with their current workload.",
  },
]

const mockSessions = [
  { id: "1", title: "Initial Coaching Session", date: "2023-10-01" },
  { id: "2", title: "Follow-up Session", date: "2023-10-08" },
  { id: "3", title: "Career Discussion", date: "2023-10-15" },
  { id: "4", title: "Work-Life Balance", date: "2023-10-22" },
  { id: "5", title: "Stress Management", date: "2023-10-29" },
  { id: "6", title: "Goal Setting", date: "2023-11-05" },
  { id: "7", title: "Progress Review", date: "2023-11-12" },
  { id: "8", title: "Relationship Dynamics", date: "2023-11-19" },
  { id: "9", title: "Health and Wellness", date: "2023-11-26" },
  { id: "10", title: "Year-End Planning", date: "2023-12-03" },
]

// Mock implementations for the missing chart components
function SessionComparisonChart() {
  // Mock data for session comparison
  const data = [
    {
      session: "Session 1",
      emotions: {
        Anxiety: 4,
        Frustration: 3,
        Fear: 2,
        Excitement: 3,
        Hope: 2,
      },
    },
    {
      session: "Session 5",
      emotions: {
        Anxiety: 3,
        Frustration: 2,
        Fear: 1,
        Excitement: 4,
        Hope: 3,
      },
    },
    {
      session: "Session 10",
      emotions: {
        Anxiety: 2,
        Frustration: 1,
        Fear: 1,
        Excitement: 5,
        Hope: 4,
      },
    },
  ]

  const emotions = ["Anxiety", "Frustration", "Fear", "Excitement", "Hope"]
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]

  // Calculate dimensions for radar chart
  const centerX = 50
  const centerY = 25
  const radius = 20
  const angleStep = (Math.PI * 2) / emotions.length

  // Calculate points for each emotion axis
  const axisPoints = emotions.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2 // Start from top
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      label: emotions[index],
      angle,
    }
  })

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
      {/* Radar grid */}
      {[1, 2, 3, 4, 5].map((level) => {
        const scaledRadius = (level / 5) * radius
        const points = axisPoints
          .map((point) => {
            const x = centerX + scaledRadius * Math.cos(point.angle)
            const y = centerY + scaledRadius * Math.sin(point.angle)
            return `${x},${y}`
          })
          .join(" ")

        return <polygon key={level} points={points} fill="none" stroke="#e5e5e5" strokeWidth="0.2" />
      })}

      {/* Axis lines */}
      {axisPoints.map((point, index) => (
        <g key={index}>
          <line x1={centerX} y1={centerY} x2={point.x} y2={point.y} stroke="#e5e5e5" strokeWidth="0.2" />
          <text
            x={centerX + (radius + 2) * Math.cos(point.angle)}
            y={centerY + (radius + 2) * Math.sin(point.angle)}
            fontSize="2"
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#666"
          >
            {point.label}
          </text>
        </g>
      ))}

      {/* Session data */}
      {data.map((session, sessionIndex) => {
        const points = axisPoints
          .map((point, index) => {
            const emotion = emotions[index]
            const value = session.emotions[emotion as keyof typeof session.emotions] || 0
            const scaledRadius = (value / 5) * radius
            const x = centerX + scaledRadius * Math.cos(point.angle)
            const y = centerY + scaledRadius * Math.sin(point.angle)
            return `${x},${y}`
          })
          .join(" ")

        return (
          <g key={sessionIndex}>
            <polygon
              points={points}
              fill={`${colors[sessionIndex % colors.length]}33`}
              stroke={colors[sessionIndex % colors.length]}
              strokeWidth="0.5"
            />
          </g>
        )
      })}

      {/* Legend */}
      <g transform="translate(80, 5)">
        {data.map((session, index) => (
          <g key={index} transform={`translate(0, ${index * 3})`}>
            <rect width="3" height="1.5" fill={colors[index % colors.length]} />
            <text x="4" y="1" fontSize="1.5" alignmentBaseline="middle">
              {session.session}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

function EmotionTrendsChart({ data }: { data: any[] }) {
  // Group data by emotion
  const emotions = Array.from(new Set(data.map((item) => item.emotion)))

  // Create datasets for each emotion
  const datasets = emotions.map((emotion) => {
    const emotionData = data.filter((item) => item.emotion === emotion)
    return {
      emotion,
      data: emotionData,
    }
  })

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
      {/* Y-axis grid lines */}
      {[0, 1, 2, 3, 4].map((value) => (
        <g key={value}>
          <line
            x1="0"
            y1={50 - (value / 4) * 50}
            x2="100"
            y2={50 - (value / 4) * 50}
            stroke="#e5e5e5"
            strokeWidth="0.2"
          />
          <text x="-1" y={50 - (value / 4) * 50} fontSize="2" textAnchor="end" alignmentBaseline="middle" fill="#666">
            {value}
          </text>
        </g>
      ))}

      {/* Line for each emotion */}
      {datasets.map((dataset, datasetIndex) => {
        const points = dataset.data
          .map((item, index) => {
            const x = (index / (dataset.data.length - 1)) * 100
            const y = 50 - (item.intensity / 4) * 50
            return `${x},${y}`
          })
          .join(" ")

        return (
          <g key={datasetIndex}>
            <polyline points={points} fill="none" stroke={`hsl(${datasetIndex * 60}, 80%, 60%)`} strokeWidth="0.5" />
            {dataset.data.map((item, index) => {
              const x = (index / (dataset.data.length - 1)) * 100
              const y = 50 - (item.intensity / 4) * 50
              return <circle key={index} cx={x} cy={y} r="0.8" fill={`hsl(${datasetIndex * 60}, 80%, 60%)`} />
            })}
          </g>
        )
      })}

      {/* X-axis labels */}
      <g>
        {datasets[0]?.data.map((item, index) => {
          if (index % 2 === 0 || index === datasets[0].data.length - 1) {
            // Show every other label to avoid crowding
            return (
              <text
                key={index}
                x={(index / (datasets[0].data.length - 1)) * 100}
                y="52"
                fontSize="1.5"
                textAnchor="middle"
                fill="#666"
              >
                {item.date.slice(5)}
              </text>
            )
          }
          return null
        })}
      </g>

      {/* Legend */}
      <g transform="translate(80, 5)">
        {datasets.map((dataset, index) => (
          <g key={index} transform={`translate(0, ${index * 3})`}>
            <rect width="3" height="1.5" fill={`hsl(${index * 60}, 80%, 60%)`} />
            <text x="4" y="1" fontSize="1.5" alignmentBaseline="middle" style={{ fontFamily: "Arial, sans-serif" }}>
              {dataset.emotion}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

function SessionEmotionalProfile({ sessionId }: { sessionId?: string }) {
  return <div className="text-center">Session Emotional Profile Placeholder for Session ID: {sessionId}</div>
}

// First, add a new TopicComparisonChart function near the other chart functions (before the EmotionAnalytics component)
function TopicComparisonChart() {
  // Mock data for topic comparison
  const data = [
    {
      topic: "Work",
      emotions: {
        Anxiety: 4.2,
        Frustration: 3.8,
        Fear: 3.1,
        Excitement: 2.5,
        Hope: 2.2,
        Joy: 2.0,
      },
    },
    {
      topic: "Health",
      emotions: {
        Anxiety: 2.8,
        Frustration: 2.2,
        Fear: 1.9,
        Excitement: 3.7,
        Hope: 3.5,
        Joy: 3.2,
      },
    },
    {
      topic: "Relationships",
      emotions: {
        Anxiety: 3.2,
        Frustration: 3.5,
        Fear: 2.8,
        Excitement: 3.9,
        Hope: 3.7,
        Joy: 3.5,
      },
    },
    {
      topic: "Finances",
      emotions: {
        Anxiety: 4.5,
        Frustration: 4.0,
        Fear: 3.8,
        Excitement: 2.0,
        Hope: 2.2,
        Joy: 1.8,
      },
    },
  ]

  const emotions = ["Anxiety", "Frustration", "Fear", "Excitement", "Hope", "Joy"]
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"]

  // Calculate dimensions for radar chart
  const centerX = 50
  const centerY = 25
  const radius = 20
  const angleStep = (Math.PI * 2) / emotions.length

  // Calculate points for each emotion axis
  const axisPoints = emotions.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2 // Start from top
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      label: emotions[index],
      angle,
    }
  })

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
      {/* Radar grid */}
      {[1, 2, 3, 4, 5].map((level) => {
        const scaledRadius = (level / 5) * radius
        const points = axisPoints
          .map((point) => {
            const x = centerX + scaledRadius * Math.cos(point.angle)
            const y = centerY + scaledRadius * Math.sin(point.angle)
            return `${x},${y}`
          })
          .join(" ")

        return <polygon key={level} points={points} fill="none" stroke="#e5e5e5" strokeWidth="0.2" />
      })}

      {/* Axis lines */}
      {axisPoints.map((point, index) => (
        <g key={index}>
          <line x1={centerX} y1={centerY} x2={point.x} y2={point.y} stroke="#e5e5e5" strokeWidth="0.2" />
          <text
            x={centerX + (radius + 2) * Math.cos(point.angle)}
            y={centerY + (radius + 2) * Math.sin(point.angle)}
            fontSize="2"
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#666"
          >
            {point.label}
          </text>
        </g>
      ))}

      {/* Topic data */}
      {data.map((topicData, topicIndex) => {
        const points = axisPoints
          .map((point, index) => {
            const emotion = emotions[index]
            const value = topicData.emotions[emotion as keyof typeof topicData.emotions] || 0
            const scaledRadius = (value / 5) * radius
            const x = centerX + scaledRadius * Math.cos(point.angle)
            const y = centerY + scaledRadius * Math.sin(point.angle)
            return `${x},${y}`
          })
          .join(" ")

        return (
          <g key={topicIndex}>
            <polygon
              points={points}
              fill={`${colors[topicIndex % colors.length]}33`}
              stroke={colors[topicIndex % colors.length]}
              strokeWidth="0.5"
            />
          </g>
        )
      })}

      {/* Legend */}
      <g transform="translate(80, 5)">
        {data.map((topicData, index) => (
          <g key={index} transform={`translate(0, ${index * 3})`}>
            <rect width="3" height="1.5" fill={colors[index % colors.length]} />
            <text x="4" y="1" fontSize="1.5" alignmentBaseline="middle">
              {topicData.topic}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

// Replace the Emotion Trends Over Time card with this updated version that includes the dropdown on top
export default function EmotionAnalytics({ sessionId }: { sessionId?: string }) {
  // Keep all the existing state and functions
  const [isLoading, setIsLoading] = useState(true)
  const [emotions, setEmotions] = useState<any[]>([])
  const [selectedEmotion, setSelectedEmotion] = useState("Anxiety")
  const [selectedSession, setSelectedSession] = useState("1")
  const [emotionFrequency, setEmotionFrequency] = useState(mockEmotionFrequency)
  const [emotionIntensity, setEmotionIntensity] = useState(mockEmotionIntensity)
  const [emotionJourney, setEmotionJourney] = useState(mockEmotionJourney)
  const [sessionEmotions, setSessionEmotions] = useState(mockSessionEmotions)
  const [emotionContexts, setEmotionContexts] = useState(mockEmotionContexts)
  const [sessions, setSessions] = useState(mockSessions)
  const [selectedChartEmotion, setSelectedChartEmotion] = useState<string | null>(null)
  const [selectedTrendsEmotion, setSelectedTrendsEmotion] = useState("Anxiety")

  // Keep all the existing useEffect hooks and handler functions

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // In a real app, you would fetch this data from your API
        // For now, we'll use the mock data
        const insightsResponse = await insightsAPI.getInsights()

        if (insightsResponse.data?.insights) {
          // Filter emotions
          const emotionInsights = insightsResponse.data.insights.filter((insight) => insight.type === "emotion")
          setEmotions(emotionInsights)
        }

        // Simulate API delay
        setTimeout(() => {
          setIsLoading(false)
        }, 1000)
      } catch (err) {
        console.error("Failed to fetch emotion analytics:", err)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // If a specific sessionId is provided, update the selected session
    if (sessionId) {
      setSelectedSession(sessionId)

      // In a real app, you would fetch session-specific data here
      // For now, we'll just simulate filtering the mock data

      // Filter session emotions to only show data for this session
      if (sessionId === "1") {
        setSessionEmotions(mockSessionEmotions)
      } else if (sessionId === "2") {
        // Create some different data for session 2
        setSessionEmotions([
          { time: "00:03", emotion: "Anxiety", intensity: 3 },
          { time: "00:10", emotion: "Frustration", intensity: 4 },
          { time: "00:17", emotion: "Worry", intensity: 3 },
          { time: "00:25", emotion: "Relief", intensity: 2 },
          { time: "00:32", emotion: "Hope", intensity: 3 },
          { time: "00:40", emotion: "Confidence", intensity: 4 },
        ])
      } else if (sessionId === "3") {
        // Create some different data for session 3
        setSessionEmotions([
          { time: "00:04", emotion: "Excitement", intensity: 4 },
          { time: "00:12", emotion: "Fear", intensity: 2 },
          { time: "00:20", emotion: "Anxiety", intensity: 2 },
          { time: "00:28", emotion: "Excitement", intensity: 3 },
          { time: "00:36", emotion: "Hope", intensity: 4 },
        ])
      }

      // Filter emotion contexts to match the session
      const filteredContexts = mockEmotionContexts.filter((_, index) =>
        sessionId === "1" ? index < 3 : sessionId === "2" ? index >= 1 && index <= 3 : index >= 2,
      )
      setEmotionContexts(filteredContexts)
    }
  }, [sessionId])

  const handleEmotionChange = (value: string) => {
    setSelectedEmotion(value)
    // In a real app, you would fetch data specific to this emotion
  }

  const handleTrendsEmotionChange = (value: string) => {
    setSelectedTrendsEmotion(value)
    // In a real app, you would fetch data specific to this emotion for the trends chart
  }

  const handleSessionChange = (value: string) => {
    setSelectedSession(value)
    // In a real app, you would fetch data specific to this session
  }

  const handleChartEmotionSelect = (emotion: string) => {
    setSelectedChartEmotion(emotion)
  }

  const clearEmotionFilter = () => {
    setSelectedChartEmotion(null)
  }

  const topicDistribution = [
    { topic: "Work", emotions: { Anxiety: 12, Frustration: 8, Fear: 5, Excitement: 3 } },
    { topic: "Health", emotions: { Anxiety: 4, Frustration: 2, Fear: 1, Excitement: 7 } },
    { topic: "Relationships", emotions: { Anxiety: 6, Frustration: 5, Fear: 3, Excitement: 8 } },
    { topic: "Personal", emotions: { Anxiety: 2, Frustration: 3, Fear: 1, Excitement: 10 } },
    { topic: "Finances", emotions: { Anxiety: 9, Frustration: 7, Fear: 6, Excitement: 2 } },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">
            Sessions
            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emotion Frequency */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Emotion Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <EmotionPieChart data={emotionFrequency} />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Showing emotion frequency distribution</p>
                </div>
              </CardContent>
            </Card>

            {/* Emotion Average Intensity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Emotion Average Intensity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  <div className="h-64 relative">
                    <EmotionBarChart data={emotionIntensity} />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">Showing average emotion intensity levels</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Session Comparison - Moved from Sessions tab to Overview tab */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Session Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 relative">
                  <SessionComparisonChart />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Topic Comparison - New chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Topic Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 relative">
                <TopicComparisonChart />
              </div>
            </CardContent>
          </Card>

          {/* Emotion Trends Over Time - Modified to include dropdown on top */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Emotion Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Select emotion to highlight</p>
                <Select value={selectedTrendsEmotion} onValueChange={handleTrendsEmotionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {emotionFrequency.map((item) => (
                      <SelectItem key={item.emotion} value={item.emotion}>
                        {item.emotion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="h-80 relative">
                <EmotionTrendsChart data={emotionJourney} />
              </div>
            </CardContent>
          </Card>

          {/* Emotion Distribution by Topic */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Emotion Distribution by Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 relative">
                <EmotionTopicChart data={topicDistribution} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab - Keep the rest of the component unchanged */}
        <TabsContent value="sessions" className="space-y-4">
          {/* Recent Sessions - Added at the top */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <h3 className="font-medium">{session.title}</h3>
                      <p className="text-sm text-gray-500">{session.date}</p>
                    </div>
                    <button
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      onClick={() => handleSessionChange(session.id)}
                    >
                      View
                    </button>
                  </div>
                ))}
                {sessions.length > 3 && (
                  <div className="text-center">
                    <button className="text-sm text-blue-600 hover:underline">
                      View all {sessions.length} sessions
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Select an Emotion - Moved from Overview tab */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Select an Emotion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Emotion name</p>
                <Select value={selectedEmotion} onValueChange={handleEmotionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {emotionFrequency.map((item) => (
                      <SelectItem key={item.emotion} value={item.emotion}>
                        {item.emotion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-48 relative">
                <EmotionJourneyChart data={emotionJourney.filter((item) => item.emotion === selectedEmotion)} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">Showing intensity changes across sessions</p>
              </div>
            </CardContent>
          </Card>

          {/* Rest of the Sessions tab content */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Select a Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Session sessionId</p>
                <Select value={selectedSession} onValueChange={handleSessionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.date} - {session.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-48 relative">
                <SessionEmotionsChart data={sessionEmotions} onSelectEmotion={handleChartEmotionSelect} />
              </div>
              {selectedChartEmotion && (
                <div className="mt-2 text-sm text-blue-600">Selected emotion: {selectedChartEmotion}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Emotion Context within a session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Emotion</th>
                      <th className="text-center py-2 font-medium">Intensity</th>
                      <th className="text-left py-2 font-medium">Context</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emotionContexts.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">{item.emotion}</td>
                        <td className="text-center py-3">{item.intensity}</td>
                        <td className="py-3">{item.context}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedChartEmotion && (
                  <div className="mt-4">
                    <button onClick={clearEmotionFilter} className="text-sm text-blue-600 hover:underline">
                      Clear filter
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Session Emotional Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 relative">
                <SessionEmotionalProfile sessionId={selectedSession} />
              </div>
            </CardContent>
          </Card>

          {/* Session Comparison chart removed from here and moved to Overview tab */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Visualization Components
function EmotionPieChart({ data }: { data: any[] }) {
  // In a real app, you would use a charting library like Chart.js, Recharts, or D3
  // For this demo, we'll create a simple SVG pie chart
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#8AC926",
    "#1982C4",
    "#6A4C93",
    "#FF595E",
    "#FFCA3A",
  ]

  let startAngle = 0
  const slices = data.map((item, index) => {
    const percentage = (item.count / total) * 100
    const angle = (percentage / 100) * 360
    const endAngle = startAngle + angle

    // Calculate SVG arc path
    const x1 = 100 + 80 * Math.cos(((startAngle - 90) * Math.PI) / 180)
    const y1 = 100 + 80 * Math.sin(((startAngle - 90) * Math.PI) / 180)
    const x2 = 100 + 80 * Math.cos(((endAngle - 90) * Math.PI) / 180)
    const y2 = 100 + 80 * Math.sin(((endAngle - 90) * Math.PI) / 180)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathData = [`M 100 100`, `L ${x1} ${y1}`, `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(" ")

    // Calculate label position
    const labelAngle = startAngle + angle / 2
    const labelRadius = 100 // Slightly outside the pie
    const labelX = 100 + labelRadius * Math.cos(((labelAngle - 90) * Math.PI) / 180)
    const labelY = 100 + labelRadius * Math.sin(((labelAngle - 90) * Math.PI) / 180)

    const slice = {
      path: pathData,
      color: colors[index % colors.length],
      labelX,
      labelY,
      label: item.emotion,
      percentage: percentage.toFixed(2),
    }

    startAngle = endAngle
    return slice
  })

  return (
    <svg width="100%" height="100%" viewBox="0 0 200 200" className="overflow-visible">
      {slices.map((slice, index) => (
        <g key={index}>
          <path d={slice.path} fill={slice.color} stroke="white" strokeWidth="1" />
          <line
            x1={slice.labelX > 100 ? slice.labelX : slice.labelX}
            y1={slice.labelY}
            x2={slice.labelX > 100 ? slice.labelX + 20 : slice.labelX - 20}
            y2={slice.labelY}
            stroke="#666"
            strokeWidth="1"
          />
          <text
            x={slice.labelX > 100 ? slice.labelX + 25 : slice.labelX - 25}
            y={slice.labelY}
            textAnchor={slice.labelX > 100 ? "start" : "end"}
            alignmentBaseline="middle"
            fontSize="8"
            fill="#333"
          >
            {slice.label} ({slice.percentage}%)
          </text>
        </g>
      ))}
    </svg>
  )
}

// Replace the EmotionBarChart function with this improved version
function EmotionBarChart({ data }: { data: any[] }) {
  // Sort data by intensity in descending order
  const sortedData = [...data].sort((a, b) => b.intensity - a.intensity)

  // Take top 15 for better visualization
  const topData = sortedData.slice(0, 15)

  // Calculate max value for scaling
  const maxValue = Math.max(...topData.map((item) => item.intensity))

  // Calculate bar width based on number of items
  const barWidth = 100 / topData.length

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
      {/* Y-axis grid lines */}
      {[0, 1, 2, 3, 4, 5].map((value) => (
        <g key={value}>
          <line
            x1="0"
            y1={50 - (value / 5) * 50}
            x2="100"
            y2={50 - (value / 5) * 50}
            stroke="#e5e5e5"
            strokeWidth="0.2"
          />
          <text
            x="-1"
            y={50 - (value / 5) * 50}
            fontSize="2"
            textAnchor="end"
            alignmentBaseline="middle"
            fill="#666"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}
          >
            {value}
          </text>
        </g>
      ))}

      {/* Bars */}
      {topData.map((item, index) => {
        const barHeight = (item.intensity / 5) * 50
        return (
          <g key={index}>
            <rect
              x={index * barWidth + barWidth * 0.1}
              y={50 - barHeight}
              width={barWidth * 0.8}
              height={barHeight}
              fill={`hsl(${210 - index * 10}, 80%, 60%)`}
            />
          </g>
        )
      })}

      {/* X-axis labels - improved for readability */}
      <g>
        {topData.map((item, index) => (
          <text
            key={index}
            x={index * barWidth + barWidth / 2}
            y="51"
            fontSize="1.5"
            textAnchor="end"
            transform={`rotate(45, ${index * barWidth + barWidth / 2}, 51)`}
            fill="#666"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, letterSpacing: "-0.01em" }}
          >
            {item.emotion.length > 8 ? item.emotion.substring(0, 7) + "." : item.emotion}
          </text>
        ))}
      </g>
    </svg>
  )
}

// For the EmotionJourneyChart function, update the X-axis labels to show session dates
function EmotionJourneyChart({ data }: { data: any[] }) {
  // Calculate max value for scaling
  const maxValue = Math.max(...data.map((item) => item.intensity))

  // Calculate bar width based on number of items
  const barWidth = 100 / data.length

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
      {/* Y-axis grid lines */}
      {[0, 1, 2, 3, 4].map((value) => (
        <g key={value}>
          <line
            x1="0"
            y1={50 - (value / 4) * 50}
            x2="100"
            y2={50 - (value / 4) * 50}
            stroke="#e5e5e5"
            strokeWidth="0.2"
          />
          <text x="-1" y={50 - (value / 4) * 50} fontSize="2" textAnchor="end" alignmentBaseline="middle" fill="#666">
            {value}
          </text>
        </g>
      ))}

      {/* Bars */}
      {data.map((item, index) => {
        const barHeight = (item.intensity / 4) * 50
        return (
          <g key={index}>
            <rect
              x={index * barWidth + barWidth * 0.1}
              y={50 - barHeight}
              width={barWidth * 0.8}
              height={barHeight}
              fill={`hsl(${210 - index * 5}, 80%, 60%)`}
            />
          </g>
        )
      })}

      {/* X-axis labels - improved to show dates */}
      <g>
        {data.map((item, index) => {
          // Show the date instead of just the session number
          return (
            <text
              key={index}
              x={index * barWidth + barWidth / 2}
              y="51"
              fontSize="1.5"
              textAnchor="middle"
              fill="#666"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {item.date.slice(5)} {/* Show month-day format */}
            </text>
          )
        })}
      </g>
    </svg>
  )
}

// Update the SessionEmotionsChart function for consistent label styling
function SessionEmotionsChart({ data, onSelectEmotion }: { data: any[]; onSelectEmotion?: (emotion: string) => void }) {
  // Calculate max value for scaling
  const maxValue = Math.max(...data.map((item) => item.intensity))

  // Calculate bar width based on number of items
  const barWidth = 100 / data.length

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
      {/* Y-axis grid lines */}
      {[0, 1, 2, 3, 4].map((value) => (
        <g key={value}>
          <line
            x1="0"
            y1={50 - (value / 4) * 50}
            x2="100"
            y2={50 - (value / 4) * 50}
            stroke="#e5e5e5"
            strokeWidth="0.2"
          />
          <text x="-1" y={50 - (value / 4) * 50} fontSize="2" textAnchor="end" alignmentBaseline="middle" fill="#666">
            {value}
          </text>
        </g>
      ))}

      {/* Bars */}
      {data.map((item, index) => {
        const barHeight = (item.intensity / 4) * 50
        return (
          <g key={index}>
            <rect
              x={index * barWidth + barWidth * 0.1}
              y={50 - barHeight}
              width={barWidth * 0.8}
              height={barHeight}
              fill={`hsl(${item.emotion === "Joy" ? 120 : 0}, 80%, 60%)`}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectEmotion && onSelectEmotion(item.emotion)}
            />
          </g>
        )
      })}

      {/* X-axis labels - improved for readability */}
      <g>
        {data.map((item, index) => (
          <text
            key={index}
            x={index * barWidth + barWidth / 2}
            y="51"
            fontSize="1.5"
            textAnchor="middle"
            fill="#666"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {item.time}
          </text>
        ))}
      </g>
    </svg>
  )
}

// Update the EmotionTopicChart function to add topic labels underneath each group
function EmotionTopicChart({ data }: { data?: any[] }) {
  // Use provided data or fallback to mock data
  const chartData = data || [
    { topic: "Work", emotions: { Anxiety: 12, Frustration: 8, Fear: 5, Excitement: 3 } },
    {
      topic: "Health",
      emotions: { Anxiety: 4, Frustration: 2, Fear: 1, Excitement: 7 },
    },
    {
      topic: "Relationships",
      emotions: { Anxiety: 6, Frustration: 5, Fear: 3, Excitement: 8 },
    },
    {
      topic: "Personal",
      emotions: { Anxiety: 2, Frustration: 3, Fear: 1, Excitement: 10 },
    },
    {
      topic: "Finances",
      emotions: { Anxiety: 9, Frustration: 7, Fear: 6, Excitement: 2 },
    },
  ]

  const emotions = ["Anxiety", "Frustration", "Fear", "Excitement"]
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]

  // Calculate bar width and spacing
  const barWidth = 100 / chartData.length
  const groupWidth = barWidth * 0.8
  const barSpacing = groupWidth / emotions.length

  // Find max value for scaling
  const maxValue = Math.max(...chartData.flatMap((item) => Object.values(item.emotions).map((val) => Number(val))))

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
      {/* Y-axis grid lines */}
      {[0, 5, 10, 15].map((value) => (
        <g key={value}>
          <line
            x1="0"
            y1={50 - (value / 15) * 50}
            x2="100"
            y2={50 - (value / 15) * 50}
            stroke="#e5e5e5"
            strokeWidth="0.2"
          />
          <text x="-1" y={50 - (value / 15) * 50} fontSize="2" textAnchor="end" alignmentBaseline="middle" fill="#666">
            {value}
          </text>
        </g>
      ))}

      {/* Grouped bars */}
      {chartData.map((item, topicIndex) => (
        <g key={topicIndex}>
          {emotions.map((emotion, emotionIndex) => {
            const value = item.emotions[emotion as keyof typeof item.emotions] || 0
            const barHeight = (value / maxValue) * 50
            const x = topicIndex * barWidth + barWidth * 0.1 + emotionIndex * barSpacing

            return (
              <rect
                key={emotionIndex}
                x={x}
                y={50 - barHeight}
                width={barSpacing * 0.9}
                height={barHeight}
                fill={colors[emotionIndex]}
              />
            )
          })}
        </g>
      ))}

      {/* X-axis labels - improved for readability with clear topic names */}
      <g>
        {chartData.map((item, index) => (
          <text
            key={index}
            x={index * barWidth + barWidth / 2}
            y="51"
            fontSize="2"
            textAnchor="middle"
            fill="#666"
            fontWeight="bold"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {item.topic}
          </text>
        ))}
      </g>

      {/* Legend - improved for readability */}
      <g transform="translate(80, 5)">
        {emotions.map((emotion, index) => (
          <g key={index} transform={`translate(0, ${index * 3})`}>
            <rect width="3" height="1.5" fill={colors[index]} />
            <text x="4" y="1" fontSize="1.5" alignmentBaseline="middle" style={{ fontFamily: "Arial, sans-serif" }}>
              {emotion}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

