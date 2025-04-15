// Types for the analysis data
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

export interface AnalysisData {
  emotions: Emotion[];
  challenges: Challenge[];
  commitments: Commitment[];
}

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

// Import fetchAPI from api-client
import { fetchAPI } from "./api-client";

// Service functions for analysis
export const analysisService = {
  // Create a new session
  createSession: async (sessionData: SessionData) => {
    try {
      const formData = new FormData();
      formData.append('title', sessionData.title);
      formData.append('inputMethod', sessionData.inputMethod);
      formData.append('language', sessionData.language);
      
      if (sessionData.inputMethod === 'audio' && Array.isArray(sessionData.content)) {
        const audioBlob = new Blob(sessionData.content, { type: 'audio/webm' });
        formData.append('audio', audioBlob);
      } else {
        formData.append('text', sessionData.content as string);
      }

      const response = await fetchAPI<SessionResponse>('/sessions', {
        method: 'POST',
        body: formData,
      });

      if (!response.data) {
        throw new Error(response.error || 'Failed to create session');
      }

      return {
        success: true,
        sessionId: response.data.sessionId,
        error: null,
      };
    } catch (error) {
      console.error("Error creating session:", error);
      return {
        success: false,
        sessionId: null,
        error: error instanceof Error ? error.message : "Failed to create session",
      };
    }
  },

  // Start a session analysis
  startAnalysis: async (sessionId: string) => {
    try {
      const response = await fetchAPI<{ status: string; results: any }>(
        `/sessions/${sessionId}/analyze`,
        {
          method: "POST",
        }
      );
      
      if (!response.data) {
        throw new Error(response.error || 'Failed to start analysis');
      }

      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error("Error starting analysis:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Failed to start analysis",
      };
    }
  },

  // Get analysis for a session
  getSessionAnalysis: async (sessionId: string) => {
    try {
      const response = await fetchAPI<SessionAnalysis>(`/sessions/${sessionId}/analysis`);
      
      if (!response.data) {
        throw new Error(response.error || 'Failed to fetch analysis');
      }

      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error("Error getting session analysis:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Failed to fetch analysis",
      };
    }
  },

  // Poll for analysis status
  pollAnalysisStatus: async (sessionId: string, maxAttempts: number = 30, interval: number = 2000) => {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetchAPI<SessionAnalysis>(`/sessions/${sessionId}/analysis`);
        
        if (response.data) {
          return {
            success: true,
            data: response.data,
            error: null,
          };
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
      } catch (error) {
        console.error("Error polling analysis status:", error);
        return {
          success: false,
          data: null,
          error: error instanceof Error ? error.message : "Failed to poll analysis status",
        };
      }
    }
    
    return {
      success: false,
      data: null,
      error: "Analysis timed out",
    };
  },

  // Get session transcript
  getSessionTranscript: async (sessionId: string) => {
    try {
      const response = await fetchAPI<{ session_id: string; transcript: any[] }>(`/sessions/${sessionId}/transcript`);
      
      if (!response.data) {
        throw new Error(response.error || 'Failed to fetch transcript');
      }

      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error("Error getting session transcript:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Failed to fetch transcript",
      };
    }
  },

  // Get elements for a session
  getSessionElements: async (sessionId: string) => {
    try {
      const response = await fetchAPI<{ elements: SessionElements }>(`/sessions/${sessionId}/elements`);
      
      if (!response.data) {
        throw new Error(response.error || 'Failed to fetch session elements');
      }

      return {
        success: true,
        data: response.data.elements,
        error: null,
      };
    } catch (error) {
      console.error("Error getting session elements:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Failed to fetch session elements",
      };
    }
  },

  // Convert SessionElements to AnalysisData (for general analysis page)
  convertToAnalysisData: (elements: SessionElements): AnalysisData => {
    return {
      emotions: elements.emotions,
      challenges: elements.challenges,
      commitments: elements.commitments,
    };
  }
}; 