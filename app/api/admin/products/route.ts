import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch all products
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase.from("products").select("*").order("name")

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// PATCH - Update product stock
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { id, stock } = body

    const { data, error } = await supabase
      .from("products")
      .update({
        stock,
        in_stock: stock > 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
