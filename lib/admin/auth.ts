import crypto from "crypto"

const LOGIN_RATE_LIMIT_WINDOW_MS = 60_000
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>()

export function hashSecret(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex")
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false

  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

export function signValue(value: string, secret: string) {
  const signature = crypto.createHmac("sha256", secret).update(value).digest("hex")
  return `${value}.${signature}`
}

export function verifySignedValue(signed: string, secret: string) {
  const parts = signed.split(".")
  if (parts.length !== 2) return null

  const [value, signature] = parts
  const expected = crypto.createHmac("sha256", secret).update(value).digest("hex")
  if (!safeEqual(signature, expected)) return null

  return value
}

export function createSessionPayload() {
  return {
    sub: "admin",
    exp: Date.now() + 1000 * 60 * 60 * 8,
  }
}

export function encodeSessionPayload() {
  return Buffer.from(JSON.stringify(createSessionPayload())).toString("base64url")
}

export function verifySessionPayload(value: string) {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8")
    const payload = JSON.parse(decoded)

    if (!payload || !payload.sub || !payload.exp) return false
    return Number(payload.exp) > Date.now()
  } catch {
    return false
  }
}

export function isRateLimited(identifier: string) {
  const now = Date.now()
  const bucket = loginAttempts.get(identifier)

  if (!bucket) return false

  if (now - bucket.firstAttempt > LOGIN_RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(identifier)
    return false
  }

  return bucket.count >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS
}

export function registerLoginAttempt(identifier: string) {
  const now = Date.now()
  const current = loginAttempts.get(identifier)

  if (!current || now - current.firstAttempt > LOGIN_RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(identifier, { count: 1, firstAttempt: now })
    return false
  }

  const nextCount = current.count + 1
  loginAttempts.set(identifier, { count: nextCount, firstAttempt: current.firstAttempt })
  return nextCount >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS
}
