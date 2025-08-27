"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Calendar, MapPin, LinkIcon } from "lucide-react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  provider: string
  created_at: string
}

interface ProfileHeaderProps {
  user: User
  profile: Profile | null
}

export default function ProfileHeader({ user, profile }: ProfileHeaderProps) {
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0]
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case "google":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Google
          </Badge>
        )
      case "github":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            GitHub
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Email
          </Badge>
        )
    }
  }

  return (
    <Card className="border-2 border-cyan-100 shadow-lg">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback className="text-2xl font-heading font-bold bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                {displayName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-cyan-800">{displayName}</h1>
                {profile?.provider && getProviderBadge(profile.provider)}
              </div>
              <p className="text-gray-600">{user.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {joinDate}</span>
              </div>
              {user.user_metadata?.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.user_metadata.location}</span>
                </div>
              )}
              {user.user_metadata?.website && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="w-4 h-4" />
                  <a
                    href={user.user_metadata.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:text-cyan-800 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Link href="/settings">
              <Button variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
