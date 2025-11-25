"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { Footer } from "@/components/footer"
import { HeaderWithSearch } from "@/components/header-with-search"
import { allProducts, type Product } from "@/lib/all-products"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTranslation } from "@/hooks/use-translation"

export default function FaceCarePage() {
  const { t } = useTranslation()

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

  const allFaceCareProducts: Product[] = Object.values(allProducts).filter((product) =>
    faceCareCategories.includes(product.category),
  )

  const categories = [
    { name: t("facecare.cat.all"), filter: "All" },
    ...faceCareCategories.map((cat) => ({ name: cat, filter: cat })),
  ]

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(9)

  const filteredProducts =
    selectedCategory === "All"
      ? allFaceCareProducts
      : allFaceCareProducts.filter((product) => product.category === selectedCategory)

  const handleCategoryClick = (filter: string) => {
    setSelectedCategory(filter)
    setDisplayLimit(9)
    setIsSheetOpen(false)
  }

  const handleLoadMore = () => {
    setDisplayLimit((prevLimit) => prevLimit + 9)
  }

  const productsToDisplay = filteredProducts.slice(0, displayLimit)
  const hasMoreProducts = filteredProducts.length > displayLimit

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithSearch />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 lg:p-12 mb-16 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <Image
              src="https://images.unsplash.com/photo-1586220742613-b731f66f7743?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Face Care Hero Background"
              layout="fill"
              objectFit="cover"
              className="blur-sm scale-110"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsToDisplay.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

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
