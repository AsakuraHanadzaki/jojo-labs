"use client"

import { useState, useEffect } from "react"
import { Filter, X } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { Footer } from "@/components/footer"
import { HeaderWithSearch } from "@/components/header-with-search"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTranslation } from "@/hooks/use-translation"
import { fetchProducts } from "@/lib/products-service"
import type { Product } from "@/lib/supabase/types"
import { allProducts } from "@/lib/all-products"

export default function FaceCarePage() {
  const { t, language } = useTranslation()
  const searchParams = useSearchParams()
  const concernParam = searchParams.get("concern")

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const faceCareCategories = [
    "Serums",
    "Essences",
    "Treatments",
    "Masks",
    "Toners",
    "Sunscreens",
    "Ampoules",
    "Cleansers",
    "Moisturizers",
    "Exfoliants",
  ]

  const categories = [
    { name: t("facecare.cat.all"), filter: "All" },
    { name: t("facecare.cat.serums"), filter: "Serums" },
    { name: t("facecare.cat.essences"), filter: "Essences" },
    { name: t("facecare.cat.treatments"), filter: "Treatments" },
    { name: t("facecare.cat.masks"), filter: "Masks" },
    { name: t("facecare.cat.toners"), filter: "Toners" },
    { name: t("facecare.cat.sunscreens"), filter: "Sunscreens" },
    { name: t("facecare.cat.cleansers"), filter: "Cleansers" },
    { name: t("facecare.cat.moisturizers"), filter: "Moisturizers" },
    { name: t("facecare.cat.exfoliants"), filter: "Exfoliants" },
  ]

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(9)

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      try {
        const dbProducts = await fetchProducts()
        console.log("[v0] Fetched products from database:", dbProducts.length)

        if (dbProducts.length > 0) {
          const faceCareProducts = dbProducts.filter((p) => faceCareCategories.includes(p.category))
          console.log("[v0] Filtered face care products:", faceCareProducts.length)

          let filteredByConcern = faceCareProducts
          if (concernParam) {
            filteredByConcern = faceCareProducts.filter((p) => {
              if (!p.concerns || !Array.isArray(p.concerns)) return false

              const concernMapping: Record<string, string[]> = {
                hydration: ["dehydration", "hydration", "dryness"],
                acne: ["acne", "pimples", "breakouts"],
                aging: ["aging", "fine lines", "wrinkles", "anti-aging"],
                pigmentation: ["pigmentation", "dark spots", "hyperpigmentation", "melasma"],
                pores: ["pores", "blackheads", "enlarged pores"],
                sensitivity: ["sensitivity", "redness", "irritation", "rosacea"],
                texture: ["texture", "dullness", "uneven texture"],
                dryness: ["dryness", "dry skin"],
              }

              const matchingConcerns = concernMapping[concernParam] || [concernParam]
              return p.concerns.some((concern: string) =>
                matchingConcerns.some((mc) => concern.toLowerCase().includes(mc.toLowerCase())),
              )
            })
          }

          const sortedProducts = sortProductsByStock(filteredByConcern)
          setProducts(sortedProducts)
        } else {
          // Fallback to hardcoded products
          console.log("[v0] Using fallback hardcoded products")
          const fallbackProducts = Object.values(allProducts)
            .filter((p) => faceCareCategories.includes(p.category) && p.inStock !== false)
            .map((p) => ({
              ...p,
              stock: 100,
              in_stock: p.inStock,
              low_stock_threshold: 10,
            }))
          setProducts(fallbackProducts as unknown as Product[])
        }
      } catch (error) {
        console.error("[v0] Error loading products:", error)
        const fallbackProducts = Object.values(allProducts)
          .filter((p) => faceCareCategories.includes(p.category) && p.inStock !== false)
          .map((p) => ({
            ...p,
            stock: 100,
            in_stock: p.inStock,
            low_stock_threshold: 10,
          }))
        setProducts(fallbackProducts as unknown as Product[])
      }
      setLoading(false)
    }
    loadProducts()
  }, [concernParam])

  const sortProductsByStock = (products: Product[]) => {
    return [...products].sort((a, b) => {
      // First priority: in_stock status
      if (a.in_stock && !b.in_stock) return -1
      if (!a.in_stock && b.in_stock) return 1

      // Second priority: stock quantity
      const stockA = a.stock ?? 0
      const stockB = b.stock ?? 0

      // Both in stock: higher stock quantity first
      if (a.in_stock && b.in_stock) {
        return stockB - stockA
      }

      return 0
    })
  }

  const filteredProducts =
    selectedCategory === "All" ? products : products.filter((product) => product.category === selectedCategory)

  const sortedFilteredProducts = sortProductsByStock(filteredProducts)

  const handleCategoryClick = (filter: string) => {
    setSelectedCategory(filter)
    setDisplayLimit(9)
    setIsSheetOpen(false)
  }

  const handleLoadMore = () => {
    setDisplayLimit((prevLimit) => prevLimit + 9)
  }

  const productsToDisplay = sortedFilteredProducts.slice(0, displayLimit)
  const hasMoreProducts = sortedFilteredProducts.length > displayLimit

  const getProductName = (product: Product) => {
    if (language === "ru" && product.name_ru) return product.name_ru
    if (language === "hy" && product.name_hy) return product.name_hy
    return product.name
  }

  const getProductDescription = (product: Product) => {
    if (language === "ru" && product.description_ru) return product.description_ru
    if (language === "hy" && product.description_hy) return product.description_hy
    return product.description
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithSearch />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        {concernParam && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-rose-50 rounded-lg border border-rose-200">
            <p className="text-center text-sm sm:text-base text-rose-800">
              {t("facecare.filteredby") || "Showing products for"}:{" "}
              <strong className="capitalize">{concernParam}</strong>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden w-full sm:w-auto">
              <Button variant="outline" className="flex items-center justify-center space-x-2 bg-transparent w-full">
                <Filter className="w-4 h-4" />
                <span className="text-sm">{t("facecare.filter")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 sm:w-80 bg-white p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">{t("facecare.filter")}</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-col p-4 space-y-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.filter}
                    variant="ghost"
                    onClick={() => handleCategoryClick(cat.filter)}
                    className={`justify-start text-sm ${
                      selectedCategory === cat.filter ? "bg-rose-100 text-rose-800 hover:bg-rose-200" : ""
                    }`}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
            <span className="py-1">{t("facecare.categories")}</span>
            {categories.map((cat) => (
              <button
                key={cat.filter}
                onClick={() => setSelectedCategory(cat.filter)}
                className={`px-2 sm:px-3 py-1 rounded-full transition-colors whitespace-nowrap text-xs sm:text-sm ${
                  selectedCategory === cat.filter ? "bg-rose-100 text-rose-800" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-gray-600 w-full sm:w-auto text-center sm:text-right">
            {filteredProducts.length} {t("facecare.products")}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm sm:text-base">Loading products...</p>
          </div>
        ) : productsToDisplay.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm sm:text-base">
              No products found. Please run the database scripts to add products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {productsToDisplay.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={getProductName(product)}
                description={getProductDescription(product)}
                price={product.price}
                image={product.image}
                category={product.category}
                stock={product.stock}
                inStock={product.in_stock}
                lowStockThreshold={product.low_stock_threshold}
              />
            ))}
          </div>
        )}

        {hasMoreProducts && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={handleLoadMore}>
              {t("facecare.loadmore")}
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
