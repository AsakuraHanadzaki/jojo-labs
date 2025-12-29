"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { fetchProducts } from "@/lib/products-service"

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && products.length === 0) {
      setLoading(true)
      fetchProducts()
        .then((data) => {
          // Filter to only show in-stock products
          const inStockProducts = data.filter((p: any) => p.in_stock === true && (p.stock === null || p.stock > 0))
          setProducts(inStockProducts)
        })
        .catch((error) => {
          console.error("Error fetching products for search:", error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isOpen, products.length])

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(query.toLowerCase()) ||
      product.name_ru?.toLowerCase().includes(query.toLowerCase()) ||
      product.name_hy?.toLowerCase().includes(query.toLowerCase()) ||
      product.category?.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase()),
  )

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Search Dialog */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-xl z-50 mx-4">
        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <p>Loading products...</p>
            </div>
          ) : query === "" ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Start typing to search products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No products found for "{query}"</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={onClose}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-3xl overflow-hidden flex-shrink-0">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name || "Product"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="text-gray-500 text-xs">{product.category}</p>
                  </div>
                  <span className="font-semibold text-sm">{product.price}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
