import { notFound } from "next/navigation"
import ProductPageClient from "@/components/product-page-client"
import { createClient } from "@/lib/supabase/server"
import { createBrowserClient } from "@supabase/ssr"

export const dynamic = "force-dynamic"
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data: products, error } = await supabase.from("products").select("id")

    if (error || !products) {
      console.error("[v0] generateStaticParams error:", error)
      return []
    }

    return products.map((product) => ({
      id: product.id,
    }))
  } catch (error) {
    console.error("[v0] generateStaticParams exception:", error)
    return []
  }
}

async function fetchProduct(id: string) {
  console.log("[v0] ProductPage: Fetching product with ID:", id)

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle()

    if (error) {
      console.error("[v0] fetchProduct error:", error)
      return null
    }

    console.log("[v0] fetchProduct: Found product:", data?.id)
    return data
  } catch (error) {
    console.error("[v0] fetchProduct exception:", error)
    return null
  }
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
