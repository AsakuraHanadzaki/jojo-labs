"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

function getVisitorId(): string {
  try {
    const key = "jojo_visitor_id"
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    return "anonymous"
  }
}

export function VisitTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    // Don't track admin pages or repeated fires for the same path
    if (pathname.startsWith("/admin")) return
    if (lastPath.current === pathname) return
    lastPath.current = pathname

    const payload = {
      path: pathname,
      referrer: document.referrer || null,
      visitorId: getVisitorId(),
    }

    // Fire-and-forget; never block or surface errors to the visitor
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return null
}
