"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, Share2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/components/shopping-cart"
import { useTranslation } from "@/hooks/use-translation"
import { HeaderWithSearch } from "@/components/header-with-search"
import { Footer } from "@/components/footer"

type Product = {
  id: string
  name: string
  name_ru?: string
  name_hy?: string
  price: string
  image: string
  category: string
  description: string
  description_ru?: string
  description_hy?: string
  benefits?: string[]
  benefits_ru?: string[]
  benefits_hy?: string[]
  how_to_use?: string[]
  how_to_use_ru?: string[]
  how_to_use_hy?: string[]
  ingredients?: string[]
  skin_type?: string
  skin_type_ru?: string
  skin_type_hy?: string
  size?: string
  rating?: number
  reviews?: number
  stock?: number
  in_stock?: boolean
  eco?: boolean
}

type ProductT = Product

const INGREDIENT_RULES: Array<{ test: RegExp; concerns: string[] }> = [
  { test: /niacinamide/i, concerns: ["Enlarged Pores", "Active Breakouts", "Excess Oil", "Uneven Tone"] },
  { test: /zinc\s*pca/i, concerns: ["Active Breakouts", "Excess Oil", "Redness & Irritation"] },

  {
    test: /salicylic|bha|lipohydroxy/i,
    concerns: ["Clogged Pores", "Blackheads", "Active Breakouts", "Rough/Uneven Texture"],
  },
  {
    test: /glycolic|lactic|mandelic|aha/i,
    concerns: ["Rough/Uneven Texture", "Dullness", "Uneven Tone", "Fine Lines & Wrinkles"],
  },
  { test: /gluconolactone|pha/i, concerns: ["Gentle Exfoliation", "Rough/Uneven Texture", "Dullness"] },

  {
    test: /ascorbic|vitamin\s*c|3-?o-?ethyl ascorbic|ethyl ascorbic/i,
    concerns: ["Dark Spots", "Uneven Tone", "Dullness", "Photoaging"],
  },
  { test: /arbutin/i, concerns: ["Dark Spots", "Uneven Tone"] },
  { test: /tranexamic/i, concerns: ["Dark Spots", "Post-Acne Marks", "Melasma-Prone"] },

  {
    test: /retinol|retinal|retinoid|bakuchiol/i,
    concerns: ["Fine Lines & Wrinkles", "Loss of Firmness", "Uneven Texture", "Dullness"],
  },
  { test: /peptide|collagen/i, concerns: ["Loss of Firmness", "Fine Lines & Wrinkles", "Elasticity"] },

  { test: /hyaluronic|sodium hyaluronate/i, concerns: ["Dehydration", "Tightness"] },
  { test: /ceramide/i, concerns: ["Compromised Barrier", "Dryness", "Redness & Irritation"] },
  { test: /panthenol|vitamin\s*b5/i, concerns: ["Dehydration", "Redness & Irritation", "Compromised Barrier"] },
  { test: /squalane?/i, concerns: ["Dryness", "Tightness", "Compromised Barrier"] },
  { test: /allantoin/i, concerns: ["Redness & Irritation", "Sensitivity"] },
  { test: /glycerin/i, concerns: ["Dehydration"] },
  { test: /urea/i, concerns: ["Rough/Uneven Texture", "Dryness"] },
  { test: /beta-?glucan/i, concerns: ["Dehydration", "Redness & Irritation"] },

  {
    test: /centella|madecassoside|asiaticoside/i,
    concerns: ["Redness & Irritation", "Sensitivity", "Compromised Barrier"],
  },
  { test: /mugwort|artemisia/i, concerns: ["Redness & Irritation", "Sensitivity", "Active Breakouts"] },
  { test: /green tea|camellia sinensis/i, concerns: ["Excess Oil", "Redness & Irritation", "Antioxidant Support"] },
  { test: /heartleaf|houttuynia/i, concerns: ["Active Breakouts", "Inflammation", "Excess Oil", "Sensitivity"] },
  { test: /tea tree/i, concerns: ["Active Breakouts", "Inflammation"] },
  { test: /rice|oryza/i, concerns: ["Dullness", "Uneven Tone", "Dehydration", "Barrier Support"] },
  {
    test: /bifida|probiotic|ferment/i,
    concerns: ["Compromised Barrier", "Redness & Irritation", "Environmental Stress"],
  },

  // Sunscreen cues (in case ingredients don't scream "SPF")
  {
    test: /spf|uv|tinosorb|mexoryl|triazine|octyl|salate|uvinul/i,
    concerns: ["UV Damage Prevention", "Photoaging", "Hyperpigmentation Prevention"],
  },
]

const CATEGORY_FALLBACK: Record<string, string[]> = {
  Cleansers: ["Impurities & Residue", "Excess Oil", "Congestion", "Dehydration"],
  Toners: ["Dehydration", "pH Imbalance", "Redness & Irritation", "Sensitivity"],
  Essences: ["Dehydration", "Dullness", "Redness & Irritation", "Barrier Support"],
  Serums: ["Targeted Treatment", "Dullness", "Uneven Tone", "Dehydration"],
  Exfoliants: ["Rough/Uneven Texture", "Clogged Pores", "Dullness", "Uneven Tone"],
  Treatments: ["Targeted Concern", "Uneven Texture", "Post-Acne Marks", "Dullness"],
  Moisturizers: ["Dryness", "Compromised Barrier", "Tightness", "Redness & Irritation"],
  Masks: ["Dehydration", "Dullness", "Redness & Irritation"],
  Sunscreens: ["UV Damage Prevention", "Photoaging", "Hyperpigmentation Prevention"],
  Eyes: ["Fine Lines & Wrinkles", "Puffiness", "Dark Circles"],
  Lips: ["Dryness", "Chapping", "Sensitivity"],
  Face: ["Dullness", "Uneven Tone", "Dehydration"],
}

const MAX_CONCERNS = 6

function uniqueOrder<T>(arr: T[]): T[] {
  const seen = new Set<T>()
  const out: T[] = []
  for (const x of arr)
    if (!seen.has(x)) {
      seen.add(x)
      out.push(x)
    }
  return out
}

function inferConcerns(product: ProductT): string[] {
  const haystacks = [
    (product.name || "").toLowerCase(),
    (product.description || "").toLowerCase(),
    ...(product.ingredients || []).map((s: string) => (s || "").toLowerCase()),
  ]

  const hits: string[] = []
  for (const rule of INGREDIENT_RULES) {
    const matched = haystacks.some((t) => rule.test.test(t))
    if (matched) hits.push(...rule.concerns)
  }

  const withFallback =
    hits.length > 0
      ? hits
      : (CATEGORY_FALLBACK[product.category as keyof typeof CATEGORY_FALLBACK] ?? [
          "Dehydration",
          "Barrier Support",
          "Dullness",
        ])

  return uniqueOrder(withFallback).slice(0, MAX_CONCERNS)
}

function badgeClassForConcern(c: string): string {
  const s = c.toLowerCase()

  if (/(breakout|blemish|acne|pore|blackhead|oil|sebum|congestion)/.test(s)) return "bg-blue-50 text-blue-800"
  if (/(hydrate|dehydration|dryness|tightness|barrier)/.test(s)) return "bg-green-50 text-green-800"
  if (/(texture|exfoli|clogged|rough|smooth)/.test(s)) return "bg-purple-50 text-purple-800"
  if (/(line|wrinkle|firmness|elasticity)/.test(s)) return "bg-orange-50 text-orange-800"
  if (/(redness|irritation|sensitivity|inflammation)/.test(s)) return "bg-rose-50 text-rose-800"
  if (/(dark spot|uneven tone|hyperpigmentation|post-acne|melasma|bright)/.test(s)) return "bg-amber-50 text-amber-800"
  if (/(uv|photoaging|sun)/.test(s)) return "bg-cyan-50 text-cyan-800"
  if (/(antioxidant|environmental)/.test(s)) return "bg-slate-50 text-slate-800"

  return "bg-gray-100 text-gray-800"
}

function findRelevantProducts(currentProduct: ProductT): ProductT[] {
  const allProductsArray = Object.values(allProducts)
  const currentConcerns = inferConcerns(currentProduct)
  const currentCategory = currentProduct.category

  const routineOrder = ["Cleansers", "Toners", "Essences", "Serums", "Treatments", "Moisturizers", "Sunscreens"]
  const complementaryCategories: Record<string, string[]> = {
    Cleansers: ["Toners", "Essences", "Moisturizers"],
    Toners: ["Serums", "Essences", "Moisturizers"],
    Essences: ["Serums", "Treatments", "Moisturizers"],
    Serums: ["Moisturizers", "Sunscreens", "Essences"],
    Treatments: ["Moisturizers", "Essences", "Toners"],
    Moisturizers: ["Serums", "Sunscreens", "Treatments"],
    Sunscreens: ["Moisturizers", "Serums", "Cleansers"],
    Exfoliants: ["Moisturizers", "Essences", "Toners"],
    Masks: ["Moisturizers", "Essences", "Serums"],
  }

  const scoredProducts = allProductsArray
    .filter((product) => product.id !== currentProduct.id)
    .map((product) => {
      let score = 0
      const productConcerns = inferConcerns(product)

      const sharedConcerns = currentConcerns.filter((concern) => productConcerns.includes(concern))
      score += sharedConcerns.length * 3

      const complementary = complementaryCategories[currentCategory] || []
      if (complementary.includes(product.category)) {
        score += 2
      }

      if (
        product.skinType === currentProduct.skinType ||
        product.skinType === "All skin types" ||
        currentProduct.skinType === "All skin types"
      ) {
        score += 1
      }

      const currentIndex = routineOrder.indexOf(currentCategory)
      const productIndex = routineOrder.indexOf(product.category)
      if (currentIndex !== -1 && productIndex !== -1) {
        const distance = Math.abs(currentIndex - productIndex)
        if (distance === 1) score += 2
        else if (distance === 2) score += 1
      }

      const currentIngredients = currentProduct.ingredients.join(" ").toLowerCase()
      const productIngredients = product.ingredients.join(" ").toLowerCase()

      if (
        currentIngredients.includes("niacinamide") &&
        (productIngredients.includes("hyaluronic") || productIngredients.includes("ceramide"))
      ) {
        score += 2
      }

      if (
        currentIngredients.includes("ascorbic") &&
        (product.category === "Moisturizers" || product.category === "Sunscreens")
      ) {
        score += 2
      }

      if (
        currentCategory === "Exfoliants" &&
        (productIngredients.includes("centella") || productIngredients.includes("panthenol"))
      ) {
        score += 2
      }

      if (currentCategory === "Cleansers" && (product.category === "Toners" || product.category === "Essences")) {
        score += 2
      }

      return { product, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => item.product)

  if (scoredProducts.length < 3) {
    const fallbackProducts = [
      allProducts["beauty-of-joseon-relief-sun-rice-probiotics-spf-50"],
      allProducts["dr-althea-345-relief-cream"],
      allProducts["anua-rice-70-glow-milky-toner"],
      allProducts["axis-y-dark-spot-correcting-glow-serum"],
    ]
      .filter(Boolean)
      .filter((p) => p.id !== currentProduct.id)

    scoredProducts.push(...fallbackProducts.slice(0, 3 - scoredProducts.length))
  }

  return scoredProducts.slice(0, 3)
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const { addItem } = useCart()
  const { t, language } = useTranslation()
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
        }
      } catch (error) {
        console.error("[v0] Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderWithSearch />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderWithSearch />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">{t("product.notfound") || "Product not found"}</h1>
            <Link href="/face-care">
              <Button variant="outline">
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t("product.backtostore") || "Back to Store"}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const getTranslatedField = (field: string): string => {
    if (language === "ru" && product[`${field}_ru` as keyof Product]) {
      return product[`${field}_ru` as keyof Product] as string
    }
    if (language === "hy" && product[`${field}_hy` as keyof Product]) {
      return product[`${field}_hy` as keyof Product] as string
    }
    return product[field as keyof Product] as string
  }

  const getTranslatedArray = (field: string): string[] => {
    if (language === "ru" && product[`${field}_ru` as keyof Product]) {
      return product[`${field}_ru` as keyof Product] as string[]
    }
    if (language === "hy" && product[`${field}_hy` as keyof Product]) {
      return product[`${field}_hy` as keyof Product] as string[]
    }
    return (product[field as keyof Product] as string[]) || []
  }

  const productName = getTranslatedField("name")
  const productDescription = getTranslatedField("description")
  const productBenefits = getTranslatedArray("benefits")
  const productHowToUse = getTranslatedArray("how_to_use")
  const productSkinType = getTranslatedField("skin_type")

  const getStockStatus = () => {
    const currentStock = product.stock ?? 0
    const inStock = product.in_stock ?? true

    if (!inStock || currentStock === 0) {
      return {
        label: t("product.outofstock") || "Out of Stock",
        color: "bg-red-100 text-red-800 border-red-200",
        available: false,
      }
    }
    if (currentStock <= 10) {
      return {
        label: t("product.lowstock") || "Low Stock",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        available: true,
      }
    }
    return {
      label: t("product.instock") || "In Stock",
      color: "bg-green-100 text-green-800 border-green-200",
      available: true,
    }
  }

  const stockStatus = getStockStatus()
  const concerns = inferConcerns(product as ProductT)

  const handleAddToCart = () => {
    if (!stockStatus.available) return

    addItem({
      id: product.id,
      name: productName,
      price: product.price,
      image: product.image,
      quantity,
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWithSearch />
      <main className="flex-grow container mx-auto px-4 py-8">
        <nav className="mb-6">
          <Link
            href="/face-care"
            className="inline-flex items-center text-sm text-gray-600 hover:text-rose-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t("product.backtostore") || "Back to Face Care"}
          </Link>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="relative aspect-square bg-gradient-to-br from-rose-50 to-pink-100 rounded-3xl overflow-hidden">
            <Image src={product.image || "/placeholder.svg"} alt={productName} fill className="object-cover" />
            {product.eco && (
              <Badge className="absolute top-4 left-4 bg-green-100 text-green-800">{t("product.eco") || "ECO"}</Badge>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                {t(`category.${product.category.toLowerCase()}`) || product.category}
              </p>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{productName}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating || 0} ({product.reviews || 0} {t("product.reviews") || "reviews"})
                  </span>
                </div>
              </div>

              <Badge variant="outline" className={`${stockStatus.color} text-sm font-medium mb-4`}>
                {stockStatus.label}
              </Badge>

              <p className="text-3xl font-bold text-rose-600 mb-4">{product.price}</p>
              <p className="text-gray-600 leading-relaxed">{productDescription}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100">
                    +
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={!stockStatus.available}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {stockStatus.available
                    ? t("product.addtocart") || "Add to Cart"
                    : t("product.outofstock") || "Out of Stock"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                  <Heart className={isFavorite ? "fill-rose-600 text-rose-600" : ""} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 />
                </Button>
              </div>
            </div>

            <div className="border-t pt-6 space-y-2">
              {product.size && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("product.size") || "Size"}:</span>
                  <span className="font-medium">{product.size}</span>
                </div>
              )}
              {productSkinType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("product.skintype") || "Skin Type"}:</span>
                  <span className="font-medium">{productSkinType}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="why" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="why">{t("product.whyyoulllove") || "Why You'll Love It"}</TabsTrigger>
            <TabsTrigger value="how">{t("product.howtouse") || "How to Use"}</TabsTrigger>
            <TabsTrigger value="ingredients">{t("product.ingredients") || "Ingredients"}</TabsTrigger>
            <TabsTrigger value="concerns">{t("product.skinconcerns") || "Skin Concerns"}</TabsTrigger>
          </TabsList>

          <TabsContent value="why" className="space-y-4 pt-6">
            <h3 className="text-xl font-semibold">{t("product.keybenefits") || "Key Benefits"}</h3>
            <ul className="space-y-2">
              {productBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-rose-600 mt-1">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="how" className="space-y-4 pt-6">
            <h3 className="text-xl font-semibold">{t("product.howtouse") || "How to Use"}</h3>
            <ol className="space-y-3">
              {productHowToUse.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-4 pt-6">
            <h3 className="text-xl font-semibold">{t("product.keyingredients") || "Key Ingredients"}</h3>
            <div className="flex flex-wrap gap-2">
              {product.ingredients?.map((ingredient, index) => (
                <Badge key={index} variant="secondary">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="concerns" className="space-y-4 pt-6">
            <h3 className="text-xl font-semibold">{t("product.targetedconcerns") || "Targeted Skin Concerns"}</h3>
            <div className="flex flex-wrap gap-2">
              {concerns.map((concern, index) => (
                <Badge key={index} variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                  {concern}
                </Badge>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

const allProducts = {}
