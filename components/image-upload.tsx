"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Upload, X, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ImageUploadProps {
  onUploadComplete?: () => void
}

export default function ImageUpload({ onUploadComplete }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !title.trim() || !prompt.trim()) {
      alert("Please fill in all fields and select an image")
      return
    }

    setIsUploading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Please sign in to upload images")
        return
      }

      // Upload image to Supabase Storage (if configured)
      // For now, we'll use a placeholder URL
      const imageUrl = `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(prompt)}`

      // Save to database
      const { error } = await supabase.from("images").insert({
        user_id: user.id,
        title: title.trim(),
        prompt: prompt.trim(),
        image_url: imageUrl,
        thumbnail_url: imageUrl,
        is_public: isPublic,
      })

      if (error) {
        console.error("Database error:", error)
        alert("Failed to save image. Please try again.")
        return
      }

      // Reset form
      setTitle("")
      setPrompt("")
      setIsPublic(false)
      handleRemoveFile()

      // Notify parent component
      onUploadComplete?.()

      alert("Image uploaded successfully!")
    } catch (err) {
      console.error("Upload error:", err)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="border-2 border-cyan-100 shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-heading font-semibold text-cyan-800 mb-2">Upload Your Artwork</h3>
          <p className="text-gray-600">Share your AI-generated images with the community</p>
        </div>

        {/* File Upload Area */}
        <div className="space-y-4">
          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-cyan-200 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-300 transition-colors duration-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-cyan-800 mb-2">Click to upload an image</p>
              <p className="text-sm text-gray-600">PNG, JPG, GIF up to 10MB</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>
          ) : (
            <div className="relative">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={handleRemoveFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your artwork a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the prompt used to generate this image"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isUploading}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} disabled={isUploading} />
            <Label htmlFor="public">Make this image public</Label>
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={isUploading || !selectedFile || !title.trim() || !prompt.trim()}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-heading font-semibold"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
