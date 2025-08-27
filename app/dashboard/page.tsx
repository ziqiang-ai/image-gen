import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Navigation from "@/components/navigation"
import UserStats from "@/components/user-stats"
import ImageGrid from "@/components/image-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-bg">
        <h1 className="text-2xl font-heading font-bold mb-4 text-cyan-800">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's images
  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching images:", error)
  }

  // Fetch user's collections
  const { data: collections } = await supabase
    .from("collections")
    .select("*, collection_images(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalImages = images?.length || 0
  const publicImages = images?.filter((img) => img.is_public).length || 0
  const totalLikes = images?.reduce((sum, img) => sum + (img.likes_count || 0), 0) || 0
  const totalCollections = collections?.length || 0

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gradient">My Creative Studio</h1>
            <p className="text-lg text-gray-600">Manage your AI-generated artwork and collections</p>
          </div>

          {/* Stats */}
          <UserStats
            totalImages={totalImages}
            publicImages={publicImages}
            totalLikes={totalLikes}
            totalCollections={totalCollections}
          />

          {/* Content Tabs */}
          <Tabs defaultValue="images" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="images" className="font-heading font-semibold">
                My Images ({totalImages})
              </TabsTrigger>
              <TabsTrigger value="collections" className="font-heading font-semibold">
                Collections ({totalCollections})
              </TabsTrigger>
              <TabsTrigger value="liked" className="font-heading font-semibold">
                Liked Images
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="space-y-6">
              <ImageGrid images={images || []} showActions={true} />
            </TabsContent>

            <TabsContent value="collections" className="space-y-6">
              <div className="text-center py-12">
                <p className="text-gray-500">Collections feature coming soon!</p>
              </div>
            </TabsContent>

            <TabsContent value="liked" className="space-y-6">
              <div className="text-center py-12">
                <p className="text-gray-500">Liked images feature coming soon!</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
