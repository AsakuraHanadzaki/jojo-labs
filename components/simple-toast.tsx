"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { X } from "lucide-react"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToastContextType {
  toast: (props: { title?: string; description?: string; variant?: "default" | "destructive" }) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let globalToastFn:
  | ((props: { title?: string; description?: string; variant?: "default" | "destructive" }) => void)
  | null = null

export function toast(props: { title?: string; description?: string; variant?: "default" | "destructive" }) {
  if (globalToastFn) {
    globalToastFn(props)
  } else {
    console.warn("Toast provider not initialized")
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toastFn = useCallback(
    (props: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
      const id = Math.random().toString(36).substring(7)
      setToasts((prev) => [...prev, { id, ...props }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    },
    [],
  )

  globalToastFn = toastFn

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: toastFn }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`border rounded-lg shadow-lg p-4 pr-10 relative animate-in slide-in-from-right ${
              t.variant === "destructive" ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
            }`}
          >
            <button
              onClick={() => removeToast(t.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            {t.title && (
              <div className={`font-semibold mb-1 ${t.variant === "destructive" ? "text-red-900" : "text-gray-900"}`}>
                {t.title}
              </div>
            )}
            {t.description && (
              <div className={`text-sm ${t.variant === "destructive" ? "text-red-700" : "text-gray-600"}`}>
                {t.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
