"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ORDER_STATUS_PAID = 2

type StatusResponse = {
  orderStatus?: number
  actionCodeDescription?: string
  errorMessage?: string
}

type Props = {
  orderNumber?: string
  orderId?: string
}

export function IpayReturnClient({ orderNumber, orderId }: Props) {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      if (!orderId) {
        setError("We could not locate the order ID for this payment. Please contact support.")
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/ipay/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        })

        const data = (await response.json()) as StatusResponse

        if (!response.ok) {
          throw new Error(data.errorMessage || "Unable to verify payment status.")
        }

        setStatus(data)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Unable to verify payment status.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
  }, [orderId])

  const isPaid = status?.orderStatus === ORDER_STATUS_PAID

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>iPay payment status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Order number: {orderNumber ?? "Unknown"}</p>

        {isLoading && <p>Checking payment status...</p>}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">Payment verification failed</p>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && status && isPaid && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <p className="font-semibold">Payment successful</p>
            <p>Your payment was confirmed. Thank you for your order.</p>
          </div>
        )}

        {!isLoading && !error && status && !isPaid && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <p className="font-semibold">Payment not completed</p>
            <p>The payment is not confirmed yet. Please wait or contact support if the status does not update.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/">Return to home</Link>
          </Button>
          <Button asChild>
            <Link href="/checkout">Back to checkout</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
