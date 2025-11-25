"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"
import { AVAILABLE_LANGUAGES } from "@/lib/i18n"

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation()

  return (
    <div className="flex items-center gap-1">
      {AVAILABLE_LANGUAGES.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage(lang.code)}
          className="text-xs font-medium"
        >
          {lang.code.toUpperCase()}
        </Button>
      ))}
    </div>
  )
}
