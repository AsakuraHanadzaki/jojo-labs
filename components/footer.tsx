"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslation } from "@/hooks/use-translation"

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-50 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Image
              src="/images/design-mode/Frame%2010.png"
              alt="JoJo Labs Footer Logo"
              width={120}
              height={40}
              className="h-auto"
            />
            <p className="text-sm text-gray-600">{t("footer.tagline")}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{t("footer.shop")}</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/face-care" className="hover:text-gray-900">
                  {t("home.facecare")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{t("footer.help")}</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/routine-finder" className="hover:text-gray-900">
                  {t("home.routinefinder")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gray-900">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900">
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-gray-900">
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{t("footer.connect")}</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="https://www.instagram.com/jojolabs.am?igsh=azdwNTBxYXFhMWxw" className="hover:text-gray-900">
                  {t("footer.instagram")}
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@jojo.labs?_r=1&_t=ZN-92PKcnVeMyc" className="hover:text-gray-900">
                  {t("footer.tiktok")}
                </a>
              </li>
              <li>
                <a href="https://t.me/jojolabsam" className="hover:text-gray-900">
                  {t("footer.telegram")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
