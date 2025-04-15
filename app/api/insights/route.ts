import { NextResponse } from "next/server"

// Mock insights data
const INSIGHTS = [
  {
    id: "1",
    type: "emotion",
    content: "Joy when completing the project ahead of schedule",
    topic: "Work",
    timestamp: "2023-12-01T10:30:00Z",
    sessionId: "123",
    sessionTitle: "Weekly Check-in",
    additionalInfo: "Intensity: 4/5, Trigger: Project completion",
  },
  {
    id: "2",
    type: "emotion",
    content: "Anxiety about upcoming presentation",
    topic: "Work",
    timestamp: "2023-12-01T10:35:00Z",
    sessionId: "123",
    sessionTitle: "Weekly Check-in",
    additionalInfo: "Intensity: 3/5, Trigger: Team presentation",
  },
  {
    id: "3",
    type: "context",
    content: "I don't think my work is good enough for this project",
    topic: "Work",
    timestamp: "2023-12-01T10:40:00Z",
    sessionId: "123",
    sessionTitle: "Weekly Check-in",
    additionalInfo: "Category: Not Good Enough / Self-Doubt",
  },
  {
    id: "4",
    type: "challenge",
    content: "Finding time for self-care with my busy schedule",
    topic: "Health",
    timestamp: "2023-12-01T10:45:00Z",
    sessionId: "123",
    sessionTitle: "Weekly Check-in",
    additionalInfo: "Impact: I feel constantly tired and don't have energy for things I enjoy",
  },
  {
    id: "5",
    type: "commitment",
    content: "Schedule at least 30 minutes of exercise three times per week",
    topic: "Health",
    timestamp: "2023-12-01T10:50:00Z",
    sessionId: "123",
    sessionTitle: "Weekly Check-in",
    additionalInfo: "Due: Dec 31, 2023, Status: Not Started",
  },
  {
    id: "6",
    type: "insight",
    content: "I notice that I feel more anxious when I don't get enough sleep",
    topic: "Health",
    timestamp: "2023-12-01T10:55:00Z",
    sessionId: "123",
    sessionTitle: "Weekly Check-in",
    additionalInfo: "Implications: Sleep quality directly affects my emotional state and productivity",
  },
]

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const type = url.searchParams.get("type")
    const topic = url.searchParams.get("topic")
    const sessionId = url.searchParams.get("sessionId")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    // Filter insights based on query parameters
    let filteredInsights = [...INSIGHTS]

    if (type) {
      filteredInsights = filteredInsights.filter((insight) => insight.type === type)
    }

    if (topic) {
      filteredInsights = filteredInsights.filter((insight) => insight.topic === topic)
    }

    if (sessionId) {
      filteredInsights = filteredInsights.filter((insight) => insight.sessionId === sessionId)
    }

    if (startDate) {
      const start = new Date(startDate)
      filteredInsights = filteredInsights.filter((insight) => new Date(insight.timestamp) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      filteredInsights = filteredInsights.filter((insight) => new Date(insight.timestamp) <= end)
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return NextResponse.json({
      data: { insights: filteredInsights },
    })
  } catch (error) {
    console.error("Get insights error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, content, topic, sessionId, additionalInfo } = body

    if (!type || !content || !topic) {
      return NextResponse.json({ error: "Type, content, and topic are required" }, { status: 400 })
    }

    // Create a new insight
    const newInsight = {
      id: `${Date.now()}`,
      type,
      content,
      topic,
      timestamp: new Date().toISOString(),
      sessionId: sessionId || "new-session",
      sessionTitle: "New Session",
      additionalInfo: additionalInfo || "",
    }

    // In a real app, you would save this to a database
    INSIGHTS.push(newInsight)

    return NextResponse.json({
      data: { insight: newInsight },
    })
  } catch (error) {
    console.error("Create insight error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

