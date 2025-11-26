import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/supabase/types"

// Fetch all products from Supabase
export async function fetchProducts(category?: string): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient()

  let query = supabase.from("products").select("*")

  if (category && category !== "All") {
    query = query.eq("category", category)
  }

  const { data, error } = await query.order("name")

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

// Fetch single product by ID
export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching product:", error)
    return null
  }

  return data
}

// Fetch products for routine finder based on skin type and concerns
export async function fetchRoutineProducts(skinType: string, concerns: string[]): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("rating", { ascending: false })

  if (error) {
    console.error("Error fetching routine products:", error)
    return []
  }

  return data || []
}

// Fetch categories
export async function fetchCategories() {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("categories").select("*").order("display_order")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

// Get translated product field based on language
export function getTranslatedField(
  product: Product,
  field: "name" | "description" | "how_to_use",
  language: string,
): string {
  if (language === "ru") {
    const ruField = `${field}_ru` as keyof Product
    return (product[ruField] as string) || (product[field] as string)
  }
  if (language === "hy") {
    const hyField = `${field}_hy` as keyof Product
    return (product[hyField] as string) || (product[field] as string)
  }
  return product[field] as string
}

// Get translated array field
export function getTranslatedArrayField(product: Product, field: "benefits" | "skin_type", language: string): string[] {
  if (language === "ru") {
    const ruField = `${field}_ru` as keyof Product
    return (product[ruField] as string[]) || (product[field] as string[])
  }
  if (language === "hy") {
    const hyField = `${field}_hy` as keyof Product
    return (product[hyField] as string[]) || (product[field] as string[])
  }
  return product[field] as string[]
}

// Get stock status label
export function getStockStatus(product: Product): { label: string; color: string } {
  const stock = product.stock ?? 0
  const lowThreshold = product.low_stock_threshold ?? 10
  const inStock = product.in_stock ?? true

  if (!inStock || stock === 0) {
    return { label: "Out of Stock", color: "bg-red-100 text-red-800" }
  }
  if (stock <= lowThreshold) {
    return { label: "Low Stock", color: "bg-amber-100 text-amber-800" }
  }
  return { label: "In Stock", color: "bg-green-100 text-green-800" }
}
