"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, User } from "lucide-react"
import HeaderWithSearch from "@/components/header-with-search"
import Footer from "@/components/footer"
import { useTranslation } from "@/hooks/use-translation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface BlogPost {
  id: string
  slug: string
  title: string
  title_ru?: string
  title_hy?: string
  excerpt: string
  excerpt_ru?: string
  excerpt_hy?: string
  featured_image?: string
  author: string
  published_at: string
}

export default function BlogPage() {
  const { t, language } = useTranslation()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Error fetching blog posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTranslatedField = (post: BlogPost, field: "title" | "excerpt") => {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderWithSearch />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("blog.title")}</h1>
            <p className="text-lg text-gray-600">{t("blog.subtitle")}</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{t("blog.loading")}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{t("blog.noposts")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-rose-50 to-pink-100">
                    {post.featured_image ? (
                      <Image
                        src={post.featured_image || "/placeholder.svg"}
                        alt={getTranslatedField(post, "title")}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-20">📝</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors line-clamp-2">
                      {getTranslatedField(post, "title")}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">{getTranslatedField(post, "excerpt")}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-rose-600 font-medium group-hover:underline">{t("blog.readmore")} →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
