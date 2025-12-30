import { notFound } from "next/navigation"
import ProductPageClient from "@/components/product-page-client"
import { createClient } from "@/lib/supabase/server"
import { allProducts } from "@/lib/all-products"
import { createClient as createBrowserClient } from "@/lib/supabase/client"

export const dynamic = "force-dynamic"
export const dynamicParams = true
export const revalidate = 60 // Revalidate every 60 seconds

export async function generateStaticParams() {
  try {
    console.log("[v0] generateStaticParams: Starting...")
    const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    if (hasSupabaseEnv) {
      console.log("[v0] generateStaticParams: Fetching products from Supabase...")
      const supabase = createBrowserClient()
      const { data: products, error } = await supabase.from("products").select("id")

      if (error) {
        console.error("[v0] generateStaticParams error:", error)
      }

      if (products && products.length > 0) {
        console.log(`[v0] generateStaticParams: Found ${products.length} products`)
        console.log("[v0] Product IDs:", products.map((p) => p.id).join(", "))
        return products.map((product) => ({
          id: product.id,
        }))
      }
    } else {
      console.warn("[v0] generateStaticParams: Supabase env vars not found")
    }
  } catch (error) {
    console.error("[v0] generateStaticParams exception:", error)
  }

  console.log("[v0] generateStaticParams: Using fallback products")
  return Object.values(allProducts).map((product) => ({
    id: product.id,
  }))
}

async function fetchProduct(id: string) {
  console.log(`[v0] fetchProduct: Fetching product with id: ${id}`)
  try {
    const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    if (!hasSupabaseEnv) {
      console.log("[v0] fetchProduct: No Supabase env, using hardcoded products")
      const hardcodedProduct = Object.values(allProducts).find((p) => p.id === id)
      return hardcodedProduct || null
    }

    const supabase = await createClient()

    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle()

    if (error) {
      console.error("[v0] fetchProduct Supabase error:", error)
    }

    if (data) {
      console.log(`[v0] fetchProduct: Found product in Supabase: ${data.id}`)
      return data
    }

    console.log("[v0] fetchProduct: Product not found in Supabase, checking hardcoded")
    // Fallback to hardcoded products
    const hardcodedProduct = Object.values(allProducts).find((p) => p.id === id)
    return hardcodedProduct || null
  } catch (error) {
    console.error("[v0] fetchProduct exception:", error)
    const hardcodedProduct = Object.values(allProducts).find((p) => p.id === id)
    return hardcodedProduct || null
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log(`[v0] ProductPage: Rendering page for id: ${id}`)
  const product = await fetchProduct(id)

  if (!product) {
    console.log(`[v0] ProductPage: Product not found for id: ${id}`)
    notFound()
  }

  console.log(`[v0] ProductPage: Successfully loaded product: ${product.id}`)
  return <ProductPageClient product={product} productId={id} />
}
