import { NextResponse } from "next/server"
import type { RoutineInput, RoutineResult, ProductMap } from "@/lib/routine-algorithm"
import { buildRoutine } from "@/lib/routine-algorithm"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isValidLanguage, type Language } from "@/lib/i18n"

function normalize(input: any): RoutineInput {
  const language = String(input?.language || "en")
  return {
    skinType: String(input?.skinType || ""),
    concerns: String(input?.concerns || ""),
    age: String(input?.age || ""),
    routine: String(input?.routine || "basic"),
    language: isValidLanguage(language) ? language : "en",
  }
}

const getTranslatedText = (
  product: Record<string, unknown>,
  field: "name" | "description" | "how_to_use",
  language: Language,
): string => {
  if (language === "ru") {
    const ruField = `${field}_ru`
    return (product[ruField] as string) || (product[field] as string)
  }
  if (language === "hy") {
    const hyField = `${field}_hy`
    return (product[hyField] as string) || (product[field] as string)
  }
  return product[field] as string
}

const getTranslatedArray = (product: Record<string, unknown>, field: "skin_type", language: Language): string => {
  if (language === "ru") {
    const ruField = `${field}_ru`
    return ((product[ruField] as string[]) || (product[field] as string[]))?.join(", ")
  }
  if (language === "hy") {
    const hyField = `${field}_hy`
    return ((product[hyField] as string[]) || (product[field] as string[]))?.join(", ")
  }
  return ((product[field] as string[]) || []).join(", ")
}

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  if (typeof value === "string") {
    return value
      .split(/[,/]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
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

    console.log(`[v0] Routine request received with language: ${input.language}`)

    let productsMap: ProductMap | undefined
    try {
      const supabase = await getSupabaseServerClient()
      const { data: dbProducts } = await supabase.from("products").select("*").eq("in_stock", true).gt("stock", 0)

      console.log(`[v0] Fetched ${dbProducts?.length || 0} in-stock products from Supabase`)

      if (dbProducts && dbProducts.length > 0) {
        const firstProduct = dbProducts[0]
        console.log(`[v0] Sample raw product from DB:`)
        console.log(`[v0]   - id: ${firstProduct.id}`)
        console.log(`[v0]   - name: ${firstProduct.name}`)
        console.log(`[v0]   - name_ru: ${firstProduct.name_ru}`)
        console.log(`[v0]   - name_hy: ${firstProduct.name_hy}`)
        console.log(`[v0]   - description: ${firstProduct.description?.substring(0, 100)}`)
        console.log(`[v0]   - description_ru: ${firstProduct.description_ru?.substring(0, 100)}`)
        console.log(`[v0]   - description_hy: ${firstProduct.description_hy?.substring(0, 100)}`)

        productsMap = dbProducts.reduce((acc, p) => {
          const translatedName = getTranslatedText(p, "name", input.language || "en")
          const translatedDescription = getTranslatedText(p, "description", input.language || "en")

          if (Object.keys(acc).length === 0) {
            console.log(`[v0] First product translation for language '${input.language}':`)
            console.log(`[v0]   - Product ID: ${p.id}`)
            console.log(`[v0]   - Translated name: ${translatedName}`)
            console.log(`[v0]   - Translated description: ${translatedDescription?.substring(0, 100)}`)
          }

          acc[p.id] = {
            id: p.id,
            name: translatedName,
            category: p.category || p.category_id || "",
            price: p.price,
            image: p.image,
            description: translatedDescription,
            brand: p.brand,
            size: p.size,
            rating: p.rating,
            sub_category: p.sub_category,
            key_ingredients: normalizeStringArray(p.ingredients),
            concerns: normalizeStringArray(p.concerns),
            skin_type: getTranslatedArray(p, "skin_type", input.language || "en"),
          }
          return acc
        }, {} as ProductMap)
      }
    } catch (dbError) {
      console.log("[v0] Using fallback product data for routine")
    }

    const result: RoutineResult = buildRoutine(input, productsMap)

    if (productsMap) {
      result.recommendedProducts = result.recommendedProducts.map((product) => {
        const translated = productsMap?.[product.id]
        if (!translated) return product

        console.log(`[v0] Product ${product.id} translation:`)
        console.log(`[v0]   - Name: ${translated.name}`)
        console.log(`[v0]   - Description: ${translated.description?.substring(0, 100)}`)

        return {
          ...product,
          name: translated.name || product.name,
          description: translated.description || product.description,
        }
      })
    }

    console.log(`[v0] Final recommendedProducts being returned to client:`)
    result.recommendedProducts.slice(0, 2).forEach((p) => {
      console.log(`[v0]   - Product: ${p.name}`)
      console.log(`[v0]   - Description: ${p.description?.substring(0, 100)}`)
    })

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
