"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Keyboard, Info, AlertTriangle, Loader2, Clock, CheckCircle2 } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import AudioVisualizer from "@/components/audio-visualizer"
import { sessionsAPI, transcriptionAPI } from "@/lib/api-client"

export default function AnalyzeInsightsPage() {
  // State management
  const [state, setState] = useState({
    mediaRecorder: null as MediaRecorder | null,
    audioChunks: [] as Blob[],
    isRecording: false,
    startTime: null as number | null,
    timerInterval: null as NodeJS.Timeout | null,
    inputMethod: "audio", // Default to audio input
    sessionTitle: "",
    language: "en",
    insightText: "",
    isAnalyzing: false,
    showAnalysisResults: false,
    offlineMode: false,
    stream: null as MediaStream | null,
    showConsentDialog: false,
    analysisStep: "",
  })

  const [timer, setTimer] = useState("00:00")
  const router = useRouter()
  const { user } = useAuth() // Use our custom auth hook instead of useSession

  // Check for offline status
  useEffect(() => {
    const handleOnline = () => setState((prev) => ({ ...prev, offlineMode: false }))
    const handleOffline = () => setState((prev) => ({ ...prev, offlineMode: true }))

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    setState((prev) => ({ ...prev, offlineMode: !navigator.onLine }))

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Toggle between audio and text input
  const toggleInterface = (method: "audio" | "text") => {
    if (state.isRecording && method === "text") {
      stopRecording()
    }

    setState((prev) => ({
      ...prev,
      inputMethod: method,
      showAnalysisResults: false,
    }))
  }

  // Recording functions
  const toggleRecording = () => {
    if (state.isRecording) {
      stopRecording()
    } else {
      // Show consent dialog before starting recording
      setState((prev) => ({ ...prev, showConsentDialog: true }))
    }
  }

  const handleConsentAccept = () => {
    setState((prev) => ({ ...prev, showConsentDialog: false }))
    startRecording()
  }

  const handleConsentDecline = () => {
    setState((prev) => ({ ...prev, showConsentDialog: false }))
  }

  const startRecording = async () => {
    // Check for browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support audio analysis. Please try using a modern browser like Chrome, Firefox, or Safari.")
      return
    }

    // Check if we're on HTTP (not localhost) - this will cause issues
    if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      alert(`Audio analysis requires HTTPS for security, or use localhost.\n\nTo fix this:\n1. Open a new tab\n2. Go to: http://localhost:4000/analyze-insights\n3. Try again\n\nCurrent URL: ${window.location.href}`)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
        },
      })

      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        alert("Your browser does not support audio analysis. Please try using Chrome, Firefox, or Safari.")
        stream.getTracks().forEach(track => track.stop())
        return
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      })

      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        // Handle recording stop
        clearInterval(state.timerInterval as NodeJS.Timeout)

        // Stop all tracks in the stream
        if (state.stream) {
          state.stream.getTracks().forEach((track) => track.stop())
        }

        setState((prev) => ({
          ...prev,
          isRecording: false,
          timerInterval: null,
          audioChunks,
          stream: null,
        }))
      }

      mediaRecorder.start()

      const startTime = Date.now()
      const timerInterval = setInterval(updateTimer, 1000, startTime)

      setState((prev) => ({
        ...prev,
        mediaRecorder,
        startTime,
        timerInterval,
        isRecording: true,
        stream,
      }))
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Unable to access microphone. Please check your permissions.")
    }
  }

  const stopRecording = () => {
    if (state.mediaRecorder && state.isRecording) {
      state.mediaRecorder.stop()
      clearInterval(state.timerInterval as NodeJS.Timeout)

      setState((prev) => ({
        ...prev,
        isRecording: false,
        timerInterval: null,
      }))
    }
  }

  const updateTimer = (startTime: number) => {
    const now = Date.now()
    const diff = now - startTime
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    setTimer(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
  }

  const handleAnalysis = async () => {
    setState((prev) => ({ ...prev, isAnalyzing: true, analysisStep: "Preparing analysis..." }))

    try {
      if (state.inputMethod === "text" && state.insightText.trim()) {
        // Direct text analysis using the directAnalysis API
        setState((prev) => ({ ...prev, analysisStep: "Creating session..." }))
        console.log("Starting direct text analysis...")
        
        // The directAnalysis function creates a session and runs analysis in one call
        const analysisResponse = await sessionsAPI.directAnalysis(state.insightText.trim())
        
        if (analysisResponse.error) {
          throw new Error(analysisResponse.error)
        }
        
        setState((prev) => ({ ...prev, analysisStep: "Analysis complete!" }))
        
        // Get the session ID from the analysis response
        const sessionId = (analysisResponse.data as any)?.session_id
        
        if (sessionId) {
          console.log("Analysis completed for session:", sessionId)
          router.push(`/session-analysis/${sessionId}`)
        } else {
          throw new Error("Failed to get session ID from analysis")
        }
        
      } else if (state.inputMethod === "audio" && state.audioChunks.length > 0) {
        // Audio transcription and analysis workflow
        setState((prev) => ({ ...prev, analysisStep: "Processing audio..." }))
        console.log("Starting audio transcription and analysis workflow...")
        
        // Step 1: Convert audio chunks to file
        const audioBlob = new Blob(state.audioChunks, { type: "audio/webm" })
        const audioFile = new File([audioBlob], "session-audio.webm", { type: "audio/webm" })
        
        console.log("Audio file prepared:", audioFile.size, "bytes")
        
        setState((prev) => ({ ...prev, analysisStep: "Creating session..." }))
        
        // Step 2: Create session first
        const sessionData = {
          title: state.sessionTitle || "Audio Analysis Session",
          date: new Date().toISOString(),
          description: "Audio session analysis",
          duration: Math.floor((Date.now() - (state.startTime || Date.now())) / 1000)
        }
        
        const sessionResponse = await sessionsAPI.createSession(sessionData)
        
        if (sessionResponse.error) {
          throw new Error(sessionResponse.error)
        }
        
        const sessionId = (sessionResponse.data as any)?.id
        
        if (!sessionId) {
          throw new Error("Failed to create session")
        }
        
        console.log("Session created with ID:", sessionId)
        
        setState((prev) => ({ ...prev, analysisStep: "Uploading audio for transcription..." }))
        
        // Step 3: Upload audio for transcription using the correct endpoint
        const transcriptionResponse = await transcriptionAPI.uploadAudio(audioFile, undefined, {
          language: "en",
          format: "text",
          speaker_detection: false
        })
        
        if (transcriptionResponse.error) {
          throw new Error(transcriptionResponse.error)
        }
        
        const transcriptionId = (transcriptionResponse.data as any)?.id
        
        if (!transcriptionId) {
          throw new Error("Failed to start transcription")
        }
        
        console.log("Transcription started with ID:", transcriptionId)
        
        setState((prev) => ({ ...prev, analysisStep: "Transcribing audio..." }))
        
        // Step 4: Poll for transcription completion
        let transcriptionCompleted = false
        let attempts = 0
        const maxAttempts = 60 // 5 minutes max
        
        while (!transcriptionCompleted && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
          
          const statusResponse = await transcriptionAPI.getTranscriptionStatus(transcriptionId)
          
          if (statusResponse.error) {
            throw new Error(`Transcription status error: ${statusResponse.error}`)
          }
          
          const status = (statusResponse.data as any)?.status
          const progress = (statusResponse.data as any)?.progress || 0
          
          setState((prev) => ({ ...prev, analysisStep: `Transcribing audio... ${progress}%` }))
          
          if (status === "completed") {
            transcriptionCompleted = true
          } else if (status === "failed") {
            throw new Error("Transcription failed")
          }
          
          attempts++
        }
        
        if (!transcriptionCompleted) {
          throw new Error("Transcription timeout - please try again")
        }
        
        setState((prev) => ({ ...prev, analysisStep: "Getting transcription result..." }))
        
        // Step 5: Get the transcription result
        const resultResponse = await transcriptionAPI.getTranscriptionResult(transcriptionId)
        
        if (resultResponse.error) {
          throw new Error(resultResponse.error)
        }
        
        const transcript = (resultResponse.data as any)?.transcript
        
        if (!transcript) {
          throw new Error("No transcript received")
        }
        
        setState((prev) => ({ ...prev, analysisStep: "Linking transcription to session..." }))
        
        // Step 6: Link transcription to session
        const linkResponse = await transcriptionAPI.linkToSession(transcriptionId, sessionId)
        
        if (linkResponse.error) {
          console.warn("Failed to link transcription to session:", linkResponse.error)
          // Continue anyway as this is not critical
        }
        
        setState((prev) => ({ ...prev, analysisStep: "Starting analysis..." }))
        
        // Step 7: Start analysis with the transcript
        const analysisResponse = await sessionsAPI.startAnalysis(sessionId)
        
        if (analysisResponse.error) {
          throw new Error(analysisResponse.error)
        }
        
        console.log("Analysis started")
        
        setState((prev) => ({ ...prev, analysisStep: "Analysis complete!" }))
        
        // Step 8: Navigate to session analysis page
        router.push(`/session-analysis/${sessionId}`)
        
      } else {
        throw new Error("No content to analyze. Please provide text or record audio.")
      }
      
    } catch (error) {
      console.error("Analysis failed:", error)
      
      let errorMessage = "Analysis failed. Please try again."
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      alert(`Analysis Error: ${errorMessage}`)
      
    } finally {
      setState((prev) => ({ ...prev, isAnalyzing: false, analysisStep: "" }))
    }
  }

  // Mock recent sessions
  const recentSessions = [
    {
      id: "1",
      title: "Morning Reflection",
      timestamp: "Today, 9:30 AM",
      stats: "3 emotions, 2 insights identified",
    },
    {
      id: "2",
      title: "Weekly Check-in",
      timestamp: "Yesterday, 4:15 PM",
      stats: "5 emotions, 4 insights identified",
    },
  ]

  return (
    <MobileLayout title="Analyze Session" showBackButton>
      <div className="container px-4 py-6 pb-16">
        {/* Main Card */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-xl flex items-center">
              <span className="mr-2">New Analysis</span>
              {state.isRecording && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <span className="animate-pulse mr-1 h-2 w-2 rounded-full bg-red-600"></span>
                  Analyzing
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-6">
            {/* Session Title */}
            <div className="mb-6">
              <Label htmlFor="sessionTitle" className="text-base font-medium mb-2 block">
                Session Title
              </Label>
              <Input
                id="sessionTitle"
                data-testid="session-title-input"
                placeholder="e.g., Morning Reflection"
                value={state.sessionTitle}
                onChange={(e) => setState((prev) => ({ ...prev, sessionTitle: e.target.value }))}
                className="h-12 text-base"
              />
            </div>

            {/* Input Method Tabs */}
            <Tabs
              defaultValue="audio"
              value={state.inputMethod}
              onValueChange={(value) => toggleInterface(value as "audio" | "text")}
              className="mt-6"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                <TabsTrigger value="audio" className="text-base flex items-center gap-2 h-full">
                  <Mic className="h-5 w-5" />
                  Analyze Audio
                </TabsTrigger>
                <TabsTrigger value="text" className="text-base flex items-center gap-2 h-full">
                  <Keyboard className="h-5 w-5" />
                  Analyze Transcript
                </TabsTrigger>
              </TabsList>

              {/* Audio Analysis Interface */}
              <TabsContent value="audio" className="space-y-6">
                {/* Audio Visualizer */}
                <div className="h-32 bg-gray-50 rounded-lg overflow-hidden border" data-testid="audio-visualizer">
                  <AudioVisualizer isRecording={state.isRecording} stream={state.stream || undefined} />
                </div>

                {/* Timer Display */}
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="text-2xl font-mono font-medium" data-testid="recording-timer">
                      {timer}
                    </span>
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={toggleRecording}
                    className={`w-20 h-20 rounded-full shadow-md ${
                      state.isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                    }`}
                    data-testid="record-button"
                    size="lg"
                  >
                    {state.isRecording ? (
                      <span className="h-8 w-8 rounded-sm bg-white"></span>
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                </div>

                {/* Instructions */}
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Info className="h-4 w-4" />
                    {state.isRecording ? "Tap to stop recording" : "Tap to start analyzing your session"}
                  </p>
                </div>
              </TabsContent>

              {/* Text Input Interface */}
              <TabsContent value="text">
                <div className="space-y-4">
                  <Label htmlFor="insightText" className="text-base font-medium">
                    Session Transcript
                  </Label>
                  <Textarea
                    id="insightText"
                    rows={8}
                    placeholder="Paste or type your session transcript here for analysis..."
                    value={state.insightText}
                    onChange={(e) => setState((prev) => ({ ...prev, insightText: e.target.value }))}
                    className="resize-none text-base p-4"
                  />
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    Enter your session transcript here. The more detailed, the better the analysis.
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Analysis Button */}
            {((state.inputMethod === "text" && state.insightText.trim()) ||
              (state.inputMethod === "audio" && !state.isRecording && state.audioChunks.length > 0)) && (
              <div className="mt-8">
                <Button
                  className="w-full h-12 text-base font-medium"
                  onClick={handleAnalysis}
                  disabled={state.isAnalyzing}
                  data-testid="analyze-button"
                >
                  {state.isAnalyzing ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {state.analysisStep || "Analyzing..."}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Analyze Session
                    </span>
                  )}
                </Button>
                
                {/* Help text for what will happen */}
                <div className="text-center mt-3">
                  <p className="text-xs text-muted-foreground">
                    {state.inputMethod === "audio" 
                      ? "Your audio will be transcribed and analyzed for emotions and insights"
                      : "Your transcript will be analyzed for emotions, patterns, and therapeutic insights"
                    }
                  </p>
                </div>
              </div>
            )}
            
            {/* Show message when nothing to analyze */}
            {state.inputMethod === "audio" && !state.isRecording && state.audioChunks.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Record some audio to begin analysis
                </p>
              </div>
            )}
            
            {state.inputMethod === "text" && !state.insightText.trim() && (
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Enter your session transcript to begin analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4 px-1">Recent Sessions</h2>
            <div className="space-y-3" data-testid="sessions-list">
              {recentSessions.map((session) => (
                <Card key={session.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-base">{session.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{session.timestamp}</p>
                        <p className="text-sm mt-2">{session.stats}</p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-1">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Offline Support */}
      {state.offlineMode && (
        <div className="fixed bottom-20 left-4 right-4 z-40" data-testid="offline-indicator">
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md"
            role="alert"
          >
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">You are currently offline</p>
                <p className="text-sm mt-1">Your session data will be saved and uploaded when you're back online.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consent Dialog */}
      {state.showConsentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Audio Analysis Consent</h3>
            </div>
            
            <div className="space-y-4 text-sm text-gray-600 mb-6">
              <p>
                <strong>Important:</strong> Before starting audio analysis with AI, please ensure:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You have checked with anyone else in the room</li>
                <li>All participants consent to AI-powered analysis</li>
                <li>You understand the session will be processed by AI</li>
                <li>You're comfortable with the privacy implications</li>
              </ul>
              
              {/* Enhanced Privacy Section */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                  🔒 Your Privacy is Protected
                </h4>
                <ul className="text-xs text-green-700 space-y-1.5 list-disc list-inside">
                  <li><strong>All data is encrypted</strong> during transmission and storage</li>
                  <li><strong>Transcripts are NOT stored</strong> - only analysis results are kept</li>
                  <li><strong>You can delete your data</strong> at any time from settings</li>
                  <li><strong>Data is anonymized</strong> - no way to identify you from the analysis</li>
                  <li><strong>Local processing</strong> when possible to minimize data sharing</li>
                </ul>
              </div>
              
              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <strong>What we analyze:</strong> Emotions, patterns, and therapeutic insights only. 
                <strong>What we don't store:</strong> Raw audio files or full transcripts.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleConsentDecline}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleConsentAccept}
              >
                I Agree, Start Analysis
              </Button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  )
}

