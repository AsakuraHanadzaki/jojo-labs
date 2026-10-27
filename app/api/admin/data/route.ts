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

    const [products, orders, requests, ratings, blogs] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id, name, name_ru, name_hy, description, description_ru, description_hy, price, category, stock, low_stock_threshold, in_stock, image, rating, reviews, eco, benefits, how_to_use, ingredients, concerns, created_at, updated_at",
        )
        .order("name"),
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
          .update({ stock: Number(body.newStock), in_stock: Number(body.newStock) > 0 })
          .eq("id", body.productId)

        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case "update-price": {
        const { error } = await supabase
          .from("products")
          .update({ price: String(body.newPrice) })
          .eq("id", body.productId)

        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case "add-product": {
        if (!body.product || !body.product.name || !body.product.price) {
          return NextResponse.json({ error: "Name and price required" }, { status: 400 })
        }

        const { error } = await supabase.from("products").insert({
          ...body.product,
          price: String(body.product.price),
          stock: Number(body.product.stock ?? 0),
          low_stock_threshold: Number(body.product.low_stock_threshold ?? 10),
          in_stock: Number(body.product.stock ?? 0) > 0,
        })

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
