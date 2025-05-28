// Mock admin data

export const mockAdminSettings = {
  max_sessions: 100,
  max_duration: 60, // minutes
  allowed_file_types: ["mp3", "wav", "m4a", "mp4"],
  analysis_elements: [
    {
      name: "Emotions",
      enabled: true,
      description: "Emotional states and their intensities",
      categories: [
        "Joy",
        "Fear",
        "Anger",
        "Sadness",
        "Surprise",
        "Love",
        "Pride",
        "Anxiety",
        "Frustration",
        "Excitement",
      ],
      format_template: '{"emotion": "string", "intensity": number, "context": "string"}',
      system_instructions: "Identify emotions with their intensity (1-10) and context.",
      analysis_instructions: "List emotions with intensity and context. Format: Emotion (intensity: X) - Context",
    },
    {
      name: "Contexts",
      enabled: true,
      description: "Mental stories and beliefs",
      categories: [
        "Not Enough Time",
        "Not Good Enough / Self-Doubt",
        "Fear of Failure / Perfectionism",
        "Fear of Change",
        "Time Scarcity",
      ],
      format_template:
        '{"category": "string", "belief": "string", "topic": "string", "timestamp": "string", "explanation": "string"}',
      system_instructions: "Identify limiting beliefs and mental models that shape the client's perception.",
      analysis_instructions:
        "Extract mental models and beliefs from the text with their category, topic, and explanation.",
    },
    {
      name: "Insights",
      enabled: true,
      description: "Key realizations and their implications",
      categories: ["Self-awareness", "Relationship Patterns", "Career Values", "Productivity", "Communication"],
      format_template:
        '{"insight": "string", "topic": "string", "timestamp": "string", "implications": "string", "potential_practice": "string"}',
      system_instructions: "Identify key insights and realizations that emerge during the session.",
      analysis_instructions: "Extract insights with their implications and potential practices to implement.",
    },
  ],
}

// Helper function to update admin settings
export function updateAdminSettings(newSettings: any) {
  Object.assign(mockAdminSettings, newSettings)
  return mockAdminSettings
}

// Helper function to get analysis elements
export function getAnalysisElements() {
  return mockAdminSettings.analysis_elements
}

