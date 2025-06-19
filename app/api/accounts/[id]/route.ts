import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const accounts: any[] = []

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const accountId = Number.parseInt(id)
    const body = await request.json()
    const { account_name, account_number, user_id } = body

    if (!account_name || !account_number || !user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const accountIndex = accounts.findIndex((acc) => acc.id === accountId && acc.user_id === user_id)

    if (accountIndex === -1) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Check if account number already exists for this user (excluding current account)
    const existingAccount = accounts.find(
      (acc) => acc.account_number === account_number && acc.user_id === user_id && acc.id !== accountId,
    )

    if (existingAccount) {
      return NextResponse.json({ error: "Account number already exists" }, { status: 400 })
    }

    // Update the account
    accounts[accountIndex] = {
      ...accounts[accountIndex],
      account_name,
      account_number,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      account: accounts[accountIndex],
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const accountId = Number.parseInt(id)
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const accountIndex = accounts.findIndex((acc) => acc.id === accountId && acc.user_id === Number.parseInt(user_id))

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}