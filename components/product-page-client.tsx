"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Minus, Plus, ShoppingCart } from "lucide-react"
import { useCart } from "@/components/shopping-cart"
import { useTranslation } from "@/hooks/use-translation"
import { useLanguage } from "@/components/language-provider"
import HeaderWithSearch from "@/components/header-with-search"
import Footer from "@/components/footer"

interface ProductPageClientProps {
  product: any
  productId: string
}

export default function ProductPageClient({ product, productId }: ProductPageClientProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [stockStatus, setStockStatus] = useState({
    inStock: product.in_stock ?? product.inStock ?? true,
    stock: product.stock ?? 100,
    lowStockThreshold: product.low_stock_threshold ?? 10,
  })

  const getTranslatedString = (baseField: string): string => {
    const suffix = language === "ru" ? "_ru" : language === "hy" ? "_hy" : ""
    const translatedField = `${baseField}${suffix}`
    const value = product[translatedField] || product[baseField]
    return value || ""
  }

  const getTranslatedArray = (baseField: string): string[] => {
    const suffix = language === "ru" ? "_ru" : language === "hy" ? "_hy" : ""
    const translatedField = `${baseField}${suffix}`
    const value = product[translatedField] || product[baseField]
    if (Array.isArray(value)) return value
    if (typeof value === "string") return [value]
    return []
  }

  const productName = getTranslatedString("name")
  const productDescription = getTranslatedString("description")
  const productBenefits = getTranslatedArray("benefits")
  const productHowToUse = getTranslatedArray("how_to_use")
  const productIngredients = getTranslatedArray("ingredients")
  const concerns = getTranslatedArray("concerns")

  const handleAddToCart = async () => {
    if (!stockStatus.inStock || stockStatus.stock <= 0) {
      alert(t("product.outofstock") || "This product is out of stock")
      return
    }

    if (quantity > stockStatus.stock) {
      alert(`Only ${stockStatus.stock} items available in stock`)
      return
    }

    const success = await addItem(
      {
        id: productId,
        name: productName,
        price: product.price,
        image: product.image,
        stock: stockStatus.stock,
      },
      quantity,
    )

    if (success) {
      alert(t("product.addedtocart") || "Added to cart!")
    }
  }

  return (
    <>
      <HeaderWithSearch />
      <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/face-care"
              className="inline-flex items-center text-sm text-gray-600 hover:text-rose-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("product.backtofacecare") || "Back to Face Care"}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 shadow-lg">
            {/* Product Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50">
              <Image src={product.image || "/placeholder.svg"} alt={productName} fill className="object-contain p-8" />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{productName}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{productDescription}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-gray-900">{product.price}</span>
                {stockStatus.inStock && stockStatus.stock <= stockStatus.lowStockThreshold && (
                  <Badge variant="destructive">{t("product.lowstock") || "Low Stock"}</Badge>
                )}
                {!stockStatus.inStock && (
                  <Badge variant="destructive">{t("product.outofstock") || "Out of Stock"}</Badge>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gray-700">{t("product.quantity") || "Quantity"}:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!stockStatus.inStock}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(stockStatus.stock, quantity + 1))}
                    disabled={!stockStatus.inStock || quantity >= stockStatus.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {stockStatus.stock > 0 && (
                  <span className="text-sm text-gray-500">
                    {stockStatus.stock} {t("product.available") || "available"}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={!stockStatus.inStock || stockStatus.stock <= 0}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-6 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {stockStatus.inStock && stockStatus.stock > 0
                  ? t("product.addtocart") || "Add to Cart"
                  : t("product.outofstock") || "Out of Stock"}
              </Button>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12 bg-white rounded-3xl p-8 shadow-lg">
            <Tabs defaultValue="benefits" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="benefits">{t("product.benefits") || "Benefits"}</TabsTrigger>
                <TabsTrigger value="how-to-use">{t("product.howtouse") || "How to Use"}</TabsTrigger>
                <TabsTrigger value="ingredients">{t("product.ingredients") || "Ingredients"}</TabsTrigger>
                <TabsTrigger value="concerns">{t("product.targetedconcerns") || "Concerns"}</TabsTrigger>
              </TabsList>

              <TabsContent value="benefits" className="space-y-4 pt-6">
                <h3 className="text-xl font-semibold">{t("product.keybenefits") || "Key Benefits"}</h3>
                <ul className="space-y-2">
                  {productBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-rose-500 mr-2">•</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="how-to-use" className="space-y-4 pt-6">
                <h3 className="text-xl font-semibold">{t("product.instructions") || "Usage Instructions"}</h3>
                {productHowToUse.length > 0 ? (
                  <ol className="space-y-2 list-decimal list-inside">
                    {productHowToUse.map((step, index) => (
                      <li key={index} className="text-gray-700">
                        {step}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-500">{t("product.noinstructions") || "No usage instructions available."}</p>
                )}
              </TabsContent>

              <TabsContent value="ingredients" className="space-y-4 pt-6">
                <h3 className="text-xl font-semibold">{t("product.fullingredients") || "Full Ingredients List"}</h3>
                <div className="flex flex-wrap gap-2">
                  {productIngredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="concerns" className="space-y-4 pt-6">
                <h3 className="text-xl font-semibold">{t("product.targetedconcerns") || "Concerns"}</h3>
                <div className="flex flex-wrap gap-2">
                  {concerns.map((concern, index) => (
                    <Badge key={index} variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
