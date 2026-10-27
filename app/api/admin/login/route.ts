import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import {
  hashSecret,
  isRateLimited,
  registerLoginAttempt,
  safeEqual,
  signValue,
  encodeSessionPayload,
  verifySessionPayload,
} from "@/lib/admin/auth"

export async function POST(request: Request) {
  try {
    const { adminCode } = await request.json()

    if (!adminCode || typeof adminCode !== "string") {
      return NextResponse.json({ error: "Missing admin code" }, { status: 400 })
    }

    const clientIp = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim()
    if (isRateLimited(clientIp)) {
      return NextResponse.json({ error: "Too many login attempts" }, { status: 429 })
    }

    const loginSecret = process.env.ADMIN_LOGIN_SECRET
    if (!loginSecret) {
      return NextResponse.json({ error: "Server login secret is not configured" }, { status: 500 })
    }

    const secretHash = hashSecret(adminCode, loginSecret)

    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "admin_code")
      .single()

    if (error || !data) {
      registerLoginAttempt(clientIp)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    const storedHash = hashSecret(data.setting_value, loginSecret)
    if (!safeEqual(secretHash, storedHash)) {
      registerLoginAttempt(clientIp)
      return NextResponse.json({ error: "Invalid admin code" }, { status: 401 })
    }

    const sessionValue = encodeSessionPayload()
    const sessionSecret = process.env.ADMIN_SESSION_SECRET || loginSecret
    const signedSession = signValue(sessionValue, sessionSecret)

    const store = await cookies()
    store.set("admin_session", signedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
