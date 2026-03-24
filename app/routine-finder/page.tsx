"use client"

// Routine Finder - Updated March 2026
import type React from "react"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCart } from "@/components/shopping-cart"
import { HeaderWithSearch } from "@/components/header-with-search"
import { Footer } from "@/components/footer"
import type { RoutineResult } from "@/lib/routine-algorithm"
import { Sun, Moon, Droplets, Sparkles, Shield, Heart } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

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

interface FollowUpQuestionConfig {
  id: string
  questionKey: string
  options: { [key: string]: string }
  multi?: boolean
}

interface FollowUpQuestion {
  id: string
  question: string
  options: { [key: string]: string }
  multi?: boolean
}

const FOLLOW_UPS: Record<string, FollowUpQuestionConfig> = {
  acne: {
    id: "acne-type",
    questionKey: "routine.followup.acne.question",
    options: {
      red: "routine.followup.acne.option.red",
      pus: "routine.followup.acne.option.pus",
    },
  },
  pores: {
    id: "pores-severity",
    questionKey: "routine.followup.pores.question",
    options: {
      oneHour: "routine.followup.pores.option.oneHour",
      midday: "routine.followup.pores.option.midday",
      evening: "routine.followup.pores.option.evening",
    },
  },
  pigment: {
    id: "pigment-cause",
    questionKey: "routine.followup.pigment.question",
    options: {
      sun: "routine.followup.pigment.option.sun",
      acne: "routine.followup.pigment.option.acne",
      unsure: "routine.followup.pigment.option.unsure",
    },
  },
  texture: {
    id: "texture-type",
    questionKey: "routine.followup.texture.question",
    options: {
      rough: "routine.followup.texture.option.rough",
      uneven: "routine.followup.texture.option.uneven",
      flaky: "routine.followup.texture.option.flaky",
      congested: "routine.followup.texture.option.congested",
    },
  },
  dehydration: {
    id: "dehydration-severity",
    questionKey: "routine.followup.dehydration.question",
    options: {
      tight: "routine.followup.dehydration.option.tight",
      dull: "routine.followup.dehydration.option.dull",
      lines: "routine.followup.dehydration.option.lines",
      oilyDry: "routine.followup.dehydration.option.oilyDry",
    },
  },
  dryness: {
    id: "dryness-severity",
    questionKey: "routine.followup.dryness.question",
    options: {
      mild: "routine.followup.dryness.option.mild",
      moderate: "routine.followup.dryness.option.moderate",
      severe: "routine.followup.dryness.option.severe",
    },
  },
  aging: {
    id: "aging-concerns",
    questionKey: "routine.followup.aging.question",
    options: {
      wrinkles: "routine.followup.aging.option.wrinkles",
      firmness: "routine.followup.aging.option.firmness",
      dullness: "routine.followup.aging.option.dullness",
      dark: "routine.followup.aging.option.dark",
    },
  },
  sensitivity: {
    id: "sensitivity-triggers",
    questionKey: "routine.followup.sensitivity.question",
    options: {
      products: "routine.followup.sensitivity.option.products",
      weather: "routine.followup.sensitivity.option.weather",
      stress: "routine.followup.sensitivity.option.stress",
      unknown: "routine.followup.sensitivity.option.unknown",
    },
  },
  uneven: {
    id: "uneven-type",
    questionKey: "routine.followup.uneven.question",
    options: {
      tone: "routine.followup.uneven.option.tone",
      texture: "routine.followup.uneven.option.texture",
      redness: "routine.followup.uneven.option.redness",
      dark: "routine.followup.uneven.option.dark",
    },
  },
}

const ROUTINE_MAP: Record<string, string> = {
  "1-3": "easy",
  "4-5": "intermediate",
  "6+": "advanced",
}

const SKIN_TYPES = [
  { value: "oily", labelKey: "routine.skintype.oily" },
  { value: "dry", labelKey: "routine.skintype.dry" },
  { value: "combination", labelKey: "routine.skintype.combination" },
  { value: "normal", labelKey: "routine.skintype.normal" },
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
  const [error, setError] = useState<string | null>(null)
  const { dispatch } = useCart()
  const { t, language } = useTranslation()

  const followUpQuestions = useMemo(
    () =>
      concerns
        .map((concern) => FOLLOW_UPS[concern])
        .filter((question): question is FollowUpQuestionConfig => Boolean(question))
        .map((question) => ({
          id: question.id,
          question: t(question.questionKey),
          options: Object.fromEntries(Object.entries(question.options).map(([key, labelKey]) => [key, t(labelKey)])),
          multi: question.multi,
        })),
    [concerns, language, t],
  )
  const totalSteps = 5

  useEffect(() => {
    setStep(1)
    setSkinType("")
    setSensitive("")
    setRoutineSteps("")
    setConcerns([])
    setFollowUps({})
    setResult(null)
    setError(null)
  }, [])

  useEffect(() => {
    setFollowUps((prev) => {
      if (followUpQuestions.length === 0) return {}
      const validIds = new Set(followUpQuestions.map((question) => question.id))
      const next: Record<string, string | string[]> = {}
      Object.entries(prev).forEach(([key, value]) => {
        if (validIds.has(key)) {
          next[key] = value
        }
      })
      return next
    })
  }, [followUpQuestions])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const routine = ROUTINE_MAP[routineSteps] || "easy"
    const finalSkin = sensitive === "yes" ? "sensitive" : skinType

    // NOTE: The backend routine-algorithm now uses key ingredients
    // from each product (via product.ingredients) to pick products.
    const body = {
      skinType: finalSkin,
      concerns: concerns.join(", "),
      age: "25",
      routine,
      followUps,
      language,
    }

    try {
      setLoading(true)
      const res = await fetch("/api/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.detail || data?.error || "Request failed")
        }
        setResult(data as RoutineResult)
      } else {
        const text = await res.text()
        if (!res.ok) {
          throw new Error(text || res.statusText || "Request failed")
        }
        throw new Error(text || "Unexpected response")
      }
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch (e) {
      setError(t("routine.error"))
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const addSingle = (product: { id: string; name: string; price: number; image: string }) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { id: product.id, name: product.name, price: String(product.price), image: product.image },
    })
    dispatch({ type: "TOGGLE_CART" })
  }

  const addAll = () => {
    if (!result) return
    result.recommendedProducts.forEach((product) => {
      dispatch({
        type: "ADD_ITEM",
        payload: { id: product.id, name: product.name, price: String(product.price), image: product.image },
      })
    })
    dispatch({ type: "TOGGLE_CART" })
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!skinType
      case 2:
        return !!sensitive
      case 3:
        return !!routineSteps
      case 4:
        return concerns.length > 0
      case 5:
        return followUpQuestions.every((question) => {
          const answer = followUps[question.id]
          if (!answer) return false
          if (question.multi && Array.isArray(answer)) {
            return answer.length > 0
          }
          return typeof answer === "string" && answer.length > 0
        })
      default:
        return false
    }
  }

  const productById = useMemo(() => {
    if (!result?.recommendedProducts) return {}
    console.log("[v0] CLIENT: Building productById from recommendedProducts:")
    console.log("[v0] CLIENT: Received", result.recommendedProducts.length, "products")
    result.recommendedProducts.forEach(p => console.log("[v0] CLIENT:   -", p.id, ":", p.name))
    return result.recommendedProducts.reduce(
      (acc, p) => {
        acc[p.id] = p
        return acc
      },
      {} as Record<string, (typeof result.recommendedProducts)[0]>,
    )
  }, [result])

  const setSkinTypeWithLog = (value: string) => {
    console.log("[v0] setSkinType called with:", value)
    setSkinType(value)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWithSearch />
      <main className="flex-grow max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-center mb-8">{t("routine.title")}</h1>
        {!result ? (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>
                {t("routine.step")} {step} {t("routine.of")} {totalSteps}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <p className="font-semibold">{t("routine.skintype")}</p>
                  <RadioGroup value={skinType} onValueChange={setSkinTypeWithLog} className="space-y-2">
                    {SKIN_TYPES.map((st) => (
                      <div key={st.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={st.value} id={`sk-${st.value}`} />
                        <Label htmlFor={`sk-${st.value}`} className="capitalize">
                          {t(st.labelKey)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </>
              )}
              {step === 2 && (
                <>
                  <p className="font-semibold">{t("routine.sensitive")}</p>
                  <RadioGroup value={sensitive} onValueChange={setSensitive} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="s-yes" />
                      <Label htmlFor="s-yes">{t("routine.sensitive.yes")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="s-no" />
                      <Label htmlFor="s-no">{t("routine.sensitive.no")}</Label>
                    </div>
                  </RadioGroup>
                </>
              )}
              {step === 3 && (
                <>
                  <p className="font-semibold">{t("routine.routinesteps")}</p>
                  <RadioGroup value={routineSteps} onValueChange={setRoutineSteps} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-3" id="r-13" />
                      <Label htmlFor="r-13">{t("routine.routinesteps.short")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4-5" id="r-45" />
                      <Label htmlFor="r-45">{t("routine.routinesteps.medium")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="6+" id="r-6" />
                      <Label htmlFor="r-6">{t("routine.routinesteps.long")}</Label>
                    </div>
                  </RadioGroup>
                </>
              )}
              {step === 4 && (
                <>
                  <p className="font-semibold">{t("routine.concerns")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CONCERN_OPTIONS.map((c) => (
                      <div key={c.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`c-${c.key}`}
                          checked={concerns.includes(c.key)}
                          onCheckedChange={() => toggleConcern(c.key)}
                        />
                        <Label htmlFor={`c-${c.key}`}>{t(c.labelKey)}</Label>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {step === 5 && (
                <>
                  <p className="font-semibold">{t("routine.concerns.followup")}</p>
                  <div className="space-y-6">
                    {followUpQuestions.map((question) => (
                      <div key={question.id} className="space-y-3">
                        <p className="font-medium text-gray-900">{question.question}</p>
                        {question.multi ? (
                          <div className="grid gap-2">
                            {Object.entries(question.options).map(([key, label]) => {
                              const current = followUps[question.id]
                              const checked = Array.isArray(current) && current.includes(key)
                              return (
                                <div key={key} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${question.id}-${key}`}
                                    checked={checked}
                                    onCheckedChange={() => updateFollowMulti(question.id, key)}
                                  />
                                  <Label htmlFor={`${question.id}-${key}`}>{label}</Label>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <RadioGroup
                            value={typeof followUps[question.id] === "string" ? (followUps[question.id] as string) : ""}
                            onValueChange={(value) => updateFollow(question.id, value)}
                            className="space-y-2"
                          >
                            {Object.entries(question.options).map(([key, label]) => (
                              <div key={key} className="flex items-center space-x-2">
                                <RadioGroupItem value={key} id={`${question.id}-${key}`} />
                                <Label htmlFor={`${question.id}-${key}`}>{label}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                  {t("routine.back")}
                </Button>
                {step < totalSteps ? (
                  <Button onClick={nextStep} disabled={!canProceed()}>
                    {t("routine.next")}
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={!canProceed() || loading}>
                    {loading ? t("routine.generating") : t("routine.see")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card id="results-section" className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>{t("routine.result")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {error && (
                <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                  <p className="text-red-800 text-lg leading-relaxed">{error}</p>
                </div>
              )}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
                <p className="text-gray-800 text-lg leading-relaxed">{result.summary}</p>
              </div>

              {result.analysis &&
                result.analysis.length > 0 &&
                result.analysis.map((section) => (
                  <div
                    key={section.title}
                    className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100"
                  >
                    <h3 className="text-xl font-bold mb-3 text-blue-900">{section.title}</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">{section.description}</p>
                    <div className="bg-white/60 rounded-xl p-4">
                      <p className="text-sm font-semibold text-blue-800 mb-2">{t("routine.ingredients")}</p>
                      <div className="flex flex-wrap gap-2">
                        {section.ingredients.map((ingredient, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

              {/* Morning Routine */}
              {console.log("[v0] CLIENT: Rendering AM routine with", result.AM.length, "steps")}
              {result.AM.forEach(s => console.log("[v0] CLIENT: AM step productId:", s.productId, "found:", !!productById[s.productId || ""]))}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Sun className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-900">{t("routine.morning")}</h3>
                  <span className="text-yellow-600 text-sm">{t("routine.morning.emoji")}</span>
                </div>
                <div className="space-y-4">
                  {result.AM.map((s, idx) => {
                    const p = s.productId ? productById[s.productId] : undefined
                    if (s.productId && !p) {
                      console.log("[v0] CLIENT WARNING: Product not found for AM step:", s.productId)
                    }
                    return (
                      <div
                        key={idx}
                        className="bg-white/70 rounded-xl p-4 border border-yellow-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 bg-yellow-100 p-2 rounded-lg">{getStepIcon(s.step, true)}</div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                                {t("routine.step.label")} {idx + 1}
                              </span>
                              <h4 className="font-semibold text-gray-900">{s.step}</h4>
                            </div>
                            {p && (
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={p.image || "/placeholder.jpg"}
                                    alt={p.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <Link
                                    href={`/products/${p.id}`}
                                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                  >
                                    {p.name}
                                  </Link>
                                  {p.description && (
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{p.description}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Evening Routine */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Moon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-indigo-900">{t("routine.evening")}</h3>
                  <span className="text-indigo-600 text-sm">{t("routine.evening.emoji")}</span>
                </div>
                <div className="space-y-4">
                  {result.PM.map((s, idx) => {
                    const p = s.productId ? productById[s.productId] : undefined
                    return (
                      <div
                        key={idx}
                        className="bg-white/70 rounded-xl p-4 border border-indigo-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-lg">{getStepIcon(s.step, false)}</div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full text-xs font-bold">
                                {t("routine.step.label")} {idx + 1}
                              </span>
                              <h4 className="font-semibold text-gray-900">{s.step}</h4>
                            </div>
                            {p && (
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={p.image || "/placeholder.jpg"}
                                    alt={p.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <Link
                                    href={`/products/${p.id}`}
                                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                  >
                                    {p.name}
                                  </Link>
                                  {p.description && (
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{p.description}</p>
                                  )}
                                </div>
                              </div>
                            )}
                            {s.note && (
                              <p className="text-indigo-600 text-sm mt-2 italic bg-indigo-50 px-3 py-1 rounded-lg">
                                💡 {s.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {result.weekly && Object.keys(result.weekly).length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-xl font-bold mb-4 text-green-900 flex items-center gap-2">
                    {t("routine.weekly")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(result.weekly).map(([day, text]) => (
                      <div key={day} className="bg-white/60 rounded-lg p-3 border border-green-100">
                        <div className="flex items-center gap-2">
                          <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                            {day}
                          </span>
                          <span className="text-gray-700 text-sm">{text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200">
                <h3 className="text-xl font-bold mb-4 text-rose-900 flex items-center gap-2">
                  {t("routine.products")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {result.recommendedProducts &&
                    result.recommendedProducts.map((p) => {
                      return (
                        <div
                          key={p.id}
                          className="bg-white/70 rounded-xl p-4 border border-rose-100 hover:shadow-md transition-shadow"
                        >
                          <Link href={`/products/${p.id}`} className="flex gap-3 mb-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
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
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{p.description}</p>
                              )}
                            </div>
                          </Link>
                          <Button
                            onClick={() => addSingle({ id: p.id, name: p.name, price: p.price, image: p.image })}
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
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}
