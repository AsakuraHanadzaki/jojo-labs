"use client"

// Admin panel - Updated March 2026 - Added price editing and product management
import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Package,
  ShoppingCart,
  MessageSquare,
  Star,
  Truck,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Plus,
  Edit,
  EyeOff,
  Trash2,
  Upload,
  ImageIcon,
} from "lucide-react"
import type { Product, Order, CustomerRequest, ProductRating } from "@/lib/supabase/types"
import Link from "next/link"

interface Blog {
  id: string
  slug: string
  title: string
  title_ru?: string
  title_hy?: string
  excerpt: string
  excerpt_ru?: string
  excerpt_hy?: string
  content: string
  content_ru?: string
  content_hy?: string
  featured_image?: string
  author: string
  published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminCode, setAdminCode] = useState("")
  const [authError, setAuthError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [ratings, setRatings] = useState<ProductRating[]>([])
  const [blogs, setBlogs] = useState<Blog[]>([])

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("")
  const [orderFilter, setOrderFilter] = useState("all")
  const [requestFilter, setRequestFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  
  // Image upload states
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null)
  
  // Product editing states
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState<string>("")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    name_ru: "",
    name_hy: "",
    description: "",
    description_ru: "",
    description_hy: "",
    price: "",
    category: "cleansers",
    stock: 100,
    low_stock_threshold: 10,
    in_stock: true,
    image: "/placeholder.svg",
  })
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  const supabase = getSupabaseBrowserClient()

  // Upload product image
  const handleImageUpload = async (productId: string, file: File) => {
    setUploadingProductId(productId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('productId', productId)

      const response = await fetch('/api/upload-product-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Update local state with new image URL
        setProducts(products.map(p => 
          p.id === productId ? { ...p, image: result.url } : p
        ))
        alert('Image uploaded successfully!')
      } else {
        alert('Failed to upload image: ' + result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingProductId(null)
    }
  }

  // Verify admin code
  const handleLogin = async () => {
    setIsLoading(true)
    setAuthError("")

    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "admin_code")
        .single()

      if (error) throw error

      if (data?.setting_value === adminCode) {
        setIsAuthenticated(true)
        sessionStorage.setItem("admin_authenticated", "true")
        loadAllData()
      } else {
        setAuthError("Invalid admin code")
      }
    } catch (error) {
      console.error("Auth error:", error)
      setAuthError("Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Check session on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem("admin_authenticated")
    if (isAuth === "true") {
      setIsAuthenticated(true)
      loadAllData()
    }
  }, [])

  // Load all data
  const loadAllData = async () => {
    loadProducts()
    loadOrders()
    loadRequests()
    loadRatings()
    loadBlogs()
  }

  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("name")
    if (data) setProducts(data)
  }

  const loadOrders = async () => {
    const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false })
    if (data) setOrders(data)
  }

  const loadRequests = async () => {
    const { data } = await supabase.from("customer_requests").select("*").order("created_at", { ascending: false })
    if (data) setRequests(data)
  }

  const loadRatings = async () => {
    const { data } = await supabase.from("product_ratings").select("*").order("created_at", { ascending: false })
    if (data) setRatings(data)
  }

  // Update product stock
  const updateStock = async (productId: string, newStock: number) => {
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock, in_stock: newStock > 0 })
      .eq("id", productId)

    if (!error) {
      setProducts(products.map((p) => (p.id === productId ? { ...p, stock: newStock, in_stock: newStock > 0 } : p)))
    }
  }

  // Update product price
  const updatePrice = async (productId: string, newPrice: string) => {
    const { error } = await supabase
      .from("products")
      .update({ price: newPrice })
      .eq("id", productId)

    if (!error) {
      setProducts(products.map((p) => (p.id === productId ? { ...p, price: newPrice } : p)))
      setEditingPriceId(null)
      setEditingPrice("")
    }
  }

  // Add new product
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Please fill in product name and price")
      return
    }

    setIsAddingProduct(true)
    try {
      // Generate a URL-friendly ID from the product name
      const productId = newProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        + "-" + Date.now().toString(36)

      const { data, error } = await supabase
        .from("products")
        .insert({
          id: productId,
          name: newProduct.name,
          name_ru: newProduct.name_ru || newProduct.name,
          name_hy: newProduct.name_hy || newProduct.name,
          description: newProduct.description,
          description_ru: newProduct.description_ru || newProduct.description,
          description_hy: newProduct.description_hy || newProduct.description,
          price: newProduct.price,
          category: newProduct.category,
          stock: newProduct.stock,
          low_stock_threshold: newProduct.low_stock_threshold,
          in_stock: newProduct.stock > 0,
          image: newProduct.image,
          rating: 0,
          reviews: 0,
          eco: false,
          benefits: [],
          how_to_use: [],
          ingredients: [],
          concerns: [],
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setProducts([...products, data])
        setIsAddProductOpen(false)
        setNewProduct({
          name: "",
          name_ru: "",
          name_hy: "",
          description: "",
          description_ru: "",
          description_hy: "",
          price: "",
          category: "cleansers",
          stock: 100,
          low_stock_threshold: 10,
          in_stock: true,
          image: "/placeholder.svg",
        })
        alert("Product added successfully!")
      }
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Failed to add product")
    } finally {
      setIsAddingProduct(false)
    }
  }

  // Delete product
  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    const { error } = await supabase.from("products").delete().eq("id", productId)

    if (!error) {
      setProducts(products.filter((p) => p.id !== productId))
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)

    if (!error) {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: status as Order["status"] } : o)))
    }
  }

  // Update order tracking
  const updateOrderTracking = async (orderId: string, trackingNumber: string, carrier: string) => {
    const { error } = await supabase
      .from("orders")
      .update({
        tracking_number: trackingNumber,
        carrier,
        status: "shipped",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (!error) {
      loadOrders()
    }
  }

  // Respond to customer request
  const respondToRequest = async (requestId: string, response: string) => {
    const { error } = await supabase
      .from("customer_requests")
      .update({
        admin_response: response,
        status: "resolved",
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (!error) {
      loadRequests()
    }
  }

  // Moderate rating
  const moderateRating = async (ratingId: string, status: "approved" | "rejected", notes?: string) => {
    const { error } = await supabase
      .from("product_ratings")
      .update({
        moderation_status: status,
        moderation_notes: notes,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", ratingId)

    if (!error) {
      loadRatings()
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated")
    setIsAuthenticated(false)
    setAdminCode("")
  }

  // Load blogs
  const loadBlogs = async () => {
    try {
      const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setBlogs(data || [])
    } catch (error) {
      console.error("Error loading blogs:", error)
    }
  }

  // Toggle blog publish status
  const toggleBlogPublish = async (blogId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("blogs")
        .update({
          published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq("id", blogId)
      if (error) throw error
      loadBlogs()
    } catch (error) {
      console.error("Error updating blog:", error)
    }
  }

  // Delete a blog post
  const deleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", blogId)
      if (error) throw error
      loadBlogs()
    } catch (error) {
      console.error("Error deleting blog:", error)
    }
  }

  // Status badge colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      new: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  // Filter functions
  const filteredOrders = orders.filter(
    (o) =>
      (orderFilter === "all" || o.status === orderFilter) &&
      (searchTerm === "" ||
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredRequests = requests.filter((r) => requestFilter === "all" || r.status === requestFilter)

  const filteredRatings = ratings.filter((r) => ratingFilter === "all" || r.moderation_status === ratingFilter)

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter your admin code to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="adminCode">Admin Code</Label>
                <Input
                  id="adminCode"
                  type="password"
                  placeholder="Enter admin code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              {authError && <p className="text-sm text-destructive">{authError}</p>}
              <Button className="w-full" onClick={handleLogin} disabled={isLoading || !adminCode}>
                {isLoading ? "Verifying..." : "Access Admin Panel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">JoJo Labs Admin</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={loadAllData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requests</p>
                  <p className="text-2xl font-bold">{requests.filter((r) => r.status === "new").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-2xl font-bold">
                    {ratings.filter((r) => r.moderation_status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold">
                    {products.filter((p) => p.stock <= p.low_stock_threshold).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="requests">
              <MessageSquare className="w-4 h-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="ratings">
              <Star className="w-4 h-4 mr-2" />
              Ratings
            </TabsTrigger>
            <TabsTrigger value="blogs">
              <FileText className="w-4 h-4 mr-2" />
              Blogs
            </TabsTrigger>
          </TabsList>

          {/* Stock Management Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage product inventory, pricing, and images</CardDescription>
                </div>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>Fill in the product details to add it to your store</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name (English) *</Label>
                          <Input
                            id="name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="e.g., Vitamin C Serum"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (AMD) *</Label>
                          <Input
                            id="price"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            placeholder="e.g., 15000"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name_ru">Product Name (Russian)</Label>
                          <Input
                            id="name_ru"
                            value={newProduct.name_ru}
                            onChange={(e) => setNewProduct({ ...newProduct, name_ru: e.target.value })}
                            placeholder="Название продукта"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name_hy">Product Name (Armenian)</Label>
                          <Input
                            id="name_hy"
                            value={newProduct.name_hy}
                            onChange={(e) => setNewProduct({ ...newProduct, name_hy: e.target.value })}
                            placeholder="Ապրdelays անունdelays"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (English)</Label>
                        <Textarea
                          id="description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Product description..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="description_ru">Description (Russian)</Label>
                          <Textarea
                            id="description_ru"
                            value={newProduct.description_ru}
                            onChange={(e) => setNewProduct({ ...newProduct, description_ru: e.target.value })}
                            placeholder="Описание продукта..."
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description_hy">Description (Armenian)</Label>
                          <Textarea
                            id="description_hy"
                            value={newProduct.description_hy}
                            onChange={(e) => setNewProduct({ ...newProduct, description_hy: e.target.value })}
                            placeholder=" Delays նdelays delays..."
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={newProduct.category}
                            onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cleansers">Cleansers</SelectItem>
                              <SelectItem value="toners">Toners</SelectItem>
                              <SelectItem value="serums">Serums</SelectItem>
                              <SelectItem value="moisturizers">Moisturizers</SelectItem>
                              <SelectItem value="sunscreens">Sunscreens</SelectItem>
                              <SelectItem value="masks">Masks</SelectItem>
                              <SelectItem value="essences">Essences</SelectItem>
                              <SelectItem value="eye-care">Eye Care</SelectItem>
                              <SelectItem value="lip-care">Lip Care</SelectItem>
                              <SelectItem value="body-care">Body Care</SelectItem>
                              <SelectItem value="hair-care">Hair Care</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stock">Initial Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="low_stock">Low Stock Alert</Label>
                          <Input
                            id="low_stock"
                            type="number"
                            value={newProduct.low_stock_threshold}
                            onChange={(e) => setNewProduct({ ...newProduct, low_stock_threshold: parseInt(e.target.value) || 10 })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addProduct} disabled={isAddingProduct}>
                          {isAddingProduct ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Product
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden group">
                            {product.image && product.image !== '/placeholder.svg' ? (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              {uploadingProductId === product.id ? (
                                <RefreshCw className="w-5 h-5 text-white animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5 text-white" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleImageUpload(product.id, file)
                                }}
                                disabled={uploadingProductId === product.id}
                              />
                            </label>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium max-w-48">
                          <div className="truncate" title={product.name}>{product.name}</div>
                        </TableCell>
                        <TableCell>{product.category || product.category_id}</TableCell>
                        <TableCell>
                          {editingPriceId === product.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="text"
                                className="w-24"
                                value={editingPrice}
                                onChange={(e) => setEditingPrice(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") updatePrice(product.id, editingPrice)
                                  if (e.key === "Escape") {
                                    setEditingPriceId(null)
                                    setEditingPrice("")
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updatePrice(product.id, editingPrice)}
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingPriceId(null)
                                  setEditingPrice("")
                                }}
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              className="text-left hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                              onClick={() => {
                                setEditingPriceId(product.id)
                                setEditingPrice(product.price || "")
                              }}
                            >
                              {product.price} AMD
                            </button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20"
                            value={product.stock}
                            onChange={(e) => updateStock(product.id, Number.parseInt(e.target.value) || 0)}
                            min={0}
                          />
                        </TableCell>
                        <TableCell>
                          {product.stock <= 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : product.stock <= product.low_stock_threshold ? (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              In Stock
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStock(product.id, product.stock + 10)}
                            >
                              +10
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStock(product.id, product.stock + 50)}
                            >
                              +50
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>Manage and track customer orders</CardDescription>
                  </div>
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders..."
                        className="pl-9 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={orderFilter} onValueChange={setOrderFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <OrderDetailsDialog order={order} />
                            <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Customer Requests</CardTitle>
                    <CardDescription>View and respond to customer inquiries</CardDescription>
                  </div>
                  <Select value={requestFilter} onValueChange={setRequestFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{request.customer_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{request.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.request_type.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              request.priority === "urgent"
                                ? "bg-red-100 text-red-800"
                                : request.priority === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : request.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }
                          >
                            {request.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>{request.status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <RequestDetailsDialog
                            request={request}
                            onRespond={(response) => respondToRequest(request.id, response)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Ratings Tab */}
          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Ratings</CardTitle>
                    <CardDescription>Review and moderate customer reviews</CardDescription>
                  </div>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reviews</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRatings.map((rating) => (
                      <TableRow key={rating.id}>
                        <TableCell className="font-medium">{rating.product_id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{rating.reviewer_name}</p>
                            {rating.verified_purchase && (
                              <Badge variant="outline" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < rating.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="font-medium">{rating.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{rating.review}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(rating.moderation_status)}>{rating.moderation_status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(rating.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 bg-transparent"
                              onClick={() => moderateRating(rating.id, "approved")}
                              disabled={rating.moderation_status === "approved"}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 bg-transparent"
                              onClick={() => moderateRating(rating.id, "rejected")}
                              disabled={rating.moderation_status === "rejected"}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Tab - This tab content was present but not linked in TabsList */}
          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Tracking</CardTitle>
                <CardDescription>Monitor order shipments and delivery status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter((o) => ["confirmed", "processing", "shipped", "delivered"].includes(o.status))
                      .map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono">{order.order_number}</TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{order.shipping_address}</p>
                              <p className="text-muted-foreground">
                                {order.shipping_city}, {order.shipping_country}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{order.carrier || "-"}</TableCell>
                          <TableCell className="font-mono text-sm">{order.tracking_number || "-"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <TrackingDialog
                              order={order}
                              onUpdate={(tracking, carrier) => updateOrderTracking(order.id, tracking, carrier)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blogs Tab Content */}
          <TabsContent value="blogs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Blog Posts Management</span>
                  <Link href="/admin/blog/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Blog Post
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {blogs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No blog posts yet.</p>
                ) : (
                  <div className="space-y-4">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{blog.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{blog.excerpt}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>By {blog.author}</span>
                            <span>•</span>
                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className={blog.published ? "text-green-600" : "text-gray-400"}>
                              {blog.published ? "Published" : "Draft"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/blog/${blog.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBlogPublish(blog.id, blog.published)}
                          >
                            {blog.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteBlog(blog.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Order Details Dialog Component
function OrderDetailsDialog({ order }: { order: Order }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order #{order.order_number}</DialogTitle>
          <DialogDescription>Order details and items</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Customer Info</h4>
              <p>{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Shipping Address</h4>
              <p>{order.shipping_address}</p>
              <p className="text-sm text-muted-foreground">
                {order.shipping_city}, {order.shipping_postal_code}
              </p>
              <p className="text-sm text-muted-foreground">{order.shipping_country}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Order Items</h4>
            <div className="border rounded-lg">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${item.total_price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Subtotal: ${order.subtotal.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Shipping: ${order.shipping_cost.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Tax: ${order.tax.toFixed(2)}</p>
            </div>
            <p className="text-xl font-bold">Total: ${order.total.toFixed(2)}</p>
          </div>
          {order.customer_notes && (
            <div>
              <h4 className="font-medium mb-2">Customer Notes</h4>
              <p className="text-sm text-muted-foreground">{order.customer_notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Request Details Dialog Component
function RequestDetailsDialog({
  request,
  onRespond,
}: {
  request: CustomerRequest
  onRespond: (response: string) => void
}) {
  const [response, setResponse] = useState(request.admin_response || "")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{request.subject}</DialogTitle>
          <DialogDescription>Customer request from {request.customer_name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Message</h4>
            <p className="text-sm bg-muted p-3 rounded-lg">{request.message}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Response</h4>
            <Textarea
              placeholder="Type your response..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
            />
          </div>
          <Button onClick={() => onRespond(response)} disabled={!response || request.status === "resolved"}>
            Send Response
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Tracking Dialog Component
function TrackingDialog({
  order,
  onUpdate,
}: {
  order: Order
  onUpdate: (tracking: string, carrier: string) => void
}) {
  const [tracking, setTracking] = useState(order.tracking_number || "")
  const [carrier, setCarrier] = useState(order.carrier || "")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Truck className="w-4 h-4 mr-1" />
          Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Tracking Info</DialogTitle>
          <DialogDescription>Order #{order.order_number}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Carrier</Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DHL">DHL</SelectItem>
                <SelectItem value="FedEx">FedEx</SelectItem>
                <SelectItem value="UPS">UPS</SelectItem>
                <SelectItem value="USPS">USPS</SelectItem>
                <SelectItem value="Haypost">Haypost</SelectItem>
                <SelectItem value="Russian Post">Russian Post</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tracking Number</Label>
            <Input placeholder="Enter tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} />
          </div>
          <Button onClick={() => onUpdate(tracking, carrier)} disabled={!tracking || !carrier}>
            Update & Mark as Shipped
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
