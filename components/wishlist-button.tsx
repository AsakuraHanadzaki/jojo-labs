"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "@/components/simple-toast"
import { useTranslation } from "@/hooks/use-translation"

interface WishlistButtonProps {
  productId: string
  productName: string
}

export function WishlistButton({ productId, productName }: WishlistButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if product is in wishlist on mount
  useState(() => {
    if (user) {
      checkWishlist()
    }
  })

  const checkWishlist = async () => {
    if (!user) return
    const { data } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single()
    setIsInWishlist(!!data)
  }

  const handleToggleWishlist = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)
    try {
      if (isInWishlist) {
        // Remove from wishlist
        await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId)
        setIsInWishlist(false)
        toast({
          title: "Removed from wishlist",
          description: `${productName} has been removed from your wishlist`,
        })
      } else {
        // Add to wishlist
        await supabase.from("wishlists").insert({
          user_id: user.id,
          product_id: productId,
        })
        setIsInWishlist(true)
        toast({
          title: "Added to wishlist",
          description: `${productName} has been added to your wishlist`,
        })
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className="relative bg-transparent"
    >
      <Heart className={`w-5 h-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
    </Button>
  )
}
