import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface ProductCardProps {
  id: string
  name: string
  price: string
  image: string
  category: string
  description?: string
}

export function ProductCard({ id, name, price, image, category, description }: ProductCardProps) {
  return (
    <Link href={`/products/${id}`}>
      <Card className="group cursor-pointer border-0 shadow-none hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="aspect-square bg-gradient-to-br from-rose-50 to-pink-100 rounded-3xl overflow-hidden mb-4">
            {" "}
            {/* Updated background */}
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
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
