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
  // ... other action items
]

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const { id } = await params
  const actionItem = ACTION_ITEMS.find((item) => item.id === id)

  if (!actionItem) {
    return NextResponse.json({ message: "Action item not found" }, { status: 404 })
  }

  return NextResponse.json({ actionItem })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await request.json()
    const { id } = await params

    // Find the action item
    const actionItem = ACTION_ITEMS.find((item) => item.id === id)

    if (!actionItem) {
      return NextResponse.json({ message: "Action item not found" }, { status: 404 })
    }

    // Update the action item (in a real app, you would update the database)
    const updatedActionItem = {
      ...actionItem,
      ...data,
    }

    return NextResponse.json({ actionItem: updatedActionItem })
  } catch (error) {
    console.error("Update action item error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

