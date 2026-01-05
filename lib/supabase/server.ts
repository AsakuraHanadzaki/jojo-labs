import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config"
import { createNoopSupabaseClient, type SupabaseClientLike } from "@/lib/supabase/noop-client"

export async function createClient() {
  return getSupabaseServerClient()
}

export async function getSupabaseServerClient(): Promise<SupabaseClientLike> {
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

 const config = getSupabaseConfig()
  if (!isSupabaseConfigured(config)) {
    return createNoopSupabaseClient("Supabase server env vars are missing.")
  }

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: cookieHandler.getAll,
      setAll: cookieHandler.setAll,
    },
  })
}
