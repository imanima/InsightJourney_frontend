import { NextResponse } from "next/server"
import { sign } from "jsonwebtoken"

// Mock user database - in a real app, this would be a database
const USERS = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "password", // In a real app, this would be hashed
  },
]

// JWT secret - in a real app, this would be an environment variable
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "supersecretkey123"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user in mock database
    const user = USERS.find((u) => u.email === email)

    // Check credentials
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create a JWT token
    const token = sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      data: {
        user: userWithoutPassword,
        token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

