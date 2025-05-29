"use client"

import { useState, useEffect } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js"
import 'chartjs-adapter-date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, TrendingDown, Minus, Lightbulb, AlertTriangle } from "lucide-react"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

interface TimelineDataPoint {
  date: string
  sessionId: string
  sessionTitle: string
  insights: number
  challenges: number
  emotionAverage: number
}

interface InsightsTimelineProps {
  sessions: Array<{
    id: string
    title: string
    timestamp: string
    elements: {
      insights?: any[]
      challenges?: any[]
      emotions?: any[]
    }
  }>
  onSessionClick?: (sessionId: string) => void
}

export default function InsightsTimeline({ sessions, onSessionClick }: InsightsTimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([])
  const [stats, setStats] = useState({
    totalInsights: 0,
    totalChallenges: 0,
    trendDirection: 'stable' as 'up' | 'down' | 'stable'
  })

  useEffect(() => {
    if (!sessions || sessions.length === 0) return

    // Transform sessions data into timeline format
    const transformedData = sessions
      .filter(session => session.elements)
      .map(session => {
        const insights = session.elements.insights || []
        const challenges = session.elements.challenges || []
        const emotions = session.elements.emotions || []
        
        const emotionAverage = emotions.length > 0 
          ? emotions.reduce((sum, emotion) => sum + (emotion.intensity || 0), 0) / emotions.length 
          : 0

        return {
          date: session.timestamp,
          sessionId: session.id,
          sessionTitle: session.title,
          insights: insights.length,
          challenges: challenges.length,
          emotionAverage
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setTimelineData(transformedData)

    // Calculate stats
    const totalInsights = transformedData.reduce((sum, point) => sum + point.insights, 0)
    const totalChallenges = transformedData.reduce((sum, point) => sum + point.challenges, 0)
    
    // Simple trend calculation (last 3 vs first 3 sessions)
    let trendDirection: 'up' | 'down' | 'stable' = 'stable'
    if (transformedData.length >= 6) {
      const firstHalf = transformedData.slice(0, 3)
      const lastHalf = transformedData.slice(-3)
      
      const firstAvg = firstHalf.reduce((sum, p) => sum + p.insights, 0) / 3
      const lastAvg = lastHalf.reduce((sum, p) => sum + p.insights, 0) / 3
      
      if (lastAvg > firstAvg * 1.2) trendDirection = 'up'
      else if (lastAvg < firstAvg * 0.8) trendDirection = 'down'
    }

    setStats({ totalInsights, totalChallenges, trendDirection })
  }, [sessions])

  const chartData = {
    labels: timelineData.map(point => new Date(point.date)),
    datasets: [
      {
        label: 'Insights',
        data: timelineData.map(point => point.insights),
        borderColor: '#10B981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        yAxisID: 'y'
      },
      {
        label: 'Challenges',
        data: timelineData.map(point => point.challenges),
        borderColor: '#F59E0B', // amber-500
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        yAxisID: 'y'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            const dataIndex = context[0].dataIndex
            const point = timelineData[dataIndex]
            return point?.sessionTitle || 'Session'
          },
          afterTitle: (context: any) => {
            const dataIndex = context[0].dataIndex
            const point = timelineData[dataIndex]
            return new Date(point.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })
          },
          afterBody: (context: any) => {
            const dataIndex = context[0].dataIndex
            const point = timelineData[dataIndex]
            return [
              `Emotion Average: ${point.emotionAverage.toFixed(1)}/5`,
              'Click to view session details'
            ]
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MMM d'
          }
        },
        title: {
          display: true,
          text: 'Session Date',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Count',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        }
      }
    },
    onClick: (event: any, elements: any) => {
      if (elements.length > 0 && onSessionClick) {
        const dataIndex = elements[0].index
        const point = timelineData[dataIndex]
        if (point) {
          onSessionClick(point.sessionId)
        }
      }
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  if (timelineData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Insights & Challenges Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No session data available for timeline</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Insights & Challenges Timeline
          </CardTitle>
          {getTrendIcon(stats.trendDirection)}
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {stats.totalInsights} insights
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {stats.totalChallenges} challenges
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          💡 Click on data points to view session details
        </div>
      </CardContent>
    </Card>
  )
} 