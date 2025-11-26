import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch all orders with items
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST - Create new order and decrease stock
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { order, items } = body

    // Generate order number
    const orderNumber = `JJ-${Date.now().toString(36).toUpperCase()}`

    // Create order
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({ ...order, order_number: orderNumber })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items and decrease stock
    for (const item of items) {
      // Insert order item
      await supabase.from("order_items").insert({
        order_id: newOrder.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      })

      // Decrease product stock
      await supabase.rpc("decrease_product_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })
    }

    return NextResponse.json(newOrder)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

// PATCH - Update order status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { id, ...updates } = body

    const { data, error } = await supabase
      .from("orders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
