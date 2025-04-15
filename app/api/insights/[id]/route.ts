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
  // ... other insights
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const insight = INSIGHTS.find((i) => i.id === params.id)

  if (!insight) {
    return NextResponse.json({ message: "Insight not found" }, { status: 404 })
  }

  return NextResponse.json({ insight })
}

