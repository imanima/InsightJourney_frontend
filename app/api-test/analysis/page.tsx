"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analysisService } from '@/lib/analysis-service'

export default function AnalysisApiTestPage() {
  const [sessionId, setSessionId] = useState<string>('1')
  const [startAnalysisStatus, setStartAnalysisStatus] = useState<string>('Not started')
  const [getAnalysisStatus, setGetAnalysisStatus] = useState<string>('Not started')
  const [pollAnalysisStatus, setPollAnalysisStatus] = useState<string>('Not started')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  
  // Backend API URL for reference
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5002/api/v1'

  const handleStartAnalysis = async () => {
    if (!sessionId) {
      setError('Please enter a session ID')
      return
    }
    
    setLoading(true)
    setStartAnalysisStatus('Testing...')
    setError(null)
    
    try {
      const result = await analysisService.startAnalysis(sessionId)
      setStartAnalysisStatus(result.success ? 'Success' : 'Failed')
      
      if (!result.success) {
        setError(result.error || 'Unknown error')
      } else {
        setStartAnalysisStatus(`Success: ${JSON.stringify(result.data)}`)
      }
    } catch (err) {
      console.error('Error starting analysis:', err)
      setStartAnalysisStatus('Error')
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGetAnalysis = async () => {
    if (!sessionId) {
      setError('Please enter a session ID')
      return
    }
    
    setLoading(true)
    setGetAnalysisStatus('Testing...')
    setError(null)
    setAnalysisResult(null)
    
    try {
      const result = await analysisService.getSessionAnalysis(sessionId)
      setGetAnalysisStatus(result.success ? 'Success' : 'Failed')
      
      if (!result.success) {
        setError(result.error || 'Unknown error')
      } else {
        setGetAnalysisStatus('Success')
        setAnalysisResult(result.data)
      }
    } catch (err) {
      console.error('Error getting analysis:', err)
      setGetAnalysisStatus('Error')
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handlePollAnalysis = async () => {
    if (!sessionId) {
      setError('Please enter a session ID')
      return
    }
    
    setLoading(true)
    setPollAnalysisStatus('Testing...')
    setError(null)
    setAnalysisResult(null)
    
    try {
      // Start with shorter poll settings for testing
      const result = await analysisService.pollAnalysisStatus(sessionId, 3, 1000)
      setPollAnalysisStatus(result.success ? 'Success' : 'Failed')
      
      if (!result.success) {
        setError(result.error || 'Unknown error')
      } else {
        setPollAnalysisStatus('Success')
        setAnalysisResult(result.data)
      }
    } catch (err) {
      console.error('Error polling analysis:', err)
      setPollAnalysisStatus('Error')
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analysis API Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>API URL:</strong> {apiUrl}</p>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Analysis Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Session ID:</label>
            <div className="flex gap-2">
              <Input 
                type="text" 
                value={sessionId} 
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID" 
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleStartAnalysis} 
              disabled={loading}
              className="w-full"
            >
              Start Analysis
            </Button>
            <Button 
              onClick={handleGetAnalysis} 
              disabled={loading}
              className="w-full"
            >
              Get Analysis
            </Button>
            <Button 
              onClick={handlePollAnalysis} 
              disabled={loading}
              className="w-full"
            >
              Poll Analysis Status
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p><strong>Start Analysis Status:</strong> {startAnalysisStatus}</p>
            <p><strong>Get Analysis Status:</strong> {getAnalysisStatus}</p>
            <p><strong>Poll Analysis Status:</strong> {pollAnalysisStatus}</p>
          </div>
          
          {error && (
            <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          {analysisResult && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Analysis Result:</h3>
              <pre className="p-4 bg-gray-100 rounded overflow-auto max-h-96">
                {JSON.stringify(analysisResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 