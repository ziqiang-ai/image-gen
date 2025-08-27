import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import Navigation from "@/components/navigation"
import GalleryGrid from "@/components/gallery-grid"
import GalleryFilters from "@/components/gallery-filters"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

interface SearchParams {
  search?: string
  sort?: string
  featured?: string
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-bg">
        <h1 className="text-2xl font-heading font-bold mb-4 text-cyan-800">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()
  const { search, sort = "newest", featured } = searchParams

  // Build query
  let query = supabase
    .from("images")
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq("is_public", true)

  // Apply search filter
  if (search) {
    query = query.or(`title.ilike.%${search}%,prompt.ilike.%${search}%`)
  }

  // Apply featured filter
  if (featured === "true") {
    query = query.eq("is_featured", true)
  }

  // Apply sorting
  switch (sort) {
    case "popular":
      query = query.order("likes_count", { ascending: false })
      break
    case "oldest":
      query = query.order("created_at", { ascending: true })
      break
    case "newest":
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  const { data: images, error } = await query.limit(50)

  if (error) {
    console.error("Error fetching gallery images:", error)
  }

  // Get featured images for hero section
  const { data: featuredImages } = await supabase
    .from("images")
    .select("*")
    .eq("is_public", true)
    .eq("is_featured", true)
    .order("likes_count", { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gradient">Community Gallery</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover amazing AI-generated artwork from our creative community
            </p>
          </div>

          {/* Featured Section */}
          {featuredImages && featuredImages.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-heading font-bold text-cyan-800">Featured Artwork</h2>
                <div className="text-sm text-gray-600">Curated by our team</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {featuredImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <img
                      src={image.thumbnail_url || image.image_url || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white text-sm font-semibold truncate">{image.title}</h3>
                        <div className="flex items-center justify-between text-xs text-white/80">
                          <span>❤️ {image.likes_count}</span>
                          <span>Featured</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <Suspense fallback={<div className="h-16 bg-white/50 rounded-lg animate-pulse" />}>
            <GalleryFilters />
          </Suspense>

          {/* Gallery Grid */}
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
              </div>
            }
          >
            <GalleryGrid images={images || []} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
