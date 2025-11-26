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

// Infer actives from product name via keywords
function activeFromName(name: string): string[] {
  const n = name.toLowerCase()
  const flags: string[] = []
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
  return uniq(flags)
}

// Map category to slot
type Role = "cleanse-1" | "cleanse-2" | "hydrate" | "treat" | "exfoliate" | "moisturize" | "mask" | "spf"
function roleFromProduct(cat: string, name?: string): Role {
  const c = (cat || "").toLowerCase()
  const n = (name || "").toLowerCase()

  if ((/oil/.test(c) && /clean/.test(c)) || (/oil/.test(n) && /clean/.test(n))) return "cleanse-1"
  if (/sun|spf/.test(c) || /spf|sunscreen/.test(n)) return "spf"
  if (/cleanser|wash|foam/.test(c) || /cleanser|foam/.test(n)) return "cleanse-2"
  if (/toner|essence|hydrate/.test(c) || /toner|essence/.test(n)) return "hydrate"
  if (/mask/.test(c) || /mask/.test(n)) return "mask"
  if (/exfol|pad/.test(c) || /exfol|pad/.test(n)) return "exfoliate"
  if (/moist|cream|lotion/.test(c) || /cream|lotion|moistur/i.test(n)) return "moisturize"
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
  const acts = activeFromName(p.name)
  const roles = STEP_ROLES[slot] || []
  const role = roleFromProduct(p.category, p.name)
  const concernMatch = actives.length ? actives.filter((a) => acts.includes(a)).length / actives.length : 0
  const roleFit = roles.includes(role) ? 1 : 0.25
  const pref = SKIN_PREF[user.skinType] || { prefer: [], avoid: [] }
  let skinFit = 0.5
  if (pref.prefer.some((rx) => rx.test(p.name))) skinFit += 0.3
  if (pref.avoid.some((rx) => rx.test(p.name))) skinFit -= 0.3
  return 0.5 * concernMatch + 0.3 * roleFit + 0.2 * skinFit
}

function pickFor(
  slot: string,
  user: RoutineInput,
  wanted: string[],
  products: ProductMap,
  limit = 1,
  opts?: { excludeOil?: boolean },
): string[] {
  const roles = STEP_ROLES[slot] || []

  const candidates = Object.keys(products).filter((id) => {
    const prod = products[id]
    const role = roleFromProduct(prod.category, prod.name)
    if (!roles.includes(role)) return false

    if (opts?.excludeOil) {
      const isOil = role === "cleanse-1" || /\boil\b/i.test(prod.name) || /\boil\b/i.test(prod.category)
      if (isOil) return false
    }
    return true
  })

  const ranked = candidates.map((id) => ({ id, s: scoreProduct(id, slot, user, wanted, products) }))
  ranked.sort((a, b) => b.s - a.s)
  return Array.from(new Set(ranked.slice(0, limit).map((r) => r.id)))
}

function weeklyPlan(level: string, sensitive: boolean, hasRet: boolean, hasExf: boolean): Record<string, string> {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const plan: Record<string, string> = {}
  if (level === "easy") {
    days.forEach((d) => (plan[d] = "PM: Barrier care (cleanse → moisturize)"))
    if (hasExf) plan["Tue"] = "PM: Gentle exfoliant"
    if (hasRet) plan["Thu"] = "PM: Retinoid"
    return plan
  }
  days.forEach((d) => (plan[d] = "PM: Barrier care"))
  if (hasExf) {
    plan["Tue"] = "PM: Exfoliant"
    plan["Sat"] = "PM: Exfoliant"
  }
  if (hasRet) {
    plan["Thu"] = "PM: Retinoid"
    plan["Sun"] = sensitive ? "PM: Bakuchiol/low-strength retinoid" : "PM: Retinoid"
  }
  return plan
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

export function buildRoutine(input: RoutineInput, productsMap?: ProductMap): RoutineResult {
  // Use provided products or fall back to hardcoded allProducts
  const products: ProductMap = productsMap || (allProducts as unknown as ProductMap)

  const level = (input.routine || "easy").toLowerCase().replace("basic", "easy")
  const actives = planActives(input)

  const template = TEMPLATES[level as keyof typeof TEMPLATES]
  const AM: RoutineStep[] = []
  const PM: RoutineStep[] = []

  template.AM.forEach((slot) => {
    const pid =
      slot === "cleanser"
        ? pickFor(slot, input, actives, products, 1, { excludeOil: true })[0]
        : pickFor(slot, input, actives, products)[0]

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
    const pid = pickFor(slot, input, actives, products)[0]
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
      return activeFromName(product?.name || "")
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
