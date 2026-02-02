import { NextResponse } from "next/server"

const REQUIRED_ENV = ["IPAY_BASE_URL", "IPAY_USERNAME", "IPAY_PASSWORD"] as const

function getEnv(name: (typeof REQUIRED_ENV)[number]) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function buildIpayUrl(path: string) {
  const baseUrl = getEnv("IPAY_BASE_URL")
  const normalized = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  return new URL(path, normalized).toString()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId } = body ?? {}

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    const url = buildIpayUrl("getOrderStatus.do")

    const params = new URLSearchParams({
      userName: getEnv("IPAY_USERNAME"),
      password: getEnv("IPAY_PASSWORD"),
      orderId,
    })

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: params.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: "iPay status failed", details: data }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[ipay] status error", error)
    return NextResponse.json({ error: "Failed to fetch iPay status", details: String(error) }, { status: 500 })
  }
}
