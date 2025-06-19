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

  // Auth methods
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(name: string, email: string, password: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  // Account methods
  async getAccounts() {
    return this.request("/accounts")
  }

  async createAccount(accountName: string, accountNumber: string) {
    return this.request("/accounts", {
      method: "POST",
      body: JSON.stringify({
        account_name: accountName,
        account_number: accountNumber,
      }),
    })
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

  // Changed method name to be more descriptive - this now cancels instead of deletes
  async cancelCashVoucher(id: string) {
    return this.request(`/cash-vouchers/${id}`, {
      method: "DELETE", // Still uses DELETE method but cancels instead
    })
  }

  // Alternative method using the dedicated cancel endpoint
  async cancelCashVoucherAlt(id: string) {
    return this.request(`/cash-vouchers/${id}/cancel`, {
      method: "POST",
    })
  }

  // Keep the old method name for backward compatibility
  async deleteCashVoucher(id: string) {
    return this.cancelCashVoucher(id)
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

  async getNextCashVoucherNumber() {
    return this.request("/cash-vouchers/next-number")
  }

  // Legacy Voucher methods (for backward compatibility)
  async createVoucher(voucherData: any) {
    return this.createCashVoucher(voucherData)
  }

  async getVouchers() {
    return this.getCashVouchers()
  }

  // Cheque Voucher methods
  async createChequeVoucher(chequeVoucherData: any) {
    return this.request("/cheque-vouchers", {
      method: "POST",
      body: JSON.stringify(chequeVoucherData),
    })
  }

  async getChequeVouchers() {
    return this.request("/cheque-vouchers")
  }

  async getChequeVoucher(id: string) {
    return this.request(`/cheque-vouchers/${id}`)
  }

  async updateChequeVoucher(id: string, chequeVoucherData: any) {
    return this.request(`/cheque-vouchers/${id}`, {
      method: "PUT",
      body: JSON.stringify(chequeVoucherData),
    })
  }

  async deleteChequeVoucher(id: string) {
    return this.request(`/cheque-vouchers/${id}`, {
      method: "DELETE",
    })
  }

  async generateChequeNumber() {
    return this.request("/cheque-vouchers/generate-number", {
      method: "POST",
    })
  }

  async getNextChequeVoucherNumber() {
    return this.request("/cheque-vouchers/next-number")
  }
}

const api = new ApiClient(API_BASE_URL)
export default api
