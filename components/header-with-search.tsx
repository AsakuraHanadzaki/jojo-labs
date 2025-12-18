"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingBag, Menu, X, User } from "lucide-react"
import { SearchDialog } from "@/components/search-dialog"
import { useCart } from "@/components/shopping-cart"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/hooks/use-auth"

export function HeaderWithSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { state, dispatch } = useCart()
  const { t } = useTranslation()
  const { user } = useAuth()

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <>
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="https://45gkphzzl3vmvuua.public.blob.vercel-storage.com/Frame%206.svg"
                alt="JoJo Labs Logo"
                width={110}
                height={40}
                priority
                className="h-auto"
              />
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/face-care"
                className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
              >
                {t("nav.facecare")}
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
                {t("nav.about")}
              </Link>
              <Link
                href="/routine-finder"
                className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
              >
                {t("nav.routinefinder")}
              </Link>
              <Link href="/blog" className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
                {t("nav.blog")}
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              <LanguageToggle />

              {user ? (
                <Link href="/profile" className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                >
                  {t("auth.login")}
                </Link>
              )}

              <button
                onClick={() => dispatch({ type: "TOGGLE_CART" })}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/face-care"
                  className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.facecare")}
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.about")}
                </Link>
                <Link
                  href="/routine-finder"
                  className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.routinefinder")}
                </Link>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.blog")}
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default HeaderWithSearch
