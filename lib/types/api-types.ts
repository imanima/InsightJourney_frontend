/**
 * API Types - Type definitions for API requests and responses
 */

// Session Data Types
export interface SessionData {
  title: string;
  content: string | Blob[];
  inputMethod: string;
  language: string;
}

export interface SessionResponse {
  sessionId: string;
  status: string;
}

export interface Session {
  id: string;
  title: string;
  date: string;
  status: string;
  created_at: string;
}

// Analysis Data Types
export interface Emotion {
  emotion: string;
  intensity: number;
  topic: string;
  timestamp: string;
  context: string;
}

export interface Context {
  category: string;
  topic: string;
  timestamp: string;
  belief: string;
  explanation: string;
}

export interface Practice {
  practice: string;
  topic: string;
  frequency: string;
  timestamp: string;
  related_insight: string;
}

export interface Challenge {
  challenge: string;
  topic: string;
  timestamp: string;
  impact: string;
}

export interface Commitment {
  commitment: string;
  topic: string;
  due_date: string;
  status: string;
  timestamp: string;
}

export interface Insight {
  insight: string;
  topic: string;
  timestamp: string;
  implications: string;
  potential_practice: string;
}

export interface SessionElements {
  emotions: Emotion[];
  contexts: Context[];
  practices: Practice[];
  challenges: Challenge[];
  commitments: Commitment[];
  insights: Insight[];
}

export interface SessionAnalysis {
  insights: string[];
  action_items: string[];
  sentiment: string;
  topics: string[];
  elements: SessionElements;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker: string;
}

export interface SessionTranscript {
  session_id: string;
  transcript: TranscriptSegment[];
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  picture?: string;
}

export interface UserProfile extends User {
  settings: UserSettings;
}

export interface UserSettings {
  theme: string;
  notification_preferences: {
    email: boolean;
    push: boolean;
  };
  language: string;
}

// Insights Types
export interface InsightItem {
  id: string;
  type: "emotion" | "context" | "commitment" | "challenge" | "insight";
  content: string;
  topic: string;
  timestamp: string;
  sessionId: string;
  sessionTitle: string;
  additionalInfo?: string;
}

// Action Items Types
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "completed" | "in_progress" | "not_started";
  priority: "high" | "medium" | "low";
  topic: string;
  sessionId: string;
  sessionTitle: string;
} 