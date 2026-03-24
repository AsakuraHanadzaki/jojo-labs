"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/hooks/use-translation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Package, Heart, ChevronDown, ChevronUp, Star, CheckCircle } from "lucide-react"
import Image from "next/image"
import { ProductRatingDialog } from "@/components/product-rating-dialog"

interface Profile {
  full_name: string
  phone: string
  email: string
}

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_image: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  created_at: string
  total: number
  status: string
  customer_name: string
  customer_email: string
  order_items?: OrderItem[]
}

interface ProductRating {
  id: string
  product_id: string
  order_id: string
  rating: number
}

interface WishlistItem {
  id: string
  product_id: string
  products: {
    id: string
    name: string
    price: number
    image: string
  }
}

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [userRatings, setUserRatings] = useState<ProductRating[]>([])
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchOrders()
      fetchWishlist()
    }
  }, [user])

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", user?.id).single()
    if (data) {
      setProfile(data)
      setFullName(data.full_name || "")
      setPhone(data.phone || "")
    }
  }

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
    if (data) setOrders(data)
    
    // Also fetch user's ratings
    const { data: ratings } = await supabase
      .from("product_ratings")
      .select("id, product_id, order_id, rating")
    if (ratings) setUserRatings(ratings)
  }

  const toggleOrderExpanded = async (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const hasRatedProduct = (orderId: string, productId: string) => {
    return userRatings.some(r => r.order_id === orderId && r.product_id === productId)
  }

  const handleRatingSubmitted = () => {
    fetchOrders()
  }

  const fetchWishlist = async () => {
    console.log("[v0] fetchWishlist: Starting for user", user?.id)
    const { data, error } = await supabase
      .from("wishlists")
      .select("id, product_id, products(id, name, price, image)")
      .eq("user_id", user?.id)
    console.log("[v0] fetchWishlist: Result", { data, error })
    if (data) setWishlist(data as any)
  }

  const handleSaveProfile = async () => {
    await supabase.from("profiles").update({ full_name: fullName, phone: phone }).eq("id", user?.id)
    setIsEditing(false)
    fetchProfile()
  }

  const removeFromWishlist = async (id: string) => {
    await supabase.from("wishlists").delete().eq("id", id)
    fetchWishlist()
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold">{t("profile.title")}</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/">{t("profile.backToStore")}</Link>
          </Button>
          <Button variant="outline" onClick={signOut}>
            {t("auth.logout")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">
            <User className="w-4 h-4 mr-2" />
            {t("profile.account")}
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="w-4 h-4 mr-2" />
            {t("profile.orders")}
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Heart className="w-4 h-4 mr-2" />
            {t("profile.wishlist")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.details")}</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" type="email" value={user.email} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName">{t("auth.fullname")}</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} />
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile}>{t("profile.save")}</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)}>{t("profile.edit")}</Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.orders")}</CardTitle>
              <CardDescription>{t("profile.orderHistoryDesc") || "View your order history and rate delivered products"}</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground">{t("profile.noorders")}</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg overflow-hidden">
                      {/* Order Header */}
                      <button
                        onClick={() => toggleOrderExpanded(order.id)}
                        className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-left">
                          <p className="font-medium">
                            {t("profile.order")} #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">AMD {order.total}</p>
                            <p className={`text-sm capitalize ${
                              order.status === "delivered" 
                                ? "text-green-600" 
                                : order.status === "cancelled" 
                                  ? "text-red-600" 
                                  : "text-muted-foreground"
                            }`}>
                              {order.status}
                            </p>
                          </div>
                          {expandedOrders.has(order.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Order Items (Expanded) */}
                      {expandedOrders.has(order.id) && order.order_items && (
                        <div className="border-t bg-gray-50 p-4">
                          <p className="text-sm font-medium mb-3">{t("profile.orderItems") || "Order Items"}</p>
                          <div className="space-y-3">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-lg">
                                <img
                                  src={item.product_image || "/placeholder.svg"}
                                  alt={item.product_name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{item.product_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.quantity} × AMD {item.unit_price}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">AMD {item.total_price}</p>
                                  {/* Rating Section */}
                                  {order.status === "delivered" && (
                                    <div className="mt-2">
                                      {hasRatedProduct(order.id, item.product_id) ? (
                                        <span className="inline-flex items-center text-sm text-green-600">
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          {t("rating.rated") || "Rated"}
                                        </span>
                                      ) : (
                                        <ProductRatingDialog
                                          productId={item.product_id}
                                          productName={item.product_name}
                                          orderId={order.id}
                                          reviewerName={order.customer_name}
                                          reviewerEmail={order.customer_email}
                                          onRatingSubmitted={handleRatingSubmitted}
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          {order.status === "delivered" && (
                            <p className="text-xs text-muted-foreground mt-3">
                              {t("rating.deliveredNote") || "You can rate products from delivered orders"}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.wishlist")}</CardTitle>
              <CardDescription>Your favorite products</CardDescription>
            </CardHeader>
            <CardContent>
              {wishlist.length === 0 ? (
                <p className="text-muted-foreground">{t("profile.nowishlist")}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <Image
                        src={item.products.image || "/placeholder.svg"}
                        alt={item.products.name}
                        width={80}
                        height={80}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.products.name}</p>
                        <p className="font-medium mt-2">AMD {item.products.price}</p>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" onClick={() => removeFromWishlist(item.id)}>
                            {t("profile.removefromwishlist")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
