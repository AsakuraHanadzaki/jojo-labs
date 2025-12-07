import { NextResponse } from "next/server"
import type { RoutineInput, RoutineResult, ProductMap } from "@/lib/routine-algorithm"
import { buildRoutine } from "@/lib/routine-algorithm"
import { getSupabaseServerClient } from "@/lib/supabase/server"

function normalize(input: any): RoutineInput {
  return {
    skinType: String(input?.skinType || ""),
    concerns: String(input?.concerns || ""),
    age: String(input?.age || ""),
    routine: String(input?.routine || "basic"),
  }
}

export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type") || ""
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 })
    }

    const body = await req.json()
    const input = normalize(body)

    if (!input.skinType || !input.concerns || !input.age || !input.routine) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let productsMap: ProductMap | undefined
    try {
      const supabase = await getSupabaseServerClient()
      const { data: dbProducts } = await supabase.from("products").select("*").eq("in_stock", true).gt("stock", 0)

      if (dbProducts && dbProducts.length > 0) {
        productsMap = dbProducts.reduce((acc, p) => {
          acc[p.id] = {
            id: p.id,
            name: p.name,
            category: p.category || p.category_id || "",
            price: p.price,
            image: p.image,
            description: p.description,
            brand: p.brand,
            size: p.size,
            rating: p.rating,
            sub_category: p.sub_category,
            key_ingredients: p.ingredients || [], // Use ingredients array as key_ingredients
            concerns: p.concerns || [],
            skin_type: p.skin_type || "",
          }
          return acc
        }, {} as ProductMap)
      }
    } catch (dbError) {
      console.error("Database error, falling back to hardcoded products:", dbError)
      // Will use hardcoded products as fallback
    }

    const result: RoutineResult = buildRoutine(input, productsMap)
    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error", detail: String(err?.message || err) }, { status: 500 })
  }
}
