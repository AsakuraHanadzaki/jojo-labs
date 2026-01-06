"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CreditCard, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/shopping-cart"
import { HeaderWithSearch } from "@/components/header-with-search"
import { Footer } from "@/components/footer"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const { t } = useTranslation()
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    if (data) {
      const fullName = data.full_name || ""
      const nameParts = fullName.split(" ")
      setFirstName(nameParts[0] || "")
      setLastName(nameParts.slice(1).join(" ") || "")
      setPhone(data.phone || "")
    }
  }

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      const price = Number.parseFloat(item.price.replace("AMD", "").replace(",", ""))
      return total + price * item.quantity
    }, 0)
  }

  const getShippingCost = () => {
    const total = getTotalPrice()
    return total >= 5000 ? 0 : 500
  }

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCost()
  }

  const handleCompleteOrder = async () => {
    setIsSubmitting(true)

    try {
      const total = getFinalTotal()

      // Create order in Supabase
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          customer_name: `${firstName} ${lastName}`.trim(),
          customer_email: email,
          customer_phone: phone,
          total: total,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      // Create order items
      if (order) {
        const orderItems = state.items.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price: Number.parseFloat(item.price.replace("AMD", "").replace(",", "")),
        }))

        await supabase.from("order_items").insert(orderItems)
      }

      // Clear cart
      clearCart()

      // Clear saved cart in database if logged in
      if (user) {
        await supabase.from("saved_carts").delete().eq("user_id", user.id)
      }

      // Redirect to success page
      router.push("/checkout/success")
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Failed to complete order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithSearch />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("checkout.continue")}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("checkout.title")}</h1>
              <p className="text-gray-600">{t("checkout.desc")}</p>
            </div>

            {/* Contact Information */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>{t("checkout.contact")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("checkout.firstname")}</Label>
                    <Input
                      id="firstName"
                      placeholder={t("checkout.firstname.placeholder")}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("checkout.lastname")}</Label>
                    <Input
                      id="lastName"
                      placeholder={t("checkout.lastname.placeholder")}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("checkout.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("checkout.email.placeholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("checkout.phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("checkout.phone.placeholder")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>{t("checkout.shipping")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">{t("checkout.address")}</Label>
                  <Input id="address" placeholder={t("checkout.address.placeholder")} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("checkout.city")}</Label>
                    <Input id="city" placeholder={t("checkout.city.placeholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{t("checkout.postal")}</Label>
                    <Input id="postalCode" placeholder={t("checkout.postal.placeholder")} />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-3xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">{t("checkout.glovo")}</span>
                  </div>
                  <p className="text-sm text-green-700">{t("checkout.glovo.desc")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>{t("checkout.payment")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-3xl">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>{t("checkout.card")}</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">{t("checkout.cardnumber")}</Label>
                      <Input id="cardNumber" placeholder={t("checkout.cardnumber.placeholder")} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">{t("checkout.expiry")}</Label>
                        <Input id="expiry" placeholder={t("checkout.expiry.placeholder")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">{t("checkout.cvv")}</Label>
                        <Input id="cvv" placeholder={t("checkout.cvv.placeholder")} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-8">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>{t("checkout.summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {t("checkout.qty")}: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">
                      AMD
                      {(
                        Number.parseFloat(item.price.replace("AMD", "").replace(",", "")) * item.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("checkout.subtotal")}</span>
                    <span>AMD{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("checkout.shipping")}</span>
                    <span>{getShippingCost() === 0 ? t("checkout.free") : `AMD${getShippingCost()}`}</span>
                  </div>
                  {getShippingCost() === 0 && <p className="text-xs text-green-600">{t("checkout.freeshipping")}</p>}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>{t("checkout.total")}</span>
                  <span>AMD{getFinalTotal().toLocaleString()}</span>
                </div>

                <Button
                  className="w-full bg-gray-900 hover:bg-gray-800 mt-6"
                  onClick={handleCompleteOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : t("checkout.complete")}
                </Button>

                <div className="text-center text-xs text-gray-500 mt-4">
                  <p>{t("checkout.terms")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
