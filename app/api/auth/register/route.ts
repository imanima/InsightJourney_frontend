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
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = USERS.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const newUser = {
      id: `${Date.now()}`,
      name,
      email,
      password, // In a real app, this would be hashed
    }

    // In a real app, you would save this to a database
    USERS.push(newUser)

    // Create a JWT token
    const token = sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      data: {
        user: userWithoutPassword,
        token,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

