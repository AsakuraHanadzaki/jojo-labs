import { notFound } from "next/navigation"
import ProductPageClient from "@/components/product-page-client"
import { allProducts } from "@/lib/all-products"
import { createBrowserClient } from "@supabase/ssr"

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

async function fetchProduct(id: string) {
  const idVariants = getIdVariants(id)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(idVariants.map((variant) => `id.eq.${variant}`).join(","))
        .maybeSingle()

      if (error) {
        console.error("[v0] fetchProduct error:", error)
      }

      if (data) {
        return data
      }
    } catch (error) {
      console.error("[v0] fetchProduct exception:", error)
    }
  }

  // Fallback to bundled products
  for (const variant of idVariants) {
    const fallbackProduct = allProducts[variant]
    if (fallbackProduct) {
      return fallbackProduct
    }
  }

  return null
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const product = await fetchProduct(id)

  if (!product) {
    notFound()
  }

  return <ProductPageClient product={product} productId={id} />
}
