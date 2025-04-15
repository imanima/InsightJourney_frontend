"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileAudio, Upload, AlertCircle, Loader2 } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { sessionsAPI } from "@/lib/api-client"

export default function NewSessionPage() {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [clientName, setClientName] = useState("")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !date || !file) {
      setError("Please fill in all required fields and upload an audio file")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append("title", title)
      formData.append("date", date)
      formData.append("file", file)

      if (clientName) {
        formData.append("client_name", clientName)
      }

      if (notes) {
        formData.append("notes", notes)
      }

      const { data, error } = await sessionsAPI.createSession(formData)

      if (error) {
        setError(error)
        return
      }

      // Redirect to the session page
      router.push(`/sessions/${data.id}`)
    } catch (err) {
      console.error("Failed to create session:", err)
      setError("Failed to create session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MobileLayout title="New Session" showBackButton backUrl="/sessions">
      <div className="container px-4 py-6 pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Record New Session</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Coaching Session #1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Session Date *</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Session Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this session..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Audio Recording *</Label>
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  {file ? (
                    <div className="space-y-2">
                      <FileAudio className="h-8 w-8 mx-auto text-primary" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => setFile(null)}>
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm">Drag and drop your audio file here, or click to browse</p>
                      <p className="text-xs text-muted-foreground">Supported formats: MP3, WAV, OGG, M4A, FLAC</p>
                      <Input id="file" type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("file")?.click()}
                      >
                        Browse Files
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Session"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}

