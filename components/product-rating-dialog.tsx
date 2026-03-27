"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface ProductRatingDialogProps {
  productId: string
  productName: string
  orderId: string
  reviewerName?: string
  reviewerEmail?: string
  onRatingSubmitted?: () => void
}

export function ProductRatingDialog({
  productId,
  productName,
  orderId,
  reviewerName = "",
  reviewerEmail = "",
  onRatingSubmitted,
}: ProductRatingDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [review, setReview] = useState("")
  const [name, setName] = useState(reviewerName)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t("rating.selectRating") || "Please select a rating")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          order_id: orderId,
          rating,
          title,
          review,
          reviewer_name: name || "Anonymous",
          reviewer_email: reviewerEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to submit rating")
        return
      }

      setOpen(false)
      setRating(0)
      setTitle("")
      setReview("")
      onRatingSubmitted?.()
    } catch (err) {
      setError("Failed to submit rating. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star className="w-4 h-4 mr-2" />
          {t("rating.rateProduct") || "Rate Product"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("rating.rateProduct") || "Rate Product"}</DialogTitle>
          <DialogDescription>{productName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>{t("rating.yourRating") || "Your Rating"} *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating > 0 && (
                <>
                  {rating === 1 && (t("rating.poor") || "Poor")}
                  {rating === 2 && (t("rating.fair") || "Fair")}
                  {rating === 3 && (t("rating.good") || "Good")}
                  {rating === 4 && (t("rating.veryGood") || "Very Good")}
                  {rating === 5 && (t("rating.excellent") || "Excellent")}
                </>
              )}
            </p>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("rating.reviewTitle") || "Review Title"}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("rating.titlePlaceholder") || "Summarize your experience"}
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">{t("rating.yourReview") || "Your Review"}</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={t("rating.reviewPlaceholder") || "Tell us about your experience with this product..."}
              rows={4}
            />
          </div>

          {/* Reviewer Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("rating.yourName") || "Your Name"}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("rating.namePlaceholder") || "How should we display your name?"}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? (t("common.submitting") || "Submitting...")
                : (t("rating.submitRating") || "Submit Rating")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
