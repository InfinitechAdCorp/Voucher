import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "API request failed")
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  async getCashVoucher(id: string) {
    return this.request(`/cash-vouchers/${id}`)
  }

  async updateCashVoucher(id: string, voucherData: any) {
    return this.request(`/cash-vouchers/${id}`, {
      method: "PUT",
      body: JSON.stringify(voucherData),
    })
  }

  async deleteCashVoucher(id: string) {
    return this.request(`/cash-vouchers/${id}`, {
      method: "DELETE",
    })
  }
}

const api = new ApiClient(API_BASE_URL)

// GET - Fetch specific cash voucher
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await api.getCashVoucher(params.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching cash voucher:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch cash voucher" }, { status: 500 })
  }
}

// PUT - Update cash voucher
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const result = await api.updateCashVoucher(params.id, body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating cash voucher:", error)
    return NextResponse.json({ success: false, message: "Failed to update cash voucher" }, { status: 500 })
  }
}

// DELETE - Delete cash voucher
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await api.deleteCashVoucher(params.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting cash voucher:", error)
    return NextResponse.json({ success: false, message: "Failed to delete cash voucher" }, { status: 500 })
  }
}
