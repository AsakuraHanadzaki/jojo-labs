"use client"

import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product-card"
import { Footer } from "@/components/footer"
import { HeaderWithSearch } from "@/components/header-with-search"
import { useCart } from "@/components/shopping-cart"
import { allProducts } from "@/lib/all-products" // Import allProducts

// --- Skin Concern inference helpers -----------------------------------------

type ProductT = (typeof allProducts)[keyof typeof allProducts]

// Map ingredient keywords/regex → concerns
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

// Category fallback so every page shows something useful
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

  // If nothing from ingredients, fall back to category defaults
  const withFallback =
    hits.length > 0
      ? hits
      : (CATEGORY_FALLBACK[product.category as keyof typeof CATEGORY_FALLBACK] ?? [
          "Dehydration",
          "Barrier Support",
          "Dullness",
        ])

  // Tidy up & cap the list
  return uniqueOrder(withFallback).slice(0, MAX_CONCERNS)
}

// Badge color rules by concern theme
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

// Function to find relevant products based on routine logic
function findRelevantProducts(currentProduct: ProductT): ProductT[] {
  const allProductsArray = Object.values(allProducts)
  const currentConcerns = inferConcerns(currentProduct)
  const currentCategory = currentProduct.category

  // Define routine order and complementary categories
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

  // Score products based on relevance
  const scoredProducts = allProductsArray
    .filter((product) => product.id !== currentProduct.id) // Exclude current product
    .map((product) => {
      let score = 0
      const productConcerns = inferConcerns(product)

      // 1. Shared concerns (highest priority)
      const sharedConcerns = currentConcerns.filter((concern) => productConcerns.includes(concern))
      score += sharedConcerns.length * 3

      // 2. Complementary categories
      const complementary = complementaryCategories[currentCategory] || []
      if (complementary.includes(product.category)) {
        score += 2
      }

      // 3. Same skin type compatibility
      if (
        product.skinType === currentProduct.skinType ||
        product.skinType === "All skin types" ||
        currentProduct.skinType === "All skin types"
      ) {
        score += 1
      }

      // 4. Routine logic - prefer products that come before/after in routine
      const currentIndex = routineOrder.indexOf(currentCategory)
      const productIndex = routineOrder.indexOf(product.category)
      if (currentIndex !== -1 && productIndex !== -1) {
        const distance = Math.abs(currentIndex - productIndex)
        if (distance === 1)
          score += 2 // Adjacent in routine
        else if (distance === 2) score += 1 // Close in routine
      }

      // 5. Special ingredient synergies
      const currentIngredients = currentProduct.ingredients.join(" ").toLowerCase()
      const productIngredients = product.ingredients.join(" ").toLowerCase()

      // Niacinamide pairs well with hyaluronic acid, ceramides
      if (
        currentIngredients.includes("niacinamide") &&
        (productIngredients.includes("hyaluronic") || productIngredients.includes("ceramide"))
      ) {
        score += 2
      }

      // Vitamin C pairs well with moisturizers and sunscreens
      if (
        currentIngredients.includes("ascorbic") &&
        (product.category === "Moisturizers" || product.category === "Sunscreens")
      ) {
        score += 2
      }

      // Exfoliants need soothing follow-ups
      if (
        currentCategory === "Exfoliants" &&
        (productIngredients.includes("centella") || productIngredients.includes("panthenol"))
      ) {
        score += 2
      }

      // Cleansers should be followed by hydrating products
      if (currentCategory === "Cleansers" && (product.category === "Toners" || product.category === "Essences")) {
        score += 2
      }

      return { product, score }
    })
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, 6) // Take top 6 candidates
    .map((item) => item.product)

  // Ensure we have at least 3 products, fill with popular items if needed
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

  return scoredProducts.slice(0, 3) // Return top 3
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const { dispatch } = useCart()

  // Move product lookup to the very beginning
  const product = allProducts[params.id as keyof typeof allProducts]

  // Early return if product not found
  if (!product) {
    notFound()
  }

  // Get relevant products based on the current product
  const relatedProducts = findRelevantProducts(product)

  const addToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithSearch />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={
              product.category === "Lips" || product.category === "Eyes" || product.category === "Face"
                ? "/makeup"
                : "/face-care"
            }
            className="hover:text-gray-900"
          >
            {product.category === "Lips" || product.category === "Eyes" || product.category === "Face"
              ? "Make-up"
              : "Face Care"}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
      </div>

      {/* Product Details */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image */}
          <div className="space-y-6">
            <div className="aspect-[3/4] bg-gradient-to-br from-rose-50 to-pink-100 rounded-3xl p-8 relative">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={400}
                height={600}
                className="w-full h-full object-contain"
              />
              {product.eco && <Badge className="absolute top-4 left-4 bg-green-600 hover:bg-green-700">ECO</Badge>}
            </div>

            {/* Product Highlights */}
            <div className="bg-gray-50 rounded-3xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Why You'll Love It</h3>
              <ul className="space-y-3">
                {product.benefits.slice(0, 5).map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-xs font-medium">
                  {product.category}
                </Badge>
                {product.inStock && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>}
                {product.eco && (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Eco-Friendly</Badge>
                )}
              </div>

              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline space-x-4 mb-6">
                  <span className="text-3xl font-bold text-gray-900">{product.price}</span>
                  <span className="text-sm text-gray-500">• {product.size}</span>
                </div>
              </div>

              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Skin Type</h4>
                <p className="text-gray-700">{product.skinType}</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Texture</h4>
                <p className="text-gray-700">
                  {product.category === "Serums"
                    ? "Lightweight, fast-absorbing serum"
                    : product.category === "Essences"
                      ? "Viscous, hydrating essence"
                      : product.category === "Cleansers"
                        ? "Gentle, low-foam gel"
                        : product.category === "Toners"
                          ? "Refreshing, watery texture"
                          : product.category === "Treatments"
                            ? "Targeted treatment formula"
                            : product.category === "Masks"
                              ? "Rich, nourishing cream"
                              : product.category === "Sunscreen"
                                ? "Lightweight, non-greasy"
                                : product.category === "Ampoules"
                                  ? "Concentrated, silky texture"
                                  : "Smooth, comfortable application"}
                </p>
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="space-y-6 border-t border-gray-200 pt-8">
              <div className="flex space-x-4">
                <Button
                  size="lg"
                  className="flex-1 bg-gray-900 hover:bg-gray-800 h-14 text-base font-medium"
                  onClick={addToCart}
                >
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" className="p-4 bg-transparent border-2">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="p-4 bg-transparent border-2">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">✓ Free shipping on orders over AMD 5,000</p>
                <p className="text-sm text-green-700 mt-1">✓ Same-day delivery available in Yerevan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Product Information Tabs */}
        <div className="mt-16 border-t border-gray-200 pt-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column */}
              <div className="space-y-10">
                {/* How to Use */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">How to Use</h3>
                  <div className="space-y-4">
                    {product.howToUse.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skin Concerns */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Addresses These Concerns</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {inferConcerns(product).map((concern) => (
                      <div
                        key={concern}
                        className={`${badgeClassForConcern(concern)} px-3 py-2 rounded-lg text-sm font-medium`}
                      >
                        {concern}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-10">
                {/* Key Ingredients */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Key Ingredients</h3>
                  <div className="space-y-4">
                    {product.ingredients.slice(0, 6).map((ingredient, index) => (
                      <div key={index} className="border border-gray-200 rounded-3xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{ingredient}</h4>
                        <p className="text-sm text-gray-600">
                          {ingredient.includes("Niacinamide") &&
                            "A form of Vitamin B3 that helps regulate oil production, brighten skin, and strengthen the skin barrier."}
                          {ingredient.includes("Zinc PCA") &&
                            "Regulates oil production and has anti-inflammatory properties"}
                          {ingredient.includes("Hyaluronic") &&
                            "A powerful humectant that attracts and retains up to 1000x its weight in water for deep hydration."}
                          {ingredient.includes("Glycolic") &&
                            "An alpha hydroxy acid (AHA) that gently exfoliates dead skin cells for smoother, more radiant skin."}
                          {ingredient.includes("Retinol") &&
                            "A vitamin A derivative that promotes cell turnover, boosts collagen production, and smooths fine lines."}
                          {ingredient.includes("Centella") &&
                            "A soothing botanical rich in asiaticoside and madecassoside, known to calm inflammation and promote healing."}
                          {ingredient.includes("Tea Tree") &&
                            "Natural antibacterial and anti-inflammatory properties help reduce acne and purify skin."}
                          {ingredient.includes("Rice") &&
                            "Rich in vitamins, minerals, and amino acids to nourish, hydrate, and brighten skin."}
                          {ingredient.includes("Heartleaf") &&
                            "Derived from Houttuynia Cordata, helps reduce redness, soothe irritation, and balance oil production."}
                          {ingredient.includes("Panthenol") &&
                            "Also known as Vitamin B5, deeply hydrates and soothes, supporting a healthy skin barrier."}
                          {ingredient.includes("Ceramide") &&
                            "Lipids that reinforce the skin barrier, lock in moisture, and protect from environmental stressors."}
                          {ingredient.includes("Squalane") &&
                            "A lightweight, non-comedogenic oil that moisturizes and balances without clogging pores."}
                          {ingredient.includes("Allantoin") &&
                            "A calming agent that soothes irritation and promotes skin healing."}
                          {ingredient.includes("Olea Europaea") &&
                            "Olive fruit oil rich in antioxidants and fatty acids to nourish and soften skin."}
                          {ingredient.includes("Macadamia") &&
                            "Macadamia seed oil is rich in oleic acid and palmitoleic acid to deeply nourish dry skin."}
                          {ingredient.includes("Lactobacillus") &&
                            "Fermented probiotic ingredient that strengthens skin barrier and supports a healthy microbiome."}
                          {ingredient.includes("Isoamyl p-Methoxycinnamate") &&
                            "A UV filter that helps protect skin from sun damage."}
                          {ingredient.includes("Salicylic") &&
                            "A beta hydroxy acid (BHA) that exfoliates inside pores to reduce acne and congestion."}
                          {ingredient.includes("LHA") &&
                            "Lipo-Hydroxy Acid, a gentle derivative of salicylic acid that exfoliates and smooths skin."}
                          {ingredient.includes("Kaolin") &&
                            "A natural clay that absorbs excess oil and impurities while being gentle on skin."}
                          {ingredient.includes("Bakuchiol") &&
                            "A plant-based retinol alternative that smooths fine lines and improves firmness with less irritation."}
                          {ingredient.includes("Peptide") &&
                            "Short chains of amino acids that support collagen production and improve skin elasticity."}
                          {ingredient.includes("Beta-Glucan") &&
                            "A polysaccharide that soothes irritation, hydrates deeply, and supports skin repair."}
                          {ingredient.includes("Aloe") &&
                            "Aloe vera extract hydrates, soothes, and helps calm redness."}
                          {ingredient.includes("Hydrolyzed Collagen") &&
                            "Collagen broken down into smaller molecules to help plump and firm the skin."}
                          {ingredient.includes("Sedum") &&
                            "A succulent plant extract that hydrates, soothes, and strengthens the skin barrier."}
                          {ingredient.includes("Morinda Citrifolia") &&
                            "Also known as Noni, an antioxidant-rich fruit extract that calms and nourishes skin."}
                          {ingredient.includes("Ascorbic Acid") &&
                            "Vitamin C, a potent antioxidant that brightens skin, evens tone, and supports collagen."}
                          {ingredient.includes("Tocopherol") &&
                            "Vitamin E, an antioxidant that protects against free radicals and nourishes skin."}
                          {ingredient.includes("Bifida Ferment Lysate") &&
                            "A probiotic ferment that strengthens the skin barrier and improves resilience."}
                          {ingredient.includes("Hydrolyzed Sponge") &&
                            "Micro-spicule technology that gently stimulates skin to enhance absorption of actives."}
                          {ingredient.includes("Glycerin") &&
                            "A humectant that draws moisture into the skin and keeps it hydrated."}
                          {ingredient.includes("Adenosine") &&
                            "A skin-soothing and anti-aging ingredient that helps smooth fine lines."}
                          {ingredient.includes("Oryza Sativa") &&
                            "Rice extract rich in antioxidants, amino acids, and minerals for brightening and nourishing."}
                          {ingredient.includes("Papaya") &&
                            "Contains natural enzymes (papain) to gently exfoliate dead skin cells and promote smooth skin."}
                          {ingredient.includes("Artemisia") &&
                            "Mugwort extract that calms irritation, soothes sensitivity, and provides antioxidant benefits."}
                          {ingredient.includes("Camellia Sinensis") &&
                            "Green tea extract, rich in antioxidants, helps reduce redness and protect from environmental stressors."}
                          {ingredient.includes("Bambusa") &&
                            "Bamboo water helps hydrate, soothe, and strengthen the skin barrier."}
                          {ingredient.includes("Ceramide NP") &&
                            "A type of ceramide that replenishes the skin barrier and improves moisture retention."}
                          {!(
                            ingredient.includes("Niacinamide") ||
                            ingredient.includes("Hyaluronic") ||
                            ingredient.includes("Glycolic") ||
                            ingredient.includes("Retinol") ||
                            ingredient.includes("Centella") ||
                            ingredient.includes("Tea Tree") ||
                            ingredient.includes("Rice") ||
                            ingredient.includes("Heartleaf") ||
                            ingredient.includes("Panthenol") ||
                            ingredient.includes("Ceramide") ||
                            ingredient.includes("Squalane") ||
                            ingredient.includes("Allantoin") ||
                            ingredient.includes("Olea Europaea") ||
                            ingredient.includes("Macadamia") ||
                            ingredient.includes("Lactobacillus") ||
                            ingredient.includes("Isoamyl p-Methoxycinnamate") ||
                            ingredient.includes("Salicylic") ||
                            ingredient.includes("LHA") ||
                            ingredient.includes("Kaolin") ||
                            ingredient.includes("Bakuchiol") ||
                            ingredient.includes("Peptide") ||
                            ingredient.includes("Beta-Glucan") ||
                            ingredient.includes("Aloe") ||
                            ingredient.includes("Hydrolyzed Collagen") ||
                            ingredient.includes("Sedum") ||
                            ingredient.includes("Morinda Citrifolia") ||
                            ingredient.includes("Ascorbic Acid") ||
                            ingredient.includes("Tocopherol") ||
                            ingredient.includes("Bifida Ferment Lysate") ||
                            ingredient.includes("Hydrolyzed Sponge") ||
                            ingredient.includes("Glycerin") ||
                            ingredient.includes("Adenosine") ||
                            ingredient.includes("Oryza Sativa") ||
                            ingredient.includes("Papaya") ||
                            ingredient.includes("Artemisia") ||
                            ingredient.includes("Camellia Sinensis") ||
                            ingredient.includes("Bambusa") ||
                            ingredient.includes("Ceramide NP")
                          ) && "A carefully selected ingredient chosen for its proven skin benefits."}
                        </p>
                      </div>
                    ))}
                    {product.ingredients.length > 6 && (
                      <p className="text-sm text-gray-500 italic">
                        + {product.ingredients.length - 6} more ingredients
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Product Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Size</span>
                      <span className="text-gray-700">{product.size}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Skin Type</span>
                      <span className="text-gray-700">{product.skinType}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Category</span>
                      <span className="text-gray-700">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-900">pH Level</span>
                      <span className="text-gray-700">
                        {product.category === "Cleansers"
                          ? "5.0-6.0"
                          : product.category === "Toners"
                            ? "5.5-6.5"
                            : product.category === "Treatments" && product.name.includes("AHA")
                              ? "3.5-4.0"
                              : "6.0-7.0"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="font-medium text-gray-900">Cruelty-Free</span>
                      <span className="text-green-600 font-medium">✓ Yes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <section className="mt-20 bg-gray-50 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Routine</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These products work beautifully together to enhance your skincare results and address similar concerns
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <ProductCard {...relatedProduct} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
