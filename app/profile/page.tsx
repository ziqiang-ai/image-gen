import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Navigation from "@/components/navigation"
import ProfileHeader from "@/components/profile-header"
import ProfileStats from "@/components/profile-stats"
import ImageGrid from "@/components/image-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ProfilePage() {
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

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user's images
  const { data: images } = await supabase
    .from("images")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user's public images
  const { data: publicImages } = await supabase
    .from("images")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalImages = images?.length || 0
  const totalPublicImages = publicImages?.length || 0
  const totalLikes = images?.reduce((sum, img) => sum + (img.likes_count || 0), 0) || 0

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <ProfileHeader user={user} profile={profile} />

          {/* Profile Stats */}
          <ProfileStats totalImages={totalImages} totalPublicImages={totalPublicImages} totalLikes={totalLikes} />

          {/* Content Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="all" className="font-heading font-semibold">
                All Images ({totalImages})
              </TabsTrigger>
              <TabsTrigger value="public" className="font-heading font-semibold">
                Public Images ({totalPublicImages})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <ImageGrid images={images || []} showActions={true} />
            </TabsContent>

            <TabsContent value="public" className="space-y-6">
              <ImageGrid images={publicImages || []} showActions={false} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
