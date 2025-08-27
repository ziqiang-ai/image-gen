"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  provider: string
  created_at: string
}

interface ProfileSettingsProps {
  user: User
  profile: Profile | null
}

export default function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || user.user_metadata?.full_name || "")
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState(user.user_metadata?.website || "")
  const [location, setLocation] = useState(user.user_metadata?.location || "")
  const supabase = createClient()

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName.trim() || null,
        })
        .select()

      if (profileError) {
        console.error("Profile update error:", profileError)
        alert("Failed to update profile. Please try again.")
        return
      }

      // Update user metadata (for OAuth providers)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim() || null,
          website: website.trim() || null,
          location: location.trim() || null,
        },
      })

      if (metadataError) {
        console.error("Metadata update error:", metadataError)
        // Don't show error for metadata update as it might not be supported for all providers
      }

      alert("Profile updated successfully!")
    } catch (err) {
      console.error("Update error:", err)
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const displayName = fullName || user.user_metadata?.full_name || user.email?.split("@")[0]
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card className="border-2 border-cyan-100 shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-cyan-800">Profile Picture</CardTitle>
          <CardDescription>Update your profile picture and display information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback className="text-xl font-heading font-bold bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                {displayName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 bg-transparent">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Picture
              </Button>
              <p className="text-sm text-gray-600">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-2 border-cyan-100 shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-cyan-800">Personal Information</CardTitle>
          <CardDescription>Update your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user.email || ""} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yourwebsite.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isLoading}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-heading font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
