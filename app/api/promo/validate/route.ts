import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "missing_code" }, { status: 400 })
    }

    const orderSubtotal = Number(subtotal) || 0
    const supabase = await getSupabaseServerClient()

    const { data: promo, error } = await supabase
      .from("promo_codes")
      .select("*")
      .ilike("code", code.trim())
      .maybeSingle()

    if (error || !promo) {
      return NextResponse.json({ valid: false, error: "not_found" })
    }

    if (!promo.is_active) {
      return NextResponse.json({ valid: false, error: "inactive" })
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "expired" })
    }

    if (promo.max_uses != null && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ valid: false, error: "usage_limit_reached" })
    }

    if (promo.min_order_amount && orderSubtotal < Number(promo.min_order_amount)) {
      return NextResponse.json({
        valid: false,
        error: "min_order_not_met",
        minOrderAmount: Number(promo.min_order_amount),
      })
    }

    // Calculate discount
    let discount = 0
    if (promo.discount_type === "percentage") {
      discount = Math.round((orderSubtotal * Number(promo.discount_value)) / 100)
    } else {
      discount = Number(promo.discount_value)
    }

    // Never discount more than the subtotal
    discount = Math.min(discount, orderSubtotal)

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountType: promo.discount_type,
      discountValue: Number(promo.discount_value),
      discountAmount: discount,
    })
  } catch (err) {
    console.log("[v0] Promo validation error:", err)
    return NextResponse.json({ valid: false, error: "server_error" }, { status: 500 })
  }
}
