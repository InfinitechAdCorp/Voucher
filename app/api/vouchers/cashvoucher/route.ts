import { type NextRequest, NextResponse } from "next/server"
import api from "@/lib/api"

// GET - Fetch cash vouchers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      status: searchParams.get("status") || undefined,
      start_date: searchParams.get("start_date") || undefined,
      end_date: searchParams.get("end_date") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : undefined,
      per_page: searchParams.get("per_page") ? Number.parseInt(searchParams.get("per_page")!) : undefined,
    }

    const result = await api.getCashVouchers(params)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching cash vouchers:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch cash vouchers" }, { status: 500 })
  }
}

// POST - Create new cash voucher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await api.createCashVoucher(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating cash voucher:", error)
    return NextResponse.json({ success: false, message: "Failed to create cash voucher" }, { status: 500 })
  }
}
