"use client"

import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/footer"
import { HeaderWithSearch } from "@/components/header-with-search"
import { useTranslation } from "@/hooks/use-translation"

export default function ContactPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithSearch />

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">{t("contact.title")}</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">{t("contact.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("contact.form")}</h2>
              <p className="text-gray-600 mb-8">{t("contact.form.desc")}</p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("contact.form.firstname")}</Label>
                  <Input id="firstName" placeholder={t("contact.form.firstname.placeholder")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("contact.form.lastname")}</Label>
                  <Input id="lastName" placeholder={t("contact.form.lastname.placeholder")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("contact.form.email")}</Label>
                <Input id="email" type="email" placeholder={t("contact.form.email.placeholder")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                <Input id="phone" type="tel" placeholder={t("contact.form.phone.placeholder")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">{t("contact.form.subject")}</Label>
                <Input id="subject" placeholder={t("contact.form.subject.placeholder")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("contact.form.message")}</Label>
                <Textarea id="message" placeholder={t("contact.form.message.placeholder")} className="min-h-[120px]" />
              </div>

              <Button size="lg" className="w-full bg-gray-900 hover:bg-gray-800">
                {t("contact.form.send")}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("contact.info")}</h2>
              <p className="text-gray-600 mb-8">{t("contact.info.desc")}</p>
            </div>

            <div className="space-y-6">
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-rose-600" />
                    <span>{t("contact.info.address")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-line">{t("contact.info.address.value")}</p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-rose-600" />
                    <span>{t("contact.info.phone")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-line">{t("contact.info.phone.value")}</p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-rose-600" />
                    <span>{t("contact.info.email")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-line">{t("contact.info.email.value")}</p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-rose-600" />
                    <span>{t("contact.info.hours")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-line">{t("contact.info.hours.value")}</p>
                </CardContent>
              </Card>
            </div>

            {/* Social Media */}
            <div className="bg-gray-50 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("contact.social")}</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-sm font-medium">IG</span>
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-sm font-medium">TT</span>
                </a>
              </div>
              <p className="text-sm text-gray-600 mt-4">{t("contact.social.desc")}</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("contact.faq")}</h2>
            <p className="text-lg text-gray-600">{t("contact.faq.desc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("contact.faq.q1")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t("contact.faq.a1")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("contact.faq.q2")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t("contact.faq.a2")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("contact.faq.q3")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t("contact.faq.a3")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("contact.faq.q4")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t("contact.faq.a4")}</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
