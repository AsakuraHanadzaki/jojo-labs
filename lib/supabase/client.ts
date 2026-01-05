import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config"
import { createNoopSupabaseClient, type SupabaseClientLike } from "@/lib/supabase/noop-client"

type BrowserClient = ReturnType<typeof createBrowserClient> | SupabaseClientLike

let client: BrowserClient | null = null

export function getSupabaseBrowserClient() {
  if (client) return client

  if (typeof window === "undefined") {
    return createNoopSupabaseClient("Supabase client is not available during server rendering.")
  }

  const config = getSupabaseConfig()

  if (!isSupabaseConfigured(config)) {
    return createNoopSupabaseClient("Supabase client env vars are missing.")
  }

  client = createBrowserClient(config.url, config.anonKey)


  return client
}

export function createClient() {
  return getSupabaseBrowserClient()
}
