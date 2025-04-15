"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Define an interface for endpoint status
interface EndpointStatus {
  status: string;
  error: string | null;
}

export default function ApiTestPage() {
  const [healthStatus, setHealthStatus] = useState<string>('Loading...')
  const [healthError, setHealthError] = useState<string | null>(null)
  const [endpoints, setEndpoints] = useState<Record<string, EndpointStatus>>({
    'health': { status: 'Not tested', error: null },
    'api/v1/sessions': { status: 'Not tested', error: null },
    'api/v1/auth/me': { status: 'Not tested', error: null }
  });

  useEffect(() => {
    async function testEndpoint(endpoint: string) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api/v1';
        // Remove /api/v1 from the base URL for health check
        const baseUrl = endpoint === 'health' ? 
          apiUrl.replace('/api/v1', '') : 
          apiUrl.replace('/api/v1', '');
          
        // Full URL with proper path adjustments
        const fullUrl = endpoint.startsWith('api/v1') ? 
          `${baseUrl}/${endpoint}` : 
          `${baseUrl}/${endpoint}`;
        
        console.log(`Testing endpoint: ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // For testing without CORS issues, try without credentials first
          // credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setEndpoints(prev => ({
            ...prev,
            [endpoint]: {
              status: `Success (${response.status}) - ${JSON.stringify(data)}`,
              error: null
            }
          }));
        } else {
          setEndpoints(prev => ({
            ...prev,
            [endpoint]: {
              status: `Failed (${response.status})`,
              error: response.statusText
            }
          }));
        }
      } catch (error) {
        setEndpoints(prev => ({
          ...prev,
          [endpoint]: {
            status: 'Error',
            error: `${error instanceof Error ? error.message : String(error)}`
          }
        }));
      }
    }

    // Test all endpoints
    Object.keys(endpoints).forEach(endpoint => {
      testEndpoint(endpoint);
    });

    // Also separately handle the health check for backward compatibility
    async function testHealthEndpoint() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api/v1';
        const baseUrl = apiUrl.replace('/api/v1', '');
        
        const healthResponse = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          setHealthStatus(`Backend health check: ${healthData.status}`);
          setHealthError(null);
        } else {
          setHealthStatus('Backend health check failed');
          setHealthError(`Health Check Error: ${healthResponse.status} ${healthResponse.statusText}`);
        }
      } catch (error) {
        setHealthStatus('Backend connection failed');
        setHealthError(`Connection Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    testHealthEndpoint();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Backend Info</h2>
        <p><strong>API URL Environment Variable:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
      </div>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Test Specific Features</h2>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/api-test/analysis">Test Analysis API</Link>
          </Button>
        </div>
      </div>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Overall Health Status</h2>
        <p>{healthStatus}</p>
        {healthError && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            <p className="font-semibold">Error:</p>
            <p>{healthError}</p>
          </div>
        )}
      </div>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Detailed Endpoint Tests</h2>
        <div className="mt-4 space-y-4">
          {Object.entries(endpoints).map(([endpoint, { status, error }]) => (
            <div key={endpoint} className="p-3 border rounded">
              <h3 className="font-semibold">{endpoint}</h3>
              <p><strong>Status:</strong> {status}</p>
              {error && (
                <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
                  <p>{error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Manual Test Form</h2>
        <p className="mb-2">Enter an endpoint to test (e.g., "health" or "api/v1/sessions"):</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 p-2 border rounded" 
            placeholder="Endpoint path"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const endpoint = e.currentTarget.value;
                if (endpoint) {
                  setEndpoints(prev => ({
                    ...prev,
                    [endpoint]: { status: 'Testing...', error: null }
                  }))
                  // Trigger a re-render which will test the new endpoint
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 