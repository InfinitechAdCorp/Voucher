import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  removeToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    // Add existing headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value
        })
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value
        })
      } else {
        Object.assign(headers, options.headers)
      }
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

  // Cash Voucher methods
  async createCashVoucher(voucherData: any) {
    return this.request("/cash-vouchers", {
      method: "POST",
      body: JSON.stringify(voucherData),
    })
  }

  async getCashVouchers(params?: {
    status?: string
    start_date?: string
    end_date?: string
    search?: string
    page?: number
    per_page?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/cash-vouchers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return this.request(endpoint)
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

  async generateVoucherNumber() {
    return this.request("/cash-vouchers/generate-number", {
      method: "POST",
    })
  }

  async approveCashVoucher(
    id: string,
    approvalData: {
      approved_name: string
      approved_date?: string
      approved_signature?: string
    },
  ) {
    return this.request(`/cash-vouchers/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(approvalData),
    })
  }

  async markCashVoucherAsPaid(id: string) {
    return this.request(`/cash-vouchers/${id}/mark-as-paid`, {
      method: "POST",
    })
  }
}

const api = new ApiClient(API_BASE_URL)

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
