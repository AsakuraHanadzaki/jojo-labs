"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Eye, Users, Loader2 } from "lucide-react"

interface Analytics {
  totalVisits: number
  uniqueVisitors: number
  daily: { date: string; count: number }[]
  topPages: { path: string; count: number }[]
  days: number
}

const RANGES = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
]

export function VisitsAnalytics() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/visits?days=${days}`)
        const json = await res.json()
        if (!json.error) setData(json)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [days])

  const chartData = (data?.daily || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    visits: d.count,
  }))

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setDays(r.value)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              days === r.value
                ? "border-rose-300 bg-rose-100 text-rose-800"
                : "border-input hover:bg-muted"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Visits</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.totalVisits.toLocaleString() ?? 0}</p>
                <p className="text-xs text-muted-foreground">Last {data?.days ?? days} days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unique Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.uniqueVisitors.toLocaleString() ?? 0}</p>
                <p className="text-xs text-muted-foreground">Last {data?.days ?? days} days</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Visits</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No visit data yet.</p>
              ) : (
                <ChartContainer
                  config={{ visits: { label: "Visits", color: "hsl(345 70% 55%)" } }}
                  className="h-[300px] w-full"
                >
                  <BarChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="visits" fill="var(--color-visits)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Top pages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.topPages.length ? (
                <p className="py-8 text-center text-muted-foreground">No visit data yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.topPages.map((p) => (
                    <div key={p.path} className="flex items-center justify-between border-b py-2 last:border-0">
                      <span className="font-mono text-sm text-muted-foreground">{p.path}</span>
                      <span className="text-sm font-semibold">{p.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
