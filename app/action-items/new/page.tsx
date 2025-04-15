"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MobileLayout from "@/components/mobile-layout"
import ActionItemForm from "@/components/action-item-form"

export default function NewActionItemPage() {
  return (
    <MobileLayout title="New Action Item" showBackButton backUrl="/action-items">
      <div className="container px-4 py-6 pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Create New Action Item</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionItemForm />
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}

