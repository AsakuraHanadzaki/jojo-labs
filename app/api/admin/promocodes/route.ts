import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch all promo codes
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching promo codes:", error)
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 })
  }
}

// POST - Create a new promo code
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const code = String(body.code || "").trim()
    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }
    if (!["percentage", "fixed"].includes(body.discount_type)) {
      return NextResponse.json({ error: "Invalid discount type" }, { status: 400 })
    }
    const discountValue = Number(body.discount_value)
    if (!discountValue || discountValue <= 0) {
      return NextResponse.json({ error: "Invalid discount value" }, { status: 400 })
    }
    if (body.discount_type === "percentage" && discountValue > 100) {
      return NextResponse.json({ error: "Percentage cannot exceed 100" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("promo_codes")
      .insert({
        code,
        discount_type: body.discount_type,
        discount_value: discountValue,
        min_order_amount: Number(body.min_order_amount) || 0,
        expires_at: body.expires_at || null,
        max_uses: body.max_uses ? Number(body.max_uses) : null,
        is_active: body.is_active !== false,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "This code already exists" }, { status: 409 })
      }
      // Surface the real Postgres error so failures are diagnosable in production
      console.error("[v0] Promo code insert error:", error)
      const detail =
        error.code === "42P01"
          ? "The promo_codes table does not exist in this database. Run the promo codes migration against this environment's database."
          : error.message || "Failed to create promo code"
      return NextResponse.json({ error: detail, code: error.code }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error creating promo code:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to create promo code" },
      { status: 500 },
    )
  }
}

// PATCH - Toggle active status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { id, is_active } = await request.json()

    const { data, error } = await supabase
      .from("promo_codes")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating promo code:", error)
    return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 })
  }
}

// DELETE - Remove a promo code
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const { error } = await supabase.from("promo_codes").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting promo code:", error)
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 })
  }
}
