import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const accounts: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Filter accounts by user_id to ensure data isolation
    const userAccounts = accounts.filter((acc) => acc.user_id === Number.parseInt(user_id))

    return NextResponse.json({
      accounts: userAccounts,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { account_name, account_number, user_id } = body

    if (!account_name || !account_number || !user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if account number already exists for this user
    const existingAccount = accounts.find(
      (acc) => acc.account_number === account_number && acc.user_id === user_id
    )

    if (existingAccount) {
      return NextResponse.json({ error: "Account number already exists" }, { status: 400 })
    }

    const newAccount = {
      id: accounts.length + 1,
      account_name,
      account_number,
      user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    accounts.push(newAccount)

    return NextResponse.json({
      success: true,
      account: newAccount,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
