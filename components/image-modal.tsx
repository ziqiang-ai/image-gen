"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Share2, Download, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ImageModalProps {
  image: {
    id: string
    title: string
    prompt: string
    image_url: string
    is_featured: boolean
    likes_count: number
    created_at: string
    profiles?: {
      full_name?: string
      email: string
    }
  }
  onClose: () => void
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  const handleShare = async () => {
    try {
      await navigator.share({
        title: image.title,
        text: `Check out this AI-generated image: "${image.prompt}"`,
        url: `${window.location.origin}/gallery?image=${image.id}`,
      })
    } catch (err) {
      navigator.clipboard.writeText(`${window.location.origin}/gallery?image=${image.id}`)
    }
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = image.image_url
    link.download = `${image.title}.png`
    link.click()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Image */}
          <div className="relative">
            <img
              src={image.image_url || "/placeholder.svg"}
              alt={image.title}
              className="w-full max-h-[60vh] object-contain bg-gray-50"
            />
            {image.is_featured && <Badge className="absolute top-4 left-4 bg-yellow-500/90 text-white">Featured</Badge>}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading font-bold text-cyan-800">{image.title}</DialogTitle>
            </DialogHeader>

            <p className="text-gray-600 italic text-lg">"{image.prompt}"</p>

            {/* Creator and date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>
                    {image.profiles?.full_name?.charAt(0) || image.profiles?.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900">
                    {image.profiles?.full_name || image.profiles?.email.split("@")[0]}
                  </div>
                  <div className="text-sm text-gray-500">{new Date(image.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  {image.likes_count} Likes
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
