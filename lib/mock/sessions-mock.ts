// Mock sessions data

export const mockSessions = [
  {
    id: 1,
    title: "Initial Coaching Session",
    date: "2023-10-15",
    status: "completed",
    client_name: "John Doe",
    notes: "First session with client, focused on goal setting",
    file_path: "/uploads/session1.mp3",
    created_at: "2023-10-15T14:30:00Z",
  },
  {
    id: 2,
    title: "Follow-up Session",
    date: "2023-10-22",
    status: "completed",
    client_name: "John Doe",
    notes: "Follow-up on goals from first session",
    file_path: "/uploads/session2.mp3",
    created_at: "2023-10-22T15:00:00Z",
  },
  {
    id: 3,
    title: "Career Coaching",
    date: "2023-10-18",
    status: "in_progress",
    client_name: "Jane Smith",
    notes: "Discussed career transition strategies",
    file_path: "/uploads/session3.mp3",
    created_at: "2023-10-18T10:00:00Z",
  },
]

export const mockSessionAnalyses = {
  1: {
    insights: ["Client shows strong self-awareness", "Work-life balance is a key concern"],
    action_items: ["Create a daily schedule with dedicated personal time", "Practice saying no to non-essential tasks"],
    sentiment: "Positive",
    topics: ["Work-Life Balance", "Career Development", "Stress Management"],
    elements: {
      emotions: [
        {
          emotion: "Joy",
          intensity: 8,
          topic: "Work",
          timestamp: "00:15:22",
          context: "When discussing recent achievements",
        },
        {
          emotion: "Anxiety",
          intensity: 6,
          topic: "Work",
          timestamp: "00:23:45",
          context: "When talking about upcoming challenges",
        },
      ],
      contexts: [
        {
          category: "Fear of Failure",
          belief: "I'll never be able to complete this project on time",
          topic: "Work Stress",
          timestamp: "00:15:22",
          explanation: "Client expressed anxiety about upcoming deadline",
        },
        {
          category: "Not Good Enough",
          belief: "My colleagues are more qualified than me",
          topic: "Self-Doubt",
          timestamp: "00:23:45",
          explanation: "Client comparing themselves to team members",
        },
      ],
      practices: [
        {
          practice: "Morning meditation",
          topic: "Stress Management",
          timestamp: "00:32:10",
          frequency: "Daily",
          related_insight: "Mindfulness helps reduce work anxiety",
        },
      ],
      challenges: [
        {
          challenge: "Finding time for self-care",
          topic: "Work-Life Balance",
          timestamp: "00:18:30",
          impact: "Feeling constantly tired and burnt out",
        },
      ],
      commitments: [
        {
          commitment: "Schedule 30 minutes of exercise three times per week",
          topic: "Health",
          timestamp: "00:42:15",
          due_date: "2023-10-31",
          status: "Not Started",
        },
      ],
      insights: [
        {
          insight: "Recognizing perfectionism is holding me back",
          topic: "Self-awareness",
          timestamp: "00:22:15",
          implications: "Can stop over-preparing for presentations",
          potential_practice: "Set time limits for preparation tasks",
        },
      ],
    },
  },
  2: {
    insights: ["Client has made progress on setting boundaries", "Still struggling with perfectionism"],
    action_items: ["Implement the 80/20 rule for tasks", "Schedule regular check-ins with team members"],
    sentiment: "Mixed",
    topics: ["Productivity", "Team Dynamics", "Personal Growth"],
    elements: {
      emotions: [
        {
          emotion: "Pride",
          intensity: 7,
          topic: "Personal Growth",
          timestamp: "00:10:15",
          context: "When sharing progress on goals",
        },
        {
          emotion: "Frustration",
          intensity: 5,
          topic: "Team Dynamics",
          timestamp: "00:18:30",
          context: "When discussing obstacles encountered",
        },
      ],
      contexts: [
        {
          category: "Time Scarcity",
          belief: "I never have enough time for everything",
          topic: "Work-Life Balance",
          timestamp: "00:10:15",
          explanation: "Client feeling overwhelmed by competing priorities",
        },
      ],
      practices: [
        {
          practice: "End-of-day reflection",
          topic: "Productivity",
          timestamp: "00:25:40",
          frequency: "Daily",
          related_insight: "Reviewing accomplishments reduces anxiety",
        },
      ],
      challenges: [
        {
          challenge: "Delegating tasks to team members",
          topic: "Leadership",
          timestamp: "00:15:20",
          impact: "Taking on too much work personally",
        },
      ],
      commitments: [
        {
          commitment: "Have one difficult conversation this week",
          topic: "Communication",
          timestamp: "00:35:10",
          due_date: "2023-10-29",
          status: "In Progress",
        },
      ],
      insights: [
        {
          insight: "Setting boundaries improves my productivity",
          topic: "Productivity",
          timestamp: "00:18:30",
          implications: "Less stress and more focused work",
          potential_practice: "Block focused work time on calendar",
        },
      ],
    },
  },
  3: {
    insights: ["Client is excited but fearful about career change", "Values alignment is a key decision factor"],
    action_items: ["Research salary ranges in target industry", "Connect with 3 professionals in desired field"],
    sentiment: "Mixed",
    topics: ["Career Transition", "Financial Planning", "Networking"],
    elements: {
      emotions: [
        {
          emotion: "Excitement",
          intensity: 9,
          topic: "Career Transition",
          timestamp: "00:05:30",
          context: "When discussing new career possibilities",
        },
        {
          emotion: "Fear",
          intensity: 7,
          topic: "Financial Planning",
          timestamp: "00:12:45",
          context: "When considering leaving current job",
        },
      ],
      contexts: [
        {
          category: "Fear of Change",
          belief: "What if the new career is worse than my current one?",
          topic: "Career Transition",
          timestamp: "00:12:40",
          explanation: "Client worried about unknown aspects of new career",
        },
      ],
      practices: [
        {
          practice: "Informational interviews",
          topic: "Networking",
          timestamp: "00:28:15",
          frequency: "Weekly",
          related_insight: "Learning from others in the field reduces uncertainty",
        },
      ],
      challenges: [
        {
          challenge: "Financial uncertainty during transition",
          topic: "Financial Planning",
          timestamp: "00:15:20",
          impact: "Causing hesitation to make the change",
        },
      ],
      commitments: [
        {
          commitment: "Create a 6-month financial buffer",
          topic: "Financial Planning",
          timestamp: "00:32:10",
          due_date: "2024-04-30",
          status: "In Progress",
        },
      ],
      insights: [
        {
          insight: "My values align more with the new career path",
          topic: "Career Values",
          timestamp: "00:25:18",
          implications: "Would likely find more fulfillment",
          potential_practice: "List specific aspects that align with values",
        },
      ],
    },
  },
}

export const mockTranscripts = {
  1: {
    text: "Coach: Welcome to our first session. How are you feeling today?\nClient: I'm doing okay, a bit nervous about this process but excited too.\nCoach: That's completely normal. Let's start by talking about what you hope to achieve through our coaching sessions.\nClient: I've been feeling stuck in my career and want to find more purpose in my work.",
    segments: [
      {
        start: 0.0,
        end: 5.2,
        text: "Welcome to our first session. How are you feeling today?",
        speaker: "Coach",
      },
      {
        start: 5.8,
        end: 12.5,
        text: "I'm doing okay, a bit nervous about this process but excited too.",
        speaker: "Client",
      },
      {
        start: 13.1,
        end: 20.3,
        text: "That's completely normal. Let's start by talking about what you hope to achieve through our coaching sessions.",
        speaker: "Coach",
      },
      {
        start: 21.0,
        end: 35.2,
        text: "I've been feeling stuck in my career and want to find more purpose in my work.",
        speaker: "Client",
      },
    ],
  },
  2: {
    text: "Coach: It's great to see you again. How has your week been since our last session?\nClient: It's been interesting. I tried implementing some of the strategies we discussed.\nCoach: That's excellent. Which strategies did you find most helpful?",
    segments: [
      {
        start: 0.0,
        end: 8.3,
        text: "It's great to see you again. How has your week been since our last session?",
        speaker: "Coach",
      },
      {
        start: 9.0,
        end: 15.4,
        text: "It's been interesting. I tried implementing some of the strategies we discussed.",
        speaker: "Client",
      },
      {
        start: 16.1,
        end: 22.5,
        text: "That's excellent. Which strategies did you find most helpful?",
        speaker: "Coach",
      },
    ],
  },
  3: {
    text: "Coach: Today we're focusing on your career transition. What's been on your mind about this?\nClient: I've been researching the industry I want to move into, but I'm worried about the salary change.\nCoach: That's a valid concern. Let's explore what financial adjustments might be necessary.",
    segments: [
      {
        start: 0.0,
        end: 10.2,
        text: "Today we're focusing on your career transition. What's been on your mind about this?",
        speaker: "Coach",
      },
      {
        start: 11.0,
        end: 20.5,
        text: "I've been researching the industry I want to move into, but I'm worried about the salary change.",
        speaker: "Client",
      },
      {
        start: 21.2,
        end: 32.1,
        text: "That's a valid concern. Let's explore what financial adjustments might be necessary.",
        speaker: "Coach",
      },
    ],
  },
}

// Helper function to find a session by ID
export function findSessionById(id: number) {
  return mockSessions.find((session) => session.id === id)
}

// Helper function to create a new session
export function createSession(sessionData: any) {
  const newSession = {
    id: mockSessions.length + 1,
    title: sessionData.title,
    date: sessionData.date,
    status: "pending",
    client_name: sessionData.client_name || null,
    notes: sessionData.notes || null,
    file_path: sessionData.file ? `/uploads/session${mockSessions.length + 1}.mp3` : null,
    created_at: new Date().toISOString(),
  }

  mockSessions.push(newSession)
  return newSession
}

// Helper function to upload a recording
export function uploadRecording(sessionId: number, file: any) {
  const session = findSessionById(sessionId)
  if (!session) return null

  session.file_path = `/uploads/session${sessionId}.mp3`
  session.status = "processing"

  return {
    message: "Recording uploaded successfully",
    file_path: session.file_path,
  }
}

// Helper function to start analysis
export function startAnalysis(sessionId: number) {
  const session = findSessionById(sessionId)
  if (!session) return null

  session.status = "analyzing"

  // Simulate analysis completion after a delay
  setTimeout(() => {
    session.status = "completed"
  }, 5000)

  return {
    message: "Analysis started",
    status: session.status,
  }
}

// Helper function to delete a session
export function deleteSession(id: number) {
  const index = mockSessions.findIndex((session) => session.id === id)
  if (index !== -1) {
    mockSessions.splice(index, 1)
    return true
  }
  return false
}

