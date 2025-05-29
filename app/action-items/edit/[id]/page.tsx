"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import ActionItemForm from "@/components/action-item-form"
import { actionItemsAPI, ActionItem } from "@/lib/api-client"

export default function EditActionItemPage({ params }: { params: Promise<{ id: string }> }) {
  const [actionItem, setActionItem] = useState<ActionItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { id } = use(params)

  useEffect(() => {
    const fetchActionItem = async () => {
      try {
        setIsLoading(true)
        // For now, we'll need to get the action item through a different approach
        // since the API requires both sessionId and actionItemId
        // This is a temporary solution - in a real app, you'd either:
        // 1. Include sessionId in the route
        // 2. Have a separate endpoint for getting action items by ID
        // 3. Store the sessionId in the action item data
        
        // For now, let's create a mock action item or redirect to action items list
        setError("Action item editing requires session context. Please access from session analysis page.")
      } catch (err) {
        console.error("Failed to fetch action item:", err)
        setError("Failed to load action item. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchActionItem()
  }, [id])

  const handleSuccess = () => {
    router.push("/action-items")
    router.refresh()
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <MobileLayout title="Edit Action Item" showBackButton>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading action item...</span>
        </div>
      </MobileLayout>
    )
  }

  if (error || !actionItem) {
    return (
      <MobileLayout title="Edit Action Item" showBackButton>
        <div className="container px-4 py-6">
          <div className="p-4 bg-red-50 text-red-800 rounded-md">{error || "Action item not found"}</div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Edit Action Item" showBackButton>
      <div className="container px-4 py-6 pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Edit Action Item</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionItemForm
              actionItem={actionItem}
              isEditing={true}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}

