/**
 * API Services - Centralized API service layer for the application
 * 
 * This file provides a clean abstraction for all API calls to the backend services.
 * Each service is organized by domain and contains methods that map directly
 * to backend API endpoints.
 */

import { fetchAPI } from './api-client';
import type { 
  SessionData, 
  SessionResponse, 
  SessionElements, 
  SessionAnalysis,
  SessionTranscript,
  UserProfile,
  UserSettings,
  InsightItem,
  ActionItem as ApiActionItem
} from './types/api-types';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface Session {
  id: string;
  title: string;
  date: string;
  transcript: string;
  analysis: {
    emotions: Array<{
      name: string;
      intensity: number;
      context: string;
    }>;
    beliefs: Array<{
      name: string;
      description: string;
    }>;
    topics: string[];
  };
}

export interface Insight {
  id: string;
  session_id: string;
  content: string;
  category: string;
  created_at: string;
}

export interface ActionItem {
  id: string;
  session_id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'not_started';
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  topic: string;
  created_at: string;
}

// Auth Service
export const authService = {
  register: async (email: string, password: string, name: string) => {
    console.log('Register API call:', { email, name });
    const response = await fetchAPI<{ message: string; user_id: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    console.log('Register API response:', response);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  },

  login: async (email: string, password: string) => {
    console.log('Login API call:', { email });
    const response = await fetchAPI<{
      access_token: string;
      user: {
        id: string;
        email: string;
        name: string;
        is_admin: boolean;
        created_at: string | null;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Login API response:', response);
    
    if (response.error) {
      return { error: response.error };
    }
    
    // Store the token
    if (response.data?.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return { data: response.data };
  },

  logout: async () => {
    const response = await fetchAPI('/auth/logout', {
      method: 'POST',
    });
    
    // Remove the token
    localStorage.removeItem('token');
    
    return response;
  },

  getCurrentUser: async () => {
    const response = await fetchAPI<{ user: User }>('/auth/me');
    return response;
  },
};

// Session Service
export const sessionService = {
  createSession: async (title: string, date: string, client_name: string, notes: string, transcript?: string) => {
    const response = await fetchAPI<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        title,
        date,
        client_name,
        notes,
        transcript,
        status: 'pending'
      }),
    });
    return response;
  },

  uploadAudio: async (sessionId: string, audioFile: Blob) => {
    const formData = new FormData();
    formData.append('file', audioFile);

    const response = await fetchAPI<{ message: string; file_path: string }>(`/sessions/${sessionId}/upload`, {
      method: 'POST',
      body: formData,
      headers: {} // Let the browser set the correct Content-Type with boundary
    });
    return response;
  },

  getSession: async (sessionId: string) => {
    const response = await fetchAPI<Session>(`/sessions/${sessionId}`);
    return response;
  },

  listSessions: async () => {
    const response = await fetchAPI<{ sessions: Session[] }>('/sessions');
    return response;
  },

  deleteSession: async (sessionId: string) => {
    const response = await fetchAPI(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return response;
  },

  analyzeSession: async (sessionId: string) => {
    const response = await fetchAPI<{ status: string; results: any }>(`/sessions/${sessionId}/analyze`, {
      method: 'GET',
    });
    return response;
  },

  saveAnalysis: async (sessionId: string, analysisData: any) => {
    const response = await fetchAPI<{ message: string; session_id: string }>(`/sessions/${sessionId}/save-analysis`, {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
    return response;
  },

  getAnalysis: async (sessionId: string) => {
    const response = await fetchAPI<any>(`/sessions/${sessionId}/analysis`);
    return response;
  },

  getSessionElements: async (sessionId: string) => {
    const response = await fetchAPI<{ elements: any }>(`/sessions/${sessionId}/elements`);
    return response;
  },
  
  getUserTopics: async () => {
    const response = await fetchAPI<{ topics: any[] }>('/sessions/topics');
    return response;
  }
};

// Insights Service
export const insightsService = {
  getInsights: async (sessionId: string) => {
    const response = await fetchAPI<Insight[]>(`/sessions/${sessionId}/insights`);
    return response;
  },

  createInsight: async (sessionId: string, content: string, category: string) => {
    const response = await fetchAPI<Insight>(`/sessions/${sessionId}/insights`, {
      method: 'POST',
      body: JSON.stringify({ content, category }),
    });
    return response;
  },
};

// Action Items Service
export const actionItemsService = {
  getActionItems: async (sessionId: string) => {
    const response = await fetchAPI<ActionItem[]>(`/sessions/${sessionId}/action-items`);
    return response;
  },

  createActionItem: async (
    sessionId: string,
    title: string,
    description: string,
    dueDate: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    topic?: string
  ) => {
    const response = await fetchAPI<ActionItem>(`/sessions/${sessionId}/action-items`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        due_date: dueDate,
        priority,
        topic,
      }),
    });
    return response;
  },

  updateActionItem: async (sessionId: string, actionItemId: string, updates: Partial<ActionItem>) => {
    const response = await fetchAPI<ActionItem>(`/sessions/${sessionId}/action-items/${actionItemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response;
  },

  deleteActionItem: async (sessionId: string, actionItemId: string) => {
    const response = await fetchAPI(`/sessions/${sessionId}/action-items/${actionItemId}`, {
      method: 'DELETE',
    });
    return response;
  },
};

// User Service - handles all user-related API calls
export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await fetchAPI<UserProfile>('/user/profile');
      
      if (!response.data) {
        return {
          success: false,
          profile: null,
          error: response.error || 'Failed to fetch profile',
        };
      }

      return {
        success: true,
        profile: response.data,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return {
        success: false,
        profile: null,
        error: error instanceof Error ? error.message : "Failed to fetch profile",
      };
    }
  },

  // Update user settings
  updateSettings: async (settings: UserSettings) => {
    try {
      const response = await fetchAPI<{ settings: UserSettings }>('/user/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      
      if (!response.data) {
        return {
          success: false,
          settings: null,
          error: response.error || 'Failed to update settings',
        };
      }

      return {
        success: true,
        settings: response.data.settings,
        error: null,
      };
    } catch (error) {
      console.error("Error updating settings:", error);
      return {
        success: false,
        settings: null,
        error: error instanceof Error ? error.message : "Failed to update settings",
      };
    }
  },
}; 