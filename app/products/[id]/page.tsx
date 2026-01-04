import { notFound } from "next/navigation"
import ProductPageClient from "@/components/product-page-client"
import { createClient } from "@/lib/supabase/server"
import { createBrowserClient } from "@supabase/ssr"
import { allProducts } from "@/lib/all-products"

export const dynamic = "force-dynamic"
export const dynamicParams = true
export const revalidate = 60

export async function generateStaticParams() {
  try {
    const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    if (!hasSupabaseEnv) {
      return Object.keys(allProducts).map((id) => ({ id }))
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data: products, error } = await supabase.from("products").select("id")

    if (error || !products) {
      console.error("[v0] generateStaticParams error:", error)
      return Object.keys(allProducts).map((id) => ({ id }))
    }

    return products.map((p) => ({ id: p.id }))
  } catch (error) {
    console.error("[v0] generateStaticParams exception:", error)
    return Object.keys(allProducts).map((id) => ({ id }))
  }
}

async function fetchProduct(id: string) {
  console.log("[v0] fetchProduct: Fetching product with id:", id)

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
      console.log("[v0] fetchProduct: Found product in Supabase:", data.id)
      return data
    }

    console.log("[v0] fetchProduct: Product not found in Supabase, checking hardcoded")
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
  console.log("[v0] ProductPage: Rendering page for id:", id)

  const product = await fetchProduct(id)

  if (!product) {
    console.log("[v0] ProductPage: Product not found, returning 404")
    notFound()
  }

  console.log("[v0] ProductPage: Successfully loaded product:", product.id)
  return <ProductPageClient product={product} productId={id} />
}
