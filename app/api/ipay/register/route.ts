import { NextResponse } from "next/server"
import { saveIpayOrder } from "@/lib/ipay-order-store"

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
    const { orderNumber, amount, currency, language } = body ?? {}

    if (!orderNumber || typeof orderNumber !== "string") {
      return NextResponse.json({ error: "orderNumber is required" }, { status: 400 })
    }

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "amount must be a positive number in minor units" }, { status: 400 })
    }

    if (!currency || typeof currency !== "string") {
      return NextResponse.json({ error: "currency is required" }, { status: 400 })
    }

    const url = buildIpayUrl("register.do")
    const returnOrigin = new URL(request.url).origin
    const returnUrl = `${returnOrigin}/checkout/ipay-return?orderNumber=${encodeURIComponent(orderNumber)}`

    const params = new URLSearchParams({
      userName: getEnv("IPAY_USERNAME"),
      password: getEnv("IPAY_PASSWORD"),
      orderNumber,
      amount: Math.round(amount).toString(),
      currency,
      returnUrl,
    })

    if (language && typeof language === "string") {
      params.set("language", language)
    }

    params.set("pageView", "MOBILE")

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: params.toString(),
    })

    const contentType = response.headers.get("content-type") ?? ""
    const data = contentType.includes("application/json") ? await response.json() : await response.text()

    if (!response.ok) {
      return NextResponse.json({ error: "iPay register failed", details: data }, { status: response.status })
    }

    if (typeof data !== "object" || !data?.orderId || !data?.formUrl) {
      return NextResponse.json({ error: "iPay register did not return orderId", details: data }, { status: 502 })
    }

    if (data.orderId) {
      saveIpayOrder(orderNumber, data.orderId)
    }

    return NextResponse.json({ orderId: data.orderId, formUrl: data.formUrl })
  } catch (error) {
    console.error("[ipay] register error", error)
    return NextResponse.json({ error: "Failed to register iPay order", details: String(error) }, { status: 500 })
  }
}
