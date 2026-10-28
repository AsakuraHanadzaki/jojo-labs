import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { verifySignedValue, verifySessionPayload } from "@/lib/admin/auth"

async function requireAdminSession() {
  const store = await cookies()
  const signedCookie = store.get("admin_session")?.value

  if (!signedCookie) {
    throw new Error("Unauthorized")
  }

  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_LOGIN_SECRET
  if (!secret) {
    throw new Error("Unauthorized")
  }

  const value = verifySignedValue(signedCookie, secret)
  if (!value || !verifySessionPayload(value)) {
    throw new Error("Unauthorized")
  }

  return getSupabaseServerClient()
}

export async function GET() {
  try {
    const supabase = await requireAdminSession()

    const { data, error } = await supabase
      .from("page_visits")
      .select("id, path, referrer, visitor_id, user_agent, created_at")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ visits: data || [] })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
