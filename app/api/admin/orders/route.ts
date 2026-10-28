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
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_email, status, total_price, tracking_number, carrier, created_at, updated_at, order_items(*)",
      )
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ orders: data || [] })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await requireAdminSession()
    const body = await request.json()

    const { order, items } = body

    if (!order || !items) {
      return NextResponse.json({ error: "Missing order payload" }, { status: 400 })
    }

    const orderNumber = `JJ-${Date.now().toString(36).toUpperCase()}`

    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        ...order,
        order_number: orderNumber,
        updated_at: new Date().toISOString(),
      })
      .select(
        "id, order_number, customer_name, customer_email, status, total_price, tracking_number, carrier, created_at, updated_at",
      )
      .single()

    if (orderError) throw orderError

    for (const item of items) {
      await supabase.from("order_items").insert({
        order_id: newOrder.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      })
    }

    return NextResponse.json({ order: newOrder })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await requireAdminSession()
    const body = await request.json()

    const { id, ...updates } = body
    const { error } = await supabase
      .from("orders")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
