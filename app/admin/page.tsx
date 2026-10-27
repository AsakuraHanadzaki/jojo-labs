  const [isAddingProduct, setIsAddingProduct] = useState(false)

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

  // Verify admin code
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

  // Check session on mount
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

  // Load all data
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

  const runAdminAction = async (action: string, payload: Record<string, any> = {}) => {
    return fetchAdminJson("/api/admin/data", {
      method: "POST",
      body: JSON.stringify({ action, ...payload }),
    })
  }

  // Update product stock
  const updateStock = async (productId: string, newStock: number) => {
    try {
      await runAdminAction("update-stock", { productId, newStock })
      await loadAllData()
    } catch (error) {
      console.error("Error updating stock:", error)
      alert("Failed to update stock")
    }
  }

  // Update product price
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

  // Add new product
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Please fill in product name and price")
      return
    }

    setIsAddingProduct(true)
    try {
      const productId = newProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        + "-" + Date.now().toString(36)

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

  // Delete product
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

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await runAdminAction("update-order-status", { orderId, status })
      await loadAllData()
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Failed to update order status")
    }
  }

  // Update order tracking
  const updateOrderTracking = async (orderId: string, trackingNumber: string, carrier: string) => {
    try {
      await runAdminAction("update-order-tracking", { orderId, trackingNumber, carrier })
      await loadAllData()
    } catch (error) {
      console.error("Error updating tracking:", error)
      alert("Failed to update tracking")
    }
  }

  // Respond to customer request
  const respondToRequest = async (requestId: string, response: string) => {
    try {
      await runAdminAction("respond-request", { requestId, response })
      await loadAllData()
    } catch (error) {
      console.error("Error responding to request:", error)
      alert("Failed to respond to request")
    }
  }

  // Moderate rating
  const moderateRating = async (ratingId: string, status: "approved" | "rejected", notes?: string) => {
    try {
      await runAdminAction("moderate-rating", { ratingId, status, notes })
      await loadAllData()
    } catch (error) {
      console.error("Error moderating rating:", error)
      alert("Failed to update review status")
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

  // Load blogs
  const loadBlogs = async () => {
    try {
      const result = await fetchAdminJson("/api/admin/data")
      setBlogs(result.blogs || [])
    } catch (error) {
      console.error("Error loading blogs:", error)
    }
  }

  // Toggle blog publish status
  const toggleBlogPublish = async (blogId: string, currentStatus: boolean) => {
    try {
      await runAdminAction("toggle-blog-publish", { blogId, currentStatus })
      await loadAllData()
    } catch (error) {
      console.error("Error updating blog:", error)
      alert("Failed to update blog")
    }
  }

  // Delete a blog post
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
