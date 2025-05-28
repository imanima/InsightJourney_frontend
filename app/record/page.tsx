"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Mic, Pause, Send } from "lucide-react"
import AudioVisualizer from "@/components/audio-visualizer"

export default function RecordInsightsPage() {
  const [state, setState] = useState({
    isRecording: false,
    audioChunks: [] as Blob[],
    insightText: "",
    topic: "",
    isAnalyzing: false,
  })

  const [timer, setTimer] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (state.isRecording) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [state.isRecording])

  const toggleRecording = () => {
    if (state.isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" })
        // Here you would typically send the audioBlob to your server for processing
        console.log("Recording stopped, audio blob created")
      }

      mediaRecorder.start()
      setState((prev) => ({ ...prev, isRecording: true, audioChunks }))
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Unable to access microphone. Please check your permissions.")
    }
  }

  const stopRecording = () => {
    setState((prev) => ({ ...prev, isRecording: false }))
    // Stop the MediaRecorder here
  }

  const handleSubmit = async () => {
    setState((prev) => ({ ...prev, isAnalyzing: true }))
    // Here you would send the audio or text to your backend for analysis
    // For this demo, we'll just simulate a delay
    setTimeout(() => {
      router.push("/analysis")
    }, 2000)
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Record Your Insight</h1>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="mb-4">
            <Label htmlFor="topic">Topic</Label>
            <Select onValueChange={(value) => setState((prev) => ({ ...prev, topic: value }))}>
              <SelectTrigger id="topic">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
                <SelectItem value="personal-growth">Personal Growth</SelectItem>
                <SelectItem value="stress">Stress Management</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor="insightText">Your Insight</Label>
            <Textarea
              id="insightText"
              placeholder="Type your thoughts here..."
              value={state.insightText}
              onChange={(e) => setState((prev) => ({ ...prev, insightText: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="text-center mb-4">
            <Button
              variant={state.isRecording ? "destructive" : "default"}
              size="lg"
              className="rounded-full w-16 h-16"
              onClick={toggleRecording}
            >
              {state.isRecording ? <Pause /> : <Mic />}
            </Button>
            {state.isRecording && (
              <div className="mt-2">
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
              </div>
            )}
          </div>

          {state.isRecording && (
            <div className="mb-4 h-24 bg-gray-100 rounded-md overflow-hidden">
              <AudioVisualizer isRecording={state.isRecording} />
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={state.isAnalyzing || (!state.insightText && state.audioChunks.length === 0)}
          >
            {state.isAnalyzing ? "Analyzing..." : "Submit Insight"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

