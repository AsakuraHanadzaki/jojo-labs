interface SupabaseConfig {
  url?: string
  anonKey?: string
}

let hasWarned = false

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!hasWarned && (!url || !anonKey)) {
    console.warn(
      "[supabase] Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or their SUPABASE_* equivalents).",
    )
    hasWarned = true
  }

  return { url, anonKey }
}

export function isSupabaseConfigured(config: SupabaseConfig = getSupabaseConfig()): config is Required<SupabaseConfig> {
  return Boolean(config.url && config.anonKey)
}
