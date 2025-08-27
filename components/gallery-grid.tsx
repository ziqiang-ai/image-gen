"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Share2, Download, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import ImageModal from "@/components/image-modal"

interface GalleryImage {
  id: string
  title: string
  prompt: string
  image_url: string
  thumbnail_url?: string
  is_featured: boolean
  likes_count: number
  created_at: string
  profiles?: {
    full_name?: string
    email: string
  }
}

interface GalleryGridProps {
  images: GalleryImage[]
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [localImages, setLocalImages] = useState(images)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set())
  const supabase = createClient()

  const handleLike = async (imageId: string, currentLikes: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login or show login modal
      return
    }

    const isLiked = likedImages.has(imageId)

    if (isLiked) {
      // Unlike
      await supabase.from("image_likes").delete().eq("user_id", user.id).eq("image_id", imageId)

      await supabase
        .from("images")
        .update({ likes_count: Math.max(0, currentLikes - 1) })
        .eq("id", imageId)

      setLikedImages((prev) => {
        const newSet = new Set(prev)
        newSet.delete(imageId)
        return newSet
      })

      setLocalImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, likes_count: Math.max(0, currentLikes - 1) } : img)),
      )
    } else {
      // Like
      await supabase.from("image_likes").insert({ user_id: user.id, image_id: imageId })

      await supabase
        .from("images")
        .update({ likes_count: currentLikes + 1 })
        .eq("id", imageId)

      setLikedImages((prev) => new Set(prev).add(imageId))

      setLocalImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, likes_count: currentLikes + 1 } : img)),
      )
    }
  }

  const handleShare = async (image: GalleryImage) => {
    try {
      await navigator.share({
        title: image.title,
        text: `Check out this AI-generated image: "${image.prompt}"`,
        url: `${window.location.origin}/gallery?image=${image.id}`,
      })
    } catch (err) {
      // Fallback to copying URL
      navigator.clipboard.writeText(`${window.location.origin}/gallery?image=${image.id}`)
    }
  }

  const handleDownload = (imageUrl: string, title: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `${title}.png`
    link.click()
  }

  if (localImages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-gray-600 mb-2">No images found</h3>
        <p className="text-gray-500">Try adjusting your search or filters to find more artwork.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {localImages.map((image) => (
          <Card
            key={image.id}
            className="border-2 border-cyan-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative">
              <img
                src={image.thumbnail_url || image.image_url || "/placeholder.svg"}
                alt={image.title}
                className="w-full h-48 object-cover"
              />

              {/* Featured badge */}
              {image.is_featured && (
                <Badge className="absolute top-2 left-2 bg-yellow-500/90 text-white text-xs">Featured</Badge>
              )}

              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare(image)
                  }}
                >
                  <Share2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(image.image_url, image.title)
                  }}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>

              {/* Like button */}
              <Button
                size="sm"
                variant="secondary"
                className={`absolute bottom-2 right-2 bg-white/90 hover:bg-white ${
                  likedImages.has(image.id) ? "text-red-500" : "text-gray-600"
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleLike(image.id, image.likes_count)
                }}
              >
                <Heart className={`h-3 w-3 mr-1 ${likedImages.has(image.id) ? "fill-current" : ""}`} />
                {image.likes_count}
              </Button>
            </div>

            <CardContent className="p-4">
              <h3 className="font-heading font-semibold text-cyan-800 mb-1 truncate">{image.title}</h3>
              <p className="text-sm text-gray-600 italic line-clamp-2 mb-3">"{image.prompt}"</p>

              {/* Creator info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-xs">
                      {image.profiles?.full_name?.charAt(0) || image.profiles?.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500 truncate">
                    {image.profiles?.full_name || image.profiles?.email.split("@")[0]}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{new Date(image.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}
    </>
  )
}
