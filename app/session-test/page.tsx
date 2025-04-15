"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { sessionService } from '@/lib/api-services'

export default function SessionTestPage() {
  // Session Creation Form
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]) // Current date in YYYY-MM-DD
  const [clientName, setClientName] = useState('')
  const [notes, setNotes] = useState('')
  const [transcript, setTranscript] = useState('')
  
  // File Upload Form
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState('')
  
  // State Management
  const [sessions, setSessions] = useState<any[]>([])
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null)

  // Create a new session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await sessionService.createSession(title, date, clientName, notes, transcript)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Session created successfully!' })
        // Add the new session to the list
        setSessions(prev => [result.data, ...prev])
        setCurrentSession(result.data)
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create session' })
    } finally {
      setIsLoading(false)
    }
  }

  // Upload audio file to a session
  const handleUploadAudio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile || !selectedSessionId) {
      setMessage({ type: 'error', text: 'Please select a session and an audio file' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await sessionService.uploadAudio(selectedSessionId, audioFile)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Audio uploaded successfully!' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to upload audio' })
    } finally {
      setIsLoading(false)
    }
  }

  // Get all sessions
  const handleGetSessions = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await sessionService.listSessions()
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else if (result.data?.sessions) {
        setSessions(result.data.sessions)
        setMessage({ type: 'success', text: `Retrieved ${result.data.sessions.length} sessions` })
      } else {
        setMessage({ type: 'error', text: 'No sessions found' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to get sessions' })
    } finally {
      setIsLoading(false)
    }
  }

  // Get session details
  const handleGetSession = async (sessionId: string) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await sessionService.getSession(sessionId)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setCurrentSession(result.data)
        setMessage({ type: 'success', text: 'Session details retrieved' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to get session details' })
    } finally {
      setIsLoading(false)
    }
  }

  // Analyze a session
  const handleAnalyzeSession = async (sessionId: string) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await sessionService.analyzeSession(sessionId)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setAnalysisResults(result.data)
        setMessage({ type: 'success', text: 'Analysis completed successfully' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to analyze session' })
    } finally {
      setIsLoading(false)
    }
  }

  // Save analysis results
  const handleSaveAnalysis = async (sessionId: string) => {
    if (!analysisResults || !analysisResults.results) {
      setMessage({ type: 'error', text: 'No analysis results to save' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await sessionService.saveAnalysis(sessionId, analysisResults.results)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Analysis saved to Neo4j successfully' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save analysis' })
    } finally {
      setIsLoading(false)
    }
  }

  // Get session elements
  const handleGetSessionElements = async (sessionId: string) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await sessionService.getSessionElements(sessionId)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setAnalysisResults(result.data)
        setMessage({ type: 'success', text: 'Session elements retrieved successfully' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to get session elements' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Session Management API Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Create Session Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Session</CardTitle>
            <CardDescription>Enter session details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Session Title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-name">Client Name</Label>
                <Input 
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Session notes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transcript">Transcript</Label>
                <Textarea 
                  id="transcript"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Session transcript"
                  rows={5}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating...' : 'Create Session'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Upload Audio Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Audio File</CardTitle>
            <CardDescription>Add audio to an existing session</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadAudio} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-id">Session ID</Label>
                <Input 
                  id="session-id"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  placeholder="Enter session ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audio-file">Audio File</Label>
                <Input 
                  id="audio-file"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const files = e.target.files
                    if (files && files.length > 0) {
                      setAudioFile(files[0])
                    }
                  }}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Uploading...' : 'Upload Audio'}
              </Button>
            </form>

            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium mb-2">Get All Sessions</h3>
              <Button onClick={handleGetSessions} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Fetch Sessions'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      {sessions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Sessions</CardTitle>
            <CardDescription>Click on a session to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleGetSession(session.id)}>
                  <div className="font-medium">{session.title}</div>
                  <div className="text-sm text-gray-500">
                    {session.date} - {session.client_name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Session Details */}
      {currentSession && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>ID: {currentSession.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-md">
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(currentSession, null, 2)}</pre>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button onClick={() => handleAnalyzeSession(currentSession.id)} disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze Session'}
            </Button>
            <Button onClick={() => handleSaveAnalysis(currentSession.id)} disabled={isLoading || !analysisResults}>
              {isLoading ? 'Saving...' : 'Save Analysis to Neo4j'}
            </Button>
            <Button onClick={() => handleGetSessionElements(currentSession.id)} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Get Session Elements'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-md">
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(analysisResults, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message Display */}
      {message && (
        <Alert className={`mt-6 ${message.type === 'error' ? 'bg-red-100' : 'bg-green-100'}`}>
          <AlertTitle>{message.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
    </div>
  )
} 