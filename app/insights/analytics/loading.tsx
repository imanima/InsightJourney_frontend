import { Loader2 } from "lucide-react"
import MobileLayout from "@/components/mobile-layout"

export default function Loading() {
  return (
    <MobileLayout title="Emotion Analytics" showBackButton backUrl="/insights">
      <div className="container px-4 py-6 pb-16">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    </MobileLayout>
  )
}

