"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Sparkles, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { HeaderWithSearch } from "@/components/header-with-search"
import { useTranslation } from "@/hooks/use-translation"

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { t } = useTranslation()

  const heroProducts = [
    {
      image: "/bakuchiol-serum.jpg",
      titleKey: "home.hero.slide1.title",
      descKey: "home.hero.slide1.desc",
      gradient: "from-blue-100 to-indigo-200",
    },
    {
      image: "/snail-mucin-essence.jpg",
      titleKey: "home.hero.slide2.title",
      descKey: "home.hero.slide2.desc",
      gradient: "from-green-100 to-emerald-200",
    },
    {
      image: "/exfoliating-treatment.jpg",
      titleKey: "home.hero.slide3.title",
      descKey: "home.hero.slide3.desc",
      gradient: "from-purple-100 to-pink-200",
    },
    {
      image: "/lip-treatment.jpg",
      titleKey: "home.hero.slide4.title",
      descKey: "home.hero.slide4.desc",
      gradient: "from-rose-100 to-pink-200",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroProducts.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroProducts.length) % heroProducts.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithSearch />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div
              className={`bg-gradient-to-br ${heroProducts[currentSlide].gradient} rounded-3xl p-8 lg:p-12 transition-all duration-500`}
            >
              <div className="relative aspect-square max-w-md mx-auto">
                <Image
                  src={heroProducts[currentSlide].image || "/placeholder.svg"}
                  alt="Featured Product"
                  width={300}
                  height={400}
                  className="w-full h-full object-contain transition-opacity duration-500"
                  priority
                />
              </div>
            </div>

            <div className="flex items-center justify-center mt-6 space-x-2">
              <button onClick={prevSlide} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex space-x-2">
                {heroProducts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? "bg-rose-400" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <button onClick={nextSlide} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight transition-all duration-500">
                {t(heroProducts[currentSlide].titleKey)}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg transition-all duration-500">
                {t(heroProducts[currentSlide].descKey)}
              </p>
            </div>

            <Link href="/routine-finder">
              <Button
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-sm font-medium tracking-wide"
              >
                {t("home.cta.discover")}
              </Button>
            </Link>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">{t("home.categories")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/face-care" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t("home.facecare")}</h3>
                <p className="text-sm text-gray-600">{t("home.facecare.desc")}</p>
              </div>
            </Link>

            <Link href="/routine-finder" className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <Lightbulb className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t("home.routinefinder")}</h3>
                <p className="text-sm text-gray-600">{t("home.routinefinder.desc")}</p>
              </div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
