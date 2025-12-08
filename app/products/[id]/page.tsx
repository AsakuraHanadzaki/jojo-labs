"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Minus, Plus, Star, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/components/shopping-cart"
import HeaderWithSearch from "@/components/header-with-search"
import Footer from "@/components/footer"
import { useTranslation } from "@/hooks/use-translation"
import { allProducts } from "@/lib/all-products"

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
  concerns?: string[]
  concerns_ru?: string[]
  concerns_hy?: string[]

  // Some products might use camelCase from API
  skinType?: string
  inStock?: boolean
  low_stock_threshold?: number
}

// --- NEW INGREDIENT / ACTIVE LOGIC (ported from the routine algorithm) ---

// Rules based on full ingredient / description text (your original rules)
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
  { test: /ascorbic|vitamin\s*c/i, concerns: ["Dark Spots", "Uneven Tone", "Dullness", "Photoaging"] },
  {
    test: /retinol|retinal|bakuchiol/i,
    concerns: ["Fine Lines & Wrinkles", "Loss of Firmness", "Uneven Texture", "Dullness"],
  },
  { test: /hyaluronic|sodium hyaluronate/i, concerns: ["Dehydration", "Tightness"] },
  { test: /ceramide/i, concerns: ["Compromised Barrier", "Dryness", "Redness & Irritation"] },
  { test: /panthenol|vitamin\s*b5/i, concerns: ["Dehydration", "Redness & Irritation", "Compromised Barrier"] },
  { test: /centella|madecassoside/i, concerns: ["Redness & Irritation", "Sensitivity", "Compromised Barrier"] },
  { test: /mugwort|artemisia/i, concerns: ["Redness & Irritation", "Sensitivity", "Active Breakouts"] },
]

function uniqueOrder<T>(arr: T[]): T[] {
  const seen = new Set<T>()
  const out: T[] = []
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x)
      out.push(x)
    }
  }
  return out
}

// Detect actives (canonical codes) from product name + ingredients
function detectActivesFromProduct(product: Product): string[] {
  const name = (product.name || "").toLowerCase()
  const desc = (product.description || "").toLowerCase()
  const ingredientsText = (product.ingredients || []).join(" ").toLowerCase()
  const text = `${name} ${desc} ${ingredientsText}`

  const flags: string[] = []

  if (/salicylic|bha/.test(text)) flags.push("BHA")
  if (/\baha\b|glycolic|lactic|mandelic/.test(text)) flags.push("AHA")
  if (/mandelic/.test(text)) flags.push("MANDELIC")
  if (/retinol|retinal|retinoate|tretinoin|retinoid/.test(text)) flags.push("RETINOID")
  if (/niacinamide|nicotinamide/.test(text)) flags.push("NIACINAMIDE")
  if (/azelaic/.test(text)) flags.push("AZELAIC")
  if (/ascorbic|vitamin c|3-o-ethyl ascorbic/.test(text)) flags.push("VITC")
  if (/tranexamic/.test(text)) flags.push("TXA")
  if (/arbutin/.test(text)) flags.push("ARBUTIN")
  if (/ceramide/.test(text)) flags.push("CERAMIDES")
  if (/squalane|squalene/.test(text)) flags.push("SQUALANE")
  if (/snail/.test(text)) flags.push("SNAIL")
  if (/beta[-\s]?glucan/.test(text)) flags.push("BETA_GLUCAN")
  if (/hyaluronic|sodium hyaluronate/.test(text)) flags.push("HA")
  if (/peptide/.test(text)) flags.push("PEPTIDES")
  if (/ginseng/.test(text)) flags.push("GINSENG")
  if (/centella|cica/.test(text)) flags.push("CENTELLA")
  if (/mugwort|artemisia/.test(text)) flags.push("MUGWORT")
  if (/panthenol|provitamin b5/.test(text)) flags.push("PANTHENOL")
  if (/heartleaf|houttuynia/.test(text)) flags.push("HEARTLEAF")

  return uniqueOrder(flags)
}

// Map each active → human-facing concern labels (front-end display)
const ACTIVE_CONCERN_MAP: Record<string, string[]> = {
  BHA: ["Clogged Pores", "Blackheads", "Active Breakouts", "Oily T-Zone"],
  AHA: ["Rough/Uneven Texture", "Dullness", "Uneven Tone"],
  MANDELIC: ["Texture", "Post-Acne Marks", "Mild Exfoliation"],
  RETINOID: ["Fine Lines & Wrinkles", "Loss of Firmness", "Uneven Texture"],
  NIACINAMIDE: ["Enlarged Pores", "Active Breakouts", "Excess Oil", "Uneven Tone"],
  AZELAIC: ["Post-Acne Marks", "Redness & Irritation", "Mild Breakouts"],
  VITC: ["Dark Spots", "Uneven Tone", "Dullness", "Photoaging"],
  TXA: ["Stubborn Dark Spots", "Post-Inflammatory Marks"],
  ARBUTIN: ["Hyperpigmentation", "Uneven Tone"],
  CERAMIDES: ["Compromised Barrier", "Dryness", "Redness & Irritation"],
  SQUALANE: ["Dryness", "Tightness", "Barrier Support"],
  SNAIL: ["Dehydration", "Post-Acne Marks", "Barrier Repair"],
  BETA_GLUCAN: ["Dehydration", "Redness & Irritation"],
  HA: ["Dehydration", "Tightness", "Fine Dehydration Lines"],
  PEPTIDES: ["Loss of Firmness", "Fine Lines & Wrinkles"],
  GINSENG: ["Dullness", "Fatigued Skin", "Fine Lines"],
  CENTELLA: ["Redness & Irritation", "Sensitivity", "Compromised Barrier"],
  MUGWORT: ["Redness & Irritation", "Sensitivity", "Active Breakouts"],
  PANTHENOL: ["Dehydration", "Redness & Irritation", "Compromised Barrier"],
  HEARTLEAF: ["Redness & Irritation", "Active Breakouts", "Sensitivity"],
}

// Old ingredient-rule inference, extracted into its own helper
function inferConcernsFromRules(product: Product): string[] {
  const haystacks = [
    (product.name || "").toLowerCase(),
    (product.description || "").toLowerCase(),
    ...(product.ingredients || []).map((s: string) => (s || "").toLowerCase()),
  ]

  const hits: string[] = []
  for (const rule of INGREDIENT_RULES) {
    if (haystacks.some((t) => rule.test.test(t))) {
      hits.push(...rule.concerns)
    }
  }

  return uniqueOrder(hits)
}

// NEW: unified concern inference using:
// 1) explicit product.concerns
// 2) actives → ACTIVE_CONCERN_MAP
// 3) old INGREDIENT_RULES fallback
function inferConcerns(product: Product): string[] {
  const explicit = (product.concerns || []).filter(Boolean)

  const actives = detectActivesFromProduct(product)
  const fromActives = actives.flatMap((a) => ACTIVE_CONCERN_MAP[a] || [])

  const fromRules = inferConcernsFromRules(product)

  // merge in priority order: explicit > actives > rules
  const merged = uniqueOrder<string>([...explicit, ...fromActives, ...fromRules])

  // display max 5 concerns for UI clarity
  return merged.slice(0, 5)
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

function findRelevantProducts(currentProduct: Product): any[] {
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
    .map((product: any) => {
      let score = 0
      const productConcerns = inferConcerns(product as Product)

      const sharedConcerns = currentConcerns.filter((concern) => productConcerns.includes(concern))
      score += sharedConcerns.length * 3

      const complementary = complementaryCategories[currentCategory] || []
      if (complementary.includes(product.category)) {
        score += 2
      }

      const currentSkin = currentProduct.skinType || currentProduct.skin_type || "All skin types"
      const otherSkin = product.skinType || product.skin_type || "All skin types"

      if (otherSkin === currentSkin || otherSkin === "All skin types" || currentSkin === "All skin types") {
        score += 1
      }

      const currentIndex = routineOrder.indexOf(currentCategory)
      const productIndex = routineOrder.indexOf(product.category)
      if (currentIndex !== -1 && productIndex !== -1) {
        const distance = Math.abs(currentIndex - productIndex)
        if (distance === 1) score += 2
        else if (distance === 2) score += 1
      }

      const currentIngredients = (currentProduct.ingredients || []).join(" ").toLowerCase()
      const productIngredients = (product.ingredients || []).join(" ").toLowerCase()

      // Niacinamide + hydrating/barrier partners
      if (
        currentIngredients.includes("niacinamide") &&
        (productIngredients.includes("hyaluronic") || productIngredients.includes("ceramide"))
      ) {
        score += 2
      }

      // Vitamin C + moisturizer/SPF partner
      if (
        /ascorbic|vitamin c/.test(currentIngredients) &&
        (product.category === "Moisturizers" || product.category === "Sunscreens")
      ) {
        score += 2
      }

      // Exfoliant + soothing partner
      if (
        currentCategory === "Exfoliants" &&
        (productIngredients.includes("centella") || productIngredients.includes("panthenol"))
      ) {
        score += 2
      }

      // Cleanser + early routine hydrating step
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

// Helper to get translated array with language suffix
function getTranslatedArray(product: any, field: string, language: string): string[] {
  if (language === "en") {
    return product[field] || []
  }
  const translatedField = `${field}_${language}`
  const translated = product[translatedField]
  if (translated && Array.isArray(translated) && translated.length > 0) {
    if (typeof translated[0] === "string" && translated[0].toLowerCase().includes("delays")) {
      return product[field] || []
    }
    return translated
  }
  return product[field] || []
}

// Helper to get translated string with language suffix
function getTranslatedString(product: any, field: string, language: string): string {
  if (language === "en") {
    return product[field] || ""
  }
  const translatedField = `${field}_${language}`
  const translated = product[translatedField]
  if (translated && typeof translated === "string" && !translated.toLowerCase().includes("delays")) {
    return translated
  }
  return product[field] || ""
}

// Client Component for interactivity
const ProductPageClient = ({ product, productId }: { product: Product; productId: string }) => {
  const { t, language } = useTranslation()
  const { addItem, toggleCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [stockStatus, setStockStatus] = useState<{ inStock: boolean; stock: number; lowStockThreshold: number }>({
    inStock: product.in_stock ?? product.inStock ?? true,
    stock: product.stock ?? 100,
    lowStockThreshold: 10,
  })

  const productName = getTranslatedString(product, "name", language)
  const productDescription = getTranslatedString(product, "description", language)
  const productBenefits = getTranslatedArray(product, "benefits", language)
  const productHowToUse = getTranslatedArray(product, "how_to_use", language)

  const productIngredients = getTranslatedArray(product, "ingredients", language)
  const productSkinType =
    getTranslatedString(product, "skinType", language) || getTranslatedString(product, "skin_type", language)

  const productConcernsTranslated = getTranslatedArray(product, "concerns", language)
  const concerns = productConcernsTranslated.length > 0 ? productConcernsTranslated : inferConcerns(product)

  const isLowStock = stockStatus.stock > 0 && stockStatus.stock <= stockStatus.lowStockThreshold
  const isOutOfStock = !stockStatus.inStock || stockStatus.stock <= 0

  const handleAddToCart = async () => {
    if (isOutOfStock) return

    try {
      const response = await fetch("/api/cart/validate-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      })

      const validation = await response.json()

      if (!validation.available) {
        alert(validation.message)
        return
      }

      const success = await addItem(
        {
          id: product.id,
          name: productName,
          price: product.price,
          image: product.image,
        },
        quantity,
      )

      if (success) {
        toggleCart()
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Failed to add item to cart. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <HeaderWithSearch />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/face-care"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("nav.facecare") || "Back to Face Care"}
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Image */}
          <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={productName}
              fill
              className="object-contain p-8"
              priority
            />
            {product.eco && (
              <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-600">
                <Leaf className="w-3 h-3 mr-1" />
                {t("product.eco") || "ECO"}
              </Badge>
            )}
            {/* Stock Status Badge */}
            {isOutOfStock ? (
              <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600">
                {t("product.outofstock") || "Out of Stock"}
              </Badge>
            ) : isLowStock ? (
              <Badge className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600">
                {t("product.lowstock") || "Low Stock"}
              </Badge>
            ) : (
              <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600">
                {t("product.instock") || "In Stock"}
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{productName}</h1>
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
              <p className="text-2xl font-bold text-rose-600">{product.price}</p>
            </div>

            <p className="text-muted-foreground">{productDescription}</p>

            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">{t("product.size") || "Size"}:</span> {product.size}
              </p>
              <p className="text-sm">
                <span className="font-medium">{t("product.skintype") || "Skin Type"}:</span> {productSkinType}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium">{t("product.quantity") || "Quantity"}:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} disabled={isOutOfStock}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              className="w-full bg-rose-600 hover:bg-rose-700"
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? t("product.outofstock") || "Out of Stock" : t("product.addtocart") || "Add to Cart"}
            </Button>

            {isOutOfStock && (
              <p className="text-sm text-red-600 text-center">
                {t("product.unavailable") || "This product is currently out of stock"}
              </p>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
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
            {productHowToUse.length > 0 ? (
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
            ) : (
              <p className="text-gray-500 italic">No usage instructions available.</p>
            )}
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-4 pt-6">
            <h3 className="text-xl font-semibold">{t("product.keyingredients") || "Key Ingredients"}</h3>
            <div className="flex flex-wrap gap-2">
              {productIngredients.map((ingredient, index) => (
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
                <Badge key={index} variant="outline" className={`${badgeClassForConcern(concern)} border-rose-200`}>
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

export default ProductPageClient
