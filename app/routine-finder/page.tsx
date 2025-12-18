"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCart } from "@/components/shopping-cart"
import { HeaderWithSearch } from "@/components/header-with-search"
import { Footer } from "@/components/footer"
import type { RoutineResult } from "@/lib/routine-algorithm"
import { allProducts } from "@/lib/all-products"
import { Sun, Moon, Droplets, Sparkles, Shield, Heart } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface FollowUpQuestion {
  id: string
  question: string
  options: { [key: string]: string }
  multi?: boolean
}

const CONCERN_OPTIONS = [
  { key: "acne", labelKey: "routine.concern.acne" },
  { key: "pores", labelKey: "routine.concern.pores" },
  { key: "pigment", labelKey: "routine.concern.pigment" },
  { key: "texture", labelKey: "routine.concern.texture" },
  { key: "dehydration", labelKey: "routine.concern.dehydration" },
  { key: "dryness", labelKey: "routine.concern.dryness" },
  { key: "aging", labelKey: "routine.concern.aging" },
  { key: "sensitivity", labelKey: "routine.concern.sensitivity" },
  { key: "uneven", labelKey: "routine.concern.uneven" },
]

const FOLLOW_UPS: Record<string, FollowUpQuestion> = {
  acne: {
    id: "acne-type",
    question: "How would you describe your acne?",
    options: { red: "Inflamed/red bumps", pus: "Pustules (whiteheads with pus)" },
  },
  pores: {
    id: "pores-severity",
    question: "How oily does your skin get after washing?",
    options: {
      oneHour: "Very oily after one hour",
      midday: "Normal until midday then oily",
      evening: "Fine until evening",
    },
  },
  pigment: {
    id: "pigment-cause",
    question: "What causes your dark spots?",
    options: { sun: "Sun exposure", acne: "Acne scars", unsure: "I'm not sure" },
  },
}

const ROUTINE_MAP: Record<string, string> = {
  "1-3": "easy",
  "4-5": "intermediate",
  "6+": "advanced",
}

const SKIN_TYPES = [
  { key: "oily", labelKey: "routine.skintype.oily" },
  { key: "dry", labelKey: "routine.skintype.dry" },
  { key: "combination", labelKey: "routine.skintype.combination" },
  { key: "normal", labelKey: "routine.skintype.normal" },
]

const TEXTURE_PREFS = [
  { key: "smooth", labelKey: "routine.texture.smooth" },
  { key: "matte", labelKey: "routine.texture.matte" },
  { key: "oil-prone", labelKey: "routine.texture.oil-prone" },
  { key: "combination", labelKey: "routine.texture.combination" },
]

const getStepIcon = (stepName: string, isAM: boolean) => {
  const step = stepName.toLowerCase()
  if (step.includes("cleanser") || step.includes("cleanse")) {
    return <Droplets className="w-5 h-5 text-blue-500" />
  }
  if (step.includes("serum") || step.includes("treatment") || step.includes("essence")) {
    return <Sparkles className="w-5 h-5 text-purple-500" />
  }
  if (step.includes("moisturizer") || step.includes("cream")) {
    return <Heart className="w-5 h-5 text-pink-500" />
  }
  if (step.includes("sunscreen") || step.includes("spf")) {
    return <Shield className="w-5 h-5 text-yellow-500" />
  }
  if (step.includes("toner") || step.includes("hydrat")) {
    return <Droplets className="w-5 h-5 text-cyan-500" />
  }
  return isAM ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-indigo-400" />
}

export default function RoutineFinderPage() {
  const [step, setStep] = useState(1)
  const [skinType, setSkinType] = useState("")
  const [sensitive, setSensitive] = useState("")
  const [routineSteps, setRoutineSteps] = useState("")
  const [concerns, setConcerns] = useState<string[]>([])
  const [followUps, setFollowUps] = useState<Record<string, string | string[]>>({})
  const [result, setResult] = useState<RoutineResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [texture, setTexture] = useState("")
  const { dispatch } = useCart()
  const { t } = useTranslation()

  useEffect(() => {
    setStep(1)
    setSkinType("")
    setSensitive("")
    setRoutineSteps("")
    setConcerns([])
    setFollowUps({})
    setResult(null)
    setTexture("")
  }, [])

  const nextStep = () => setStep((s) => s + 1)
  const prevStep = () => setStep((s) => (s > 1 ? s - 1 : s))

  const toggleConcern = (c: string) => {
    setConcerns((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : prev.length < 5 ? [...prev, c] : prev))
  }

  const updateFollow = (qid: string, value: string) => {
    setFollowUps((prev) => ({ ...prev, [qid]: value }))
  }

  const updateFollowMulti = (qid: string, value: string) => {
    setFollowUps((prev) => {
      const cur = prev[qid]
      if (!cur || !Array.isArray(cur)) return { ...prev, [qid]: [value] }
      return cur.includes(value)
        ? { ...prev, [qid]: cur.filter((v) => v !== value) }
        : { ...prev, [qid]: [...cur, value] }
    })
  }

  const handleSubmit = async () => {
    const routine = ROUTINE_MAP[routineSteps] || "easy"
    const finalSkin = sensitive === "yes" ? "sensitive" : skinType

    // NOTE: The backend routine-algorithm now uses key ingredients
    // from each product (via product.ingredients) to pick products.
    const body = {
      skinType: finalSkin,
      concerns: concerns.join(", "),
      age: "25",
      routine,
      texture,
    }

    try {
      setLoading(true)
      const res = await fetch("/api/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data: RoutineResult = await res.json()
      setResult(data)
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch (e) {
      alert(t("routine.error"))
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const addSingle = (id: string) => {
    const p = allProducts[id as keyof typeof allProducts]
    if (!p) return
    dispatch({ type: "ADD_ITEM", payload: { id: p.id, name: p.name, price: p.price, image: p.image } })
    dispatch({ type: "TOGGLE_CART" })
  }

  const addAll = () => {
    if (!result) return
    result.recommendedProducts.forEach((id) => {
      const p = allProducts[id as keyof typeof allProducts]
      if (!p) return
      dispatch({ type: "ADD_ITEM", payload: { id: p.id, name: p.name, price: p.price, image: p.image } })
    })
    dispatch({ type: "TOGGLE_CART" })
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!skinType
      case 2:
        return concerns.length > 0
      case 3:
        return !!texture
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWithSearch />
      <main className="flex-grow max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 sm:mb-10">{t("routine.title")}</h1>
        {!result ? (
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-rose-100">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
              {t("routine.customizeyourroutine")}
            </h2>
            <div className="space-y-6 sm:space-y-8">
              {step === 1 && (
                <>
                  <p className="font-semibold text-base sm:text-lg">{t("routine.skintype")}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {SKIN_TYPES.map((st) => (
                      <Button
                        key={st.key}
                        variant={skinType === st.key ? "default" : "outline"}
                        className={`h-auto py-3 sm:py-4 text-xs sm:text-sm whitespace-normal ${
                          skinType === st.key
                            ? "bg-rose-500 hover:bg-rose-600 text-white"
                            : "hover:bg-rose-50 hover:border-rose-300"
                        }`}
                        onClick={() => setSkinType(st.key)}
                      >
                        {t(st.labelKey)}
                      </Button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="font-semibold text-base sm:text-lg">{t("routine.concerns")}</p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {CONCERN_OPTIONS.map((c) => (
                      <div key={c.key} className="flex items-start space-x-2">
                        <Checkbox
                          id={`c-${c.key}`}
                          checked={concerns.includes(c.key)}
                          onCheckedChange={() => toggleConcern(c.key)}
                          className="mt-0.5"
                        />
                        <Label htmlFor={`c-${c.key}`} className="text-sm sm:text-base leading-tight cursor-pointer">
                          {t(c.labelKey)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <p className="font-semibold text-base sm:text-lg">{t("routine.preference")}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {TEXTURE_PREFS.map((tp) => (
                      <Button
                        key={tp.key}
                        variant={texture === tp.key ? "default" : "outline"}
                        className={`h-auto py-3 sm:py-4 text-xs sm:text-sm whitespace-normal ${
                          texture === tp.key
                            ? "bg-rose-500 hover:bg-rose-600 text-white"
                            : "hover:bg-rose-50 hover:border-rose-300"
                        }`}
                        onClick={() => setTexture(tp.key)}
                      >
                        {t(tp.labelKey)}
                      </Button>
                    ))}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 py-5 sm:py-6 text-sm sm:text-base bg-transparent"
                  >
                    {t("routine.previous")}
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    onClick={nextStep}
                    disabled={
                      (step === 1 && !skinType) || (step === 2 && concerns.length === 0) || (step === 3 && !texture)
                    }
                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 py-5 sm:py-6 text-sm sm:text-base"
                  >
                    {t("routine.next")}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!skinType || concerns.length === 0 || !texture || loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-5 sm:py-6 text-sm sm:text-base"
                  >
                    {loading ? t("routine.generating") : t("routine.generate")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto mt-8 sm:mt-12 space-y-6 sm:space-y-8">
            {/* Morning Routine */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 sm:p-8 border border-amber-200">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">🌅</span>
                {t("routine.morning")}
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {result.morning.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 sm:gap-4">
                    <span className="bg-amber-200 text-amber-800 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs sm:text-sm">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 pt-0.5 sm:pt-1 text-sm sm:text-base">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evening Routine */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 sm:p-8 border border-indigo-200">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">🌙</span>
                {t("routine.evening")}
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {result.evening.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 sm:gap-4">
                    <span className="bg-indigo-200 text-indigo-800 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs sm:text-sm">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 pt-0.5 sm:pt-1 text-sm sm:text-base">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Plan */}
            {result.weekly && Object.keys(result.weekly).length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 sm:p-8 border border-green-200">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">{t("routine.weekly")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(result.weekly).map(([day, text]) => (
                    <div key={day} className="bg-white/60 rounded-lg p-3 border border-green-100">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                          {day}
                        </span>
                        <span className="text-gray-700 text-xs sm:text-sm">{text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Products */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-rose-100">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 text-center">
                {t("routine.recommendedproducts")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {result.recommendedProducts &&
                  result.recommendedProducts.map((pid) => {
                    const p = allProducts[pid as keyof typeof allProducts]
                    if (!p) return null
                    return (
                      <div
                        key={pid}
                        className="bg-white/70 rounded-xl p-4 border border-rose-100 hover:shadow-md transition-shadow"
                      >
                        <Link href={`/products/${p.id}`} className="flex gap-3 mb-3">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            <Image
                              src={p.image || "/placeholder.jpg"}
                              alt={p.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-semibold text-gray-900 mb-1">{p.name}</h4>
                            <p className="text-rose-600 font-bold">{p.price}</p>
                            {p.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>
                            )}
                          </div>
                        </Link>
                        <Button
                          onClick={() => addSingle(p.id)}
                          size="sm"
                          className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                        >
                          {t("routine.addtobasket")}
                        </Button>
                      </div>
                    )
                  })}
              </div>
              <Button
                onClick={addAll}
                size="lg"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3"
              >
                {t("routine.addalltobasket")}
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
