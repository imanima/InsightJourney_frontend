"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { sessionsAPI } from "@/lib/api-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Brain, Flag, Mountain, Lightbulb, Save, ArrowLeft, Home, Plus, Edit, Trash2, CheckCircle, X, Play } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { toast } from "react-hot-toast"

// Data types with consistent naming for API compatibility
interface ApiEmotion {
  id?: string
  name?: string
  emotion?: string
  intensity?: string | number
  topic?: string
  topics?: string[]
  timestamp?: string
  context?: string
  description?: string
}

interface ApiBelief {
  id?: string
  name?: string
  text?: string
  description?: string
  belief?: string
  impact?: string
  topic?: string
  topics?: string[]
  timestamp?: string
}

interface ApiActionItem {
  id?: string
  name?: string
  description?: string
  text?: string
  topic?: string
  topics?: string[]
  status?: string
  timestamp?: string
}

interface ApiChallenge {
  id?: string
  name?: string
  challenge?: string
  text?: string
  description?: string
  impact?: string
  severity?: string
  topic?: string
  topics?: string[]
  timestamp?: string
}

interface ApiInsight {
  id?: string
  name?: string
  insight?: string
  text?: string
  description?: string
  context?: string
  implications?: string
  topic?: string
  topics?: string[]
  timestamp?: string
}

interface ApiSessionElements {
  emotions?: ApiEmotion[]
  beliefs?: ApiBelief[]
  action_items?: ApiActionItem[]
  challenges?: ApiChallenge[]
  insights?: ApiInsight[]
}

interface Emotion {
  id?: string
  name: string
  intensity: number
  topic: string | { name: string; id: string; relevance?: number }
  timestamp: string
  context: string
}

interface Belief {
  id?: string
  name: string
  description: string
  impact: string
  topic: string | { name: string; id: string; relevance?: number }
  timestamp: string
}

interface ActionItem {
  id?: string
  name: string
  description: string
  topic: string | { name: string; id: string; relevance?: number }
  status: string
  timestamp: string
}

interface Challenge {
  id?: string
  name: string
  description: string
  impact: string
  topic: string | { name: string; id: string; relevance?: number }
  timestamp: string
}

interface Insight {
  id?: string
  name: string
  description: string
  context: string
  topic: string | { name: string; id: string; relevance?: number }
  timestamp: string
}

interface SessionData {
  id: string
  timestamp: string
  emotions: Emotion[]
  beliefs: Belief[]
  action_items: ActionItem[]
  challenges: Challenge[]
  insights: Insight[]
}

// Topic options for dropdowns
const TOPIC_OPTIONS = [
  "General", "Career", "Relationships", "Health", "Personal Growth", 
  "Family", "Stress Management", "Self-Esteem", "Anxiety", "Depression",
  "Communication", "Goals", "Life Transition", "Trauma", "Anger"
]

const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed", "On Hold"]
const IMPACT_LEVELS = ["Low", "Medium", "High"]

export default function SessionAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [originalData, setOriginalData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)
  const { user } = useAuth()

  // Helper function to get topic name
  const getTopicName = (topic: string | { name: string; id: string; relevance?: number }): string => {
    return typeof topic === 'object' ? topic.name : topic
  }

  // Helper function to generate unique ID
  const generateId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Helper function to deduplicate elements based on name
  const deduplicateElements = <T extends { name: string }>(elements: T[]): T[] => {
    const seen = new Set<string>()
    return elements.filter(element => {
      const key = element.name.toLowerCase().trim()
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  useEffect(() => {
    async function fetchSessionData() {
      try {
        setLoading(true)
        
        const response = await sessionsAPI.getSessionElements(id)
        
        if (response.error) {
          throw new Error(`Failed to fetch session data: ${response.status} - ${response.error}`)
        }
        
        const elementsData = response.data as ApiSessionElements
        console.log('Session elements data:', elementsData)
        
        // Transform API data to match our interface
        const transformedData: SessionData = {
          id: id,
          timestamp: new Date().toISOString(),
          emotions: deduplicateElements(elementsData.emotions?.map((emotion: ApiEmotion, index: number) => ({
            id: emotion.id || `emo_${index}`, // Use stable, simple ID
            name: emotion.name || emotion.emotion || 'Unknown',
            intensity: parseInt(emotion.intensity as string) || 0,
            topic: emotion.topic || emotion.topics?.[0] || 'General',
            timestamp: emotion.timestamp || new Date().toISOString(),
            context: emotion.context || emotion.description || '',
          })) || []),
          beliefs: deduplicateElements(elementsData.beliefs?.map((belief: ApiBelief, index: number) => ({
            id: belief.id || `bel_${index}`, // Use stable, simple ID
            name: belief.name || 'Untitled Belief',
            description: belief.text || belief.description || belief.belief || '',
            impact: belief.impact || 'Medium',
            topic: belief.topic || belief.topics?.[0] || 'General',
            timestamp: belief.timestamp || new Date().toISOString(),
          })) || []),
          action_items: deduplicateElements(elementsData.action_items?.map((action: ApiActionItem, index: number) => ({
            id: action.id || `act_${index}`, // Use stable, simple ID
            name: action.name || 'Untitled Action',
            description: action.description || action.text || '',
            topic: action.topic || action.topics?.[0] || 'General',
            status: action.status || 'Not Started',
            timestamp: action.timestamp || new Date().toISOString(),
          })) || []),
          challenges: deduplicateElements(elementsData.challenges?.map((challenge: ApiChallenge, index: number) => ({
            id: challenge.id || `cha_${index}`, // Use stable, simple ID
            name: challenge.name || challenge.challenge || 'Untitled Challenge',
            description: challenge.text || challenge.description || '',
            impact: challenge.impact || challenge.severity || 'Medium',
            topic: challenge.topic || challenge.topics?.[0] || 'General',
            timestamp: challenge.timestamp || new Date().toISOString(),
          })) || []),
          insights: deduplicateElements(elementsData.insights?.map((insight: ApiInsight, index: number) => ({
            id: insight.id || `ins_${index}`, // Use stable, simple ID
            name: insight.name || insight.insight || 'Untitled Insight',
            description: insight.text || insight.description || '',
            context: insight.context || insight.implications || '',
            topic: insight.topic || insight.topics?.[0] || 'General',
            timestamp: insight.timestamp || new Date().toISOString(),
          })) || []),
        }
        
        console.log('Transformed session data:', transformedData)
        setSessionData(transformedData)
        setOriginalData(JSON.parse(JSON.stringify(transformedData))) // Deep copy
        
        // Debug: Log analyze button conditions
        const totalItems = transformedData.emotions.length + 
                          transformedData.beliefs.length + 
                          transformedData.action_items.length + 
                          transformedData.challenges.length + 
                          transformedData.insights.length
        console.log('🔍 Analyze Button Debug:', {
          emotions: transformedData.emotions.length,
          beliefs: transformedData.beliefs.length,
          actions: transformedData.action_items.length,
          challenges: transformedData.challenges.length,
          insights: transformedData.insights.length,
          totalItems,
          shouldShowAnalyze: totalItems <= 3,
          shouldShowReanalyze: totalItems > 3
        })
      } catch (error) {
        console.error('Error fetching session data:', error)
        toast.error('Failed to load session data')
        setSessionData({
          id: id,
          timestamp: new Date().toISOString(),
          emotions: [],
          beliefs: [],
          action_items: [],
          challenges: [],
          insights: [],
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchSessionData()
  }, [id])

  // Check for changes
  useEffect(() => {
    if (sessionData && originalData) {
      // More comprehensive change detection
      const lengthChanges = (
        sessionData.emotions.length !== originalData.emotions.length ||
        sessionData.beliefs.length !== originalData.beliefs.length ||
        sessionData.action_items.length !== originalData.action_items.length ||
        sessionData.challenges.length !== originalData.challenges.length ||
        sessionData.insights.length !== originalData.insights.length
      )
      
      // Check for content changes in existing items
      const contentChanges = 
        sessionData.emotions.some((emotion, index) => {
          const original = originalData.emotions[index]
          return !original || 
            emotion.name !== original.name || 
            emotion.intensity !== original.intensity ||
            emotion.context !== original.context ||
            getTopicName(emotion.topic) !== getTopicName(original.topic)
        }) ||
        sessionData.beliefs.some((belief, index) => {
          const original = originalData.beliefs[index]
          return !original || 
            belief.name !== original.name || 
            belief.description !== original.description ||
            belief.impact !== original.impact ||
            getTopicName(belief.topic) !== getTopicName(original.topic)
        }) ||
        sessionData.action_items.some((action, index) => {
          const original = originalData.action_items[index]
          return !original || 
            action.name !== original.name || 
            action.description !== original.description ||
            action.status !== original.status ||
            getTopicName(action.topic) !== getTopicName(original.topic)
        }) ||
        sessionData.challenges.some((challenge, index) => {
          const original = originalData.challenges[index]
          return !original || 
            challenge.name !== original.name || 
            challenge.description !== original.description ||
            challenge.impact !== original.impact ||
            getTopicName(challenge.topic) !== getTopicName(original.topic)
        }) ||
        sessionData.insights.some((insight, index) => {
          const original = originalData.insights[index]
          return !original || 
            insight.name !== original.name || 
            insight.description !== original.description ||
            insight.context !== original.context ||
            getTopicName(insight.topic) !== getTopicName(original.topic)
        })
      
      const hasChanges = lengthChanges || contentChanges
      
      console.log('🔍 Change Detection Debug:', {
        hasSessionData: !!sessionData,
        hasOriginalData: !!originalData,
        lengthChanges,
        contentChanges,
        hasChanges,
        emotionsLength: sessionData.emotions.length,
        originalEmotionsLength: originalData.emotions.length,
        beliefsLength: sessionData.beliefs.length,
        originalBeliefsLength: originalData.beliefs.length,
        actionsLength: sessionData.action_items.length,
        originalActionsLength: originalData.action_items.length,
      })
      setHasChanges(hasChanges)
    }
  }, [sessionData, originalData])

  const handleSave = async (forceDebug = false) => {
    if (!sessionData) {
      console.log('🔍 Save blocked: No session data')
      return
    }
    
    if (saving) {
      console.log('🔍 Save blocked: Already saving')
      return
    }
    
    if (!hasChanges && !forceDebug) {
      console.log('🔍 Save blocked: No changes detected', {
        hasChanges,
        sessionData: sessionData ? {
          emotions: sessionData.emotions.length,
          beliefs: sessionData.beliefs.length,
          actions: sessionData.action_items.length,
          challenges: sessionData.challenges.length,
          insights: sessionData.insights.length
        } : null,
        originalData: originalData ? {
          emotions: originalData.emotions.length,
          beliefs: originalData.beliefs.length,
          actions: originalData.action_items.length,
          challenges: originalData.challenges.length,
          insights: originalData.insights.length
        } : null
      })
      return
    }

    try {
      setSaving(true)
      console.log('🔍 Starting save process...')
      
      // Format data for API - wrap elements in "elements" key to match backend UpdateElementsRequest model
      const updateData = {
        elements: {
          emotions: sessionData.emotions.map(emotion => ({
            name: emotion.name,
            intensity: emotion.intensity,
            context: emotion.context,
            topic: getTopicName(emotion.topic),
          })),
          beliefs: sessionData.beliefs.map(belief => ({
            id: belief.id || generateId(),
            name: belief.name,
            description: belief.description,
            impact: belief.impact,
            topic: getTopicName(belief.topic),
          })),
          action_items: sessionData.action_items.map(action => ({
            id: action.id || generateId(),
            name: action.name,
            description: action.description,
            topic: getTopicName(action.topic),
            status: action.status,
          })),
          challenges: sessionData.challenges.map(challenge => ({
            name: challenge.name,
            description: challenge.description,
            impact: challenge.impact,
            topic: getTopicName(challenge.topic),
          })),
          insights: sessionData.insights.map(insight => ({
            name: insight.name,
            description: insight.description,
            context: insight.context,
            topic: getTopicName(insight.topic),
          }))
        }
      }

      console.log('🔍 Saving update data:', updateData)

      const response = await sessionsAPI.updateSessionElements(id, updateData)

      console.log('🔍 Save response:', response)

      if (response.error) {
        console.error('🔍 Save failed:', response.error)
        throw new Error(`Failed to save: ${response.status} - ${response.error}`)
      }

      const result = response.data
      console.log('🔍 Save result:', result)
      
      toast.success('Analysis saved successfully!')
      setOriginalData(JSON.parse(JSON.stringify(sessionData))) // Update original data
      setEditingItems(new Set()) // Clear editing state
      
    } catch (error) {
      console.error('🔍 Error saving session data:', error)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleAnalyze = async () => {
    if (!sessionData) return

    try {
      setAnalyzing(true)
      toast.loading('Starting analysis...', { id: 'analyze' })

      console.log('🔍 Starting analysis for session:', id)

      // Try to start analysis for this session
      const response = await sessionsAPI.startAnalysis(id)

      console.log('🔍 Analysis response:', response)

      if (response.error) {
        console.error('🔍 Analysis error:', response.error)
        
        // If the error is about missing transcript, provide helpful guidance
        if (response.error.includes("No transcript found") || response.error.includes("transcript")) {
          toast.error("This session doesn't have a transcript yet. Please record or upload audio first.", { id: 'analyze' })
          return
        } else {
          throw new Error(`Failed to start analysis: ${response.error}`)
        }
      }

      toast.success('Analysis completed!', { id: 'analyze' })
      
      // Refresh the session data to get the new analysis
      console.log('🔍 Analysis completed, refreshing page...')
      window.location.reload()
      
    } catch (error) {
      console.error('Error analyzing session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze session'
      toast.error(errorMessage, { id: 'analyze' })
    } finally {
      setAnalyzing(false)
    }
  }

  const updateEmotion = (index: number, field: keyof Emotion, value: string | number) => {
    if (!sessionData) return
    const newEmotions = [...sessionData.emotions]
    newEmotions[index] = { ...newEmotions[index], [field]: value }
    setSessionData({ ...sessionData, emotions: newEmotions })
  }

  const updateBelief = (index: number, field: keyof Belief, value: string) => {
    if (!sessionData) return
    const newBeliefs = [...sessionData.beliefs]
    newBeliefs[index] = { ...newBeliefs[index], [field]: value }
    setSessionData({ ...sessionData, beliefs: newBeliefs })
  }

  const updateActionItem = (index: number, field: keyof ActionItem, value: string) => {
    if (!sessionData) return
    const newActionItems = [...sessionData.action_items]
    newActionItems[index] = { ...newActionItems[index], [field]: value }
    setSessionData({ ...sessionData, action_items: newActionItems })
  }

  const updateChallenge = (index: number, field: keyof Challenge, value: string) => {
    if (!sessionData) return
    const newChallenges = [...sessionData.challenges]
    newChallenges[index] = { ...newChallenges[index], [field]: value }
    setSessionData({ ...sessionData, challenges: newChallenges })
  }

  const updateInsight = (index: number, field: keyof Insight, value: string) => {
    if (!sessionData) return
    const newInsights = [...sessionData.insights]
    newInsights[index] = { ...newInsights[index], [field]: value }
    setSessionData({ ...sessionData, insights: newInsights })
  }

  const addEmotion = () => {
    if (!sessionData) return
    const newEmotion: Emotion = {
      id: generateId(),
      name: '',
      intensity: 1,
      topic: 'General',
      timestamp: new Date().toISOString(),
      context: ''
    }
    setSessionData({ ...sessionData, emotions: [...sessionData.emotions, newEmotion] })
    setEditingItems(prev => new Set([...prev, `emotion-${sessionData.emotions.length}`]))
  }

  const addBelief = () => {
    if (!sessionData) return
    const newBelief: Belief = {
      id: generateId(),
      name: '',
      description: '',
      impact: 'Medium',
      topic: 'General',
      timestamp: new Date().toISOString()
    }
    setSessionData({ ...sessionData, beliefs: [...sessionData.beliefs, newBelief] })
    setEditingItems(prev => new Set([...prev, `belief-${sessionData.beliefs.length}`]))
  }

  const addActionItem = () => {
    if (!sessionData) return
    const newAction: ActionItem = {
      id: generateId(),
      name: '',
      description: '',
      topic: 'General',
      status: 'Not Started',
      timestamp: new Date().toISOString()
    }
    setSessionData({ ...sessionData, action_items: [...sessionData.action_items, newAction] })
    setEditingItems(prev => new Set([...prev, `action-${sessionData.action_items.length}`]))
  }

  const addChallenge = () => {
    if (!sessionData) return
    const newChallenge: Challenge = {
      id: generateId(),
      name: '',
      description: '',
      impact: 'Medium',
      topic: 'General',
      timestamp: new Date().toISOString()
    }
    setSessionData({ ...sessionData, challenges: [...sessionData.challenges, newChallenge] })
    setEditingItems(prev => new Set([...prev, `challenge-${sessionData.challenges.length}`]))
  }

  const addInsight = () => {
    if (!sessionData) return
    const newInsight: Insight = {
      id: generateId(),
      name: '',
      description: '',
      context: '',
      topic: 'General',
      timestamp: new Date().toISOString()
    }
    setSessionData({ ...sessionData, insights: [...sessionData.insights, newInsight] })
    setEditingItems(prev => new Set([...prev, `insight-${sessionData.insights.length}`]))
  }

  const deleteItem = (type: string, index: number) => {
    if (!sessionData) return
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    switch (type) {
      case 'emotion':
        setSessionData({ ...sessionData, emotions: sessionData.emotions.filter((_, i) => i !== index) })
        break
      case 'belief':
        setSessionData({ ...sessionData, beliefs: sessionData.beliefs.filter((_, i) => i !== index) })
        break
      case 'action':
        setSessionData({ ...sessionData, action_items: sessionData.action_items.filter((_, i) => i !== index) })
        break
      case 'challenge':
        setSessionData({ ...sessionData, challenges: sessionData.challenges.filter((_, i) => i !== index) })
        break
      case 'insight':
        setSessionData({ ...sessionData, insights: sessionData.insights.filter((_, i) => i !== index) })
        break
    }
  }

  const toggleEdit = (itemKey: string) => {
    setEditingItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey)
      } else {
        newSet.add(itemKey)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <MobileLayout hideNav>
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
          <div className="text-center">
            <div className="mb-4">
              <div className="animate-spin inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
            <h4 className="text-xl font-medium mb-2">Loading Analysis Results</h4>
            <p className="text-muted-foreground">Please wait while we load your session analysis...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (!sessionData) {
    return (
      <MobileLayout>
        <div className="container py-8 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
            <p className="mb-6">We couldn't find the session you're looking for.</p>
            <Button asChild>
              <Link href="/analyze-insights">Record New Insights</Link>
            </Button>
          </div>
        </div>
      </MobileLayout>
    )
  }

  const EmotionCard = ({ emotion, index }: { emotion: Emotion; index: number }) => {
    const itemKey = `emotion-${index}`
    const isEditing = editingItems.has(itemKey)

    return (
      <Card key={emotion.id || index}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-1">
              <Heart className="h-4 w-4 text-red-500" />
              {isEditing ? (
                <Input
                  value={emotion.name}
                  onChange={(e) => updateEmotion(index, 'name', e.target.value)}
                  placeholder="Emotion name"
                  className="h-8"
                />
              ) : (
                <h3 className="font-medium">{emotion.name}</h3>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => toggleEdit(itemKey)}>
                {isEditing ? <CheckCircle className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteItem('emotion', index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Intensity:</Label>
              {isEditing ? (
                <Select value={emotion.intensity.toString()} onValueChange={(value) => updateEmotion(index, 'intensity', parseInt(value))}>
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(i => (
                      <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline">Intensity: {emotion.intensity}/5</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-xs">Topic:</Label>
              {isEditing ? (
                <Select value={getTopicName(emotion.topic)} onValueChange={(value) => updateEmotion(index, 'topic', value)}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPIC_OPTIONS.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {getTopicName(emotion.topic)}
                </Badge>
              )}
            </div>
            
            <div>
              <Label className="text-xs">Context:</Label>
              {isEditing ? (
                <Textarea
                  value={emotion.context}
                  onChange={(e) => updateEmotion(index, 'context', e.target.value)}
                  placeholder="Context description"
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <p className="text-sm mt-1">{emotion.context}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const BeliefCard = ({ belief, index }: { belief: Belief; index: number }) => {
    const itemKey = `belief-${index}`
    const isEditing = editingItems.has(itemKey)

    return (
      <Card key={belief.id || index}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-1">
              <Brain className="h-4 w-4 text-blue-500" />
              {isEditing ? (
                <Input
                  value={belief.name}
                  onChange={(e) => updateBelief(index, 'name', e.target.value)}
                  placeholder="Belief name"
                  className="h-8"
                />
              ) : (
                <h3 className="font-medium">{belief.name}</h3>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => toggleEdit(itemKey)}>
                {isEditing ? <CheckCircle className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteItem('belief', index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Topic:</Label>
              {isEditing ? (
                <Select value={getTopicName(belief.topic)} onValueChange={(value) => updateBelief(index, 'topic', value)}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPIC_OPTIONS.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {getTopicName(belief.topic)}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-xs">Impact:</Label>
              {isEditing ? (
                <Select value={belief.impact} onValueChange={(value) => updateBelief(index, 'impact', value)}>
                  <SelectTrigger className="h-8 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPACT_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline">{belief.impact}</Badge>
              )}
            </div>
            
            <div>
              <Label className="text-xs">Description:</Label>
              {isEditing ? (
                <Textarea
                  value={belief.description}
                  onChange={(e) => updateBelief(index, 'description', e.target.value)}
                  placeholder="Belief description"
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <p className="text-sm mt-1">{belief.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const ActionItemCard = ({ action, index }: { action: ActionItem; index: number }) => {
    const itemKey = `action-${index}`
    const isEditing = editingItems.has(itemKey)

    return (
      <Card key={action.id || index}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-1">
              <Flag className="h-4 w-4 text-green-500" />
              {isEditing ? (
                <Input
                  value={action.name}
                  onChange={(e) => updateActionItem(index, 'name', e.target.value)}
                  placeholder="Action item name"
                  className="h-8"
                />
              ) : (
                <h3 className="font-medium">{action.name}</h3>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => toggleEdit(itemKey)}>
                {isEditing ? <CheckCircle className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteItem('action', index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Topic:</Label>
              {isEditing ? (
                <Select value={getTopicName(action.topic)} onValueChange={(value) => updateActionItem(index, 'topic', value)}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPIC_OPTIONS.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {getTopicName(action.topic)}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-xs">Status:</Label>
              {isEditing ? (
                <Select value={action.status} onValueChange={(value) => updateActionItem(index, 'status', value)}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={action.status === "Completed" ? "default" : "outline"}>
                  {action.status}
                </Badge>
              )}
            </div>
            
            <div>
              <Label className="text-xs">Description:</Label>
              {isEditing ? (
                <Textarea
                  value={action.description}
                  onChange={(e) => updateActionItem(index, 'description', e.target.value)}
                  placeholder="Action description"
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <p className="text-sm mt-1">{action.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const ChallengeCard = ({ challenge, index }: { challenge: Challenge; index: number }) => {
    const itemKey = `challenge-${index}`
    const isEditing = editingItems.has(itemKey)

    return (
      <Card key={challenge.id || index}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-1">
              <Mountain className="h-4 w-4 text-yellow-500" />
              {isEditing ? (
                <Input
                  value={challenge.name}
                  onChange={(e) => updateChallenge(index, 'name', e.target.value)}
                  placeholder="Challenge name"
                  className="h-8"
                />
              ) : (
                <h3 className="font-medium">{challenge.name}</h3>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => toggleEdit(itemKey)}>
                {isEditing ? <CheckCircle className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteItem('challenge', index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Topic:</Label>
              {isEditing ? (
                <Select value={getTopicName(challenge.topic)} onValueChange={(value) => updateChallenge(index, 'topic', value)}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPIC_OPTIONS.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {getTopicName(challenge.topic)}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-xs">Impact:</Label>
              {isEditing ? (
                <Select value={challenge.impact} onValueChange={(value) => updateChallenge(index, 'impact', value)}>
                  <SelectTrigger className="h-8 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPACT_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline">{challenge.impact}</Badge>
              )}
            </div>
            
            <div>
              <Label className="text-xs">Description:</Label>
              {isEditing ? (
                <Textarea
                  value={challenge.description}
                  onChange={(e) => updateChallenge(index, 'description', e.target.value)}
                  placeholder="Challenge description"
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <p className="text-sm mt-1">{challenge.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const InsightCard = ({ insight, index }: { insight: Insight; index: number }) => {
    const itemKey = `insight-${index}`
    const isEditing = editingItems.has(itemKey)

    return (
      <Card key={insight.id || index}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-1">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              {isEditing ? (
                <Input
                  value={insight.name}
                  onChange={(e) => updateInsight(index, 'name', e.target.value)}
                  placeholder="Insight name"
                  className="h-8"
                />
              ) : (
                <h3 className="font-medium">{insight.name}</h3>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => toggleEdit(itemKey)}>
                {isEditing ? <CheckCircle className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteItem('insight', index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Topic:</Label>
              {isEditing ? (
                <Select value={getTopicName(insight.topic)} onValueChange={(value) => updateInsight(index, 'topic', value)}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPIC_OPTIONS.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {getTopicName(insight.topic)}
                </Badge>
              )}
            </div>
            
            <div>
              <Label className="text-xs">Description:</Label>
              {isEditing ? (
                <Textarea
                  value={insight.description}
                  onChange={(e) => updateInsight(index, 'description', e.target.value)}
                  placeholder="Insight description"
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <p className="text-sm mt-1">{insight.description}</p>
              )}
            </div>
            
            <div>
              <Label className="text-xs">Context:</Label>
              {isEditing ? (
                <Textarea
                  value={insight.context}
                  onChange={(e) => updateInsight(index, 'context', e.target.value)}
                  placeholder="Context or implications"
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <p className="text-sm mt-1">{insight.context}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <MobileLayout hideNav>
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/insights">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-medium">Session Analysis</h1>
            {hasChanges && <Badge variant="outline" className="ml-2">Unsaved Changes</Badge>}
          </div>
          <div className="flex items-center gap-2">
            {/* Show analyze button if session has no meaningful analysis data */}
            {sessionData && (
              // Show if completely empty OR if total analysis items are very few (likely failed/incomplete analysis)
              (sessionData.emotions.length + 
               sessionData.beliefs.length + 
               sessionData.action_items.length + 
               sessionData.challenges.length + 
               sessionData.insights.length <= 5)
            ) && (
              <Button 
                size="sm" 
                onClick={handleAnalyze} 
                disabled={analyzing}
                className="flex items-center gap-1"
                variant="outline"
              >
                {analyzing ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{analyzing ? 'Analyzing...' : 'Analyze Session'}</span>
              </Button>
            )}
            {/* Always show a re-analyze button if there's some data but user wants to re-run */}
            {sessionData && (
              sessionData.emotions.length + 
              sessionData.beliefs.length + 
              sessionData.action_items.length + 
              sessionData.challenges.length + 
              sessionData.insights.length > 5
            ) && (
              <Button 
                size="sm" 
                onClick={handleAnalyze} 
                disabled={analyzing}
                className="flex items-center gap-1"
                variant="ghost"
              >
                {analyzing ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{analyzing ? 'Re-analyzing...' : 'Re-analyze'}</span>
              </Button>
            )}
            {/* Fallback: Always show analyze button for debugging */}
            {!sessionData || (
              sessionData.emotions.length + 
              sessionData.beliefs.length + 
              sessionData.action_items.length + 
              sessionData.challenges.length + 
              sessionData.insights.length === 0
            ) ? (
              <Button 
                size="sm" 
                onClick={handleAnalyze} 
                disabled={analyzing}
                className="flex items-center gap-1"
                variant="default"
              >
                {analyzing ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{analyzing ? 'Analyzing...' : 'Start Analysis'}</span>
              </Button>
            ) : null}
            {/* Temporary debug button - always visible */}
            <Button 
              size="sm" 
              onClick={() => {
                console.log('🔍 Debug Session Data:', {
                  sessionData,
                  hasSessionData: !!sessionData,
                  totalItems: sessionData ? (
                    sessionData.emotions.length + 
                    sessionData.beliefs.length + 
                    sessionData.action_items.length + 
                    sessionData.challenges.length + 
                    sessionData.insights.length
                  ) : 0
                })
                handleAnalyze()
              }} 
              disabled={analyzing}
              className="flex items-center gap-1"
              variant="secondary"
            >
              {analyzing ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>{analyzing ? 'Debug Analyzing...' : 'Debug Analyze'}</span>
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleSave(false)} 
              disabled={!hasChanges || saving}
              className="flex items-center gap-1"
            >
              {saving ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </Button>
            {/* Temporary debug save button - always enabled */}
            <Button 
              size="sm" 
              onClick={() => {
                console.log('🔍 Debug Save clicked with state:', {
                  hasChanges,
                  sessionData: sessionData ? {
                    emotions: sessionData.emotions.length,
                    beliefs: sessionData.beliefs.length,
                    actions: sessionData.action_items.length,
                    challenges: sessionData.challenges.length,
                    insights: sessionData.insights.length
                  } : null,
                  originalData: originalData ? {
                    emotions: originalData.emotions.length,
                    beliefs: originalData.beliefs.length,
                    actions: originalData.action_items.length,
                    challenges: originalData.challenges.length,
                    insights: originalData.insights.length
                  } : null
                })
                handleSave(true) // Force debug save
              }} 
              disabled={saving}
              className="flex items-center gap-1"
              variant="secondary"
            >
              {saving ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Debug Saving...' : 'Debug Save'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 pb-16">
        <div className="mb-4 text-sm text-muted-foreground">{new Date(sessionData.timestamp).toLocaleString()}</div>

        <Tabs defaultValue="emotions">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="emotions" className="flex items-center gap-1 text-xs">
              <Heart className="h-3 w-3" />
              <span>Emotions</span>
            </TabsTrigger>
            <TabsTrigger value="beliefs" className="flex items-center gap-1 text-xs">
              <Brain className="h-3 w-3" />
              <span>Beliefs</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1 text-xs">
              <Lightbulb className="h-3 w-3" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-1 text-xs">
              <Mountain className="h-3 w-3" />
              <span>Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-1 text-xs">
              <Flag className="h-3 w-3" />
              <span>Actions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emotions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Emotions</h2>
              <Button size="sm" onClick={addEmotion} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Emotion
              </Button>
            </div>
            {sessionData.emotions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No emotions detected</h3>
                  <p className="text-gray-500 mb-4">
                    {(sessionData.emotions.length + sessionData.beliefs.length + sessionData.action_items.length + sessionData.challenges.length + sessionData.insights.length) === 0 
                      ? "Click 'Analyze Session' above to automatically detect emotions from your session."
                      : "Add emotions manually or re-run the analysis."
                    }
                  </p>
                  <Button onClick={addEmotion} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Emotion
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sessionData.emotions.map((emotion, index) => (
                <EmotionCard key={emotion.id || index} emotion={emotion} index={index} />
              ))
            )}
          </TabsContent>

          <TabsContent value="beliefs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Mental Stories & Beliefs</h2>
              <Button size="sm" onClick={addBelief} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Belief
              </Button>
            </div>
            {sessionData.beliefs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No beliefs identified</h3>
                  <p className="text-gray-500 mb-4">
                    {(sessionData.emotions.length + sessionData.beliefs.length + sessionData.action_items.length + sessionData.challenges.length + sessionData.insights.length) === 0 
                      ? "Click 'Analyze Session' above to automatically identify underlying beliefs."
                      : "Add beliefs manually or re-run the analysis."
                    }
                  </p>
                  <Button onClick={addBelief} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Belief
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sessionData.beliefs.map((belief, index) => (
                <BeliefCard key={belief.id || index} belief={belief} index={index} />
              ))
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Insights</h2>
              <Button size="sm" onClick={addInsight} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Insight
              </Button>
            </div>
            {sessionData.insights.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No insights discovered</h3>
                  <p className="text-gray-500 mb-4">
                    {(sessionData.emotions.length + sessionData.beliefs.length + sessionData.action_items.length + sessionData.challenges.length + sessionData.insights.length) === 0 
                      ? "Click 'Analyze Session' above to automatically discover key insights."
                      : "Add insights manually or re-run the analysis."
                    }
                  </p>
                  <Button onClick={addInsight} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Insight
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sessionData.insights.map((insight, index) => (
                <InsightCard key={insight.id || index} insight={insight} index={index} />
              ))
            )}
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Challenges</h2>
              <Button size="sm" onClick={addChallenge} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Challenge
              </Button>
            </div>
            {sessionData.challenges.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mountain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No challenges identified</h3>
                  <p className="text-gray-500 mb-4">
                    {(sessionData.emotions.length + sessionData.beliefs.length + sessionData.action_items.length + sessionData.challenges.length + sessionData.insights.length) === 0 
                      ? "Click 'Analyze Session' above to automatically identify challenges."
                      : "Add challenges manually or re-run the analysis."
                    }
                  </p>
                  <Button onClick={addChallenge} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Challenge
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sessionData.challenges.map((challenge, index) => (
                <ChallengeCard key={challenge.id || index} challenge={challenge} index={index} />
              ))
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Action Items</h2>
              <Button size="sm" onClick={addActionItem} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Action
              </Button>
            </div>
            {sessionData.action_items.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Flag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No action items created</h3>
                  <p className="text-gray-500 mb-4">
                    {(sessionData.emotions.length + sessionData.beliefs.length + sessionData.action_items.length + sessionData.challenges.length + sessionData.insights.length) === 0 
                      ? "Click 'Analyze Session' above to automatically generate action items."
                      : "Add action items manually or re-run the analysis."
                    }
                  </p>
                  <Button onClick={addActionItem} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Action
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sessionData.action_items.map((action, index) => (
                <ActionItemCard key={action.id || index} action={action} index={index} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating home button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" asChild>
          <Link href="/">
            <Home className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </MobileLayout>
  )
}

