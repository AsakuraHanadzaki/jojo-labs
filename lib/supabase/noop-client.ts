type SupabaseQuery = {
  select: (...args: any[]) => SupabaseQuery
  eq: (...args: any[]) => SupabaseQuery
  gt: (...args: any[]) => SupabaseQuery
  order: (...args: any[]) => SupabaseQuery
  insert: (...args: any[]) => SupabaseQuery
  upsert: (...args: any[]) => SupabaseQuery
  delete: (...args: any[]) => SupabaseQuery
  maybeSingle: () => SupabaseQuery
  single: () => SupabaseQuery
  then: (resolve: (value: { data: null; error: Error }) => void) => void
}

export type SupabaseClientLike = {
  from: (...args: any[]) => SupabaseQuery
  auth: {
    getUser: () => Promise<{ data: { user: null }; error: Error }>
    getSession: () => Promise<{ data: { session: null }; error: Error }>
    onAuthStateChange: () => { data: { subscription: { unsubscribe: () => void } } }
    signOut: () => Promise<{ error: Error }>
    signUp: () => Promise<{ data: { user: null; session: null }; error: Error }>
    signInWithPassword: () => Promise<{ data: { user: null; session: null }; error: Error }>
  }
}

const createNoopQuery = (message: string): SupabaseQuery => {
  const query: SupabaseQuery = {
    select: () => query,
    eq: () => query,
    gt: () => query,
    order: () => query,
    insert: () => query,
    upsert: () => query,
    delete: () => query,
    maybeSingle: () => query,
    single: () => query,
    then: (resolve) => resolve({ data: null, error: new Error(message) }),
  }

  return query
}

export const createNoopSupabaseClient = (message: string): SupabaseClientLike => ({
  from: () => createNoopQuery(message),
  auth: {
    getUser: async () => ({ data: { user: null }, error: new Error(message) }),
    getSession: async () => ({ data: { session: null }, error: new Error(message) }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => ({ error: new Error(message) }),
    signUp: async () => ({ data: { user: null, session: null }, error: new Error(message) }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error(message) }),
  },
})
