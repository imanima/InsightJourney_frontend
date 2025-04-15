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
import { sessionsAPI } from "@/lib/api-client"

type InputMethod = "audio" | "text";

export default function RecordInsightsPage() {
  // State management
  const [state, setState] = useState({
    mediaRecorder: null as MediaRecorder | null,
    audioChunks: [] as Blob[],
    isRecording: false,
    startTime: null as number | null,
    timerInterval: null as NodeJS.Timeout | null,
    inputMethod: "text" as InputMethod,
    sessionTitle: "",
    language: "en",
    insightText: "",
    isAnalyzing: false,
    showAnalysisResults: false,
    offlineMode: false,
    stream: null as MediaStream | null,
  })

  const [timer, setTimer] = useState("00:00")
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')
  const router = useRouter()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null);

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

  // Check for backend availability
  useEffect(() => {
    async function checkBackendStatus() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
        }).catch(() => null);
        
        setBackendStatus(response && response.ok ? 'available' : 'unavailable');
      } catch (error) {
        console.error("Backend check failed:", error);
        setBackendStatus('unavailable');
      }
    }
    
    checkBackendStatus();
  }, []);

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
      startRecording()
    }
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support audio recording")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
        },
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      })

      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        clearInterval(state.timerInterval as NodeJS.Timeout)

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
    setState((prev) => ({ ...prev, isAnalyzing: true }));
    console.log("Starting analysis...");

    try {
      // Create a new session with the current input
      const title = state.sessionTitle || "Untitled Session";
      const content = state.inputMethod === "audio" ? new Blob(state.audioChunks, { type: 'audio/webm' }) : state.insightText;
      
      console.log("Creating session with data:", {
        title,
        inputMethod: state.inputMethod,
        language: state.language,
        contentType: state.inputMethod === "audio" ? `audio blob (${state.audioChunks.length} chunks)` : "text",
        textLength: state.inputMethod === "text" ? state.insightText.length : "N/A"
      });

      const result = await sessionsAPI.createSession(
        title,
        content,
        state.inputMethod,
        state.language
      );

      if (result.error) {
        console.error("Session creation error:", result.error);
        throw new Error(`Failed to create session: ${result.error}`);
      }

      if (!result.data?.sessionId) {
        console.error("No session ID in response:", result);
        throw new Error("No session ID received from server");
      }

      console.log("Session created successfully:", result.data);

      // Start analysis
      const analysisResult = await sessionsAPI.startAnalysis(result.data.sessionId);
      if (analysisResult.error) {
        console.error("Analysis start error:", analysisResult.error);
        throw new Error(`Failed to start analysis: ${analysisResult.error}`);
      }

      console.log("Analysis started successfully:", analysisResult.data);

      // Redirect to analysis page
      router.push(`/session-analysis/${result.data.sessionId}`);
    } catch (error) {
      console.error("Analysis error:", error);
      setError(error instanceof Error ? error.message : "An error occurred during analysis");
    } finally {
      setState((prev) => ({ ...prev, isAnalyzing: false }));
    }
  };

  return (
    <MobileLayout>
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Record Your Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {backendStatus === 'unavailable' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Backend Service Unavailable</h3>
                    <p className="text-sm mt-1">
                      The backend API service is not responding. Please make sure it's running at{" "}
                      <code className="bg-red-100 px-1 py-0.5 rounded">{process.env.NEXT_PUBLIC_API_URL}</code>
                    </p>
                    <p className="text-sm mt-2">
                      To start the backend, run: <code className="bg-red-100 px-1 py-0.5 rounded">python3 backend/run.py</code>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {backendStatus === 'checking' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-600">
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <p>Checking backend connection...</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="sessionTitle">Session Title</Label>
                <Input
                  id="sessionTitle"
                  value={state.sessionTitle}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, sessionTitle: e.target.value }))
                  }
                  placeholder="Enter a title for your session"
                />
              </div>

              <Tabs
                value={state.inputMethod}
                onValueChange={(value) => toggleInterface(value as "audio" | "text")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="audio">
                    <Mic className="h-4 w-4 mr-2" />
                    Audio
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <Keyboard className="h-4 w-4 mr-2" />
                    Text
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="audio">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <Button
                        variant={state.isRecording ? "destructive" : "default"}
                        size="lg"
                        onClick={toggleRecording}
                        className="w-full"
                      >
                        {state.isRecording ? (
                          <>
                            <Mic className="h-4 w-4 mr-2" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-2" />
                            Start Recording
                          </>
                        )}
                      </Button>
                    </div>

                    {state.isRecording && (
                      <div className="flex items-center justify-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{timer}</span>
                      </div>
                    )}

                    {state.audioChunks.length > 0 && !state.isRecording && (
                      <div className="flex items-center justify-center text-green-500">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        <span>Recording saved</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="text">
                  <Textarea
                    value={state.insightText}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, insightText: e.target.value }))
                    }
                    placeholder="Type your insights here..."
                    className="min-h-[200px]"
                  />
                </TabsContent>
              </Tabs>

              {state.offlineMode && (
                <div className="flex items-center text-yellow-500">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>You are offline. Analysis will be available when you reconnect.</span>
                </div>
              )}

              <Button
                onClick={handleAnalysis}
                disabled={
                  state.isAnalyzing ||
                  state.offlineMode ||
                  backendStatus !== 'available' ||
                  (state.inputMethod === "audio" && state.audioChunks.length === 0) ||
                  (state.inputMethod === "text" && !state.insightText.trim())
                }
                className="w-full"
              >
                {state.isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : backendStatus !== 'available' ? (
                  "Backend Unavailable"
                ) : (
                  "Analyze Session"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}

