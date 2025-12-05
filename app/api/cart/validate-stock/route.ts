import { NextResponse } from "next/server"
import { validateStock } from "@/lib/products-service"

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json()

    if (!productId || !quantity) {
      return NextResponse.json({ error: "Product ID and quantity are required" }, { status: 400 })
    }

    const validation = await validateStock(productId, quantity)

    return NextResponse.json(validation)
  } catch (error) {
    console.error("Error validating stock:", error)
    return NextResponse.json({ error: "Failed to validate stock" }, { status: 500 })
  }
}
