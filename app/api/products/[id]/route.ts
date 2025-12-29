import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { allProducts } from "@/lib/all-products"

// GET - Fetch single product by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle()

    if (data) {
      return NextResponse.json(data)
    }

    const fallbackProduct = allProducts[id as keyof typeof allProducts]
    if (fallbackProduct) {
      return NextResponse.json(fallbackProduct)
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  } catch (error) {
    console.error("Error fetching product:", error)

    const { id } = await params
    const fallbackProduct = allProducts[id as keyof typeof allProducts]
    if (fallbackProduct) {
      return NextResponse.json(fallbackProduct)
    }

    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
