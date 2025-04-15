"use client"

import { useState, useEffect } from 'react'

export default function SimpleTestPage() {
  const [status, setStatus] = useState('Loading...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHealth() {
      try {
        // Direct fetch to the health endpoint without any wrappers or complex logic
        const response = await fetch('http://127.0.0.1:5002/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Skip credentials for this basic test
          mode: 'cors',
        })

        if (response.ok) {
          const data = await response.json()
          setStatus(`Success! Backend status: ${JSON.stringify(data)}`)
          setError(null)
        } else {
          setStatus('Failed to connect to backend')
          setError(`Error: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        setStatus('Connection error')
        setError(`${error instanceof Error ? error.message : String(error)}`)
      }
    }

    fetchHealth()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Backend Test</h1>
      <p>This page makes a direct fetch to the backend health endpoint.</p>
      
      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-medium">Status</h2>
        <p className="mt-2">{status}</p>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <a 
          href="/api-test" 
          className="text-blue-500 underline"
        >
          Go to full API test page
        </a>
      </div>
    </div>
  )
} 