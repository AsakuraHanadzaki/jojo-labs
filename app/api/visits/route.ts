import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// POST - Record a page visit
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const path = String(body.path || "/").slice(0, 512)
    const referrer = body.referrer ? String(body.referrer).slice(0, 512) : null
    const visitorId = body.visitorId ? String(body.visitorId).slice(0, 128) : null
    const userAgent = request.headers.get("user-agent")?.slice(0, 512) || null

    const { error } = await supabase.from("page_visits").insert({
      path,
      referrer,
      visitor_id: visitorId,
      user_agent: userAgent,
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording visit:", error)
    // Never surface tracking errors to the visitor
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
