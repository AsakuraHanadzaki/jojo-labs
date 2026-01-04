import { notFound } from "next/navigation"
import ProductPageClient from "@/components/product-page-client"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const dynamicParams = true

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

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params
  console.log("[v0] ProductPage: Rendering page for id:", id)

  const product = await fetchProduct(id)

  if (!product) {
    console.log("[v0] ProductPage: Product not found, returning 404")
    notFound()
  }

  console.log("[v0] ProductPage: Successfully loaded product:", product.id)
  return <ProductPageClient product={product} productId={id} />
}
