import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user with accounting role
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password, // In production, hash this password
      role: "accounting",
      created_at: new Date().toISOString(),
    }

    users.push(newUser)

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
