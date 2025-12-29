import { notFound } from "next/navigation"
import ProductPageClient from "@/components/product-page-client"
import { createClient } from "@/lib/supabase/server"
import { allProducts } from "@/lib/all-products"
import { createClient as createBrowserClient } from "@/lib/supabase/client"

export async function generateStaticParams() {
  try {
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

export const dynamicParams = true

async function fetchProduct(id: string) {
  try {
    const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    if (!hasSupabaseEnv) {
      const hardcodedProduct = Object.values(allProducts).find((p) => p.id === id)
      return hardcodedProduct || null
    }

    const supabase = await createClient()

    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle()

    if (error) {
      console.error("Supabase error:", error)
    }

    if (data) {
      return data
    }

    // Fallback to hardcoded products
    const hardcodedProduct = Object.values(allProducts).find((p) => p.id === id)
    return hardcodedProduct || null
  } catch (error) {
    console.error("Error fetching product:", error)
    const hardcodedProduct = Object.values(allProducts).find((p) => p.id === id)
    return hardcodedProduct || null
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params
  const product = await fetchProduct(id)

  if (!product) {
    notFound()
  }

  return <ProductPageClient product={product} productId={id} />
}
