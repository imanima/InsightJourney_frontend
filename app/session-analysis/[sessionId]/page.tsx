"use client";

import { useState, useEffect } from "react";
import { sessionService, insightsService, actionItemsService } from "@/lib/api-services";
import type { Session, InsightItem, ActionItem } from "@/lib/types/api-types";
import type { Session as ApiSession, Insight as ApiInsight, ActionItem as ApiActionItem } from "@/lib/api-services";

// Helper function to convert API status to UI status
const convertApiStatusToUi = (apiStatus: 'pending' | 'completed'): ActionItem['status'] => {
  if (apiStatus === 'completed') return 'completed';
  return 'not_started';
};

// Helper function to convert UI status to API status
const convertUiStatusToApi = (uiStatus: ActionItem['status']): 'pending' | 'completed' => {
  if (uiStatus === 'completed') return 'completed';
  return 'pending';
};

// Helper function to convert API action item to UI action item
const convertApiActionItemToUi = (apiItem: ApiActionItem, sessionId: string, sessionTitle: string): ActionItem => ({
  id: apiItem.id,
  title: apiItem.content,
  description: "",
  dueDate: apiItem.due_date,
  status: convertApiStatusToUi(apiItem.status),
  priority: "medium",
  topic: "",
  sessionId,
  sessionTitle,
});

// Helper function to convert UI action item to API action item
const convertUiActionItemToApi = (uiItem: Partial<ActionItem>): Partial<ApiActionItem> => ({
  content: uiItem.title || "",
  due_date: uiItem.dueDate || "",
  status: uiItem.status ? convertUiStatusToApi(uiItem.status) : 'pending',
});

// Helper function to convert API session to UI session
const convertApiSessionToUi = (apiSession: ApiSession): Session => ({
  id: apiSession.id,
  title: apiSession.title,
  date: apiSession.date,
  status: apiSession.analysis?.topics?.[0] || "unknown",
  created_at: new Date().toISOString(),
});

export default function SessionAnalysisPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        
        // Fetch session details
        const sessionResult = await sessionService.getSession(params.sessionId);
        if (!sessionResult.data) {
          throw new Error(sessionResult.error || "Failed to fetch session");
        }
        const apiSession = sessionResult.data;
        setSession(convertApiSessionToUi(apiSession));

        // Fetch insights
        const insightsResult = await insightsService.getInsights(params.sessionId);
        if (!insightsResult.data) {
          throw new Error(insightsResult.error || "Failed to fetch insights");
        }
        setInsights(insightsResult.data.map(insight => ({
          id: insight.id,
          type: "insight",
          content: insight.content,
          topic: insight.category,
          timestamp: insight.created_at,
          sessionId: params.sessionId,
          sessionTitle: apiSession.title,
        })));

        // Fetch action items
        const actionItemsResult = await actionItemsService.getActionItems(params.sessionId);
        if (!actionItemsResult.data) {
          throw new Error(actionItemsResult.error || "Failed to fetch action items");
        }
        setActionItems(actionItemsResult.data.map(apiItem => 
          convertApiActionItemToUi(apiItem as unknown as ApiActionItem, params.sessionId, apiSession.title)
        ));

      } catch (error) {
        console.error("Error fetching session data:", error);
        setError(error instanceof Error ? error.message : "Failed to load session data");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [params.sessionId]);

  const handleUpdateInsight = async (insightId: string, updates: Partial<InsightItem>) => {
    try {
      const result = await insightsService.createInsight(
        params.sessionId,
        updates.content || "",
        updates.topic || ""
      );
      if (!result.data) {
        throw new Error(result.error || "Failed to update insight");
      }
      setInsights(prev => prev.map(i => i.id === insightId ? {
        ...i,
        content: result.data!.content,
        topic: result.data!.category,
        timestamp: result.data!.created_at,
      } : i));
    } catch (error) {
      console.error("Error updating insight:", error);
      setError(error instanceof Error ? error.message : "Failed to update insight");
    }
  };

  const handleUpdateActionItem = async (actionItemId: string, updates: Partial<ActionItem>) => {
    try {
      const apiUpdates = convertUiActionItemToApi(updates);
      const result = await actionItemsService.updateActionItem(
        params.sessionId,
        actionItemId,
        apiUpdates as Partial<import('@/lib/api-services').ActionItem>
      );
      if (!result.data) {
        throw new Error(result.error || "Failed to update action item");
      }
      setActionItems(prev => prev.map(a => a.id === actionItemId ? 
        convertApiActionItemToUi(result.data as unknown as ApiActionItem, params.sessionId, session?.title || "")
      : a));
    } catch (error) {
      console.error("Error updating action item:", error);
      setError(error instanceof Error ? error.message : "Failed to update action item");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!session) {
    return <div>Session not found</div>;
  }

  return (
    <div>
      <h1>{session.title}</h1>
      <p>Created: {new Date(session.created_at).toLocaleString()}</p>
      
      <h2>Insights</h2>
      {insights.map(insight => (
        <div key={insight.id}>
          <p>{insight.content}</p>
          <p>Topic: {insight.topic}</p>
          <p>Type: {insight.type}</p>
        </div>
      ))}

      <h2>Action Items</h2>
      {actionItems.map(actionItem => (
        <div key={actionItem.id}>
          <h3>{actionItem.title}</h3>
          <p>{actionItem.description}</p>
          <p>Due: {actionItem.dueDate}</p>
          <p>Status: {actionItem.status}</p>
          <p>Priority: {actionItem.priority}</p>
          <button onClick={() => handleUpdateActionItem(actionItem.id, { 
            status: actionItem.status === "completed" ? "not_started" : "completed" 
          })}>
            {actionItem.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
          </button>
        </div>
      ))}
    </div>
  );
} 