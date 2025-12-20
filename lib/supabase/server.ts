import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  return getSupabaseServerClient()
}

export async function getSupabaseServerClient() {
  let cookieStore: ReturnType<typeof cookies> | null = null

  try {
    cookieStore = cookies()
  } catch {
    cookieStore = null
  }

  const cookieHandler = cookieStore
    ? {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore?.set(name, value, options))
          } catch {
            // Handle server component context
          }
        },
      }
    : {
        getAll() {
          return []
        },
        setAll() {
          // No-op outside request scope
        },
      }

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: cookieHandler.getAll,
      setAll: cookieHandler.setAll,
    },
  })
}
