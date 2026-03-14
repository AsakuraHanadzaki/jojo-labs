import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/supabase/types"

// Fetch all products from Supabase
export async function fetchProducts(category?: string): Promise<Product[]> {
  try {
    const supabase = getSupabaseBrowserClient()

    let query = supabase.from("products").select("*")

    if (category && category !== "All") {
      query = query.eq("category", category)
    }

    query = query.eq("in_stock", true).gt("stock", 0)

    const { data, error } = await query.order("stock", { ascending: false }).order("name")

    if (error) {
      console.log("[v0] fetchProducts: Using fallback, Supabase unavailable")
      return []
    }

    console.log("[v0] fetchProducts: Successfully fetched", data?.length || 0, "products")
    // Debug: Log image URLs to verify they're coming from database
    if (data) {
      data.forEach(p => console.log("[v0] Product:", p.name, "| Image:", p.image))
    }
    return data || []
  } catch (error) {
    console.log("[v0] fetchProducts: Using fallback data")
    return []
  }
}

// Fetch single product by ID
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error("[v0] fetchProductById: Supabase error", error)
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] fetchProductById: Fatal error", error)
    return null
  }
}

// Fetch products for routine finder based on skin type and concerns
export async function fetchRoutineProducts(skinType: string, concerns: string[]): Promise<Product[]> {
  try {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("in_stock", true)
      .order("rating", { ascending: false })

    if (error) {
      console.error("[v0] fetchRoutineProducts: Supabase error", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] fetchRoutineProducts: Fatal error", error)
    return []
  }
}

// Fetch categories
export async function fetchCategories() {
  try {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("categories").select("*").order("display_order")

    if (error) {
      console.error("[v0] fetchCategories: Supabase error", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] fetchCategories: Fatal error", error)
    return []
  }
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

export async function validateStock(
  productId: string,
  requestedQuantity: number,
): Promise<{
  available: boolean
  maxQuantity: number
  message: string
}> {
  try {
    console.log("[v0] validateStock: Checking stock for", productId, "qty", requestedQuantity)
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("products").select("stock, in_stock").eq("id", productId).single()

    if (error) {
      return {
        available: true,
        maxQuantity: requestedQuantity,
        message: "Stock validation unavailable, allowing add to cart",
      }
    }

    if (!data) {
      return {
        available: false,
        maxQuantity: 0,
        message: "Product not found",
      }
    }

    const currentStock = data.stock ?? 0
    const inStock = data.in_stock ?? false

    console.log("[v0] validateStock: Current stock", currentStock, "in_stock", inStock)

    if (!inStock || currentStock <= 0) {
      return {
        available: false,
        maxQuantity: 0,
        message: "Product is out of stock",
      }
    }

    if (requestedQuantity > currentStock) {
      return {
        available: false,
        maxQuantity: currentStock,
        message: `Only ${currentStock} units available`,
      }
    }

    return {
      available: true,
      maxQuantity: currentStock,
      message: "Stock available",
    }
  } catch (error) {
    return {
      available: true,
      maxQuantity: requestedQuantity,
      message: "Stock validation error, allowing add to cart",
    }
  }
}
