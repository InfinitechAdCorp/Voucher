import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const accounts: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { account_name, account_number, user_id } = await request.json()

    // Validate input
    if (!account_name || !account_number || !user_id) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if account number already exists for this user
    const existingAccount = accounts.find((acc) => acc.account_number === account_number && acc.user_id === user_id)

    if (existingAccount) {
      return NextResponse.json({ error: "Account number already exists" }, { status: 400 })
    }

    // Create new account
    const newAccount = {
      id: accounts.length + 1,
      account_name,
      account_number,
      user_id,
      created_at: new Date().toISOString(),
    }

    accounts.push(newAccount)

    return NextResponse.json({ message: "Account created successfully", account: newAccount }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
