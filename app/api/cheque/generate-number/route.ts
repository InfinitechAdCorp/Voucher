import { NextRequest, NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/cheque-vouchers/generate-number`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: request.headers.get("authorization") || "",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to generate cheque number" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Generate cheque number error:", error)
    return NextResponse.json(
      { error: "Failed to connect to Laravel API" },
      { status: 500 }
    )
  }
}
