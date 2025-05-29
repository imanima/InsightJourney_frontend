"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react"
import Link from "next/link"
import BaseLayout from "@/components/base-layout"

// Mock data types
interface AnalysisElement {
  name: string
  enabled: boolean
  description: string
  system_instructions: string
  analysis_instructions: string
  categories: string[]
  format_template: string
  prompt_template: string
  requires_topic: boolean
  requires_timestamp: boolean
  additional_fields: string[]
}

interface Settings {
  gpt_model: string
  max_tokens: number
  temperature: number
  system_prompt_template: string
  analysis_prompt_template: string
  available_topics: string[]
  analysis_elements: AnalysisElement[]
}

export default function AdminSettingsPage() {
  // Mock username - in a real app, this would come from authentication
  const username = "Admin User"

  // Mock available models
  const availableModels = ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"]
  const modelDescriptions = {
    "gpt-3.5-turbo": "Fast and cost-effective for most tasks",
    "gpt-4": "More capable for complex tasks, but slower and more expensive",
    "gpt-4-turbo": "Latest model with improved capabilities and performance",
  }

  // Mock settings data
  const [settings, setSettings] = useState<Settings>({
    gpt_model: "gpt-4",
    max_tokens: 2000,
    temperature: 0.7,
    system_prompt_template: "You are an AI assistant that helps analyze emotional content. {element_instructions}",
    analysis_prompt_template:
      "Analyze the following text and extract relevant information: {text}\n\nUse these formats: {element_formats}\n\nTimestamp: {timestamp}",
    available_topics: ["Work", "Relationships", "Health", "Family", "PersonalGrowth", "Other"],
    analysis_elements: [
      {
        name: "Emotions",
        enabled: true,
        description: "Emotional states and feelings expressed in the text",
        system_instructions: "Extract emotions with their intensity, context, and triggers",
        analysis_instructions: "Identify all emotions mentioned or implied in the text",
        categories: ["Positive", "Negative", "Neutral"],
        format_template:
          '{"emotion": "string", "intensity": number, "context": "string", "trigger": "string", "category": "string", "topic": "string"}',
        prompt_template: "Extract all emotions from the text with their intensity (1-5), context, and triggers",
        requires_topic: true,
        requires_timestamp: true,
        additional_fields: ["trigger", "context"],
      },
      {
        name: "Contexts",
        enabled: true,
        description: "Mental stories and beliefs that shape perception",
        system_instructions: "Extract mental models, beliefs, and thought patterns",
        analysis_instructions: "Identify underlying beliefs and mental models",
        categories: ["Not Enough Time", "Not Good Enough / Self-Doubt", "Fear of Failure / Perfectionism"],
        format_template: '{"category": "string", "belief": "string", "explanation": "string", "topic": "string"}',
        prompt_template: "Extract mental models and beliefs from the text",
        requires_topic: true,
        requires_timestamp: true,
        additional_fields: ["explanation"],
      },
    ],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send the updated settings to your API
    alert("Settings saved successfully!")
  }

  const addTopic = () => {
    setSettings((prev) => ({
      ...prev,
      available_topics: [...prev.available_topics, ""],
    }))
  }

  const updateTopic = (index: number, value: string) => {
    const updatedTopics = [...settings.available_topics]
    updatedTopics[index] = value
    setSettings((prev) => ({
      ...prev,
      available_topics: updatedTopics,
    }))
  }

  const addCategory = (elementName: string, category = "") => {
    setSettings((prev) => ({
      ...prev,
      analysis_elements: prev.analysis_elements.map((element) => {
        if (element.name === elementName) {
          return {
            ...element,
            categories: [...element.categories, category],
          }
        }
        return element
      }),
    }))
  }

  const updateCategory = (elementName: string, index: number, value: string) => {
    setSettings((prev) => ({
      ...prev,
      analysis_elements: prev.analysis_elements.map((element) => {
        if (element.name === elementName) {
          const updatedCategories = [...element.categories]
          updatedCategories[index] = value
          return {
            ...element,
            categories: updatedCategories,
          }
        }
        return element
      }),
    }))
  }

  const addField = (elementName: string, field = "") => {
    setSettings((prev) => ({
      ...prev,
      analysis_elements: prev.analysis_elements.map((element) => {
        if (element.name === elementName) {
          return {
            ...element,
            additional_fields: [...element.additional_fields, field],
          }
        }
        return element
      }),
    }))
  }

  const updateField = (elementName: string, index: number, value: string) => {
    setSettings((prev) => ({
      ...prev,
      analysis_elements: prev.analysis_elements.map((element) => {
        if (element.name === elementName) {
          const updatedFields = [...element.additional_fields]
          updatedFields[index] = value
          return {
            ...element,
            additional_fields: updatedFields,
          }
        }
        return element
      }),
    }))
  }

  const toggleElementEnabled = (elementName: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      analysis_elements: prev.analysis_elements.map((element) => {
        if (element.name === elementName) {
          return {
            ...element,
            enabled,
          }
        }
        return element
      }),
    }))
  }

  return (
    <BaseLayout username={username}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Admin Settings</h1>
          <p className="text-muted-foreground">Configure analysis elements and GPT settings</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin-settings/users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </Link>
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* GPT Settings Card */}
          <Card className="mb-6">
            <CardHeader className="bg-gray-50">
              <h5 className="text-lg font-medium flex items-center">
                <i className="fas fa-cog mr-2"></i>GPT Settings
              </h5>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="gpt-model">GPT Model</Label>
                  <Select
                    value={settings.gpt_model}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, gpt_model: value }))}
                  >
                    <SelectTrigger id="gpt-model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1" id="model-description">
                    {modelDescriptions[settings.gpt_model as keyof typeof modelDescriptions] || ""}
                  </p>
                </div>
                <div>
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={settings.max_tokens}
                    onChange={(e) => setSettings((prev) => ({ ...prev, max_tokens: Number.parseInt(e.target.value) }))}
                    min={1}
                    max={4000}
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={settings.temperature}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, temperature: Number.parseFloat(e.target.value) }))
                    }
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Templates Card */}
          <Card className="mb-6">
            <CardHeader className="bg-gray-50">
              <h5 className="text-lg font-medium flex items-center">
                <i className="fas fa-file-alt mr-2"></i>Prompt Templates
              </h5>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="system-prompt">System Prompt Template</Label>
                  <Textarea
                    id="system-prompt"
                    value={settings.system_prompt_template}
                    onChange={(e) => setSettings((prev) => ({ ...prev, system_prompt_template: e.target.value }))}
                    rows={5}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Available variables: {"{element_instructions}"}</p>
                </div>
                <div>
                  <Label htmlFor="analysis-prompt">Analysis Prompt Template</Label>
                  <Textarea
                    id="analysis-prompt"
                    value={settings.analysis_prompt_template}
                    onChange={(e) => setSettings((prev) => ({ ...prev, analysis_prompt_template: e.target.value }))}
                    rows={5}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Available variables: {"{text}"}, {"{element_formats}"}, {"{timestamp}"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Topics Card */}
          <Card className="mb-6">
            <CardHeader className="bg-gray-50">
              <h5 className="text-lg font-medium flex items-center">
                <i className="fas fa-tags mr-2"></i>Available Topics
              </h5>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {settings.available_topics.map((topic, index) => (
                  <div key={index} className="mb-2">
                    <Input value={topic} onChange={(e) => updateTopic(index, e.target.value)} />
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addTopic} className="mt-3">
                <i className="fas fa-plus mr-2"></i>Add Topic
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Elements */}
          {settings.analysis_elements.map((element, elementIndex) => (
            <Card key={elementIndex} className="mb-6">
              <CardHeader className="bg-gray-50 flex flex-row items-center justify-between">
                <h5 className="text-lg font-medium flex items-center">
                  <i className="fas fa-puzzle-piece mr-2"></i>
                  {element.name}
                </h5>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`element-enabled-${element.name}`}
                    checked={element.enabled}
                    onCheckedChange={(checked) => toggleElementEnabled(element.name, checked)}
                  />
                  <Label htmlFor={`element-enabled-${element.name}`}>Enabled</Label>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor={`element-description-${element.name}`}>Description</Label>
                    <Input
                      id={`element-description-${element.name}`}
                      value={element.description}
                      onChange={(e) => {
                        const updatedElements = [...settings.analysis_elements]
                        updatedElements[elementIndex].description = e.target.value
                        setSettings((prev) => ({ ...prev, analysis_elements: updatedElements }))
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`element-system-instructions-${element.name}`}>System-Level Instructions</Label>
                    <Textarea
                      id={`element-system-instructions-${element.name}`}
                      value={element.system_instructions}
                      onChange={(e) => {
                        const updatedElements = [...settings.analysis_elements]
                        updatedElements[elementIndex].system_instructions = e.target.value
                        setSettings((prev) => ({ ...prev, analysis_elements: updatedElements }))
                      }}
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Instructions to be included in the system prompt for this element.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor={`element-analysis-instructions-${element.name}`}>Analysis-Level Instructions</Label>
                    <Textarea
                      id={`element-analysis-instructions-${element.name}`}
                      value={element.analysis_instructions}
                      onChange={(e) => {
                        const updatedElements = [...settings.analysis_elements]
                        updatedElements[elementIndex].analysis_instructions = e.target.value
                        setSettings((prev) => ({ ...prev, analysis_elements: updatedElements }))
                      }}
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Instructions to be included in the analysis prompt for this element.
                    </p>
                  </div>

                  {element.categories && (
                    <div>
                      <Label>Categories</Label>
                      <div className="space-y-3" id={`categories-${element.name}`}>
                        {element.categories.map((category, index) => (
                          <div key={index} className="mb-2">
                            <Input
                              value={category}
                              onChange={(e) => updateCategory(element.name, index, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCategory(element.name)}
                        className="mt-3"
                      >
                        <i className="fas fa-plus mr-2"></i>Add Category
                      </Button>
                    </div>
                  )}

                  <div>
                    <Label htmlFor={`element-format-${element.name}`}>Format Template</Label>
                    <Input
                      id={`element-format-${element.name}`}
                      value={element.format_template}
                      onChange={(e) => {
                        const updatedElements = [...settings.analysis_elements]
                        updatedElements[elementIndex].format_template = e.target.value
                        setSettings((prev) => ({ ...prev, analysis_elements: updatedElements }))
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Template for formatting the output of this element.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor={`element-prompt-${element.name}`}>Prompt Template</Label>
                    <Textarea
                      id={`element-prompt-${element.name}`}
                      value={element.prompt_template}
                      onChange={(e) => {
                        const updatedElements = [...settings.analysis_elements]
                        updatedElements[elementIndex].prompt_template = e.target.value
                        setSettings((prev) => ({ ...prev, analysis_elements: updatedElements }))
                      }}
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Custom prompt template for this element.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`element-topic-${element.name}`}
                        checked={element.requires_topic}
                        onCheckedChange={(checked) => {
                          const updatedElements = [...settings.analysis_elements]
                          updatedElements[elementIndex].requires_topic = checked
                          setSettings((prev) => ({ ...prev, analysis_elements: updatedElements }))
                        }}
                      />
                      <Label htmlFor={`element-topic-${element.name}`}>Requires Topic</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`element-timestamp-${element.name}`}
                        checked={element.requires_timestamp}
                        onCheckedChange={(checked) => {
                          const updatedElements = [...settings.analysis_elements]
                          updatedElements[elementIndex].requires_timestamp = checked
                          setSettings((prev) => ({ ...prev, analysis_elements: updatedElements }))
                        }}
                      />
                      <Label htmlFor={`element-timestamp-${element.name}`}>Requires Timestamp</Label>
                    </div>
                  </div>

                  {element.additional_fields && (
                    <div>
                      <Label>Additional Fields</Label>
                      <div className="space-y-3" id={`fields-${element.name}`}>
                        {element.additional_fields.map((field, index) => (
                          <div key={index} className="mb-2">
                            <Input value={field} onChange={(e) => updateField(element.name, index, e.target.value)} />
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addField(element.name)}
                        className="mt-3"
                      >
                        <i className="fas fa-plus mr-2"></i>Add Field
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit">
              <i className="fas fa-save mr-2"></i>Save Settings
            </Button>
          </div>
        </form>
      </div>
    </BaseLayout>
  )
}

