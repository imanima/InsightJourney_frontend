"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

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
]

const topicDistribution = [
  { topic: "Work", emotions: { Anxiety: 12, Frustration: 8, Fear: 5, Excitement: 3 } },
  { topic: "Health", emotions: { Anxiety: 4, Frustration: 2, Fear: 1, Excitement: 7 } },
  { topic: "Relationships", emotions: { Anxiety: 6, Frustration: 5, Fear: 3, Excitement: 8 } },
  { topic: "Personal", emotions: { Anxiety: 2, Frustration: 3, Fear: 1, Excitement: 10 } },
  { topic: "Finances", emotions: { Anxiety: 9, Frustration: 7, Fear: 6, Excitement: 2 } },
]

export default function InsightsOverviewAnalytics() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  return (
    <Tabs defaultValue="distribution">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="distribution">Distribution</TabsTrigger>
        <TabsTrigger value="intensity">Intensity</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="topics">Topics</TabsTrigger>
      </TabsList>

      <TabsContent value="distribution" className="h-48">
        <EmotionPieChart data={mockEmotionFrequency} />
      </TabsContent>

      <TabsContent value="intensity" className="h-48">
        <EmotionBarChart data={mockEmotionIntensity} />
      </TabsContent>

      <TabsContent value="trends" className="h-48">
        <EmotionTrendsChart data={mockEmotionJourney} />
      </TabsContent>

      <TabsContent value="topics" className="h-48">
        <EmotionTopicChart data={topicDistribution} />
      </TabsContent>
    </Tabs>
  )
}

// Visualization Components
function EmotionPieChart({ data }: { data: any[] }) {
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
      percentage: percentage.toFixed(1),
    }

    startAngle = endAngle
    return slice
  })

  return (
    <svg width="100%" height="100%" viewBox="0 0 200 200" className="overflow-visible">
      {slices.map((slice, index) => (
        <g key={index}>
          <path d={slice.path} fill={slice.color} stroke="white" strokeWidth="1" />
          {index < 5 && ( // Only show labels for top 5 emotions to avoid clutter
            <>
              <line
                x1={slice.labelX > 100 ? slice.labelX : slice.labelX}
                y1={slice.labelY}
                x2={slice.labelX > 100 ? slice.labelX + 20 : slice.labelX - 20}
                y2={slice.labelY}
                stroke="#666"
                strokeWidth="0.5"
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
            </>
          )}
        </g>
      ))}
    </svg>
  )
}

function EmotionBarChart({ data }: { data: any[] }) {
  // Sort data by intensity in descending order
  const sortedData = [...data].sort((a, b) => b.intensity - a.intensity)

  // Take top 8 for better visualization
  const topData = sortedData.slice(0, 8)

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
          <text x="-1" y={50 - (value / 5) * 50} fontSize="2" textAnchor="end" alignmentBaseline="middle" fill="#666">
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

      {/* X-axis labels */}
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
          >
            {item.emotion.length > 8 ? item.emotion.substring(0, 7) + "." : item.emotion}
          </text>
        ))}
      </g>
    </svg>
  )
}

function EmotionTrendsChart({ data }: { data: any[] }) {
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

      {/* Line for emotion trend */}
      {(() => {
        const points = data
          .map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 50 - (item.intensity / 4) * 50
            return `${x},${y}`
          })
          .join(" ")

        return (
          <g>
            <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="0.5" />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 50 - (item.intensity / 4) * 50
              return <circle key={index} cx={x} cy={y} r="0.8" fill="#3b82f6" />
            })}
          </g>
        )
      })()}

      {/* X-axis labels */}
      <g>
        {data.map((item, index) => {
          if (index % 2 === 0 || index === data.length - 1) {
            // Show every other label to avoid crowding
            return (
              <text
                key={index}
                x={(index / (data.length - 1)) * 100}
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
    </svg>
  )
}

function EmotionTopicChart({ data }: { data: any[] }) {
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
            <text x="4" y="1" fontSize="1.5" alignmentBaseline="middle">
              {emotion}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

