import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Check if user has already rated a product for a specific order
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")
    const productId = searchParams.get("productId")

    if (!orderId || !productId) {
      return NextResponse.json({ error: "Missing orderId or productId" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("product_ratings")
      .select("*")
      .eq("order_id", orderId)
      .eq("product_id", productId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return NextResponse.json({ rating: data || null })
  } catch (error) {
    console.error("Error checking rating:", error)
    return NextResponse.json({ error: "Failed to check rating" }, { status: 500 })
  }
}

// POST - Submit a new product rating
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { product_id, order_id, rating, review, title, reviewer_name, reviewer_email } = body

    // Validate required fields
    if (!product_id || !order_id || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the order exists and is delivered
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, customer_email")
      .eq("id", order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "delivered") {
      return NextResponse.json({ error: "Can only rate delivered orders" }, { status: 400 })
    }

    // Check if already rated
    const { data: existingRating } = await supabase
      .from("product_ratings")
      .select("id")
      .eq("order_id", order_id)
      .eq("product_id", product_id)
      .single()

    if (existingRating) {
      return NextResponse.json({ error: "You have already rated this product for this order" }, { status: 400 })
    }

    // Create the rating
    const { data, error } = await supabase
      .from("product_ratings")
      .insert({
        product_id,
        order_id,
        rating,
        review: review || null,
        title: title || null,
        reviewer_name: reviewer_name || "Anonymous",
        reviewer_email: reviewer_email || order.customer_email,
        verified_purchase: true,
        moderation_status: "pending",
        helpful_count: 0,
      })
      .select()
      .single()

    if (error) throw error

    // Update product average rating
    await updateProductRating(supabase, product_id)

    return NextResponse.json({ success: true, rating: data })
  } catch (error) {
    console.error("Error creating rating:", error)
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 })
  }
}

async function updateProductRating(supabase: any, productId: string) {
  // Get all approved ratings for this product
  const { data: ratings } = await supabase
    .from("product_ratings")
    .select("rating")
    .eq("product_id", productId)
    .eq("moderation_status", "approved")

  if (ratings && ratings.length > 0) {
    const avgRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
    
    await supabase
      .from("products")
      .update({ 
        rating: Math.round(avgRating * 10) / 10,
        reviews: ratings.length 
      })
      .eq("id", productId)
  }
}
