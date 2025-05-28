import { ActionItem } from "./types" // Assuming these types are defined here

// Mock fetch API function (replace with your actual fetch API)\
const mockFetchAPI = <T>(endpoint: string, options: { method: string; body?: string } = { method: 'GET' }) => {
  const { method } = options;

  // Action Items endpoints
  if (endpoint === '/action-items' && method === 'GET') {
    return { 
      data: { actionItems: mockActionItems } as unknown as T, 
      status: 200 
    };
  }

  if (endpoint.match(/^\/action-items\/\d+$/) && method === 'PATCH') {
    const id = endpoint.split('/').pop() || '';
    const updates = JSON.parse(options.body as string);
    const updatedItem = updateActionItem(id, updates);
    
    if (!updatedItem) {
      return { error: "Action item not found", status: 404 };
    }
    
    return { 
      data: { actionItem: updatedItem } as unknown as T, 
      status: 200 
    };
  }

  // Insights endpoints
  if (endpoint === '/insights' && method === 'GET') {
    return { 
      data: { insights: mockInsights } as unknown as T, 
      status: 200 
    };
  }

  return { error: "Not Found", status: 404 };
};

// Add these to the exports section
// Action Items API
export const actionItemsAPI = {
  getActionItems: async () => {
    return mockFetchAPI<{ actionItems: ActionItem[] }>("/action-items");
  },
  
  updateActionItem: async (id: string, data: Partial<ActionItem>) => {
    return mockFetchAPI<{ actionItem: ActionItem }>(`/action-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// Insights API
export const insightsAPI = {
  getInsights: async () => {
    return mockFetchAPI<{ insights: InsightItem[] }>("/insights");
  },
};

