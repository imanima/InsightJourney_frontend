"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, CheckCircle, Clock, AlertCircle, Loader2, Edit, Trash } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import { actionItemsAPI, type ActionItem } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export default function ActionItemsPage() {
  const { user } = useAuth()
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch action items from API
  useEffect(() => {
    const fetchActionItems = async () => {
      try {
        setIsLoading(true)
        const response = await actionItemsAPI.getAllActionItems()

        // Check if response and actionItems exist before setting state
        if (response && response.data && (response.data as any).actionItems) {
          setActionItems((response.data as any).actionItems)
        } else {
          // If actionItems is undefined, set an empty array
          setActionItems([])
          console.warn("No action items returned from API")
        }
      } catch (err) {
        console.error("Failed to fetch action items:", err)
        setError("Failed to load action items. Please try again.")
        // Ensure actionItems is at least an empty array
        setActionItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchActionItems()
  }, [])

  const toggleItemStatus = async (id: string) => {
    try {
      const item = actionItems.find((item) => item.id === id)
      if (!item) return

      const newStatus = item.status === "completed" ? "in_progress" : "completed"

      // Update the item in the UI immediately for better UX
      setActionItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return { ...item, status: newStatus }
          }
          return item
        }),
      )

      // Send the update to the API - use sessionId from the item
      await actionItemsAPI.updateActionItem(item.sessionId, id, { status: newStatus })
    } catch (err) {
      console.error("Failed to update action item:", err)
      // Revert the UI change if the API call fails
      setActionItems((prev) => [...prev])
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this action item?")) {
      return
    }

    try {
      const item = actionItems.find((item) => item.id === id)
      if (!item) return

      await actionItemsAPI.deleteActionItem(item.sessionId, id)

      // Remove the item from the UI
      setActionItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error("Failed to delete action item:", err)
      alert("Failed to delete action item. Please try again.")
    }
  }

  const handleAddItem = () => {
    router.push("/action-items/new")
  }

  const handleEditItem = (id: string) => {
    router.push(`/action-items/edit/${id}`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "not_started":
        return <AlertCircle className="h-4 w-4 text-gray-400" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const isOverdue = (dateString: string, status: string) => {
    if (status === "completed") return false
    const dueDate = new Date(dateString)
    const today = new Date()
    return dueDate < today
  }

  return (
    <MobileLayout title="Action Items">
      <div className="container px-4 py-6 pb-16">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Action Items</h1>
          <Button size="sm" className="flex items-center gap-1" onClick={handleAddItem}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading action items...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            {error}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {actionItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No action items found</div>
              ) : (
                actionItems.map((item) => (
                  <ActionItemCard
                    key={item.id}
                    item={item}
                    toggleStatus={toggleItemStatus}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    getPriorityColor={getPriorityColor}
                    getStatusIcon={getStatusIcon}
                    formatDate={formatDate}
                    isOverdue={isOverdue}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {actionItems.filter((item) => item.status !== "completed").length === 0 ? (
                <div className="text-center py-8 text-gray-500">No active items found</div>
              ) : (
                actionItems
                  .filter((item) => item.status !== "completed")
                  .map((item) => (
                    <ActionItemCard
                      key={item.id}
                      item={item}
                      toggleStatus={toggleItemStatus}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                      getPriorityColor={getPriorityColor}
                      getStatusIcon={getStatusIcon}
                      formatDate={formatDate}
                      isOverdue={isOverdue}
                    />
                  ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {actionItems.filter((item) => item.status === "completed").length === 0 ? (
                <div className="text-center py-8 text-gray-500">No completed items found</div>
              ) : (
                actionItems
                  .filter((item) => item.status === "completed")
                  .map((item) => (
                    <ActionItemCard
                      key={item.id}
                      item={item}
                      toggleStatus={toggleItemStatus}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                      getPriorityColor={getPriorityColor}
                      getStatusIcon={getStatusIcon}
                      formatDate={formatDate}
                      isOverdue={isOverdue}
                    />
                  ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MobileLayout>
  )
}

interface ActionItemCardProps {
  item: ActionItem
  toggleStatus: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  getPriorityColor: (priority: string) => string
  getStatusIcon: (status: string) => React.ReactNode
  formatDate: (dateString: string) => string
  isOverdue: (dateString: string, status: string) => boolean
}

function ActionItemCard({
  item,
  toggleStatus,
  onEdit,
  onDelete,
  getPriorityColor,
  getStatusIcon,
  formatDate,
  isOverdue,
}: ActionItemCardProps) {
  return (
    <Card className={`${item.status === "completed" ? "bg-gray-50" : "bg-white"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id={`item-${item.id}`}
            checked={item.status === "completed"}
            onCheckedChange={() => toggleStatus(item.id)}
            className="mt-1"
          />

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h3 className={`font-medium ${item.status === "completed" ? "line-through text-gray-500" : ""}`}>
                {item.title}
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={getPriorityColor(item.priority)}>
                  {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                </Badge>

                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {item.topic}
                </Badge>
              </div>
            </div>

            <p className={`text-sm mb-3 ${item.status === "completed" ? "text-gray-500" : "text-gray-700"}`}>
              {item.description}
            </p>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                {getStatusIcon(item.status)}
                <span className={item.status === "completed" ? "text-gray-500" : "text-gray-700"}>
                  {item.status === "completed"
                    ? "Completed"
                    : item.status === "in_progress"
                      ? "In Progress"
                      : "Not Started"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span
                  className={`
                  ${item.status === "completed" ? "text-gray-500" : ""}
                  ${isOverdue(item.dueDate, item.status) ? "text-red-600 font-medium" : ""}
                `}
                >
                  {isOverdue(item.dueDate, item.status) ? "Overdue: " : "Due: "}
                  {formatDate(item.dueDate)}
                </span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t text-xs text-gray-500 flex justify-between items-center">
              <span>From session: {item.sessionTitle}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(item.id)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

