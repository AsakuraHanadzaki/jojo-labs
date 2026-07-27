"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Loader2 } from "lucide-react"

interface PromoCode {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_amount: number
  expires_at: string | null
  max_uses: number | null
  used_count: number
  is_active: boolean
  created_at: string
}

export function PromoCodesManager() {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [code, setCode] = useState("")
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [discountValue, setDiscountValue] = useState("")
  const [minOrder, setMinOrder] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [maxUses, setMaxUses] = useState("")

  const loadCodes = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/promocodes")
      const data = await res.json()
      if (Array.isArray(data)) setCodes(data)
    } catch {
      setError("Failed to load promo codes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCodes()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")
    try {
      const res = await fetch("/api/admin/promocodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discount_type: discountType,
          discount_value: Number(discountValue),
          min_order_amount: minOrder ? Number(minOrder) : 0,
          expires_at: expiresAt || null,
          max_uses: maxUses ? Number(maxUses) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to create promo code")
      } else {
        setCode("")
        setDiscountValue("")
        setMinOrder("")
        setExpiresAt("")
        setMaxUses("")
        loadCodes()
      }
    } catch {
      setError("Failed to create promo code")
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/promocodes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !isActive }),
    })
    loadCodes()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promo code? This cannot be undone.")) return
    await fetch(`/api/admin/promocodes?id=${id}`, { method: "DELETE" })
    loadCodes()
  }

  const isExpired = (c: PromoCode) => c.expires_at && new Date(c.expires_at) < new Date()
  const isMaxedOut = (c: PromoCode) => c.max_uses !== null && c.used_count >= c.max_uses

  return (
    <div className="space-y-6">
      {/* Create form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Create Promo Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pc-code">Code</Label>
              <Input
                id="pc-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SUMMER10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pc-type">Discount type</Label>
              <select
                id="pc-type"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (AMD)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pc-value">
                {discountType === "percentage" ? "Percent off" : "Amount off (AMD)"}
              </Label>
              <Input
                id="pc-value"
                type="number"
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "10" : "1000"}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pc-min">Min order (AMD)</Label>
              <Input
                id="pc-min"
                type="number"
                min="0"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pc-expires">Expires at</Label>
              <Input
                id="pc-expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pc-max">Max uses</Label>
              <Input
                id="pc-max"
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div className="flex items-end md:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Create Code
              </Button>
              {error && <p className="ml-4 text-sm text-red-600">{error}</p>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Codes list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Promo Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : codes.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No promo codes yet. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {codes.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{c.code}</span>
                      {c.is_active && !isExpired(c) && !isMaxedOut(c) ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      ) : (
                        <Badge variant="secondary">
                          {isExpired(c) ? "Expired" : isMaxedOut(c) ? "Limit reached" : "Inactive"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {c.discount_type === "percentage"
                        ? `${c.discount_value}% off`
                        : `AMD${Number(c.discount_value).toLocaleString()} off`}
                      {c.min_order_amount > 0 && ` · min AMD${Number(c.min_order_amount).toLocaleString()}`}
                      {c.expires_at && ` · expires ${new Date(c.expires_at).toLocaleDateString()}`}
                      {` · used ${c.used_count}${c.max_uses ? `/${c.max_uses}` : ""}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleToggle(c.id, c.is_active)}>
                      {c.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
