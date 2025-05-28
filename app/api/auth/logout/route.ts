import { NextResponse } from "next/server"

export async function POST() {
  // In a real app, you would invalidate the token on the server
  // For now, we'll just return a success response
  return NextResponse.json({
    data: { success: true },
  })
}

