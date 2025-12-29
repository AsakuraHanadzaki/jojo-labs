"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const AVAILABLE_CONCERNS = [
  { key: "hydration", valueEn: "Hydration", valueRu: "Увлажнение", valueHy: "Խոնավացում" },
  { key: "acne", valueEn: "Acne", valueRu: "Акне", valueHy: "Սպուներ" },
  { key: "aging", valueEn: "Anti-Ageing", valueRu: "Старение", valueHy: "Ծերացում" },
  { key: "pigmentation", valueEn: "Dark Spots", valueRu: "Пигментация", valueHy: "Մուգ հետքեր" },
  { key: "pores", valueEn: "Pores", valueRu: "Поры", valueHy: "Ծակոտիներ" },
  { key: "sensitivity", valueEn: "Sensitivity", valueRu: "Чувствительность", valueHy: "Զգայունություն" },
  { key: "texture", valueEn: "Texture", valueRu: "Текстура", valueHy: "Հյուսվածք" },
  { key: "dryness", valueEn: "Dryness", valueRu: "Сухость", valueHy: "Չորություն" },
]

export function ConcernSelector() {
  const { t, language } = useTranslation()
  const router = useRouter()
  const [selectedConcern, setSelectedConcern] = useState(AVAILABLE_CONCERNS[0])

  const getConcernValue = (concern: (typeof AVAILABLE_CONCERNS)[0]) => {
    if (language === "ru") return concern.valueRu
    if (language === "hy") return concern.valueHy
    return concern.valueEn
  }

  const handleShopNow = () => {
    router.push(`/face-care?concern=${selectedConcern.key}`)
  }

  return (
    <section className="bg-gradient-to-br from-rose-50 to-pink-100 rounded-3xl p-8 lg:p-12 mb-16">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-rose-500 font-medium mb-4">
          {t("home.concern.question") || "What are you looking for today?"}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 hover:text-rose-700 transition-colors inline-flex items-center gap-3 underline decoration-2 underline-offset-8 decoration-rose-300">
              {t("home.concern.prefix") || "I'm looking for help with"} {getConcernValue(selectedConcern)}
              <ChevronDown className="w-8 h-8" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-64 bg-white">
            {AVAILABLE_CONCERNS.map((concern) => (
              <DropdownMenuItem
                key={concern.key}
                onClick={() => setSelectedConcern(concern)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>{getConcernValue(concern)}</span>
                {selectedConcern.key === concern.key && <Check className="w-4 h-4 text-rose-600" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={handleShopNow}
          size="lg"
          className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 text-base font-medium rounded-full"
        >
          {t("home.concern.shopnow") || "Shop Now"} →
        </Button>
      </div>
    </section>
  )
}
