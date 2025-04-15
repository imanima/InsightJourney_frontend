"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the signin page by default
    router.replace("/auth/signin")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-medium">Redirecting...</h2>
        <p className="text-sm text-muted-foreground mt-2">Please wait</p>
      </div>
    </div>
  )
}

