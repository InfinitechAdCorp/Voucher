import { type NextRequest, NextResponse } from "next/server"
import api from "@/lib/api"

// GET - Fetch vouchers (legacy endpoint)
export async function GET(request: NextRequest) {
  try {
    const result = await api.getCashVouchers()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching vouchers:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch vouchers" }, { status: 500 })
  }
}

// POST - Create new voucher (legacy endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await api.createCashVoucher(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating voucher:", error)
    return NextResponse.json({ success: false, message: "Failed to create voucher" }, { status: 500 })
  }
}
