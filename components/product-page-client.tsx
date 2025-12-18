"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Minus, Plus, ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/components/shopping-cart"
import { useTranslation } from "@/hooks/use-translation"
import { useToast } from "@/hooks/use-toast"
import { WishlistButton } from "@/components/wishlist-button"
import HeaderWithSearch from "@/components/header-with-search"
import Footer from "@/components/footer"

const SimpleBadge = ({
  children,
  className = "",
  variant = "default",
}: { children: React.ReactNode; className?: string; variant?: string }) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors"
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  }
  return (
    <span
      className={`${baseStyles} ${variantStyles[variant as keyof typeof variantStyles] || variantStyles.default} ${className}`}
    >
      {children}
    </span>
  )
}

interface ProductPageClientProps {
  product: any
  productId: string
}

export default function ProductPageClient({ product, productId }: ProductPageClientProps) {
  const { t, language } = useTranslation()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [stockStatus] = useState({
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

  const isLowStock = stockStatus.stock > 0 && stockStatus.stock <= stockStatus.lowStockThreshold
  const isOutOfStock = !stockStatus.inStock || stockStatus.stock <= 0

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast({
        title: t("product.outofstock") || "Out of Stock",
        description: t("product.unavailable") || "This product is currently unavailable",
        variant: "destructive",
      })
      return
    }

    if (quantity > stockStatus.stock) {
      toast({
        title: t("product.insufficientstock") || "Insufficient Stock",
        description: `${t("product.only") || "Only"} ${stockStatus.stock} ${t("product.available") || "available"}`,
        variant: "destructive",
      })
      return
    }

    setIsAddingToCart(true)

    try {
      let stockValidated = false

      try {
        const response = await fetch("/api/cart/validate-stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        })

        if (response.ok) {
          const validation = await response.json()
          stockValidated = true

          if (!validation.available) {
            toast({
              title: t("product.insufficientstock") || "Insufficient Stock",
              description: validation.message,
              variant: "destructive",
            })
            setIsAddingToCart(false)
            return
          }
        }
      } catch (fetchError) {
        // Stock validation failed, continue anyway with warning
        console.log("Stock validation unavailable, adding to cart anyway")
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
        toast({
          title: t("product.addedtocart") || "Product added to cart!",
          description: `${quantity} × ${productName}`,
        })
        setQuantity(1)
      }
    } catch (error) {
      toast({
        title: t("common.error") || "Error",
        description: t("product.addfailed") || "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <>
      <HeaderWithSearch />
      <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
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
              {/* Stock Badge */}
              {isOutOfStock ? (
                <SimpleBadge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white">
                  {t("product.outofstock") || "Out of Stock"}
                </SimpleBadge>
              ) : isLowStock ? (
                <SimpleBadge className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600 text-white">
                  {t("product.lowstock") || "Low Stock"}
                </SimpleBadge>
              ) : (
                <SimpleBadge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white">
                  {t("product.instock") || "In Stock"}
                </SimpleBadge>
              )}
              {/* Wishlist button to top-left corner */}
              <div className="absolute top-4 left-4">
                <WishlistButton productId={productId} productName={productName} />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{productName}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 4.5) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews || 0} {t("product.reviews") || "reviews"})
                  </span>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-4">{productDescription}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-rose-600">{product.price}</span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">{t("product.quantity") || "Quantity"}:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(stockStatus.stock, quantity + 1))}
                    disabled={isOutOfStock || quantity >= stockStatus.stock}
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

              {/* Wishlist and Cart buttons in a flex container */}
              <div className="flex gap-3">
                <WishlistButton productId={productId} productName={productName} />
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-6 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isAddingToCart
                    ? t("product.adding") || "Adding..."
                    : isOutOfStock
                      ? t("product.outofstock") || "Out of Stock"
                      : t("product.addtocart") || "Add to Cart"}
                </Button>
              </div>

              {isOutOfStock && (
                <p className="text-sm text-red-600 text-center">
                  {t("product.unavailable") || "This product is currently unavailable"}
                </p>
              )}
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
                {productBenefits.length > 0 ? (
                  <ul className="space-y-2">
                    {productBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-rose-500 mr-2">•</span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">{t("product.nobenefits") || "No benefits information available."}</p>
                )}
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
                {productIngredients.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {productIngredients.map((ingredient, index) => (
                      <SimpleBadge key={index} variant="secondary" className="text-sm">
                        {ingredient}
                      </SimpleBadge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    {t("product.noingredients") || "No ingredients information available."}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="concerns" className="space-y-4 pt-6">
                <h3 className="text-xl font-semibold">{t("product.targetedconcerns") || "Concerns"}</h3>
                {concerns.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {concerns.map((concern, index) => (
                      <SimpleBadge key={index} variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                        {concern}
                      </SimpleBadge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">{t("product.noconcerns") || "No concerns information available."}</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
