"use client"

// Homepage - Updated March 2026
import Link from "next/link"
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { HeaderWithSearch } from "@/components/header-with-search"
import { ConcernSelector } from "@/components/concern-selector"
import { useTranslation } from "@/hooks/use-translation"
import { fetchFeaturedProducts, getTranslatedField } from "@/lib/products-service"
import type { Product } from "@/lib/supabase/types"
import { useEffect, useState } from "react"

function ProductImage({ product, language }: { product: Product; language: string }) {
  const [imgSrc, setImgSrc] = useState(product.image || "/placeholder.svg")
  const [hasError, setHasError] = useState(false)

  // Update when product.image changes
  useEffect(() => {
    if (product.image && product.image !== "/placeholder.svg") {
      setImgSrc(product.image)
      setHasError(false)
    }
  }, [product.image])
  
  return (
    <img
      src={hasError ? "/placeholder.svg" : imgSrc}
      alt={getTranslatedField(product, "name", language)}
      className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
      onError={() => {
        setHasError(true)
        setImgSrc("/placeholder.svg")
      }}
      loading="lazy"
    />
  )
}

export default function HomePage() {
  const { t, language } = useTranslation()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const featured = await fetchFeaturedProducts(3)
        setFeaturedProducts(featured)
      } catch (error) {
        console.error("Error loading featured products:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithSearch />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ConcernSelector />

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t("home.facecare")}</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{t("common.loading") || "Loading..."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group">
                  <div className="bg-gradient-to-br from-rose-50 to-pink-100 rounded-3xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl bg-white">
                      <ProductImage product={product} language={language} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-rose-600 transition-colors">
                      {getTranslatedField(product, "name", language)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {getTranslatedField(product, "description", language)}
                    </p>
                    <p className="font-bold text-gray-900">{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="text-center mb-16">
          <Link href="/face-care">
            <Button
              size="lg"
              variant="outline"
              className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-3 text-sm font-medium tracking-wide bg-transparent"
            >
              {t("home.seeMoreProducts") || "See More Products"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <section className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-3xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left: message + CTA */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span className="text-sm font-medium text-sky-700">{t("home.rf.badge")}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 text-balance leading-tight">
                {t("home.rf.title")}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-pretty">{t("home.rf.desc")}</p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  {t("home.rf.trust1")}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  {t("home.rf.trust2")}
                </div>
              </div>
              <Link href="/routine-finder">
                <Button
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-sm font-medium tracking-wide"
                >
                  {t("home.cta.discover")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Right: how it works steps */}
            <div className="flex flex-col gap-4">
              {[
                { title: t("home.rf.step1.title"), desc: t("home.rf.step1.desc") },
                { title: t("home.rf.step2.title"), desc: t("home.rf.step2.desc") },
                { title: t("home.rf.step3.title"), desc: t("home.rf.step3.desc") },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 bg-white rounded-2xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
