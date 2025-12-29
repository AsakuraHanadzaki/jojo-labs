import { NextResponse } from "next/server"
import { validateStock } from "@/lib/products-service"

export async function POST(request: Request) {
  try {
    console.log("[v0] Validate Stock API: Starting")
    const body = await request.json()
    console.log("[v0] Validate Stock API: Request body", body)

    const { productId, quantity } = body

    if (!productId || !quantity) {
      console.log("[v0] Validate Stock API: Missing parameters")
      return NextResponse.json({ error: "Product ID and quantity are required" }, { status: 400 })
    }

    const validation = await validateStock(productId, quantity)
    console.log("[v0] Validate Stock API: Validation result", validation)

    return NextResponse.json(validation)
  } catch (error) {
    console.error("[v0] Validate Stock API: Error", error)
    return NextResponse.json({ error: "Failed to validate stock", details: String(error) }, { status: 500 })
  }
}
