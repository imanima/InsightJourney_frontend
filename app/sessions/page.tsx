"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, FileAudio, Calendar, Trash2 } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { sessionsAPI, type Session } from "@/lib/api-client"
import { toast } from "react-hot-toast"

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await sessionsAPI.getSessions()

        if (error) {
          setError(error)
          return
        }

        setSessions((data as Session[]) || [])
      } catch (err) {
        console.error("Failed to fetch sessions:", err)
        setError("Failed to load sessions. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const handleDeleteSession = async (sessionId: string, sessionTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${sessionTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingSessionId(sessionId)
      toast.loading('Deleting session...', { id: 'delete-session' })

      const response = await sessionsAPI.deleteSession(sessionId)
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Remove the session from the local state
      setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId))
      
      toast.success('Session deleted successfully', { id: 'delete-session' })
    } catch (error) {
      console.error('Error deleting session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete session'
      toast.error(errorMessage, { id: 'delete-session' })
    } finally {
      setDeletingSessionId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <MobileLayout title="Sessions">
      <div className="container px-4 py-6 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Your Sessions</h1>
          <Button onClick={() => router.push("/sessions/new")} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>New Session</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading sessions...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            {error}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <FileAudio className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">No sessions yet</h2>
            <p className="text-muted-foreground mb-6">Record your first coaching session to get started</p>
            <Button onClick={() => router.push("/sessions/new")}>Record New Session</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteSession(session.id, session.title)}
                      disabled={deletingSessionId === session.id}
                    >
                      {deletingSessionId === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(session.date)}
                    </div>

                    {session.description && (
                      <div className="text-sm mt-2">
                        <span className="font-medium">Description:</span> {session.description}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/sessions/${session.id}`)}>
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/sessions/${session.id}/analysis`)}
                      >
                        View Analysis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  )
}

