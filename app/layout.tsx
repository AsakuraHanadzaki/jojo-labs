import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/components/shopping-cart"
import { CartSidebar } from "@/components/cart-sidebar"
import { TranslationProvider } from "@/hooks/use-translation"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/use-auth"

export const metadata: Metadata = {
  title: "JoJo Labs - Premium Skincare & Cosmetics",
  description: "Discover premium Armenian skincare and cosmetics for your natural beauty",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <TranslationProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <CartSidebar />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </TranslationProvider>
        <Analytics />
      </body>
    </html>
  )
}
