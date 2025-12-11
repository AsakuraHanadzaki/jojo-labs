import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch products (with optional category filter)
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Products API: Starting fetch")
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    console.log("[v0] Products API: Category filter =", category)

    let query = supabase.from("products").select("*").eq("in_stock", true)

    if (category) {
      query = query.eq("category_id", category)
    }

    const { data, error } = await query.order("name")

    if (error) {
      console.error("[v0] Products API: Supabase error", error)
      throw error
    }

    console.log("[v0] Products API: Successfully fetched", data?.length, "products")
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Products API: Fatal error", error)
    return NextResponse.json({ error: "Failed to fetch products", details: String(error) }, { status: 500 })
  }
}
