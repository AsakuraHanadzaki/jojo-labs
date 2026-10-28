"use client"

import { useEffect, useState } from "react"

type Product = {
  id: string
  name: string
  price?: string | number
  stock?: number
  image?: string
  in_stock?: boolean
}

type Order = {
  id: string
  status?: string
  total_price?: number | string
}

export default function AdminPage() {
  const [adminCode, setAdminCode] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  const [blogs, setBlogs] = useState<any[]>([])
  const [isAddingProduct, setIsAddingProduct] = useState(false)
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
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState("")
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null)

  const fetchAdminJson = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    })

    const text = await res.text()
    const payload = text ? JSON.parse(text) : {}

    if (!res.ok) {
      throw new Error(payload.error || "Request failed")
    }

    return payload
  }

  const loadAllData = async () => {
    try {
      const result = await fetchAdminJson("/api/admin/data")
      setProducts(result.products || [])
      setOrders(result.orders || [])
      setRequests(result.requests || [])
      setRatings(result.ratings || [])
      setBlogs(result.blogs || [])
    } catch (error) {
      console.error("Error loading admin data:", error)
    }
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setAuthError("")

    try {
      await fetchAdminJson("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ adminCode }),
      })

      setIsAuthenticated(true)
      await loadAllData()
    } catch (error) {
      console.error("Auth error:", error)
      setAuthError("Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetchAdminJson("/api/admin/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout failed:", error)
    }

    setIsAuthenticated(false)
    setAdminCode("")
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await fetchAdminJson("/api/admin/session")
        if (result.authenticated) {
          setIsAuthenticated(true)
          await loadAllData()
        }
      } catch (error) {
        console.error("Session check failed:", error)
      }
    }

    checkAuth()
  }, [])

  const runAdminAction = async (action: string, payload: Record<string, any> = {}) => {
    return fetchAdminJson("/api/admin/data", {
      method: "POST",
      body: JSON.stringify({ action, ...payload }),
    })
  }

  const updateStock = async (productId: string, newStock: number) => {
    try {
      await runAdminAction("update-stock", { productId, newStock })
      await loadAllData()
    } catch (error) {
      console.error("Error updating stock:", error)
      alert("Failed to update stock")
    }
  }

  const updatePrice = async (productId: string, newPrice: string) => {
    try {
      await runAdminAction("update-price", { productId, newPrice })
      await loadAllData()
      setEditingPriceId(null)
      setEditingPrice("")
    } catch (error) {
      console.error("Error updating price:", error)
      alert("Failed to update price")
    }
  }

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Please fill in product name and price")
      return
    }

    setIsAddingProduct(true)
    try {
      const productId = `${newProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`

      await runAdminAction("add-product", {
        product: {
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
        },
      })

      await loadAllData()
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
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Failed to add product")
    } finally {
      setIsAddingProduct(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await runAdminAction("delete-product", { productId })
      await loadAllData()
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product")
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await runAdminAction("update-order-status", { orderId, status })
      await loadAllData()
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Failed to update order status")
    }
  }

  const updateOrderTracking = async (orderId: string, trackingNumber: string, carrier: string) => {
    try {
      await runAdminAction("update-order-tracking", { orderId, trackingNumber, carrier })
      await loadAllData()
    } catch (error) {
      console.error("Error updating tracking:", error)
      alert("Failed to update tracking")
    }
  }

  const respondToRequest = async (requestId: string, response: string) => {
    try {
      await runAdminAction("respond-request", { requestId, response })
      await loadAllData()
    } catch (error) {
      console.error("Error responding to request:", error)
      alert("Failed to respond to request")
    }
  }

  const moderateRating = async (ratingId: string, status: "approved" | "rejected", notes?: string) => {
    try {
      await runAdminAction("moderate-rating", { ratingId, status, notes })
      await loadAllData()
    } catch (error) {
      console.error("Error moderating rating:", error)
      alert("Failed to update review status")
    }
  }

  const toggleBlogPublish = async (blogId: string, currentStatus: boolean) => {
    try {
      await runAdminAction("toggle-blog-publish", { blogId, currentStatus })
      await loadAllData()
    } catch (error) {
      console.error("Error updating blog:", error)
      alert("Failed to update blog")
    }
  }

  const deleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return
    try {
      await runAdminAction("delete-blog", { blogId })
      await loadAllData()
    } catch (error) {
      console.error("Error deleting blog:", error)
      alert("Failed to delete blog")
    }
  }

  const handleImageUpload = async (productId: string, file: File) => {
    setUploadingProductId(productId)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("productId", productId)

      const response = await fetch("/api/upload-product-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setProducts((current) =>
          current.map((p) => (p.id === productId ? { ...p, image: result.url } : p)),
        )
        alert("Image uploaded successfully!")
      } else {
        alert("Failed to upload image: " + result.error)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image")
    } finally {
      setUploadingProductId(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 420, margin: "80px auto", padding: 20 }}>
        <h1 style={{ fontSize: 28, marginBottom: 20 }}>Admin Login</h1>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            type="password"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            placeholder="Enter admin code"
            style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
          />

          {authError ? <p style={{ color: "crimson" }}>{authError}</p> : null}

          <button
            onClick={handleLogin}
            disabled={isLoading || !adminCode.trim()}
            style={{ padding: 12, borderRadius: 8, background: "#111827", color: "white" }}
          >
            {isLoading ? "Checking..." : "Login"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <button onClick={() => setIsAddProductOpen((v) => !v)} style={{ width: 180 }}>
          {isAddProductOpen ? "Close form" : "Add product"}
        </button>

        {isAddProductOpen ? (
          <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, display: "grid", gap: 12 }}>
            <input
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Product name"
            />
            <input
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              placeholder="Price"
            />
            <input
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              placeholder="Category"
            />
            <input
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) || 0 })}
              placeholder="Stock"
              type="number"
            />
            <button onClick={addProduct} disabled={isAddingProduct}>
              {isAddingProduct ? "Adding..." : "Create product"}
            </button>
          </div>
        ) : null}

        <section>
          <h2>Products</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {products.map((product) => (
              <div key={product.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <strong>{product.name}</strong>
                    <div>Stock: {product.stock ?? 0}</div>
                    <div>Price: {product.price ?? "$0"}</div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => updateStock(product.id, Number(product.stock ?? 0) + 1)}>+1</button>
                    <button onClick={() => updateStock(product.id, Number(product.stock ?? 0) - 1)}>-1</button>
                    <button onClick={() => deleteProduct(product.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Orders</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {orders.map((order) => (
              <div key={order.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
                <div>Order: {order.id}</div>
                <div>Status: {order.status || "pending"}</div>
                <div>Total: {order.total_price ?? 0}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => updateOrderStatus(order.id, "processing")}>Processing</button>
                  <button onClick={() => updateOrderStatus(order.id, "shipped")}>Shipped</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Requests</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {requests.map((request) => (
              <div key={request.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12 }}>
                <div>{request.message || "Customer request"}</div>
                <button onClick={() => respondToRequest(request.id, "Resolved by admin")}>Respond</button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Ratings</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {ratings.map((rating) => (
              <div key={rating.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12 }}>
                <div>{rating.comment || "Review"}</div>
                <button onClick={() => moderateRating(rating.id, "approved")}>Approve</button>
                <button onClick={() => moderateRating(rating.id, "rejected")}>Reject</button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Blogs</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {blogs.map((blog) => (
              <div key={blog.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12 }}>
                <div>{blog.title || "Blog"}</div>
                <button onClick={() => toggleBlogPublish(blog.id, Boolean(blog.published))}>
                  {blog.published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => deleteBlog(blog.id)}>Delete</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
