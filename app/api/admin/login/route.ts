import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  encodeSessionPayload,
  hashSecret,
  isRateLimited,
  registerLoginAttempt,
  safeEqual,
  signValue,
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
    const configuredAdminCode = process.env.ADMIN_ACCESS_CODE

    if (!loginSecret || !configuredAdminCode) {
      return NextResponse.json({ error: "Server admin login is not configured" }, { status: 500 })
    }

    const submittedHash = hashSecret(adminCode, loginSecret)
    const expectedHash = hashSecret(configuredAdminCode, loginSecret)

    if (!safeEqual(submittedHash, expectedHash)) {
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
