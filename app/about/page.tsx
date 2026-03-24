"use client"

import Image from "next/image"
import Link from "next/link"
import { Truck, Eye, Heart, Award } from "lucide-react"
import { Footer } from "@/components/footer"
import { HeaderWithSearch } from "@/components/header-with-search"
import { useTranslation } from "@/hooks/use-translation"

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithSearch />

      {/* Page Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">{t("about.title")}</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">{t("about.subtitle")}</p>
        </div>

        {/* Story Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">{t("about.story")}</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{t("about.story.p1")}</p>
                <p>{t("about.story.p2")}</p>
                <p>{t("about.story.p3")}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-100 to-pink-200 rounded-3xl p-6 overflow-hidden">
              <Image
                src="/images/team-photo.png"
                alt="JoJo Labs Team"
                width={500}
                height={350}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </section>

        {/* Delivery Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 lg:p-12">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{t("about.delivery")}</h2>
                <p className="text-lg text-gray-600">{t("about.delivery.subtitle")}</p>
              </div>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{t("about.delivery.p1")}</p>
              <p>{t("about.delivery.p2")}</p>
              <div className="bg-white rounded-2xl p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">{t("about.delivery.info")}</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    • <strong>{t("about.delivery.yerevan")}</strong>
                  </li>
                  <li>
                    • <strong>{t("about.delivery.cities")}</strong>
                  </li>
                  <li>
                    • <strong>{t("about.delivery.armenia")}</strong>
                  </li>
                  <li>
                    • <strong>{t("about.delivery.free")}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t("about.values")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{t("about.values.transparency")}</h3>
              <p className="text-gray-600">{t("about.values.transparency.desc")}</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{t("about.values.personalization")}</h3>
              <p className="text-gray-600">{t("about.values.personalization.desc")}</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{t("about.values.efficiency")}</h3>
              <p className="text-gray-600">{t("about.values.efficiency.desc")}</p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gray-50 rounded-3xl p-8 lg:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("about.contact")}</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">{t("about.contact.desc")}</p>
          <div className="mb-6">
            <p className="text-gray-600">
              hello@jojolabs.com
              <br />
              support@jojolabs.com
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {t("about.contact.cta")}
            </Link>
            <Link
              href="/routine-finder"
              className="border border-gray-300 text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {t("about.contact.routine")}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
