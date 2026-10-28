import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { verifySignedValue, verifySessionPayload } from "@/lib/admin/auth"

async function requireAdminSession() {
  const store = await cookies()
  const signedCookie = store.get("admin_session")?.value

  if (!signedCookie) {
    throw new Error("Unauthorized")
  }

  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_LOGIN_SECRET
  if (!secret) {
    throw new Error("Unauthorized")
  }

  const value = verifySignedValue(signedCookie, secret)
  if (!value || !verifySessionPayload(value)) {
    throw new Error("Unauthorized")
  }

  return getSupabaseServerClient()
}

export async function GET() {
  try {
    const supabase = await requireAdminSession()

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, name_ru, name_hy, description, description_ru, description_hy, price, category, stock, low_stock_threshold, in_stock, image, rating, reviews, eco, benefits, how_to_use, ingredients, concerns, created_at, updated_at",
      )
      .order("name")

    if (error) throw error

    return NextResponse.json({ products: data || [] })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await requireAdminSession()
    const body = await request.json()

    const updates: Record<string, unknown> = {}

    if (body.stock !== undefined) updates.stock = Number(body.stock)
    if (body.price !== undefined) updates.price = String(body.price)
    if (body.image !== undefined) updates.image = String(body.image)
    if (body.in_stock !== undefined) updates.in_stock = Boolean(body.in_stock)

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields supplied" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", body.id)
      .select(
        "id, name, name_ru, name_hy, description, description_ru, description_hy, price, category, stock, low_stock_threshold, in_stock, image, rating, reviews, eco, benefits, how_to_use, ingredients, concerns, created_at, updated_at",
      )
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
