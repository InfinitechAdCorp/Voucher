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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // HTTP Methods
  async get(endpoint: string) {
    return this.request(endpoint, { method: "GET" })
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" })
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

  async updateAccount(id: number, accountName: string, accountNumber: string) {
    return this.request(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        account_name: accountName,
        account_number: accountNumber,
      }),
    })
  }

  async deleteAccount(id: number) {
    return this.request(`/accounts/${id}`, {
      method: "DELETE",
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

  async cancelCashVoucher(id: string) {
    return this.request(`/cash-vouchers/${id}`, {
      method: "DELETE",
    })
  }

  async deleteCashVoucher(id: string) {
    return this.cancelCashVoucher(id)
  }

  async getNextCashVoucherNumber() {
    return this.request("/cash-vouchers/next-number")
  }

  // Cheque Voucher methods
  async createChequeVoucher(chequeVoucherData: any) {
    return this.request("/cheque-vouchers", {
      method: "POST",
      body: JSON.stringify(chequeVoucherData),
    })
  }

  async getChequeVouchers(params?: {
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

    const endpoint = `/cheque-vouchers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return this.request(endpoint)
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

  async getNextChequeVoucherNumber() {
    return this.request("/cheque-vouchers/next-number")
  }

  // Dashboard Statistics - New methods for getting totals
  async getDashboardStats() {
    try {
      // Get all cash vouchers
      const cashResponse = await this.getCashVouchers()
      // Get all cheque vouchers  
      const chequeResponse = await this.getChequeVouchers()

      console.log("Cash Response:", cashResponse)
      console.log("Cheque Response:", chequeResponse)

      // Handle different response structures from Laravel
      let cashVouchers = []
      let chequeVouchers = []

      // Handle cash vouchers response
      if (cashResponse) {
        if (cashResponse.data) {
          cashVouchers = Array.isArray(cashResponse.data) ? cashResponse.data : 
                        (cashResponse.data.data ? cashResponse.data.data : [])
        } else if (Array.isArray(cashResponse)) {
          cashVouchers = cashResponse
        }
      }

      // Handle cheque vouchers response
      if (chequeResponse) {
        if (chequeResponse.data) {
          chequeVouchers = Array.isArray(chequeResponse.data) ? chequeResponse.data : 
                          (chequeResponse.data.data ? chequeResponse.data.data : [])
        } else if (Array.isArray(chequeResponse)) {
          chequeVouchers = chequeResponse
        }
      }

      console.log("Processed Cash Vouchers:", cashVouchers)
      console.log("Processed Cheque Vouchers:", chequeVouchers)

      // Calculate totals from amount field
      const totalCashAmount = cashVouchers.reduce((sum: number, voucher: any) => {
        const amount = parseFloat(voucher.amount) || 0
        return sum + amount
      }, 0)

      const totalChequeAmount = chequeVouchers.reduce((sum: number, voucher: any) => {
        const amount = parseFloat(voucher.amount) || 0
        return sum + amount
      }, 0)

      return {
        success: true,
        data: {
          totalCashVouchers: cashVouchers.length,
          totalChequeVouchers: chequeVouchers.length,
          totalCashAmount: totalCashAmount,
          totalChequeAmount: totalChequeAmount,
          totalAmount: totalCashAmount + totalChequeAmount,
          cashVouchers: cashVouchers.slice(0, 5), // Recent 5
          chequeVouchers: chequeVouchers.slice(0, 5), // Recent 5
        }
      }
    } catch (error) {
      console.error("Error getting dashboard stats:", error)
      throw error
    }
  }
}

const api = new ApiClient(API_BASE_URL)
export default api
