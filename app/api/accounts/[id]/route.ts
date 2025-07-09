import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const accounts: any[] = []

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const accountId = Number.parseInt(id)

    if (isNaN(accountId)) {
      return NextResponse.json({ error: "Invalid account ID" }, { status: 400 })
    }

    const body = await request.json()
    const { account_name, account_number, user_id = 1 } = body

    if (!account_name || !account_number) {
      return NextResponse.json({ error: "Account name and number are required" }, { status: 400 })
    }

    const accountIndex = accounts.findIndex((acc) => acc.id === accountId)

    if (accountIndex === -1) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Check if account number already exists for a different account
    const existingAccount = accounts.find((acc) => acc.account_number === account_number && acc.id !== accountId)

    if (existingAccount) {
      return NextResponse.json({ error: "Account number already exists" }, { status: 400 })
    }

    // Update the account
    accounts[accountIndex] = {
      ...accounts[accountIndex],
      account_name,
      account_number,
      user_id,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "Account updated successfully",
      account: accounts[accountIndex],
    })
  } catch (error) {
    console.error("Error in PUT /api/accounts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const accountId = Number.parseInt(id)

    if (isNaN(accountId)) {
      return NextResponse.json({ error: "Invalid account ID" }, { status: 400 })
    }

    const accountIndex = accounts.findIndex((acc) => acc.id === accountId)

    if (accountIndex === -1) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Remove the account
    const deletedAccount = accounts.splice(accountIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
      account: deletedAccount,
    })
  } catch (error) {
    console.error("Error in DELETE /api/accounts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
