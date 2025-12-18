"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/hooks/use-translation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Package, ShoppingCart, Heart } from "lucide-react"
import Image from "next/image"

interface Profile {
  full_name: string
  phone: string
  email: string
}

interface Order {
  id: string
  created_at: string
  total: number
  status: string
}

interface WishlistItem {
  id: string
  product_id: string
  products: {
    id: string
    name: string
    price: number
    image_url: string
  }
}

interface SavedCartItem {
  id: string
  product_id: string
  quantity: number
  products: {
    id: string
    name: string
    price: number
    image_url: string
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
  const [savedCart, setSavedCart] = useState<SavedCartItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")

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
      fetchSavedCart()
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
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
    if (data) setOrders(data)
  }

  const fetchWishlist = async () => {
    const { data } = await supabase
      .from("wishlists")
      .select("id, product_id, products(id, name, price, image_url)")
      .eq("user_id", user?.id)
    if (data) setWishlist(data as any)
  }

  const fetchSavedCart = async () => {
    const { data } = await supabase
      .from("saved_carts")
      .select("id, product_id, quantity, products(id, name, price, image_url)")
      .eq("user_id", user?.id)
    if (data) setSavedCart(data as any)
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("profile.title")}</h1>
        <Button variant="outline" onClick={signOut}>
          {t("auth.logout")}
        </Button>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">
            <User className="w-4 h-4 mr-2" />
            {t("profile.account")}
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="w-4 h-4 mr-2" />
            {t("profile.orders")}
          </TabsTrigger>
          <TabsTrigger value="cart">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t("profile.cart")}
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
              <CardDescription>View your order history</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground">{t("profile.noorders")}</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {t("profile.order")} #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">AMD {order.total}</p>
                        <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cart">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.cart")}</CardTitle>
              <CardDescription>Items saved in your cart</CardDescription>
            </CardHeader>
            <CardContent>
              {savedCart.length === 0 ? (
                <p className="text-muted-foreground">{t("profile.nocart")}</p>
              ) : (
                <div className="space-y-4">
                  {savedCart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <Image
                        src={item.products.image_url || "/placeholder.svg"}
                        alt={item.products.name}
                        width={80}
                        height={80}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.products.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        <p className="font-medium mt-2">AMD {item.products.price}</p>
                      </div>
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
                        src={item.products.image_url || "/placeholder.svg"}
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
