import { NextResponse } from "next/server"

// Mock sessions data
const SESSIONS = [
  {
    id: "123",
    timestamp: new Date().toISOString(),
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
    contexts: [
      {
        category: "Not Good Enough / Self-Doubt",
        topic: "Work",
        timestamp: new Date().toISOString(),
        belief: "I don't think my work is good enough for this project.",
        explanation: "I often compare myself to more experienced colleagues and feel inadequate.",
      },
    ],
    practices: [
      {
        practice: "Take 5 minutes each morning to practice deep breathing",
        topic: "Health",
        frequency: "Daily",
        timestamp: new Date().toISOString(),
        related_insight: "Stress management is important for my wellbeing",
      },
    ],
    challenges: [
      {
        challenge: "Finding time for self-care with my busy schedule",
        topic: "Health",
        timestamp: new Date().toISOString(),
        impact: "I feel constantly tired and don't have energy for things I enjoy",
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
    ],
    insights: [
      {
        insight: "I notice that I feel more anxious when I don't get enough sleep",
        topic: "Health",
        timestamp: new Date().toISOString(),
        implications: "Sleep quality directly affects my emotional state and productivity",
        potential_practice: "Establish a consistent sleep schedule",
      },
    ],
  },
  // ... other sessions
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const session = SESSIONS.find((s) => s.id === params.id)

  if (!session) {
    return NextResponse.json({ message: "Session not found" }, { status: 404 })
  }

  return NextResponse.json({ session })
}

