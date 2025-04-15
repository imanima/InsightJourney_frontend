"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"
import ActionItemForm from "@/components/action-item-form"
import { actionItemsAPI } from "@/lib/api-client"

export default function EditActionItemPage({ params }: { params: { id: string } }) {
  const [actionItem, setActionItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchActionItem = async () => {
      try {
        setIsLoading(true)
        const response = await actionItemsAPI.getActionItem(id)

        if (response.data?.actionItem) {
          setActionItem(response.data.actionItem)
        } else {
          setError("Action item not found")
        }
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

