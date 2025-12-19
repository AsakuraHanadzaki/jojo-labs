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

      console.log(`[v0] Fetched ${dbProducts?.length || 0} in-stock products from Supabase`)

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
            key_ingredients: p.ingredients || [],
            concerns: p.concerns || [],
            skin_type: p.skin_type || "",
          }
          return acc
        }, {} as ProductMap)

        const sampleId = Object.keys(productsMap)[0]
        if (sampleId) {
          const sample = productsMap[sampleId]
          console.log(`[v0] Sample product data:`)
          console.log(`[v0]   - ID: ${sample.id}`)
          console.log(`[v0]   - Name: ${sample.name}`)
          console.log(`[v0]   - Category: ${sample.category}`)
          console.log(`[v0]   - Sub-category: ${sample.sub_category}`)
          console.log(`[v0]   - Concerns: ${sample.concerns?.join(", ")}`)
          console.log(`[v0]   - Skin type: ${sample.skin_type}`)
          console.log(`[v0]   - Key ingredients: ${sample.key_ingredients?.slice(0, 3).join(", ")}`)
        }
      }
    } catch (dbError) {
      console.log("[v0] Using fallback product data for routine")
    }

    const result: RoutineResult = buildRoutine(input, productsMap)

    console.log(`[v0] Routine generated successfully:`)
    console.log(`[v0]   - AM steps: ${result.AM.length}`)
    console.log(`[v0]   - PM steps: ${result.PM.length}`)
    console.log(`[v0]   - Recommended products: ${result.recommendedProducts.length}`)

    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    console.error("[v0] Error in routine API:", err)
    return NextResponse.json({ error: "Internal server error", detail: String(err?.message || err) }, { status: 500 })
  }
}
