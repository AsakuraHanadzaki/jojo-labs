// Routine algorithm - Updated March 2026 - Only recommends in-stock products
import { allProducts } from "./all-products"
import { getTranslation, type Language } from "./i18n"

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
  language?: Language
}

export interface RoutineResult {
  summary: string
  AM: RoutineStep[]
  PM: RoutineStep[]
  weekly?: Record<string, string>
  analysis: AnalysisSection[]
  recommendedProducts: RecommendedProduct[]
}

export interface RecommendedProduct {
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

const formatTemplate = (template: string, values: Record<string, string>) =>
  Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, value), template)

// Map user concerns to canonical buckets
const normalizeConcern = (c: string): string => {
  const n = c.trim().toLowerCase()
  // Acne-related concerns
  if (/acne|pimples?|breakouts?|blemish/.test(n)) return "acne"
  // Pore-related concerns  
  if (/pores?|blackheads?|whiteheads?|clogged|excess oil|oily|sebum/.test(n)) return "pores"
  // Pigmentation concerns
  if (/dark spots?|hyperpigmentation|melasma|spots?|uneven tone|discoloration/.test(n)) return "pigment"
  // Dryness concerns
  if (/dryness|dry skin|dry\b/.test(n)) return "dryness"
  // Dehydration concerns
  if (/dehydrat/.test(n)) return "dehydration"
  // Texture/dullness concerns
  if (/dullness|dull|texture|rough|uneven texture/.test(n)) return "texture"
  // Aging concerns
  if (/fine lines?|wrinkles?|aging|anti-?aging|mature|photoaging/.test(n)) return "aging"
  // Sensitivity concerns
  if (/redness|sensitiv|rosacea|irritat|inflam|compromised barrier|barrier/.test(n)) return "sensitivity"
  // Uneven tone
  if (/uneven|tone/.test(n)) return "uneven"
  return n
}

// Check if a product concern matches any user concern
const concernsMatch = (productConcern: string, userConcerns: string[]): boolean => {
  const normalizedProduct = normalizeConcern(productConcern)
  return userConcerns.some(uc => {
    const normalizedUser = normalizeConcern(uc)
    // Direct match
    if (normalizedProduct === normalizedUser) return true
    // Partial match - check if they share the same bucket
    return normalizedProduct.includes(normalizedUser) || normalizedUser.includes(normalizedProduct)
  })
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

  // Parse user concerns - handle both comma-separated and space-separated
  const userConcernsList = user.concerns
    .split(/[,\n]+/)
    .map(c => c.trim().toLowerCase())
    .filter(Boolean)
  
  let concernMatch = 0
  if (p.concerns && Array.isArray(p.concerns) && p.concerns.length > 0) {
    // Count how many product concerns match any user concern
    const matchingConcerns = p.concerns.filter((pc: string) => 
      concernsMatch(pc, userConcernsList)
    )
    // Score based on how many user concerns are addressed
    const userConcernsAddressed = userConcernsList.filter(uc =>
      p.concerns.some((pc: string) => concernsMatch(pc, [uc]))
    )
    concernMatch = userConcernsList.length > 0 
      ? userConcernsAddressed.length / userConcernsList.length 
      : 0
    console.log(`[v0]   - Product concerns: ${p.concerns.join(", ")}`)
    console.log(`[v0]   - User concerns: ${userConcernsList.join(", ")}`)
    console.log(`[v0]   - Matching concerns: ${matchingConcerns.join(", ")}`)
    console.log(`[v0]   - Concern match: ${concernMatch.toFixed(2)} (${userConcernsAddressed.length}/${userConcernsList.length} user concerns addressed)`)
  } else {
    concernMatch = actives.length ? actives.filter((a) => acts.includes(a)).length / actives.length : 0
    console.log(`[v0]   - Concern match (ingredient fallback): ${concernMatch.toFixed(2)}`)
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

const SKIN_ANALYSIS: Record<string, { descKey: string; ingredients: string[] }> = {
  oily: {
    descKey: "routine.analysis.skin.oily.desc",
    ingredients: ["ingredient.bha", "ingredient.niacinamide", "ingredient.green_tea"],
  },
  dry: {
    descKey: "routine.analysis.skin.dry.desc",
    ingredients: ["ingredient.ceramides", "ingredient.squalane", "ingredient.snail_mucin"],
  },
  combination: {
    descKey: "routine.analysis.skin.combination.desc",
    ingredients: ["ingredient.niacinamide", "ingredient.mandelic_acid", "ingredient.matcha"],
  },
  sensitive: {
    descKey: "routine.analysis.skin.sensitive.desc",
    ingredients: ["ingredient.centella", "ingredient.mugwort", "ingredient.panthenol"],
  },
  normal: {
    descKey: "routine.analysis.skin.normal.desc",
    ingredients: ["ingredient.hyaluronic_acid", "ingredient.glycerin", "ingredient.green_tea"],
  },
}

const CONCERN_ANALYSIS: Record<string, { descKey: string; ingredients: string[] }> = {
  acne: {
    descKey: "routine.analysis.concern.acne.desc",
    ingredients: ["ingredient.bha", "ingredient.retinoid", "ingredient.mugwort", "ingredient.niacinamide"],
  },
  pigment: {
    descKey: "routine.analysis.concern.pigment.desc",
    ingredients: ["ingredient.vitamin_c", "ingredient.niacinamide", "ingredient.tranexamic_acid"],
  },
  pores: {
    descKey: "routine.analysis.concern.pores.desc",
    ingredients: ["ingredient.bha", "ingredient.niacinamide", "ingredient.green_tea"],
  },
  dehydration: {
    descKey: "routine.analysis.concern.dehydration.desc",
    ingredients: ["ingredient.hyaluronic_acid", "ingredient.panthenol", "ingredient.beta_glucan"],
  },
  texture: {
    descKey: "routine.analysis.concern.texture.desc",
    ingredients: ["ingredient.aha", "ingredient.bha", "ingredient.retinoid"],
  },
  aging: {
    descKey: "routine.analysis.concern.aging.desc",
    ingredients: ["ingredient.retinoid", "ingredient.peptides", "ingredient.vitamin_c"],
  },
  sensitivity: {
    descKey: "routine.analysis.concern.sensitivity.desc",
    ingredients: ["ingredient.centella", "ingredient.mugwort", "ingredient.panthenol"],
  },
  dryness: {
    descKey: "routine.analysis.concern.dryness.desc",
    ingredients: ["ingredient.ceramides", "ingredient.urea", "ingredient.squalane"],
  },
  uneven: {
    descKey: "routine.analysis.concern.uneven.desc",
    ingredients: ["ingredient.vitamin_c", "ingredient.niacinamide", "ingredient.retinoid"],
  },
}

function weeklyPlan(
  level: string,
  isSensitive: boolean,
  hasRet: boolean,
  hasExf: boolean,
  language: Language,
): Record<string, string> {
  const plan: Record<string, string> = {}
  const t = (key: string) => getTranslation(key, language)

  if (level === "advanced") {
    plan[t("routine.weekly.exfoliant")] = t("routine.weekly.exfoliant.advanced")
    plan[t("routine.weekly.retinoid")] = t("routine.weekly.retinoid.advanced")
    plan[t("routine.weekly.sleeping_pack")] = t("routine.weekly.sleeping_pack.advanced")
  } else if (level === "intermediate") {
    plan[t("routine.weekly.exfoliant")] = t("routine.weekly.exfoliant.intermediate")
    plan[t("routine.weekly.retinoid")] = t("routine.weekly.retinoid.intermediate")
    plan[t("routine.weekly.sleeping_pack")] = t("routine.weekly.sleeping_pack.intermediate")
  } else if (level === "easy") {
    plan[t("routine.weekly.exfoliant")] = t("routine.weekly.exfoliant.easy")
    plan[t("routine.weekly.retinoid")] = t("routine.weekly.retinoid.easy")
    plan[t("routine.weekly.sleeping_pack")] = t("routine.weekly.sleeping_pack.easy")
  }

  if (isSensitive) {
    plan[t("routine.weekly.sunscreen")] = t("routine.weekly.sunscreen.daily")
  } else {
    plan[t("routine.weekly.sunscreen")] = t("routine.weekly.sunscreen.daily")
  }

  return plan
}

export function buildRoutine(input: RoutineInput, productsMap?: ProductMap): RoutineResult {
  // IMPORTANT: Only use productsMap if provided (contains only in-stock products from DB)
  // Only fall back to allProducts if no productsMap is provided at all
  const hasDbProducts = productsMap && Object.keys(productsMap).length > 0
  const products: ProductMap = hasDbProducts ? productsMap : (allProducts as unknown as ProductMap)
  const language = input.language || "en"
  const t = (key: string) => getTranslation(key, language)

  console.log(`[v0] Building routine for:`)
  console.log(`[v0]   - Skin type: ${input.skinType}`)
  console.log(`[v0]   - Concerns: ${input.concerns}`)
  console.log(`[v0]   - Routine level: ${input.routine}`)
  console.log(`[v0]   - Using DB products: ${hasDbProducts}`)
  console.log(`[v0]   - Total products available: ${Object.keys(products).length}`)
  if (hasDbProducts) {
    console.log(`[v0]   - Products: ${Object.values(products).map(p => p.name).join(", ")}`)
  }

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

    const labelKey =
      slot === "cleanser"
        ? "routine.step.am.cleanser"
        : slot === "hydrate"
          ? "routine.step.am.hydrate"
          : slot === "essence"
            ? "routine.step.am.essence"
            : slot === "antioxidant"
              ? "routine.step.am.antioxidant"
              : slot === "serum"
                ? "routine.step.am.serum"
                : slot === "second_serum"
                  ? "routine.step.am.second_serum"
                  : slot === "moisturizer"
                    ? "routine.step.am.moisturizer"
                    : slot === "spf"
                      ? "routine.step.am.spf"
                      : ""
    const label = labelKey ? t(labelKey) : slot

    AM.push({ step: label, productId: pid })
  })

  template.PM.forEach((slot) => {
    const pid = pickFor(slot, input, actives, products, 1, { usedProducts: usedInPM })[0]

    if (pid) usedInPM.add(pid)

    const labelKey =
      slot === "oil_cleanser"
        ? "routine.step.pm.oil_cleanser"
        : slot === "cleanser"
          ? "routine.step.pm.cleanser"
          : slot === "exfoliant_nights"
            ? "routine.step.pm.exfoliant"
            : slot === "treatment"
              ? "routine.step.pm.treatment"
              : slot === "active_block"
                ? "routine.step.pm.active_block"
                : slot === "buffer"
                  ? "routine.step.pm.buffer"
                  : slot === "moisturizer"
                    ? "routine.step.pm.moisturizer"
                    : slot === "sleeping_pack"
                      ? "routine.step.pm.sleeping_pack"
                      : ""
    const label = labelKey ? t(labelKey) : slot

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
  const weekly = weeklyPlan(level, input.skinType === "sensitive", hasRet, hasExf, language)

  const analysis: AnalysisSection[] = []
  if (SKIN_ANALYSIS[input.skinType]) {
    const { descKey, ingredients } = SKIN_ANALYSIS[input.skinType]
    analysis.push({
      title: t(`routine.analysis.skin.${input.skinType}.title`),
      description: t(descKey),
      ingredients: ingredients.map((ingredient) => t(ingredient)),
    })
  }
  const concernTokens = toTokens(input.concerns).map(normalizeConcern)
  concernTokens.forEach((c) => {
    if (CONCERN_ANALYSIS[c]) {
      const { descKey, ingredients } = CONCERN_ANALYSIS[c]
      analysis.push({
        title: t(`routine.concern.${c}`),
        description: t(descKey),
        ingredients: ingredients.map((ingredient) => t(ingredient)),
      })
    }
  })

  const summary = formatTemplate(t("routine.summary"), {
    skinType: t(`routine.skintype.${input.skinType}`),
    concerns: concernTokens.map((c) => t(`routine.concern.${c}`)).join(", "),
  })

  const recommendedProductIds = uniq([...AM, ...PM].map((s) => s.productId || "").filter(Boolean) as string[])
  
  // Only include products that exist in our products map (which only contains in-stock items)
  const recommendedProducts = recommendedProductIds
    .map((id) => products[id])
    .filter((product) => {
      if (!product) {
        console.log(`[v0] WARNING: Product ID not found in available products`)
        return false
      }
      return true
    })
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      description: product.description,
      brand: product.brand,
      size: product.size,
      rating: product.rating,
      sub_category: product.sub_category,
      key_ingredients: product.key_ingredients,
      concerns: product.concerns,
      skin_type: product.skin_type,
    }))

  console.log(`[v0] Final recommended products (${recommendedProducts.length}):`)
  recommendedProducts.forEach(p => console.log(`[v0]   - ${p.name}`))

  return { summary, AM, PM, weekly, analysis, recommendedProducts }
}
