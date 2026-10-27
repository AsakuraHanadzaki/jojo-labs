import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

async function requireAdminSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  if (session?.value !== "authenticated") {
    throw new Error("Unauthorized")
  }

  return getSupabaseServerClient()
}

export async function GET() {
  try {
    const supabase = await requireAdminSession()

    const [products, orders, requests, ratings, blogs] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
      supabase.from("customer_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("product_ratings").select("*").order("created_at", { ascending: false }),
      supabase.from("blogs").select("*").order("created_at", { ascending: false }),
    ])

    return NextResponse.json({
      products: products.data || [],
      orders: orders.data || [],
      requests: requests.data || [],
      ratings: ratings.data || [],
      blogs: blogs.data || [],
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await requireAdminSession()
    const body = await request.json()

    switch (body.action) {
      case "update-stock": {
        const { error } = await supabase
          .from("products")
          .update({ stock: body.newStock, in_stock: body.newStock > 0 })
          .eq("id", body.productId)

        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case "update-price": {
        const { error } = await supabase
          .from("products")
          .update({ price: body.newPrice })
          .eq("id", body.productId)

        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case "add-product": {
        const { error } = await supabase.from("products").insert(body.product)
        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case "delete-product": {
        const { error } = await supabase.from("products").delete().eq("id", body.productId)
        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case "update-order-status": {
        const { error } = await supabase
          .from("orders")
          .update({ status: body.status, updated_at: new Date().toISOString() })
          .eq("id", body.orderId)

        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case "update-order-tracking": {
        const { error } = await supabase
          .from("orders")
          .update({
            tracking_number: body.trackingNumber,
            carrier: body.carrier,
            status: "shipped",
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.orderId)

        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case "respond-request": {
        const { error } = await supabase
          .from("customer_requests")
          .update({
            admin_response: body.response,
            status: "resolved",
            responded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.requestId)

        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case "moderate-rating": {
        const { error } = await supabase
          .from("product_ratings")
          .update({
            moderation_status: body.status,
            moderation_notes: body.notes,
            moderated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.ratingId)

        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case "toggle-blog-publish": {
        const { error } = await supabase
          .from("blogs")
          .update({
            published: !body.currentStatus,
            published_at: !body.currentStatus ? new Date().toISOString() : null,
          })
          .eq("id", body.blogId)

        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case "delete-blog": {
        const { error } = await supabase.from("blogs").delete().eq("id", body.blogId)
        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
