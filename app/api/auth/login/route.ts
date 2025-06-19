import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const users: any[] = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@abicrealty.com",
    password: "password123",
    role: "accounting",
    created_at: new Date().toISOString(),
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user has accounting role
    if (user.role !== "accounting") {
      return NextResponse.json({ error: "Access denied. Accounting role required." }, { status: 403 })
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
