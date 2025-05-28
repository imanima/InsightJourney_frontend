import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const progressItems = [
  { name: "Stress Management", progress: 65 },
  { name: "Work-Life Balance", progress: 40 },
  { name: "Leadership Skills", progress: 80 },
  { name: "Team Communication", progress: 55 },
]

export default function ProgressPage() {
  return (
    <div className="container px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Progress</h1>

      {progressItems.map((item, index) => (
        <Card key={index} className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle>{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={item.progress} className="w-full" />
            <p className="text-right text-sm text-muted-foreground mt-1">{item.progress}%</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

