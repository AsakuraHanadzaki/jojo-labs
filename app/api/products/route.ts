import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch products (with optional category filter)
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = supabase.from("products").select("*").eq("in_stock", true)

    if (category) {
      query = query.eq("category_id", category)
    }

    const { data, error } = await query.order("name")

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
