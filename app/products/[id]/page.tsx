import { notFound } from "next/navigation"
import ProductPageClient from "@/components/product-page-client"
import { allProducts } from "@/lib/all-products"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"

export const dynamic = "force-dynamic"
export const dynamicParams = true

function getIdVariants(id: string) {
  const decoded = decodeURIComponent(id)
  const normalized = decoded
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return Array.from(new Set([id, decoded, normalized])).filter(Boolean)
}

export async function generateStaticParams() {
  if (!isSupabaseConfigured()) {
    console.warn("[v0] Supabase config missing during static generation, falling back to bundled products")
    return Object.keys(allProducts).map((id) => ({ id }))
  }

  try {
    const supabase = await createClient()

    const { data: products, error } = await supabase.from("products").select("id")

    if (error || !products) {
      console.error("[v0] generateStaticParams error:", error)
      throw error 
    }

    return products.map((product) => ({
      id: product.id,
    }))
  } catch (error) {
    console.error("[v0] generateStaticParams exception, using fallback products:", error)
    return Object.keys(allProducts).map((id) => ({ id }))
  }
}

async function fetchProduct(id: string) {
  console.log("[v0] ProductPage: Fetching product with ID:", id)
const idVariants = getIdVariants(id)
  console.log("[v0] ProductPage: ID variants to try:", idVariants)

  if (!isSupabaseConfigured()) {
    console.warn("[v0] fetchProduct: Supabase config missing, using fallback data only")
  } else {
    try {
      const supabase = await createClient()
       const query = supabase.from("products").select("*")
      const { data, error } =
        idVariants.length === 1
          ? await query.eq("id", idVariants[0]!).maybeSingle()
          : await query.or(idVariants.map((variant) => `id.eq.${variant}`).join(",")).maybeSingle()

      if (error) {
        console.error("[v0] fetchProduct error:", error)
        throw error
      }

      if (data) {
        console.log("[v0] fetchProduct: Found product:", data.id)
        return data
      }

      console.warn("[v0] fetchProduct: Product not found in Supabase, checking fallback data")
    } catch (error) {
      console.error("[v0] fetchProduct exception:", error)
    }

  }
  
  for (const variant of idVariants) {
    const fallbackProduct = allProducts[variant]
    if (fallbackProduct) {
      console.log("[v0] fetchProduct: Using fallback product:", variant)
      return fallbackProduct
    }
  }

  console.error("[v0] fetchProduct: Product not found in Supabase or fallback:", id)
  return null
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  console.log("[v0] ProductPage: Starting to render product page")

  const { id } = await params
  console.log("[v0] ProductPage: Extracted ID from params:", id)

  const product = await fetchProduct(id)

  if (!product) {
    console.log("[v0] ProductPage: Product not found, returning 404")
    notFound()
  }

  console.log("[v0] ProductPage: Successfully loaded product, rendering client component")
  return <ProductPageClient product={product} productId={id} />
}
