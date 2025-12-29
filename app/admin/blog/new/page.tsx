"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function NewBlogPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    title_ru: "",
    title_hy: "",
    excerpt: "",
    excerpt_ru: "",
    excerpt_hy: "",
    content: "",
    content_ru: "",
    content_hy: "",
    featured_image: "",
    author: "Admin",
    published: false,
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.excerpt || !formData.content) {
      alert("Please fill in all required fields (English version)")
      return
    }

    setIsLoading(true)

    try {
      const slug = generateSlug(formData.title)

      const { error } = await supabase.from("blogs").insert([
        {
          ...formData,
          slug,
          published_at: formData.published ? new Date().toISOString() : null,
        },
      ])

      if (error) throw error

      alert("Blog post created successfully!")
      router.push("/admin")
    } catch (error) {
      console.error("Error creating blog:", error)
      alert("Failed to create blog post. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create New Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="en" className="space-y-6">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ru">Russian</TabsTrigger>
                <TabsTrigger value="hy">Armenian</TabsTrigger>
              </TabsList>

              <TabsContent value="en" className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter blog title"
                  />
                </div>
                <div>
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief summary of the blog post"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Full blog content (HTML supported)"
                    rows={12}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ru" className="space-y-4">
                <div>
                  <Label htmlFor="title_ru">Title (Russian)</Label>
                  <Input
                    id="title_ru"
                    value={formData.title_ru}
                    onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                    placeholder="Введите заголовок блога"
                  />
                </div>
                <div>
                  <Label htmlFor="excerpt_ru">Excerpt (Russian)</Label>
                  <Textarea
                    id="excerpt_ru"
                    value={formData.excerpt_ru}
                    onChange={(e) => setFormData({ ...formData, excerpt_ru: e.target.value })}
                    placeholder="Краткое описание статьи"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="content_ru">Content (Russian)</Label>
                  <Textarea
                    id="content_ru"
                    value={formData.content_ru}
                    onChange={(e) => setFormData({ ...formData, content_ru: e.target.value })}
                    placeholder="Полное содержание блога (HTML поддерживается)"
                    rows={12}
                  />
                </div>
              </TabsContent>

              <TabsContent value="hy" className="space-y-4">
                <div>
                  <Label htmlFor="title_hy">Title (Armenian)</Label>
                  <Input
                    id="title_hy"
                    value={formData.title_hy}
                    onChange={(e) => setFormData({ ...formData, title_hy: e.target.value })}
                    placeholder="Մուտքագրեք բլոգի վերնագիր"
                  />
                </div>
                <div>
                  <Label htmlFor="excerpt_hy">Excerpt (Armenian)</Label>
                  <Textarea
                    id="excerpt_hy"
                    value={formData.excerpt_hy}
                    onChange={(e) => setFormData({ ...formData, excerpt_hy: e.target.value })}
                    placeholder="Հոդվածի համառոտ նկարագրություն"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="content_hy">Content (Armenian)</Label>
                  <Textarea
                    id="content_hy"
                    value={formData.content_hy}
                    onChange={(e) => setFormData({ ...formData, content_hy: e.target.value })}
                    placeholder="Բլոգի ամբողջական բովանդակություն"
                    rows={12}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4 mt-6 pt-6 border-t">
              <div>
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Admin"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="published" className="cursor-pointer">
                  Publish immediately
                </Label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Blog Post"}
              </Button>
              <Link href="/admin" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
