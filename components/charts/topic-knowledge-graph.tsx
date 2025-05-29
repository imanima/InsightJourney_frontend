"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Network, Filter, Heart, AlertTriangle, Lightbulb, Flag } from "lucide-react"

interface TopicNode {
  id: string
  name: string
  type: 'topic' | 'emotion' | 'challenge' | 'insight' | 'action'
  size: number
  connections: string[]
  data: {
    emotions: any[]
    challenges: any[]
    insights: any[]
    actions: any[]
    sessions: string[]
  }
}

interface TopicConnection {
  source: string
  target: string
  strength: number
  type: string
}

interface TopicKnowledgeGraphProps {
  sessions: Array<{
    id: string
    title: string
    timestamp: string
    elements: {
      emotions?: any[]
      challenges?: any[]
      insights?: any[]
      action_items?: any[]
    }
  }>
  onTopicSelect?: (topic: string, relatedData: any[]) => void
}

export default function TopicKnowledgeGraph({ sessions, onTopicSelect }: TopicKnowledgeGraphProps) {
  const [nodes, setNodes] = useState<TopicNode[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'emotion' | 'challenge' | 'insight' | 'action'>('all')
  const [topicDetails, setTopicDetails] = useState<any>(null)

  useEffect(() => {
    if (!sessions || sessions.length === 0) return

    // Extract all topics and their relationships
    const topicFrequency: Record<string, {
      emotions: any[]
      challenges: any[]
      insights: any[]
      actions: any[]
      sessions: string[]
    }> = {}

    sessions.forEach(session => {
      const elements = session.elements || {}
      const emotions = elements.emotions || []
      const challenges = elements.challenges || []
      const insights = elements.insights || []
      const actions = elements.action_items || []

      // Get all topics from this session
      const sessionTopics = new Set<string>()
      
      emotions.forEach(item => {
        const topic = item.topic || 'General'
        sessionTopics.add(topic)
        if (!topicFrequency[topic]) {
          topicFrequency[topic] = { emotions: [], challenges: [], insights: [], actions: [], sessions: [] }
        }
        topicFrequency[topic].emotions.push({ ...item, sessionId: session.id, sessionTitle: session.title })
      })

      challenges.forEach(item => {
        const topic = item.topic || 'General'
        sessionTopics.add(topic)
        if (!topicFrequency[topic]) {
          topicFrequency[topic] = { emotions: [], challenges: [], insights: [], actions: [], sessions: [] }
        }
        topicFrequency[topic].challenges.push({ ...item, sessionId: session.id, sessionTitle: session.title })
      })

      insights.forEach(item => {
        const topic = item.topic || 'General'
        sessionTopics.add(topic)
        if (!topicFrequency[topic]) {
          topicFrequency[topic] = { emotions: [], challenges: [], insights: [], actions: [], sessions: [] }
        }
        topicFrequency[topic].insights.push({ ...item, sessionId: session.id, sessionTitle: session.title })
      })

      actions.forEach(item => {
        const topic = item.topic || 'General'
        sessionTopics.add(topic)
        if (!topicFrequency[topic]) {
          topicFrequency[topic] = { emotions: [], challenges: [], insights: [], actions: [], sessions: [] }
        }
        topicFrequency[topic].actions.push({ ...item, sessionId: session.id, sessionTitle: session.title })
      })

      // Add session to all topics
      sessionTopics.forEach(topic => {
        if (topicFrequency[topic] && !topicFrequency[topic].sessions.includes(session.id)) {
          topicFrequency[topic].sessions.push(session.id)
        }
      })
    })

    // Create nodes for topics
    const topicNodes = Object.entries(topicFrequency).map(([topic, data]) => {
      const totalCount = data.emotions.length + data.challenges.length + data.insights.length + data.actions.length
      
      return {
        id: topic,
        name: topic,
        type: 'topic' as const,
        size: totalCount,
        connections: [],
        data: {
          emotions: data.emotions,
          challenges: data.challenges,
          insights: data.insights,
          actions: data.actions,
          sessions: data.sessions
        }
      }
    }).sort((a, b) => b.size - a.size)

    setNodes(topicNodes)
  }, [sessions])

  const handleTopicClick = (topic: TopicNode) => {
    setSelectedTopic(topic.id)
    setTopicDetails(topic.data)
    if (onTopicSelect) {
      onTopicSelect(topic.id, [topic.data])
    }
  }

  const getFilteredNodes = () => {
    return nodes.filter(node => {
      if (filterType === 'all') return true
      if (filterType === 'emotion') return node.data.emotions.length > 0
      if (filterType === 'challenge') return node.data.challenges.length > 0
      if (filterType === 'insight') return node.data.insights.length > 0
      if (filterType === 'action') return node.data.actions.length > 0
      return true
    })
  }

  const getNodeColor = (node: TopicNode) => {
    const isSelected = selectedTopic === node.id
    
    if (isSelected) {
      return 'bg-blue-100 border-blue-500 text-blue-800 shadow-lg'
    }
    
    switch (node.type) {
      case 'topic':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300 text-purple-800 hover:from-purple-200 hover:to-purple-300'
      case 'emotion':
        return 'bg-gradient-to-r from-red-100 to-red-200 border-red-300 text-red-800 hover:from-red-200 hover:to-red-300'
      case 'challenge':
        return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300 text-amber-800 hover:from-amber-200 hover:to-amber-300'
      case 'insight':
        return 'bg-gradient-to-r from-emerald-100 to-emerald-200 border-emerald-300 text-emerald-800 hover:from-emerald-200 hover:to-emerald-300'
      case 'action':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300 text-blue-800 hover:from-blue-200 hover:to-blue-300'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200'
    }
  }

  const getNodeSize = (size: number) => {
    if (size >= 5) return 'text-base px-4 py-3'
    if (size >= 3) return 'text-sm px-3 py-2'
    return 'text-xs px-2 py-1'
  }

  const filteredNodes = getFilteredNodes()

  if (nodes.length === 0) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-500" />
            Topic Knowledge Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Network className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No topic data available for knowledge graph</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-500" />
            Topic Knowledge Graph
          </CardTitle>
          <div className="flex gap-1 flex-wrap">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="text-xs"
            >
              All
            </Button>
            <Button
              variant={filterType === 'emotion' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('emotion')}
              className="flex items-center gap-1 text-xs"
            >
              <Heart className="h-3 w-3" />
              Emotions
            </Button>
            <Button
              variant={filterType === 'challenge' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('challenge')}
              className="flex items-center gap-1 text-xs"
            >
              <AlertTriangle className="h-3 w-3" />
              Challenges
            </Button>
            <Button
              variant={filterType === 'insight' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('insight')}
              className="flex items-center gap-1 text-xs"
            >
              <Lightbulb className="h-3 w-3" />
              Insights
            </Button>
            <Button
              variant={filterType === 'action' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('action')}
              className="flex items-center gap-1 text-xs"
            >
              <Flag className="h-3 w-3" />
              Actions
            </Button>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
          <span>Total Topics: <strong className="text-purple-600">{nodes.length}</strong></span>
          <span>Selected Filter: <strong className="text-blue-600 capitalize">{filterType}</strong></span>
          {selectedTopic && <span>Viewing: <strong className="text-green-600">{selectedTopic}</strong></span>}
        </div>
      </CardHeader>
      <CardContent>
        {filteredNodes.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Network className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No topics found for the selected filter</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Topic Cloud */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
              <div className="flex flex-wrap gap-3 justify-center min-h-[200px] items-center">
                {filteredNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleTopicClick(node)}
                    className={`
                      rounded-full border-2 transition-all duration-200 hover:scale-105 hover:shadow-md
                      transform-gpu ${getNodeColor(node)} ${getNodeSize(node.size)}
                      ${selectedTopic === node.id ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{node.name}</span>
                      <Badge variant="secondary" className="text-xs bg-white/70 text-gray-700">
                        {node.size}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Details */}
            {selectedTopic && topicDetails && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Network className="h-5 w-5 text-blue-600" />
                    Topic: <span className="text-blue-600">{selectedTopic}</span>
                  </h3>
                  <div className="text-sm text-blue-700">
                    Connected to <strong>{topicDetails.sessions.length}</strong> sessions with{' '}
                    <strong>{
                      topicDetails.emotions.length + 
                      topicDetails.challenges.length + 
                      topicDetails.insights.length + 
                      topicDetails.actions.length
                    }</strong> total items
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topicDetails.emotions.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <h4 className="text-sm font-semibold text-red-700 flex items-center gap-1 mb-3">
                        <Heart className="h-4 w-4" />
                        Emotions ({topicDetails.emotions.length})
                      </h4>
                      <div className="space-y-2">
                        {topicDetails.emotions.slice(0, 3).map((emotion: any, index: number) => (
                          <div key={index} className="text-sm p-2 bg-white rounded border border-red-200">
                            <div className="font-medium text-red-800">{emotion.name || emotion.emotion}</div>
                            {emotion.intensity && (
                              <div className="text-xs text-red-600">Intensity: {emotion.intensity}/5</div>
                            )}
                          </div>
                        ))}
                        {topicDetails.emotions.length > 3 && (
                          <div className="text-xs text-red-600 font-medium">
                            +{topicDetails.emotions.length - 3} more emotions
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {topicDetails.challenges.length > 0 && (
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                      <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-1 mb-3">
                        <AlertTriangle className="h-4 w-4" />
                        Challenges ({topicDetails.challenges.length})
                      </h4>
                      <div className="space-y-2">
                        {topicDetails.challenges.slice(0, 3).map((challenge: any, index: number) => (
                          <div key={index} className="text-sm p-2 bg-white rounded border border-amber-200">
                            <div className="font-medium text-amber-800">{challenge.name || challenge.challenge}</div>
                            {challenge.impact && (
                              <div className="text-xs text-amber-600">Impact: {challenge.impact}</div>
                            )}
                          </div>
                        ))}
                        {topicDetails.challenges.length > 3 && (
                          <div className="text-xs text-amber-600 font-medium">
                            +{topicDetails.challenges.length - 3} more challenges
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {topicDetails.insights.length > 0 && (
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                      <h4 className="text-sm font-semibold text-emerald-700 flex items-center gap-1 mb-3">
                        <Lightbulb className="h-4 w-4" />
                        Insights ({topicDetails.insights.length})
                      </h4>
                      <div className="space-y-2">
                        {topicDetails.insights.slice(0, 3).map((insight: any, index: number) => (
                          <div key={index} className="text-sm p-2 bg-white rounded border border-emerald-200">
                            <div className="font-medium text-emerald-800">{insight.name || insight.insight}</div>
                            {insight.description && (
                              <div className="text-xs text-emerald-600 truncate">{insight.description}</div>
                            )}
                          </div>
                        ))}
                        {topicDetails.insights.length > 3 && (
                          <div className="text-xs text-emerald-600 font-medium">
                            +{topicDetails.insights.length - 3} more insights
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {topicDetails.actions.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-1 mb-3">
                        <Flag className="h-4 w-4" />
                        Actions ({topicDetails.actions.length})
                      </h4>
                      <div className="space-y-2">
                        {topicDetails.actions.slice(0, 3).map((action: any, index: number) => (
                          <div key={index} className="text-sm p-2 bg-white rounded border border-blue-200">
                            <div className="font-medium text-blue-800">{action.name || action.title}</div>
                            {action.status && (
                              <div className="text-xs text-blue-600">Status: {action.status}</div>
                            )}
                          </div>
                        ))}
                        {topicDetails.actions.length > 3 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{topicDetails.actions.length - 3} more actions
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 text-xs text-muted-foreground text-center">
          💡 Click on topics to explore their connections • Use filters to focus on specific types
        </div>
      </CardContent>
    </Card>
  )
} 