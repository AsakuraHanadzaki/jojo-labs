import { createBrowserClient } from "@supabase/ssr"

type BrowserClient = ReturnType<typeof createBrowserClient>

let client: BrowserClient | null = null

const createNoopQuery = (message: string) => {
  const query: any = {
    select: () => query,
    eq: () => query,
    gt: () => query,
    order: () => query,
    insert: () => query,
    upsert: () => query,
    delete: () => query,
    maybeSingle: () => query,
    single: () => query,
    then: (resolve: (value: { data: null; error: Error }) => void) => resolve({ data: null, error: new Error(message) }),
  }

  return query
}

const createNoopClient = (message: string): BrowserClient =>
  ({
    from: () => createNoopQuery(message),
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error(message) }),
      getSession: async () => ({ data: { session: null }, error: new Error(message) }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: new Error(message) }),
      signUp: async () => ({ data: { user: null, session: null }, error: new Error(message) }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error(message) }),
    },
  } as BrowserClient)

export function getSupabaseBrowserClient() {
  if (client) return client

  if (typeof window === "undefined") {
    return createNoopClient("Supabase client is not available during server rendering.")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return createNoopClient("Supabase client env vars are missing.")
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)

  return client
}

export function createClient() {
  return getSupabaseBrowserClient()
}
