import { NextResponse } from "next/server"

// Mock action items data
const ACTION_ITEMS = [
  {
    id: "1",
    title: "Practice deep breathing for 5 minutes",
    description: "Take 5 minutes each morning to practice deep breathing exercises to reduce stress",
    dueDate: "2023-12-15",
    status: "in_progress",
    priority: "high",
    topic: "Stress Management",
    sessionId: "123",
    sessionTitle: "Weekly Check-in",
  },
  {
    id: "2",
    title: "Schedule time for exercise",
    description: "Block out 30 minutes three times per week for physical activity",
    dueDate: "2023-12-10",
    status: "not_started",
    priority: "medium",
    topic: "Health",
    sessionId: "123",
    sessionTitle: "Weekly Check-in",
  },
  {
    id: "3",
    title: "Journal about work challenges",
    description: "Write down specific work situations that trigger stress and potential solutions",
    dueDate: "2023-12-05",
    status: "completed",
    priority: "medium",
    topic: "Work",
    sessionId: "124",
    sessionTitle: "Career Discussion",
  },
  {
    id: "4",
    title: "Practice active listening",
    description: "Focus on active listening during team meetings without interrupting",
    dueDate: "2023-12-20",
    status: "not_started",
    priority: "low",
    topic: "Communication",
    sessionId: "124",
    sessionTitle: "Career Discussion",
  },
]

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json({ actionItems: ACTION_ITEMS })
}

