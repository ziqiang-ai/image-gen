import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Navigation from "@/components/navigation"
import ProfileSettings from "@/components/profile-settings"
import AccountSettings from "@/components/account-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function SettingsPage() {
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

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gradient">Account Settings</h1>
            <p className="text-lg text-gray-600">Manage your profile and account preferences</p>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="profile" className="font-heading font-semibold">
                Profile Settings
              </TabsTrigger>
              <TabsTrigger value="account" className="font-heading font-semibold">
                Account Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <ProfileSettings user={user} profile={profile} />
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <AccountSettings user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
