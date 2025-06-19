import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiClient {
  constructor(private baseURL: string, private token: string | null = null) {}

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  }

  async getCashVoucher(id: string) {
    return this.request(`/cash-vouchers/${id}`);
  }

  async updateCashVoucher(id: string, data: any) {
    return this.request(`/cash-vouchers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCashVoucher(id: string) {
    return this.request(`/cash-vouchers/${id}`, {
      method: "DELETE",
    });
  }
}

const api = new ApiClient(API_BASE_URL);

// ✅ DO NOT manually type the second argument
export async function GET(_request: NextRequest, context: any) {
  const { id } = context.params;

  try {
    const result = await api.getCashVoucher(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch cash voucher" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: any) {
  const { id } = context.params;

  try {
    const body = await request.json();
    const result = await api.updateCashVoucher(id, body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update cash voucher" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: any) {
  const { id } = context.params;

  try {
    const result = await api.deleteCashVoucher(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete cash voucher" },
      { status: 500 }
    );
  }
}
