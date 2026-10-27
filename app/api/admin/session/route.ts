import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { verifySignedValue, verifySessionPayload } from "@/lib/admin/auth"

export async function GET() {
  const store = await cookies()
  const signed = store.get("admin_session")?.value

  if (!signed) {
    return NextResponse.json({ authenticated: false })
  }

  const sessionSecret = process.env.ADMIN_SESSION_SECRET
  const secret = sessionSecret || process.env.ADMIN_LOGIN_SECRET

  if (!secret) {
    return NextResponse.json({ authenticated: false })
  }

  const value = verifySignedValue(signed, secret)
  if (!value) {
    return NextResponse.json({ authenticated: false })
  }

  return NextResponse.json({ authenticated: verifySessionPayload(value) })
}
