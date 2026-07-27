"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useTranslation } from "@/hooks/use-translation"

export function RoutineFinderPopup() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Only show once per browser session so it doesn't annoy returning visitors
    const seen = sessionStorage.getItem("routineFinderPopupSeen")
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      sessionStorage.setItem("routineFinderPopupSeen", "true")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-sky-50 border-sky-100">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 self-start bg-white rounded-full px-4 py-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span className="text-sm font-medium text-sky-700">{t("home.hero.badge")}</span>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 text-balance leading-tight text-left">
            {t("home.hero.title")}
          </DialogTitle>
          <DialogDescription className="text-gray-600 leading-relaxed text-pretty text-left">
            {t("home.hero.desc")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 my-2">
          {[t("home.hero.step1"), t("home.hero.step2"), t("home.hero.step3")].map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white rounded-2xl p-3">
              <div className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {idx + 1}
              </div>
              <p className="font-medium text-gray-900 text-sm">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/routine-finder" className="flex-1" onClick={() => handleClose(false)}>
            <Button
              size="lg"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 text-sm font-medium tracking-wide"
            >
              {t("home.hero.cta")}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => handleClose(false)}
            className="text-gray-600 hover:text-gray-900 hover:bg-white/60"
          >
            {t("home.hero.dismiss")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
