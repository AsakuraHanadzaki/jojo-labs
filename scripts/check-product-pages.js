#!/usr/bin/env node

const fs = require("fs/promises")
const path = require("path")

const DEFAULT_BASE_URL = "https://v0-online-store-design.vercel.app"

function normalizeBaseUrl(value) {
  const trimmed = (value || DEFAULT_BASE_URL).trim()
  if (!trimmed) return DEFAULT_BASE_URL
  return trimmed.replace(/\/$/, "")
}

const baseUrl = normalizeBaseUrl(process.env.PRODUCTION_BASE_URL)

async function getProductIdsFromApi() {
  try {
    const response = await fetch(`${baseUrl}/api/products`, { headers: { accept: "application/json" } })

    if (!response.ok) {
      throw new Error(`status ${response.status} from /api/products`)
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
      throw new Error(`unexpected response shape: ${typeof data}`)
    }

    const ids = data.map((item) => item?.id).filter(Boolean)
    return { ids, source: "production API", warning: ids.length === 0 ? "no product ids returned" : undefined }
  } catch (error) {
    return { ids: [], source: "production API", warning: error.message || String(error) }
  }
}

async function getFallbackIds() {
  const filePath = path.join(__dirname, "..", "lib", "all-products.ts")
  const contents = await fs.readFile(filePath, "utf8")
  const matches = Array.from(contents.matchAll(/"([^"]+)":\s*{/g))
  const ids = matches.map((match) => match[1])
  return { ids, source: "lib/all-products.ts" }
}

async function checkProductPage(id) {
  const url = `${baseUrl}/products/${id}`
  const start = Date.now()
  try {
    const response = await fetch(url)
    return {
      id,
      url,
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      durationMs: Date.now() - start,
    }
  } catch (error) {
    return {
      id,
      url,
      ok: false,
      status: null,
      finalUrl: null,
      error: error.message || String(error),
      durationMs: Date.now() - start,
    }
  }
}

;(async function main() {
  const apiResult = await getProductIdsFromApi()
  let productIds = apiResult.ids
  const warnings = []
  if (apiResult.warning) {
    warnings.push(apiResult.warning)
  }

  let source = apiResult.source
  if (productIds.length === 0) {
    const fallback = await getFallbackIds()
    productIds = fallback.ids
    source = fallback.source
    warnings.push("Falling back to local product list because production API did not return any ids.")
  }

  if (productIds.length === 0) {
    console.error("No product ids available to test.")
    process.exit(1)
    return
  }

  console.log(`Checking ${productIds.length} product pages from ${source} against ${baseUrl}...`)
  if (warnings.length) {
    warnings.forEach((warning) => console.warn(`⚠️  ${warning}`))
  }

  const results = []
  for (const id of productIds) {
    results.push(await checkProductPage(id))
  }

  const failures = results.filter((result) => !result.ok)
  const successes = results.filter((result) => result.ok)

  console.log("\nAccessible pages:")
  successes.forEach((result) => {
    console.log(`✔ ${result.id} (${result.status}) - ${result.finalUrl} [${result.durationMs}ms]`)
  })

  if (failures.length) {
    console.log("\nUnavailable pages:")
    failures.forEach((result) => {
      const details = result.error ? `error: ${result.error}` : `status ${result.status}`
      console.log(`✖ ${result.id} - ${details} (${result.url})`)
    })
  }

  console.log(`\nSummary: ${successes.length}/${results.length} pages accessible.`)
  process.exitCode = failures.length > 0 ? 1 : 0
})()
