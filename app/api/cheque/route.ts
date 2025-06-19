import { NextRequest, NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

async function makeRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${LARAVEL_API_URL}${endpoint}`
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  // Forward authorization header if present
  const authHeader = options.headers && 'authorization' in options.headers 
    ? (options.headers as any).authorization 
    : null
  
  if (authHeader) {
    headers.Authorization = authHeader
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Laravel API request failed" },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Laravel API Error:", error)
    return NextResponse.json(
      { error: "Failed to connect to Laravel API" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  const endpoint = id ? `/cheque-vouchers/${id}` : "/cheque-vouchers"
  
  return makeRequest(endpoint, {
    method: "GET",
    headers: {
      authorization: request.headers.get("authorization") || "",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return makeRequest("/cheque-vouchers", {
      method: "POST",
      headers: {
        authorization: request.headers.get("authorization") || "",
      },
      body: JSON.stringify(body),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "Cheque voucher ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    return makeRequest(`/cheque-vouchers/${id}`, {
      method: "PUT",
      headers: {
        authorization: request.headers.get("authorization") || "",
      },
      body: JSON.stringify(body),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json(
      { error: "Cheque voucher ID is required" },
      { status: 400 }
    )
  }
  
  return makeRequest(`/cheque-vouchers/${id}`, {
    method: "DELETE",
    headers: {
      authorization: request.headers.get("authorization") || "",
    },
  })
}
