"use client"

import { useState, useEffect } from "react"
import { Filter, X } from "lucide-react"
import Image from "next/image"
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
          const sortedProducts = sortProductsByStock(faceCareProducts)
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
  }, [])

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 lg:p-12 mb-16 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <Image
              src="https://images.unsplash.com/photo-1586220742613-b731f66f7743?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Face Care Hero Background"
              fill
              className="object-cover blur-sm scale-110"
            />
          </div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("facecare.title")}</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">{t("facecare.desc")}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Filter className="w-4 h-4" />
                <span>{t("facecare.filter")}</span>
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
                    className={`justify-start ${
                      selectedCategory === cat.filter ? "bg-rose-100 text-rose-800 hover:bg-rose-200" : ""
                    }`}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex flex-wrap gap-2 text-sm text-gray-600">
            <span>{t("facecare.categories")}</span>
            {categories.map((cat) => (
              <button
                key={cat.filter}
                onClick={() => setSelectedCategory(cat.filter)}
                className={`px-3 py-1 rounded-full transition-colors ${
                  selectedCategory === cat.filter ? "bg-rose-100 text-rose-800" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            {filteredProducts.length} {t("facecare.products")}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : productsToDisplay.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found. Please run the database scripts to add products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
