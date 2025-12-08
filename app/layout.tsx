import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/shopping-cart"
import { CartSidebar } from "@/components/cart-sidebar"
import { TranslationProvider } from "@/hooks/use-translation"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

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
      <body className={inter.className}>
        <TranslationProvider>
          <CartProvider>
            {children}
            <CartSidebar />
            <Toaster />
          </CartProvider>
        </TranslationProvider>
      </body>
    </html>
  )
}
