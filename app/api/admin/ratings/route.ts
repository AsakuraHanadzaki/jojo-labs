import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch all product ratings
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase.from("product_ratings").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching ratings:", error)
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 })
  }
}

// POST - Create new rating (from product page)
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { data, error } = await supabase.from("product_ratings").insert(body).select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating rating:", error)
    return NextResponse.json({ error: "Failed to create rating" }, { status: 500 })
  }
}

// PATCH - Moderate rating
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { id, moderation_status, moderation_notes } = body

    const { data, error } = await supabase
      .from("product_ratings")
      .update({
        moderation_status,
        moderation_notes,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error moderating rating:", error)
    return NextResponse.json({ error: "Failed to moderate rating" }, { status: 500 })
  }
}
