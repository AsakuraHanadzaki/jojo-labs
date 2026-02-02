"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface IpayCheckoutButtonProps {
  orderNumber: string
  amount: number
  currency: string
  language?: string
}

export function IpayCheckoutButton({ orderNumber, amount, currency, language }: IpayCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ipay/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, amount, currency, language }),
      })

      const data = await response.json()

      if (!response.ok || !data.formUrl) {
        throw new Error(data?.error || "Unable to start iPay checkout.")
      }

      window.location.href = data.formUrl
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start iPay checkout.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" variant="outline" onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? "Redirecting to iPay..." : "Pay with iPay"}
      </Button>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Checkout failed</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
