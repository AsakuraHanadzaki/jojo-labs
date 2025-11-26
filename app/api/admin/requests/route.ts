import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch all customer requests
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from("customer_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

// POST - Create new customer request (from contact form)
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { data, error } = await supabase.from("customer_requests").insert(body).select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating request:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}

// PATCH - Update request (admin response)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { id, ...updates } = body

    const { data, error } = await supabase
      .from("customer_requests")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}
