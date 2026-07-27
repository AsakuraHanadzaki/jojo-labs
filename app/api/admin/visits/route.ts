import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Aggregated visit analytics for the admin dashboard
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const days = Math.min(Math.max(Number(searchParams.get("days")) || 30, 1), 90)

    const since = new Date()
    since.setDate(since.getDate() - (days - 1))
    since.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from("page_visits")
      .select("path, visitor_id, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true })

    if (error) throw error

    const visits = data || []
    const totalVisits = visits.length
    const uniqueVisitors = new Set(
      visits.map((v) => v.visitor_id).filter(Boolean),
    ).size

    // Daily series (fill gaps with 0)
    const dailyMap: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(since)
      d.setDate(since.getDate() + i)
      dailyMap[d.toISOString().slice(0, 10)] = 0
    }
    for (const v of visits) {
      const key = new Date(v.created_at).toISOString().slice(0, 10)
      if (key in dailyMap) dailyMap[key] += 1
    }
    const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

    // Top pages
    const pageMap: Record<string, number> = {}
    for (const v of visits) {
      pageMap[v.path] = (pageMap[v.path] || 0) + 1
    }
    const topPages = Object.entries(pageMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({ totalVisits, uniqueVisitors, daily, topPages, days })
  } catch (error) {
    console.error("Error fetching visit analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
