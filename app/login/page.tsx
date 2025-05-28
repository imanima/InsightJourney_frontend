"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/"

  useEffect(() => {
    // Redirect to the new auth signin page
    router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }, [router, callbackUrl])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-medium">Redirecting to login...</h2>
        <p className="text-sm text-muted-foreground mt-2">Please wait</p>
      </div>
    </div>
  )
}

