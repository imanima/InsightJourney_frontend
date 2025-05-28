// Mock user settings data

export const mockUserSettings = {
  1: {
    max_sessions: 50,
    max_duration: 45, // minutes
    allowed_file_types: ["mp3", "wav"],
  },
  2: {
    max_sessions: 100,
    max_duration: 60, // minutes
    allowed_file_types: ["mp3", "wav", "m4a"],
  },
  3: {
    max_sessions: 20,
    max_duration: 30, // minutes
    allowed_file_types: ["mp3"],
  },
}

// Helper function to get user settings
export function getUserSettings(userId: number) {
  return (
    mockUserSettings[userId as keyof typeof mockUserSettings] || {
      max_sessions: 20,
      max_duration: 30,
      allowed_file_types: ["mp3"],
    }
  )
}

// Helper function to update user settings
export function updateUserSettings(userId: number, newSettings: any) {
  if (!mockUserSettings[userId as keyof typeof mockUserSettings]) {
    mockUserSettings[userId as keyof typeof mockUserSettings] = {
      max_sessions: 20,
      max_duration: 30,
      allowed_file_types: ["mp3"],
    }
  }

  Object.assign(mockUserSettings[userId as keyof typeof mockUserSettings], newSettings)
  return mockUserSettings[userId as keyof typeof mockUserSettings]
}

