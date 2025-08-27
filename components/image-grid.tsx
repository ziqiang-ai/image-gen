"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, Eye, EyeOff, MoreVertical, Download, Trash2, Share2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Image {
  id: string
  title: string
  prompt: string
  image_url: string
  thumbnail_url?: string
  is_public: boolean
  is_featured: boolean
  likes_count: number
  created_at: string
}

interface ImageGridProps {
  images: Image[]
  showActions?: boolean
}

export default function ImageGrid({ images, showActions = false }: ImageGridProps) {
  const [localImages, setLocalImages] = useState(images)
  const supabase = createClient()
  const router = useRouter()

  const handleTogglePublic = async (imageId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("images").update({ is_public: !currentStatus }).eq("id", imageId)

    if (!error) {
      setLocalImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, is_public: !currentStatus } : img)))
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    const { error } = await supabase.from("images").delete().eq("id", imageId)

    if (!error) {
      setLocalImages((prev) => prev.filter((img) => img.id !== imageId))
    }
  }

  const handleDownload = (imageUrl: string, title: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `${title}.png`
    link.click()
  }

  const handleShare = async (image: Image) => {
    try {
      await navigator.share({
        title: image.title,
        text: `Check out this AI-generated image: "${image.prompt}"`,
        url: window.location.href,
      })
    } catch (err) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (localImages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-gray-600 mb-2">No images yet</h3>
        <p className="text-gray-500 mb-6">Start creating amazing AI artwork to see them here!</p>
        <Button
          onClick={() => router.push("/")}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
        >
          Create Your First Image
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {localImages.map((image) => (
        <Card
          key={image.id}
          className="border-2 border-cyan-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group"
        >
          <div className="relative">
            <img
              src={image.thumbnail_url || image.image_url || "/placeholder.svg"}
              alt={image.title}
              className="w-full h-48 object-cover"
            />

            {/* Status badges */}
            <div className="absolute top-2 left-2 flex space-x-1">
              {image.is_public && (
                <Badge variant="secondary" className="bg-green-500/90 text-white text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              )}
              {image.is_featured && (
                <Badge variant="secondary" className="bg-yellow-500/90 text-white text-xs">
                  Featured
                </Badge>
              )}
            </div>

            {/* Likes count */}
            <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-medium text-gray-700">
              <Heart className="w-3 h-3 inline mr-1" />
              {image.likes_count}
            </div>

            {/* Actions menu */}
            {showActions && (
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(image.image_url, image.title)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(image)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleTogglePublic(image.id, image.is_public)}>
                      {image.is_public ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Make Public
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(image.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <h3 className="font-heading font-semibold text-cyan-800 mb-1 truncate">{image.title}</h3>
            <p className="text-sm text-gray-600 italic line-clamp-2 mb-2">"{image.prompt}"</p>
            <div className="text-xs text-gray-500">{new Date(image.created_at).toLocaleDateString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
