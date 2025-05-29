"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface EmotionTrendData {
  emotion: string
  color: string
  trend: 'up' | 'down' | 'stable'
  data: Array<{
    date: string
    intensity: number
    sessionId: string
    sessionTitle: string
  }>
  averageIntensity: number
  totalOccurrences: number
}

interface EmotionTrendsProps {
  sessions: Array<{
    id: string
    title: string
    timestamp: string
    elements: {
      emotions?: Array<{
        name?: string
        emotion?: string
        intensity?: number | string
      }>
    }
  }>
  onSessionClick?: (sessionId: string) => void
}

export default function EmotionTrends({ sessions, onSessionClick }: EmotionTrendsProps) {
  const [topEmotions, setTopEmotions] = useState<EmotionTrendData[]>([])
  const [selectedEmotions, setSelectedEmotions] = useState<Set<string>>(new Set())
  const [chartData, setChartData] = useState<any[]>([])

  // Predefined colors for emotions
  const emotionColors = [
    '#3B82F6', // blue
    '#EF4444', // red  
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#EC4899', // pink
  ]

  useEffect(() => {
    if (!sessions || sessions.length === 0) return

    // Extract and count all emotions
    const emotionFrequency: Record<string, { count: number; intensities: number[] }> = {}
    
    sessions.forEach(session => {
      const emotions = session.elements?.emotions || []
      emotions.forEach(emotion => {
        const emotionName = emotion.name || emotion.emotion || 'Unknown'
        const intensity = typeof emotion.intensity === 'string' 
          ? parseFloat(emotion.intensity) 
          : emotion.intensity || 0

        if (!emotionFrequency[emotionName]) {
          emotionFrequency[emotionName] = { count: 0, intensities: [] }
        }
        emotionFrequency[emotionName].count++
        emotionFrequency[emotionName].intensities.push(intensity)
      })
    })

    // Get top 3 most frequent emotions
    const sortedEmotions = Object.entries(emotionFrequency)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 3)

    // Create trend data for top emotions
    const emotionTrends = sortedEmotions.map(([emotionName, data], index) => {
      const color = emotionColors[index] || emotionColors[0]
      
      // Get intensity data over time for this emotion
      const timeSeriesData = sessions
        .map(session => {
          const sessionEmotions = session.elements?.emotions || []
          const emotionEntry = sessionEmotions.find(e => 
            (e.name || e.emotion) === emotionName
          )
          
          if (emotionEntry) {
            const intensity = typeof emotionEntry.intensity === 'string'
              ? parseFloat(emotionEntry.intensity)
              : emotionEntry.intensity || 0

            return {
              date: session.timestamp,
              intensity,
              sessionId: session.id,
              sessionTitle: session.title
            }
          }
          return null
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime()) as any[]

      // Calculate trend
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (timeSeriesData.length >= 4) {
        const firstHalf = timeSeriesData.slice(0, Math.floor(timeSeriesData.length / 2))
        const secondHalf = timeSeriesData.slice(Math.floor(timeSeriesData.length / 2))
        
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.intensity, 0) / firstHalf.length
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.intensity, 0) / secondHalf.length
        
        if (secondAvg > firstAvg * 1.2) trend = 'up'
        else if (secondAvg < firstAvg * 0.8) trend = 'down'
      }

      const averageIntensity = data.intensities.reduce((sum, i) => sum + i, 0) / data.intensities.length

      return {
        emotion: emotionName,
        color,
        trend,
        data: timeSeriesData,
        averageIntensity,
        totalOccurrences: data.count
      }
    })

    setTopEmotions(emotionTrends)
    setSelectedEmotions(new Set(emotionTrends.map(e => e.emotion)))
  }, [sessions])

  useEffect(() => {
    // Create chart data combining all emotions
    const allDates = new Set<string>()
    topEmotions.forEach(emotion => {
      emotion.data.forEach(point => allDates.add(point.date))
    })

    const sortedDates = Array.from(allDates).sort()
    
    const combinedData = sortedDates.map(date => {
      const dataPoint: any = { 
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date
      }
      
      topEmotions.forEach(emotion => {
        if (selectedEmotions.has(emotion.emotion)) {
          const emotionPoint = emotion.data.find(d => d.date === date)
          dataPoint[emotion.emotion] = emotionPoint?.intensity || null
        }
      })
      
      return dataPoint
    })

    setChartData(combinedData)
  }, [topEmotions, selectedEmotions])

  const toggleEmotion = (emotion: string) => {
    const newSelected = new Set(selectedEmotions)
    if (newSelected.has(emotion)) {
      newSelected.delete(emotion)
    } else {
      newSelected.add(emotion)
    }
    setSelectedEmotions(newSelected)
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const handleTooltipClick = (data: any) => {
    if (data && data.payload && data.payload.length > 0 && onSessionClick) {
      // Find the first emotion with data for this date
      const emotionData = topEmotions.find(emotion => 
        selectedEmotions.has(emotion.emotion) && 
        emotion.data.some(d => d.date === data.label)
      )
      
      if (emotionData) {
        const sessionData = emotionData.data.find(d => d.date === data.fullDate)
        if (sessionData) {
          onSessionClick(sessionData.sessionId)
        }
      }
    }
  }

  if (topEmotions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Emotion Intensity Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No emotion data available for trends</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Emotion Intensity Trends (Top 3)
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {topEmotions.map((emotion) => (
            <Button
              key={emotion.emotion}
              variant={selectedEmotions.has(emotion.emotion) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleEmotion(emotion.emotion)}
              className="flex items-center gap-2"
              style={{
                backgroundColor: selectedEmotions.has(emotion.emotion) ? emotion.color : undefined,
                borderColor: emotion.color
              }}
            >
              {getTrendIcon(emotion.trend)}
              {emotion.emotion}
              <Badge variant="secondary" className="ml-1">
                {emotion.averageIntensity.toFixed(1)}
              </Badge>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} onClick={handleTooltipClick}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[1, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                label={{ value: 'Intensity', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded shadow-md">
                        <p className="font-medium">{label}</p>
                        {payload.map((entry, index) => (
                          entry.value !== null && (
                            <p key={index} style={{ color: entry.color }}>
                              {entry.dataKey}: {entry.value}/5
                            </p>
                          )
                        ))}
                        <p className="text-xs text-gray-500 mt-1">Click to view session</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              {topEmotions.map((emotion) => (
                selectedEmotions.has(emotion.emotion) && (
                  <Line
                    key={emotion.emotion}
                    type="monotone"
                    dataKey={emotion.emotion}
                    stroke={emotion.color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls={false}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          💡 Click on emotion names to toggle visibility • Click chart points to view sessions
        </div>
      </CardContent>
    </Card>
  )
} 