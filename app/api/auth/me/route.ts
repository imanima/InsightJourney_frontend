import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

// Mock user database
const USERS = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
  },
]

// JWT secret - in a real app, this would be an environment variable
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "supersecretkey123"

export async function GET(request: Request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract token
    const token = authHeader.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      // Verify token
      const decoded = verify(token, JWT_SECRET) as { id: string; email: string }

      // Find user by ID
      const user = USERS.find((u) => u.id === decoded.id)

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json({
        data: { user },
      })
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

