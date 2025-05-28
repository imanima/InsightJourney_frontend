// Mock action items data

export const mockActionItems = [
  {
    id: "1",
    title: "Practice deep breathing for 5 minutes",
    description: "Take 5 minutes each morning to practice deep breathing exercises to reduce stress",
    dueDate: "2023-12-15",
    status: "in_progress",
    priority: "high",
    topic: "Stress Management",
    sessionId: "1",
    sessionTitle: "Initial Coaching Session",
  },
  {
    id: "2",
    title: "Schedule time for exercise",
    description: "Block out 30 minutes three times per week for physical activity",
    dueDate: "2023-12-10",
    status: "not_started",
    priority: "medium",
    topic: "Health",
    sessionId: "1",
    sessionTitle: "Initial Coaching Session",
  },
  {
    id: "3",
    title: "Journal about work challenges",
    description: "Write down specific work situations that trigger stress and potential solutions",
    dueDate: "2023-12-05",
    status: "completed",
    priority: "medium",
    topic: "Work",
    sessionId: "2",
    sessionTitle: "Follow-up Session",
  },
  {
    id: "4",
    title: "Practice active listening",
    description: "Focus on active listening during team meetings without interrupting",
    dueDate: "2023-12-20",
    status: "not_started",
    priority: "low",
    topic: "Communication",
    sessionId: "2",
    sessionTitle: "Follow-up Session",
  },
]

// Helper function to update an action item
export function updateActionItem(id: string, updates: Partial<any>) {
  const index = mockActionItems.findIndex((item) => item.id === id)
  if (index !== -1) {
    mockActionItems[index] = { ...mockActionItems[index], ...updates }
    return mockActionItems[index]
  }
  return null
}

// Add a function to create a new action item
export function createActionItem(data: any) {
  const newItem = {
    id: `${Date.now()}`,
    title: data.title,
    description: data.description || "",
    dueDate: data.dueDate,
    status: data.status || "not_started",
    priority: data.priority || "medium",
    topic: data.topic || "General",
    sessionId: data.sessionId || "general",
    sessionTitle: data.sessionTitle || "General",
  }

  mockActionItems.push(newItem)
  return newItem
}

// Add a function to delete an action item
export function deleteActionItem(id: string) {
  const index = mockActionItems.findIndex((item) => item.id === id)
  if (index !== -1) {
    mockActionItems.splice(index, 1)
    return true
  }
  return false
}

