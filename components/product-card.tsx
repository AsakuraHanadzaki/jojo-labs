"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  id: string
  name: string
  price: string
  image: string
  category: string
  description?: string
  stock?: number
  inStock?: boolean
  lowStockThreshold?: number
}

export function ProductCard({
  id,
  name,
  price,
  image,
  category,
  description,
  stock,
  inStock = true,
  lowStockThreshold = 10,
}: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(image || "/placeholder.svg")
  const getStockStatus = () => {
    const currentStock = stock ?? 0

    if (!inStock || currentStock === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800 border-red-200" }
    }
    if (currentStock <= lowStockThreshold) {
      return { label: "Low Stock", color: "bg-amber-100 text-amber-800 border-amber-200" }
    }
    return { label: "In Stock", color: "bg-green-100 text-green-800 border-green-200" }
  }

  const stockStatus = getStockStatus()

  return (
    <Link href={`/products/${id}`}>
      <Card className="group cursor-pointer border-0 shadow-none hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="relative aspect-square bg-gradient-to-br from-rose-50 to-pink-100 rounded-3xl overflow-hidden mb-4">
            <img
              src={imgSrc}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgSrc("/placeholder.svg")}
              loading="lazy"
            />
            <Badge variant="outline" className={`absolute top-3 right-3 ${stockStatus.color} text-xs font-medium`}>
              {stockStatus.label}
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{category}</p>
            <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">{name}</h3>
            {description && <p className="text-sm text-gray-600 line-clamp-2">{description}</p>}
            <p className="text-lg font-bold text-gray-900">{price}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
