import { notFound } from "next/navigation"
import ProductPageClient from "@/components/product-page-client"
import { allProducts } from "@/lib/all-products"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"

export const dynamic = "force-dynamic"
export const dynamicParams = true

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

  if (!isSupabaseConfigured()) {
    console.warn("[v0] fetchProduct: Supabase config missing, using fallback data only")
  } else {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle()

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
  
  const fallbackProduct = allProducts[id]
  if (fallbackProduct) {
    console.log("[v0] fetchProduct: Using fallback product:", id)
    return fallbackProduct
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
