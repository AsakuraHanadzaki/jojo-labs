import { notFound } from "next/navigation"
import ProductPageClient from "@/components/product-page-client"
import { createClient } from "@/lib/supabase/server"
import { allProducts } from "@/lib/all-products"

export async function generateStaticParams() {
  const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  try {
    if (hasSupabaseEnv) {
      const supabase = await createClient()
      const { data: products } = await supabase.from("products").select("id")

    if (products && products.length > 0) {
        return products.map((product) => ({
          id: product.id,
        }))
      }
    }
  } catch (error) {
    console.error("Error generating static params:", error)
  }

  // Fallback to hardcoded products
  return Object.values(allProducts).map((product) => ({
    id: product.id,
  }))
}

export const dynamicParams = true
export const dynamic = "force-dynamic"

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

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await fetchProduct(id)

  if (!product) {
    notFound()
  }

  return <ProductPageClient product={product} productId={id} />
}
