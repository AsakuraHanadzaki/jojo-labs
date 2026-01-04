import { notFound } from "next/navigation"
import ProductPageClient from "@/components/product-page-client"
import { createClient } from "@/lib/supabase/server"
import { createBrowserClient } from "@supabase/ssr"

export const dynamic = "force-dynamic"
export const dynamicParams = true

export async function generateStaticParams() {
  console.log("[v0] generateStaticParams: Fetching all product IDs for static generation")

  try {
    // Use browser client for build-time access
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data: products, error } = await supabase.from("products").select("id")

    if (error) {
      console.error("[v0] generateStaticParams error:", error)
      return []
    }

    console.log("[v0] generateStaticParams: Found", products?.length || 0, "products")
    return (
      products?.map((product) => ({
        id: product.id,
      })) || []
    )
  } catch (error) {
    console.error("[v0] generateStaticParams exception:", error)
    return []
  }
}

async function fetchProduct(id: string) {
  console.log("[v0] fetchProduct: Fetching product with id:", id)

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle()

    if (error) {
      console.error("[v0] fetchProduct Supabase error:", error)
      return null
    }

    if (data) {
      console.log("[v0] fetchProduct: Found product in Supabase:", data.id)
      return data
    }

    console.log("[v0] fetchProduct: Product not found in Supabase")
    return null
  } catch (error) {
    console.error("[v0] fetchProduct exception:", error)
    return null
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
