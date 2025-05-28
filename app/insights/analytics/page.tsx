"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MobileLayout from "@/components/mobile-layout"
import EmotionAnalytics from "@/components/emotion-analytics"

export default function AnalyticsPage() {
  return (
    <MobileLayout title="Emotion Analytics" showBackButton backUrl="/insights">
      <div className="container px-4 py-6 pb-16">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Emotion Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <EmotionAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Emotion Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-80">
                    <EmotionAnalytics />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Emotion Intensity Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-80">
                    <EmotionAnalytics />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Emotion Trends Over Time</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-80">
                    <EmotionAnalytics />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Topic Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-80">
                    <EmotionAnalytics />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Session Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-80">
                    <EmotionAnalytics />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  )
}

