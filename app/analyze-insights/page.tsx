"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { sessionsAPI, transcriptionAPI } from "@/lib/api-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Mic, 
  Upload, 
  FileText, 
  Clock, 
  Info, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  Square,
  Loader2,
  ChevronRight,
  Sparkles
} from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { toast } from "react-hot-toast"
import AudioVisualizer from "@/components/audio-visualizer"

// Types
interface AnalysisState {
  step: "input" | "processing" | "complete"
  method: "record" | "upload" | "text"
  sessionTitle: string
  
  // Audio recording
  isRecording: boolean
  audioChunks: Blob[]
  stream: MediaStream | null
  recordingStartTime: number | null
  
  // Audio upload
  uploadedFile: File | null
  
  // Text input
  textContent: string
  
  // Processing
  isAnalyzing: boolean
  analysisProgress: string
  
  // Consent
  showConsentDialog: boolean
  consentAccepted: boolean
}

export default function AnalyzeInsightsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [timer, setTimer] = useState("00:00")
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [state, setState] = useState<AnalysisState>({
    step: "input",
    method: "record",
    sessionTitle: "",
    isRecording: false,
    audioChunks: [],
    stream: null,
    recordingStartTime: null,
    uploadedFile: null,
    textContent: "",
    isAnalyzing: false,
    analysisProgress: "",
    showConsentDialog: false,
    consentAccepted: false
  })

  // Timer for recording
  useEffect(() => {
    if (state.isRecording && state.recordingStartTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - state.recordingStartTime!
        const minutes = Math.floor(elapsed / 60000)
        const seconds = Math.floor((elapsed % 60000) / 1000)
        setTimer(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (!state.isRecording) {
        setTimer("00:00")
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [state.isRecording, state.recordingStartTime])

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        setState(prev => ({ 
          ...prev, 
          audioChunks: chunks,
          isRecording: false,
          stream: null
        }))
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start(1000) // Collect data every second
      
      setState(prev => ({ 
        ...prev, 
        isRecording: true,
        stream,
        recordingStartTime: Date.now(),
        audioChunks: []
      }))
      
      // Store recorder for stopping later
      ;(window as any).currentRecorder = mediaRecorder
      
    } catch (error) {
      console.error("Error starting recording:", error)
      toast.error("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    const recorder = (window as any).currentRecorder
    if (recorder && recorder.state === "recording") {
      recorder.stop()
    }
  }

  const toggleRecording = () => {
    if (state.isRecording) {
      stopRecording()
    } else {
      if (!state.consentAccepted) {
        setState(prev => ({ ...prev, showConsentDialog: true }))
        return
      }
      startRecording()
    }
  }

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'video/mp4', 'video/webm']
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid audio file (MP3, WAV, MP4, WebM)")
        return
      }
      
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size must be less than 100MB")
        return
      }
      
      setState(prev => ({ ...prev, uploadedFile: file }))
      toast.success(`Audio file "${file.name}" uploaded successfully`)
    }
  }

  // Consent handlers
  const handleConsentAccept = () => {
    setState(prev => ({ ...prev, showConsentDialog: false, consentAccepted: true }))
    startRecording()
  }

  const handleConsentDecline = () => {
    setState(prev => ({ ...prev, showConsentDialog: false }))
  }

  // Analysis handler
  const handleAnalysis = async () => {
    // Generate a default session title if none provided
    const sessionTitle = state.sessionTitle.trim() || `${state.method === "record" ? "Audio Recording" : state.method === "upload" ? "Audio Upload" : "Text"} Session - ${new Date().toLocaleDateString()}`

    if (!state.consentAccepted && (state.method === "record" || state.method === "upload")) {
      setState(prev => ({ ...prev, showConsentDialog: true }))
      return
    }

    setState(prev => ({ ...prev, isAnalyzing: true, step: "processing", analysisProgress: "Starting analysis..." }))

    try {
      if (state.method === "text") {
        // Direct text analysis - use the same approach as the test script
        setState(prev => ({ ...prev, analysisProgress: "Analyzing text..." }))
        
        // First create session with transcript (like the test script does)
        const sessionResponse = await sessionsAPI.createSession({
          title: sessionTitle,
          date: new Date().toISOString(),
          description: `Text analysis`,
          duration: 0,
          transcript: state.textContent // Include transcript in session creation
        })

        if (sessionResponse.error) {
          throw new Error(sessionResponse.error)
        }

        const sessionId = (sessionResponse.data as any)?.id
        if (!sessionId) {
          throw new Error("Failed to create session")
        }

        // Now run analysis on the session (like the test script does)
        setState(prev => ({ ...prev, analysisProgress: "Running AI analysis..." }))
        
        const analysisResponse = await sessionsAPI.startAnalysis(sessionId)
        
        if (analysisResponse.error) {
          throw new Error(analysisResponse.error)
        }

        setState(prev => ({ ...prev, analysisProgress: "Analysis complete!" }))
        
        // Navigate to session analysis page
        setTimeout(() => {
          router.push(`/session-analysis/${sessionId}`)
        }, 1000)

      } else {
        // Audio processing - keep existing workflow but improve it
        let audioFile: File

        if (state.method === "record") {
          // Convert recorded chunks to file
          setState(prev => ({ ...prev, analysisProgress: "Processing recording..." }))
          
          const audioBlob = new Blob(state.audioChunks, { type: 'audio/webm' })
          audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })
        } else {
          // Use uploaded file
          audioFile = state.uploadedFile!
        }

        // Step 1: Upload audio for transcription
        setState(prev => ({ ...prev, analysisProgress: "Uploading audio..." }))
        
        const transcriptionResponse = await transcriptionAPI.uploadAudio(audioFile)
        
        if (transcriptionResponse.error) {
          throw new Error(transcriptionResponse.error)
        }

        const transcriptionId = (transcriptionResponse.data as any)?.id
        if (!transcriptionId) {
          throw new Error("Failed to start transcription")
        }

        // Step 2: Poll for transcription completion
        setState(prev => ({ ...prev, analysisProgress: "Transcribing audio..." }))
        
        let transcriptionComplete = false
        let attempts = 0
        const maxAttempts = 60 // 5 minutes max
        
        while (!transcriptionComplete && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
          
          const statusResponse = await transcriptionAPI.getTranscriptionStatus(transcriptionId)
          
          if (statusResponse.error) {
            throw new Error(statusResponse.error)
          }

          const status = (statusResponse.data as any)?.status
          
          if (status === "completed") {
            transcriptionComplete = true
          } else if (status === "failed") {
            throw new Error("Transcription failed")
          }
          
          attempts++
          setState(prev => ({ 
            ...prev, 
            analysisProgress: `Transcribing audio... (${Math.round((attempts / maxAttempts) * 100)}%)` 
          }))
        }

        if (attempts >= maxAttempts) {
          throw new Error("Transcription timeout - please try again")
        }

        // Step 3: Get transcription result
        setState(prev => ({ ...prev, analysisProgress: "Getting transcription result..." }))
        
        const resultResponse = await transcriptionAPI.getTranscriptionResult(transcriptionId)
        
        if (resultResponse.error) {
          throw new Error(resultResponse.error)
        }

        const transcript = (resultResponse.data as any)?.transcript
        
        if (!transcript) {
          throw new Error("No transcript received")
        }

        // Step 4: Create session with transcript (like the test script)
        setState(prev => ({ ...prev, analysisProgress: "Creating session..." }))
        
        const sessionResponse = await sessionsAPI.createSession({
          title: sessionTitle,
          date: new Date().toISOString(),
          description: `${state.method === "record" ? "Audio recording" : "Audio file upload"} analysis`,
          duration: state.method === "record" ? Math.floor((Date.now() - (state.recordingStartTime || 0)) / 1000) : 0,
          transcript: transcript // Include transcript in session creation
        })

        if (sessionResponse.error) {
          throw new Error(sessionResponse.error)
        }

        const sessionId = (sessionResponse.data as any)?.id
        if (!sessionId) {
          throw new Error("Failed to create session")
        }

        // Step 5: Run analysis on the session
        setState(prev => ({ ...prev, analysisProgress: "Running AI analysis..." }))
        
        const analysisResponse = await sessionsAPI.startAnalysis(sessionId)
        
        if (analysisResponse.error) {
          throw new Error(analysisResponse.error)
        }

        setState(prev => ({ ...prev, analysisProgress: "Analysis complete!", step: "complete" }))
        
        // Navigate to session analysis page
        setTimeout(() => {
          router.push(`/session-analysis/${sessionId}`)
        }, 1500)
      }
      
    } catch (error) {
      console.error("Analysis failed:", error)
      
      let errorMessage = "Analysis failed. Please try again."
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast.error(`Analysis Error: ${errorMessage}`)
      setState(prev => ({ ...prev, isAnalyzing: false, step: "input", analysisProgress: "" }))
    }
  }

  // Get ready state for analysis
  const canAnalyze = () => {
    switch (state.method) {
      case "record":
        return state.audioChunks.length > 0
      case "upload":
        return state.uploadedFile !== null
      case "text":
        return state.textContent.trim().length > 0
      default:
        return false
    }
  }

  return (
    <MobileLayout title="Analyze Session" showBackButton>
      <div className="container px-4 py-6 pb-20">
        
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${state.step === "input" ? "text-blue-600" : state.step === "processing" ? "text-orange-500" : "text-green-600"}`}>
              {state.step === "input" && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />}
              {state.step === "processing" && <Loader2 className="w-4 h-4 animate-spin" />}
              {state.step === "complete" && <CheckCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {state.step === "input" ? "Set up your session" : 
                 state.step === "processing" ? "Processing..." : 
                 "Complete!"}
              </span>
            </div>
            {state.step === "processing" && (
              <span className="text-xs text-gray-500">{state.analysisProgress}</span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                state.step === "input" ? "bg-blue-600 w-1/3" : 
                state.step === "processing" ? "bg-orange-500 w-2/3" : 
                "bg-green-600 w-full"
              }`} 
            />
          </div>
        </div>

        {state.step === "input" && (
          <>
            {/* Session Title */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <Label htmlFor="sessionTitle" className="text-base font-semibold mb-3 block">
                  Session Title
                </Label>
                <Input
                  id="sessionTitle"
                  placeholder="e.g., Morning Reflection, Weekly Check-in..."
                  value={state.sessionTitle}
                  onChange={(e) => setState(prev => ({ ...prev, sessionTitle: e.target.value }))}
                  className="h-12 text-base"
                />
              </CardContent>
            </Card>

            {/* Input Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Choose Your Input Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                
                <Tabs value={state.method} onValueChange={(value) => setState(prev => ({ ...prev, method: value as any }))}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="record" className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Stream Audio
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Text
                    </TabsTrigger>
                  </TabsList>

                  {/* Audio Recording Tab */}
                  <TabsContent value="record" className="space-y-6">
                    <div className="text-center">
                      <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg overflow-hidden border mb-4 flex items-center justify-center">
                        <AudioVisualizer isRecording={state.isRecording} stream={state.stream || undefined} />
                      </div>

                      <div className="mb-4">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-xl font-mono font-medium">
                            {timer}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={toggleRecording}
                        size="lg"
                        className={`w-20 h-20 rounded-full shadow-lg ${
                          state.isRecording 
                            ? "bg-red-500 hover:bg-red-600" 
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {state.isRecording ? (
                          <Square className="h-8 w-8 fill-white" />
                        ) : (
                          <Mic className="h-8 w-8" />
                        )}
                      </Button>

                      <p className="text-sm text-gray-600 mt-4 flex items-center justify-center gap-2">
                        <Info className="h-4 w-4" />
                        {state.isRecording ? "Tap to stop streaming" : "Tap to start streaming your session"}
                      </p>
                    </div>
                  </TabsContent>

                  {/* Audio Upload Tab */}
                  <TabsContent value="upload" className="space-y-6">
                    <div className="text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,video/mp4,video/webm"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      
                      <div 
                        className={`border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
                          state.uploadedFile 
                            ? "border-green-400 bg-green-50" 
                            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {state.uploadedFile ? (
                          <div className="text-center">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-green-800 mb-1">
                              {state.uploadedFile.name}
                            </h3>
                            <p className="text-sm text-green-600">
                              {(state.uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3"
                              onClick={(e) => {
                                e.stopPropagation()
                                setState(prev => ({ ...prev, uploadedFile: null }))
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-700 mb-1">
                              Upload Audio File
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">
                              MP3, WAV, MP4, WebM up to 100MB
                            </p>
                            <Button variant="outline">
                              Choose File
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Text Input Tab */}
                  <TabsContent value="text" className="space-y-4">
                    <Label htmlFor="textContent" className="text-base font-medium">
                      Session Transcript
                    </Label>
                    <Textarea
                      id="textContent"
                      rows={10}
                      placeholder="Enter or paste your session transcript here for analysis..."
                      value={state.textContent}
                      onChange={(e) => setState(prev => ({ ...prev, textContent: e.target.value }))}
                      className="resize-none text-base p-4 border-2"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Info className="h-4 w-4" />
                        The more detailed your transcript, the better the analysis
                      </div>
                      <span>{state.textContent.length} characters</span>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Analysis Button */}
                {canAnalyze() && (
                  <div className="mt-8 pt-6 border-t">
                    <Button
                      onClick={handleAnalysis}
                      disabled={state.isAnalyzing}
                      className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {state.isAnalyzing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Start Analysis
                          <ChevronRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Debug section - temporary */}
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
                  <h4 className="font-semibold mb-2">Debug Info:</h4>
                  <div>Session Title: "{state.sessionTitle}" (length: {state.sessionTitle.length}) - Optional</div>
                  <div>Method: {state.method}</div>
                  <div>Audio Chunks: {state.audioChunks.length}</div>
                  <div>Uploaded File: {state.uploadedFile ? state.uploadedFile.name : "none"}</div>
                  <div>Text Content: {state.textContent.length} chars</div>
                  <div>Can Analyze: {canAnalyze() ? "YES" : "NO"}</div>
                  {!canAnalyze() && (
                    <div className="mt-2 p-2 bg-yellow-100 rounded">
                      <strong>Why analyze button is hidden:</strong>
                      {state.method === "record" && state.audioChunks.length === 0 && <div>• Need recorded audio</div>}
                      {state.method === "upload" && !state.uploadedFile && <div>• Need uploaded file</div>}
                      {state.method === "text" && state.textContent.trim().length === 0 && <div>• Need text content</div>}
                    </div>
                  )}
                </div>

                {/* Force show analyze button for debugging */}
                {!canAnalyze() && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={() => {
                        console.log("Debug analyze clicked with state:", state)
                        handleAnalysis()
                      }}
                      disabled={state.isAnalyzing}
                      className="w-full h-12 text-base font-medium bg-red-500 hover:bg-red-600"
                    >
                      {state.isAnalyzing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Debug Analyzing...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 mr-2" />
                          Debug: Force Analyze
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {state.step === "processing" && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Processing Your Session</h3>
                  <p className="text-gray-600 mb-4">
                    Our AI is analyzing your content to extract meaningful insights...
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700">{state.analysisProgress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {state.step === "complete" && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Analysis Complete!</h3>
                  <p className="text-gray-600">
                    Your session has been processed successfully. Redirecting to results...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Your Privacy is Protected
                </h4>
                <ul className="space-y-2 text-green-700 text-xs">
                  <li>• <strong>All data is encrypted</strong> in transit and at rest</li>
                  <li>• <strong>Audio transcripts are not stored</strong> - only analysis results</li>
                  <li>• <strong>No way to identify</strong> individual users from the data</li>
                  <li>• <strong>You can delete</strong> your data at any time</li>
                  <li>• <strong>Zero data sharing</strong> with third parties</li>
                </ul>
              </div>
              
              <p className="text-center">
                <strong>By proceeding, you consent to:</strong>
              </p>
              <ul className="text-xs space-y-1">
                <li>• Audio analysis for therapeutic insights</li>
                <li>• Temporary processing of your audio content</li>
                <li>• Storage of anonymized analysis results only</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleConsentDecline} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConsentAccept} className="flex-1 bg-blue-600 hover:bg-blue-700">
                I Agree, Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  )
}

