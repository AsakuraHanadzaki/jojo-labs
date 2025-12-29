"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, User } from "lucide-react"
import HeaderWithSearch from "@/components/header-with-search"
import Footer from "@/components/footer"
import { useTranslation } from "@/hooks/use-translation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface BlogPost {
  id: string
  slug: string
  title: string
  title_ru?: string
  title_hy?: string
  content: string
  content_ru?: string
  content_hy?: string
  featured_image?: string
  author: string
  published_at: string
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t, language } = useTranslation()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (params.slug) {
      fetchPost(params.slug as string)
    }
  }, [params.slug])

  const fetchPost = async (slug: string) => {
    try {
      const { data, error } = await supabase.from("blogs").select("*").eq("slug", slug).eq("published", true).single()

      if (error) throw error
      setPost(data)
    } catch (error) {
      console.error("Error fetching blog post:", error)
      router.push("/blog")
    } finally {
      setIsLoading(false)
    }
  }

  const getTranslatedField = (field: "title" | "content") => {
    if (!post) return ""
    if (language === "ru" && post[`${field}_ru` as keyof BlogPost]) {
      return post[`${field}_ru` as keyof BlogPost] as string
    }
    if (language === "hy" && post[`${field}_hy` as keyof BlogPost]) {
      return post[`${field}_hy` as keyof BlogPost] as string
    }
    return post[field]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : language === "hy" ? "hy-AM" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const containsHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value)

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")

  const formatContent = (value: string) => {
    if (!value) return ""
    if (containsHtml(value)) return value

    return value
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
      .join("")
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <HeaderWithSearch />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">{t("blog.loading")}</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderWithSearch />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/blog">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("blog.backtolist")}
            </Button>
          </Link>

          <article>
            {post.featured_image && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-rose-50 to-pink-100">
                <Image
                  src={post.featured_image || "/placeholder.svg"}
                  alt={getTranslatedField("title")}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{getTranslatedField("title")}</h1>

            <div className="flex items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {t("blog.publishedon")} {formatDate(post.published_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>
                  {t("blog.by")} {post.author}
                </span>
              </div>
            </div>

            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-rose-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: formatContent(getTranslatedField("content")) }}
            />
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
