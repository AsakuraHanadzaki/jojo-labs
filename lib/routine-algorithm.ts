import { allProducts } from "./all-products"

export type ProductMap = Record<
  string,
  {
    id: string
    name: string
    category: string
    price: number
    image: string
    description?: string
    brand?: string
    size?: string
    rating?: number
    sub_category?: string
    key_ingredients?: string[]
    concerns?: string[]
    skin_type?: string
  }
>

export interface RoutineStep {
  step: string
  note?: string
  productId?: string
}

export interface RoutineInput {
  skinType: string
  concerns: string
  age: string
  routine: string
}

export interface RoutineResult {
  summary: string
  AM: RoutineStep[]
  PM: RoutineStep[]
  weekly?: Record<string, string>
  analysis: AnalysisSection[]
  recommendedProducts: string[]
}

export interface AnalysisSection {
  title: string
  description: string
  ingredients: string[]
}

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr))
const toTokens = (s: string) =>
  (s || "")
    .toLowerCase()
    .split(/[\s,/]+/)
    .filter(Boolean)

// Map user concerns to canonical buckets
const normalizeConcern = (c: string): string => {
  const n = c.trim().toLowerCase()
  if (["acne", "pimples", "breakouts"].includes(n)) return "acne"
  if (["pores", "blackheads", "whiteheads", "oil"].includes(n)) return "pores"
  if (["dark spots", "hyperpigmentation", "melasma"].includes(n)) return "pigment"
  if (["dryness", "dry"].includes(n)) return "dryness"
  if (["dehydration"].includes(n)) return "dehydration"
  if (["dullness", "texture"].includes(n)) return "texture"
  if (["fine lines", "wrinkles", "aging"].includes(n)) return "aging"
  if (["redness", "sensitivity", "rosacea"].includes(n)) return "sensitivity"
  if (["uneven tone"].includes(n)) return "uneven"
  return n
}

// Actives per bucket
const concernBuckets: Record<string, string[]> = {
  acne: ["BHA", "retinoid", "benzoyl_peroxide", "niacinamide", "azelaic"],
  pores: ["BHA", "niacinamide", "green_tea"],
  pigment: ["vitc", "niacinamide", "txa", "retinoid", "arbutin"],
  dryness: ["ceramides", "squalane", "snail", "beta_glucan"],
  dehydration: ["ha", "panthenol", "beta_glucan"],
  texture: ["aha", "retinoid", "mandelic"],
  aging: ["retinoid", "peptides", "ginseng"],
  sensitivity: ["centella", "mugwort", "panthenol", "heartleaf"],
  uneven: ["vitc", "niacinamide", "retinoid"],
}

function activeFromName(name: string, keyIngredients?: string[]): string[] {
  const n = name.toLowerCase()
  const flags: string[] = []

  // Check product name
  if (/bha|salicylic/.test(n)) flags.push("BHA")
  if (/aha/.test(n)) flags.push("aha")
  if (/retin/.test(n)) flags.push("retinoid")
  if (/benzoyl/.test(n)) flags.push("benzoyl_peroxide")
  if (/niacinamide/.test(n)) flags.push("niacinamide")
  if (/azelaic/.test(n)) flags.push("azelaic")
  if (/green tea/.test(n)) flags.push("green_tea")
  if (/vitamin c|vit c/.test(n)) flags.push("vitc")
  if (/tranexamic/.test(n)) flags.push("txa")
  if (/arbutin/.test(n)) flags.push("arbutin")
  if (/ceramide/.test(n)) flags.push("ceramides")
  if (/squalane/.test(n)) flags.push("squalane")
  if (/snail/.test(n)) flags.push("snail")
  if (/beta-glucan/.test(n)) flags.push("beta_glucan")
  if (/hyaluronic|ha\b/.test(n)) flags.push("ha")
  if (/peptide/.test(n)) flags.push("peptides")
  if (/ginseng/.test(n)) flags.push("ginseng")
  if (/centella|cica/.test(n)) flags.push("centella")
  if (/mugwort/.test(n)) flags.push("mugwort")
  if (/panthenol|bamboo/.test(n)) flags.push("panthenol")
  if (/heartleaf/.test(n)) flags.push("heartleaf")

  if (keyIngredients && Array.isArray(keyIngredients)) {
    keyIngredients.forEach((ingredient) => {
      const ing = ingredient.toLowerCase()
      if (/bha|salicylic/.test(ing)) flags.push("BHA")
      if (/aha|glycolic|lactic|mandelic/.test(ing)) flags.push("aha")
      if (/retin/.test(ing)) flags.push("retinoid")
      if (/benzoyl/.test(ing)) flags.push("benzoyl_peroxide")
      if (/niacinamide/.test(ing)) flags.push("niacinamide")
      if (/azelaic/.test(ing)) flags.push("azelaic")
      if (/green tea/.test(ing)) flags.push("green_tea")
      if (/vitamin c|ascorbic/.test(ing)) flags.push("vitc")
      if (/tranexamic/.test(ing)) flags.push("txa")
      if (/arbutin/.test(ing)) flags.push("arbutin")
      if (/ceramide/.test(ing)) flags.push("ceramides")
      if (/squalane/.test(ing)) flags.push("squalane")
      if (/snail/.test(ing)) flags.push("snail")
      if (/beta-glucan|beta glucan/.test(ing)) flags.push("beta_glucan")
      if (/hyaluronic|ha\b/.test(ing)) flags.push("ha")
      if (/peptide/.test(ing)) flags.push("peptides")
      if (/ginseng/.test(ing)) flags.push("ginseng")
      if (/centella|cica/.test(ing)) flags.push("centella")
      if (/mugwort/.test(ing)) flags.push("mugwort")
      if (/panthenol/.test(ing)) flags.push("panthenol")
      if (/heartleaf/.test(ing)) flags.push("heartleaf")
    })
  }

  return uniq(flags)
}

type Role = "cleanse-1" | "cleanse-2" | "hydrate" | "treat" | "exfoliate" | "moisturize" | "mask" | "spf"
function roleFromProduct(cat: string, name?: string, subCat?: string): Role {
  const c = (cat || "").toLowerCase()
  const n = (name || "").toLowerCase()
  const s = (subCat || "").toLowerCase()

  // Check sub-category first for more precise matching
  if (s) {
    if (/oil.*clean|hydrophilic|cleansing.*oil/.test(s)) return "cleanse-1"
    if (/sun|spf/.test(s)) return "spf"
    if (/foam|cleansing.*foam|gel.*clean|cleansing.*gel/.test(s)) return "cleanse-2"
    if (/toner|essence/.test(s)) return "hydrate"
    if (/mask/.test(s)) return "mask"
    if (/exfoliant|peel|pad/.test(s)) return "exfoliate"
    if (/moisturizer|cream|moisturiz/.test(s)) return "moisturize"
    if (/serum|treatment|ampoule/.test(s)) return "treat"
  }

  // Fall back to category and name matching
  if ((/oil/.test(c) && /clean/.test(c)) || (/oil/.test(n) && /clean/.test(n))) return "cleanse-1"
  if (/sun|spf/.test(c) || /spf|sunscreen/.test(n)) return "spf"
  if (
    /cleanser|cleansers|wash|cleansing.*foam|cleansing.*gel|foam.*clean/.test(c) ||
    /cleanser|foam|cleansing.*foam|cleansing.*gel|foam.*clean/.test(n)
  )
    return "cleanse-2"
  if (/toner|toners|essence|essences|hydrate/.test(c) || /toner|essence/.test(n)) return "hydrate"
  if (/mask|masks/.test(c) || /mask/.test(n)) return "mask"
  if (/exfol|exfoliants|pad/.test(c) || /exfol|pad/.test(n)) return "exfoliate"
  if (/moist|moisturizers|cream|creams|lotion/.test(c) || /cream|lotion|moistur/i.test(n)) return "moisturize"
  if (/serum|serums|treatment|treatments/.test(c)) return "treat"
  return "treat"
}

const TEMPLATES = {
  easy: {
    AM: ["cleanser", "serum", "moisturizer", "spf"],
    PM: ["oil_cleanser", "cleanser", "treatment", "moisturizer"],
  },
  intermediate: {
    AM: ["cleanser", "hydrate", "serum", "moisturizer", "spf"],
    PM: ["oil_cleanser", "cleanser", "exfoliant_nights", "treatment", "moisturizer"],
  },
  advanced: {
    AM: ["cleanser", "hydrate", "essence", "antioxidant", "second_serum", "moisturizer", "spf"],
    PM: ["oil_cleanser", "cleanser", "active_block", "buffer", "moisturizer", "sleeping_pack"],
  },
} as const

const STEP_ROLES: Record<string, Role[]> = {
  cleanser: ["cleanse-2"],
  oil_cleanser: ["cleanse-1"],
  hydrate: ["hydrate"],
  essence: ["hydrate"],
  serum: ["treat"],
  antioxidant: ["treat"],
  second_serum: ["treat"],
  treatment: ["treat"],
  exfoliant_nights: ["exfoliate"],
  moisturizer: ["moisturize"],
  sleeping_pack: ["mask"],
  spf: ["spf"],
  active_block: ["exfoliate", "treat"],
  buffer: ["hydrate"],
}

const SKIN_PREF: Record<string, { prefer: RegExp[]; avoid: RegExp[] }> = {
  oily: { prefer: [/gel|light/i, /pore|oil|bha|niacinamide/i], avoid: [/rich|balm|heavy/i] },
  combination: { prefer: [/gel|light/i], avoid: [] },
  dry: { prefer: [/cream|ceramide|snail|squalane/i], avoid: [/oil control/i] },
  sensitive: { prefer: [/centella|mugwort|panthenol|soothing|heartleaf/i], avoid: [/retinoid|aha|bha|peel/i] },
  normal: { prefer: [], avoid: [] },
}

function planActives(input: RoutineInput): string[] {
  const tokens = toTokens(input.concerns).map(normalizeConcern)
  return uniq(tokens.flatMap((t) => concernBuckets[t] || []))
}

function scoreProduct(id: string, slot: string, user: RoutineInput, actives: string[], products: ProductMap): number {
  const p = products[id]
  if (!p) return 0

  const acts = activeFromName(p.name, p.key_ingredients)
  const roles = STEP_ROLES[slot] || []
  const role = roleFromProduct(p.category, p.name, p.sub_category)

  console.log(`[v0] Scoring product ${id} (${p.name}) for slot ${slot}`)
  console.log(`[v0]   - Role: ${role}, Expected: ${roles.join(",")}`)
  console.log(`[v0]   - Concerns: ${p.concerns?.join(",")}`)
  console.log(`[v0]   - Skin type: ${p.skin_type}`)
  console.log(`[v0]   - Key ingredients: ${p.key_ingredients?.join(",")}`)

  const userConcerns = toTokens(user.concerns).map(normalizeConcern)
  let concernMatch = 0
  if (p.concerns && Array.isArray(p.concerns) && p.concerns.length > 0) {
    const productConcerns = p.concerns.map((c: string) => normalizeConcern(c.toLowerCase()))
    const matches = userConcerns.filter((uc) => productConcerns.includes(uc))
    concernMatch = userConcerns.length > 0 ? matches.length / userConcerns.length : 0
    console.log(`[v0]   - Concern match: ${concernMatch.toFixed(2)} (${matches.length}/${userConcerns.length})`)
  } else {
    concernMatch = actives.length ? actives.filter((a) => acts.includes(a)).length / actives.length : 0
    console.log(`[v0]   - Concern match (fallback): ${concernMatch.toFixed(2)}`)
  }

  const roleFit = roles.includes(role) ? 1 : 0.25

  let skinTypeMatch = 0.5
  if (p.skin_type) {
    const productSkinTypes = p.skin_type
      .toLowerCase()
      .split(/[,/]/)
      .map((s) => s.trim())
    if (productSkinTypes.includes("all") || productSkinTypes.includes("all skin types")) {
      skinTypeMatch = 0.7
    } else if (productSkinTypes.includes(user.skinType.toLowerCase())) {
      skinTypeMatch = 1.0
    } else if (
      (user.skinType === "combination" && (productSkinTypes.includes("oily") || productSkinTypes.includes("dry"))) ||
      (user.skinType === "oily" && productSkinTypes.includes("combination"))
    ) {
      skinTypeMatch = 0.6
    } else {
      skinTypeMatch = 0.2
    }
    console.log(`[v0]   - Skin type match: ${skinTypeMatch.toFixed(2)}`)
  }

  const pref = SKIN_PREF[user.skinType] || { prefer: [], avoid: [] }
  let texturePreference = 0
  if (pref.prefer.some((rx) => rx.test(p.name) || rx.test(p.sub_category || ""))) {
    texturePreference += 0.3
  }
  if (pref.avoid.some((rx) => rx.test(p.name) || rx.test(p.sub_category || ""))) {
    texturePreference -= 0.4
  }

  const finalScore = 0.35 * concernMatch + 0.25 * roleFit + 0.25 * skinTypeMatch + 0.15 * texturePreference

  console.log(
    `[v0]   - Final score: ${finalScore.toFixed(3)} (concern:${(0.35 * concernMatch).toFixed(2)} role:${(0.25 * roleFit).toFixed(2)} skin:${(0.25 * skinTypeMatch).toFixed(2)} texture:${(0.15 * texturePreference).toFixed(2)})`,
  )

  return finalScore
}

function pickFor(
  slot: string,
  user: RoutineInput,
  wanted: string[],
  products: ProductMap,
  limit = 1,
  opts?: { excludeOil?: boolean; usedProducts?: Set<string> },
): string[] {
  const roles = STEP_ROLES[slot] || []

  console.log(`[v0] Picking products for slot: ${slot}, roles: ${roles.join(",")}`)

  const candidates = Object.keys(products).filter((id) => {
    if (opts?.usedProducts?.has(id)) return false

    const prod = products[id]
    const role = roleFromProduct(prod.category, prod.name, prod.sub_category)
    if (!roles.includes(role)) return false

    if (opts?.excludeOil) {
      const isOil = role === "cleanse-1" || /\boil\b/i.test(prod.name) || /\boil\b/i.test(prod.category)
      if (isOil) return false
    }
    return true
  })

  console.log(`[v0] Found ${candidates.length} candidates for slot ${slot}`)

  const ranked = candidates.map((id) => ({ id, s: scoreProduct(id, slot, user, wanted, products) }))
  ranked.sort((a, b) => b.s - a.s)

  const selected = Array.from(new Set(ranked.slice(0, limit).map((r) => r.id)))
  console.log(`[v0] Selected products: ${selected.join(", ")}`)

  return selected
}

const SKIN_ANALYSIS: Record<string, { desc: string; ingredients: string[] }> = {
  oily: {
    desc: "Oily skin often feels greasy with enlarged pores and is prone to blackheads. Lightweight gel cleansers and oil-control ingredients like niacinamide and BHA help balance sebum production.",
    ingredients: ["BHA", "Niacinamide", "Green Tea"],
  },
  dry: {
    desc: "Dry skin often feels tight and may flake. Nourishing creams with ceramides, squalane and snail mucin restore moisture and strengthen the skin barrier.",
    ingredients: ["Ceramides", "Squalane", "Snail Mucin"],
  },
  combination: {
    desc: "Combination skin has an oily T‑zone and dry cheeks. Gentle exfoliation and balancing ingredients like niacinamide and AHAs help even texture and hydration.",
    ingredients: ["Niacinamide", "Mandelic Acid", "Matcha"],
  },
  sensitive: {
    desc: "Sensitive skin is easily irritated and prone to redness. Soothing ingredients like centella, mugwort and panthenol calm inflammation and repair the barrier.",
    ingredients: ["Centella", "Mugwort", "Panthenol"],
  },
  normal: {
    desc: "Normal skin is balanced and not overly oily or dry. Maintain by using gentle cleansers, hydrating toners and broad‑spectrum sunscreen.",
    ingredients: ["Hyaluronic Acid", "Glycerin", "Green Tea"],
  },
}

const CONCERN_ANALYSIS: Record<string, { desc: string; ingredients: string[] }> = {
  acne: {
    desc: "Acne requires pore‑clearing ingredients like BHA and retinoids alongside soothing agents. Introduce retinoids slowly to prevent irritation.",
    ingredients: ["BHA", "Retinoid", "Mugwort", "Niacinamide"],
  },
  pigment: {
    desc: "Dark spots and hyperpigmentation are treated with vitamin C, niacinamide and tranexamic acid. Introduce retinoids and exfoliants gradually.",
    ingredients: ["Vitamin C", "Niacinamide", "Tranexamic Acid"],
  },
  pores: {
    desc: "Clogged pores benefit from salicylic acid and oil‑control ingredients like zinc PCA and tea tree. Regular exfoliation keeps pores clear.",
    ingredients: ["BHA", "Niacinamide", "Green Tea"],
  },
  dehydration: {
    desc: "Dehydrated skin lacks water, not oil. Humectants like hyaluronic acid and panthenol attract moisture, while ceramides lock it in.",
    ingredients: ["Hyaluronic Acid", "Panthenol", "Beta‑Glucan"],
  },
  texture: {
    desc: "Uneven texture needs gentle exfoliation and renewal. Use AHA/BHA on alternate nights and retinoids to boost cell turnover.",
    ingredients: ["AHA", "BHA", "Retinoid"],
  },
  aging: {
    desc: "Fine lines and loss of firmness respond to retinoids, peptides and antioxidants. Start slow and use SPF daily.",
    ingredients: ["Retinoid", "Peptides", "Vitamin C"],
  },
  sensitivity: {
    desc: "Sensitive skin easily inflames; avoid harsh actives. Choose calming agents like centella, heartleaf and mugwort.",
    ingredients: ["Centella", "Mugwort", "Panthenol"],
  },
  dryness: {
    desc: "Dry skin benefits from occlusive creams and barrier‑repair ingredients. Look for ceramides, urea and squalane.",
    ingredients: ["Ceramides", "Urea", "Squalane"],
  },
  uneven: {
    desc: "Uneven tone can be caused by sun damage or acne marks. Ingredients like vitamin C, niacinamide and retinoids help even skin tone.",
    ingredients: ["Vitamin C", "Niacinamide", "Retinoid"],
  },
}

function weeklyPlan(level: string, isSensitive: boolean, hasRet: boolean, hasExf: boolean): Record<string, string> {
  const plan: Record<string, string> = {}

  if (level === "advanced") {
    plan["Exfoliant"] = "2–3 nights/week"
    plan["Retinoid"] = "3–4 nights/week"
    plan["Sleeping Pack"] = "1–2 times/week"
  } else if (level === "intermediate") {
    plan["Exfoliant"] = "1–2 nights/week"
    plan["Retinoid"] = "2–3 nights/week"
    plan["Sleeping Pack"] = "1 time/week"
  } else if (level === "easy") {
    plan["Exfoliant"] = "1 night/week"
    plan["Retinoid"] = "1 night/week"
    plan["Sleeping Pack"] = "1 time/week"
  }

  if (isSensitive) {
    plan["Sunscreen"] = "Daily"
  } else {
    plan["Sunscreen"] = "Daily"
  }

  return plan
}

export function buildRoutine(input: RoutineInput, productsMap?: ProductMap): RoutineResult {
  const products: ProductMap = productsMap || (allProducts as unknown as ProductMap)

  console.log(`[v0] Building routine for:`)
  console.log(`[v0]   - Skin type: ${input.skinType}`)
  console.log(`[v0]   - Concerns: ${input.concerns}`)
  console.log(`[v0]   - Routine level: ${input.routine}`)
  console.log(`[v0]   - Total products available: ${Object.keys(products).length}`)

  const level = (input.routine || "easy").toLowerCase().replace("basic", "easy")
  const actives = planActives(input)

  const template = TEMPLATES[level as keyof typeof TEMPLATES]
  const AM: RoutineStep[] = []
  const PM: RoutineStep[] = []

  const usedInAM = new Set<string>()
  const usedInPM = new Set<string>()

  template.AM.forEach((slot) => {
    const pid =
      slot === "cleanser"
        ? pickFor(slot, input, actives, products, 1, { excludeOil: true, usedProducts: usedInAM })[0]
        : pickFor(slot, input, actives, products, 1, { usedProducts: usedInAM })[0]

    if (pid) usedInAM.add(pid)

    const label =
      slot === "cleanser"
        ? "Gel/Foam Cleanser (AM – removes overnight oil & debris)"
        : slot === "hydrate"
          ? "Hydrating Toner/Essence (AM)"
          : slot === "essence"
            ? "Essence (AM)"
            : slot === "antioxidant"
              ? "Antioxidant (AM)"
              : slot === "serum"
                ? "Serum (AM)"
                : slot === "second_serum"
                  ? "Second Serum (AM)"
                  : slot === "moisturizer"
                    ? "Moisturizer (AM)"
                    : slot === "spf"
                      ? "Sunscreen SPF 50 (AM)"
                      : slot

    AM.push({ step: label, productId: pid })
  })

  template.PM.forEach((slot) => {
    const pid = pickFor(slot, input, actives, products, 1, { usedProducts: usedInPM })[0]

    if (pid) usedInPM.add(pid)

    const label =
      slot === "oil_cleanser"
        ? "Oil Cleanser (PM – removes makeup & sunscreen)"
        : slot === "cleanser"
          ? "Gel/Cream Cleanser (PM – second cleanse)"
          : slot === "exfoliant_nights"
            ? "Exfoliant (PM – 2–3 nights/week)"
            : slot === "treatment"
              ? "Treatment (PM – retinoid/active)"
              : slot === "active_block"
                ? "Active Slot (PM – rotate retinoid & exfoliant)"
                : slot === "buffer"
                  ? "Buffer/Soothing Essence (PM)"
                  : slot === "moisturizer"
                    ? "Moisturizer (PM)"
                    : slot === "sleeping_pack"
                      ? "Sleeping Pack (PM – 1–2×/week)"
                      : slot

    PM.push({ step: label, productId: pid })
  })

  const pickedActs = uniq(
    [...AM, ...PM].flatMap((s) => {
      const product = products[s.productId || ""]
      return activeFromName(product?.name || "", product?.key_ingredients)
    }),
  )
  const hasRet = pickedActs.includes("retinoid")
  const hasExf = pickedActs.includes("BHA") || pickedActs.includes("aha") || pickedActs.includes("mandelic")
  const weekly = weeklyPlan(level, input.skinType === "sensitive", hasRet, hasExf)

  const analysis: AnalysisSection[] = []
  if (SKIN_ANALYSIS[input.skinType]) {
    const { desc, ingredients } = SKIN_ANALYSIS[input.skinType]
    analysis.push({
      title: `${input.skinType.charAt(0).toUpperCase()}${input.skinType.slice(1)} Skin`,
      description: desc,
      ingredients,
    })
  }
  const concernTokens = toTokens(input.concerns).map(normalizeConcern)
  concernTokens.forEach((c) => {
    if (CONCERN_ANALYSIS[c]) {
      const { desc, ingredients } = CONCERN_ANALYSIS[c]
      analysis.push({
        title: c.replace(/^./, (x) => x.toUpperCase()),
        description: desc,
        ingredients,
      })
    }
  })

  const summary = `Your skin type is ${input.skinType.charAt(0).toUpperCase() + input.skinType.slice(1)}. Your top concerns: ${concernTokens.map((c) => c.replace(/^./, (x) => x.toUpperCase())).join(", ")}.`

  const recommendedProducts = uniq([...AM, ...PM].map((s) => s.productId || "").filter(Boolean) as string[])

  return { summary, AM, PM, weekly, analysis, recommendedProducts }
}
