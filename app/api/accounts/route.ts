import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const accounts: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    // If user_id is provided, filter by user_id, otherwise return all accounts
    let userAccounts = accounts
    if (user_id) {
      userAccounts = accounts.filter((acc) => acc.user_id === Number.parseInt(user_id))
    }

    return NextResponse.json({
      success: true,
      accounts: userAccounts,
    })
  } catch (error) {
    console.error("Error in GET /api/accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { account_name, account_number, user_id = 1 } = body

    if (!account_name || !account_number) {
      return NextResponse.json({ error: "Account name and number are required" }, { status: 400 })
    }

    // Check if account number already exists
    const existingAccount = accounts.find((acc) => acc.account_number === account_number)
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

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        account: newAccount,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in POST /api/accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
