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
    return (product[ruField] as string) || (product[field] as string) || ""
  }
  if (language === "hy") {
    const hyField = `${field}_hy`
    return (product[hyField] as string) || (product[field] as string) || ""
  }
  return (product[field] as string) || ""
}

const getTranslatedArray = (product: Record<string, unknown>, field: "skin_type", language: Language): string => {
  const getValue = (key: string): string => {
    const value = product[key]
    if (!value) return ""
    if (Array.isArray(value)) {
      return value.join(", ")
    }
    if (typeof value === "string") {
      return value
    }
    return String(value)
  }

  if (language === "ru") {
    const ruValue = getValue(`${field}_ru`)
    return ruValue || getValue(field)
  }
  if (language === "hy") {
    const hyValue = getValue(`${field}_hy`)
    return hyValue || getValue(field)
  }
  return getValue(field)
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

    console.log(`[v0] ========== ROUTINE API REQUEST ==========`)
    console.log(`[v0] Language requested: ${input.language}`)

    let productsMap: ProductMap | undefined
    let dbProducts: any[] | null = null

    // Step 1: Fetch products from Supabase
    try {
      const supabase = await getSupabaseServerClient()
      const { data, error } = await supabase.from("products").select("*").eq("in_stock", true).gt("stock", 0)

      if (error) {
        console.log(`[v0] Supabase error: ${error.message}`)
      } else {
        dbProducts = data
        console.log(`[v0] Fetched ${dbProducts?.length || 0} in-stock products from Supabase`)
      }
    } catch (fetchError: any) {
      console.log(`[v0] Error fetching products: ${fetchError.message}`)
    }

    // Step 2: Build translated products map if we have data
    if (dbProducts && dbProducts.length > 0) {
      try {
        const firstProduct = dbProducts[0]
        console.log(`[v0] First product translation fields:`)
        console.log(`[v0]   - name: "${firstProduct.name}"`)
        console.log(`[v0]   - name_ru: "${firstProduct.name_ru || "N/A"}"`)
        console.log(`[v0]   - name_hy: "${firstProduct.name_hy || "N/A"}"`)
        console.log(`[v0]   - description_hy exists: ${!!firstProduct.description_hy}`)

        productsMap = {}
        for (const p of dbProducts) {
          const translatedName = getTranslatedText(p, "name", input.language || "en")
          const translatedDescription = getTranslatedText(p, "description", input.language || "en")

          productsMap[p.id] = {
            id: p.id,
            name: translatedName,
            category: p.category || p.category_id || "",
            price: p.price || 0,
            image: p.image || "",
            description: translatedDescription,
            brand: p.brand || "",
            size: p.size || "",
            rating: p.rating || 0,
            sub_category: p.sub_category || "",
            key_ingredients: normalizeStringArray(p.ingredients),
            concerns: normalizeStringArray(p.concerns),
            skin_type: getTranslatedArray(p, "skin_type", input.language || "en"),
          }
        }

        const firstKey = Object.keys(productsMap)[0]
        if (firstKey) {
          console.log(`[v0] After translation to "${input.language}":`)
          console.log(`[v0]   - name: "${productsMap[firstKey].name}"`)
          console.log(`[v0]   - description: "${(productsMap[firstKey].description || "").substring(0, 50)}..."`)
        }

        console.log(`[v0] Successfully built productsMap with ${Object.keys(productsMap).length} translated products`)
      } catch (mapError: any) {
        console.log(`[v0] Error building products map: ${mapError.message}`)
        productsMap = undefined
      }
    }

    if (productsMap && Object.keys(productsMap).length > 0) {
      console.log(`[v0] Using TRANSLATED products map for routine (${Object.keys(productsMap).length} products)`)
    } else {
      console.log(`[v0] Using FALLBACK product data for routine (no translated map available)`)
    }

    const result: RoutineResult = buildRoutine(input, productsMap)

    console.log(`[v0] Recommended products from buildRoutine:`)
    result.recommendedProducts.slice(0, 2).forEach((p) => {
      console.log(`[v0]   - ${p.id}: "${p.name}" - "${(p.description || "").substring(0, 50)}..."`)
    })

    console.log(`[v0] ========== END ROUTINE API ==========`)

    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    console.error("[v0] Error in routine API:", err)
    return NextResponse.json({ error: "Internal server error", detail: String(err?.message || err) }, { status: 500 })
  }
}
