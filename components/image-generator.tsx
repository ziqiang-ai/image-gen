"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, Wand2, Download, Share2, Sparkles, Settings, BookmarkPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  title: string
  style: string
  quality: string
}

interface GenerationSettings {
  style: string
  aspectRatio: string
  quality: string
  creativity: number
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [settings, setSettings] = useState<GenerationSettings>({
    style: "realistic",
    aspectRatio: "1:1",
    quality: "standard",
    creativity: 50,
  })

  const supabase = createClient()
  const router = useRouter()

  const debouncedPrompt = useDebounce(prompt, 500)

  const promptCategories = useMemo(
    () => ({
      "Nature & Landscapes": [
        "A majestic mountain range at golden hour with misty valleys",
        "Serene forest clearing with sunbeams filtering through ancient trees",
        "Dramatic ocean waves crashing against rocky cliffs at sunset",
      ],
      "Fantasy & Sci-Fi": [
        "A floating city among the clouds with magical bridges",
        "Cyberpunk street market with holographic vendors and neon signs",
        "Ancient dragon's lair filled with glowing crystals and treasure",
      ],
      "Architecture & Urban": [
        "Modern glass skyscraper reflecting the city skyline at dusk",
        "Cozy European café with ivy-covered walls and outdoor seating",
        "Futuristic space station orbiting a distant planet",
      ],
    }),
    [],
  )

  const enhancePrompt = useCallback(
    async (originalPrompt: string): Promise<string> => {
      setIsEnhancing(true)

      try {
        const response = await fetch("/api/enhance-prompt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: originalPrompt,
            style: settings.style,
            creativity: settings.creativity,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to enhance prompt")
        }

        const data = await response.json()

        if (data.suggestions) {
          setSuggestions(data.suggestions)
        }

        return data.enhancedPrompt
      } catch (error) {
        console.error("Enhancement error:", error)
        // Fallback to basic enhancement
        const styleModifiers = {
          realistic: "photorealistic, highly detailed, professional photography",
          artistic: "artistic, painterly, creative composition, vibrant colors",
          fantasy: "fantasy art, magical, ethereal, mystical atmosphere",
          cyberpunk: "cyberpunk style, neon lights, futuristic, high-tech",
          vintage: "vintage style, retro aesthetic, classic composition",
        }

        return `${originalPrompt}, ${styleModifiers[settings.style as keyof typeof styleModifiers]}, high quality`
      } finally {
        setIsEnhancing(false)
      }
    },
    [settings.style, settings.creativity],
  )

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate an image")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const finalPrompt = enhancedPrompt || (await enhancePrompt(prompt))
      setEnhancedPrompt(finalPrompt)

      // Simulate AI image generation with enhanced parameters
      const generationTime = settings.quality === "premium" ? 5000 : 3000
      await new Promise((resolve) => setTimeout(resolve, generationTime))

      const mockImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url: `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(finalPrompt)}`,
        prompt: finalPrompt,
        title: prompt.split(" ").slice(0, 3).join(" "),
        style: settings.style,
        quality: settings.quality,
      }

      const { error: dbError } = await supabase.from("images").insert({
        user_id: user.id,
        title: mockImage.title,
        prompt: mockImage.prompt,
        image_url: mockImage.url,
        thumbnail_url: mockImage.url,
        is_public: false,
        style: settings.style,
        quality: settings.quality,
      })

      if (dbError) {
        console.error("Database error:", dbError)
        setError("Failed to save image. Please try again.")
        return
      }

      setGeneratedImage(mockImage)
    } catch (err) {
      console.error("Generation error:", err)
      setError("Failed to generate image. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, enhancedPrompt, settings, supabase, router, enhancePrompt])

  const handleSaveToCollection = useCallback(async () => {
    if (!generatedImage) return

    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // First, get or create a default collection
      let { data: collections, error: collectionsError } = await supabase
        .from("collections")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", "Favorites")
        .single()

      if (collectionsError || !collections) {
        // Create default collection
        const { data: newCollection, error: createError } = await supabase
          .from("collections")
          .insert({
            user_id: user.id,
            name: "Favorites",
            description: "My favorite AI-generated images",
            is_public: false,
          })
          .select("id")
          .single()

        if (createError) {
          throw createError
        }
        collections = newCollection
      }

      // Find the image in database
      const { data: imageData, error: imageError } = await supabase
        .from("images")
        .select("id")
        .eq("image_url", generatedImage.url)
        .single()

      if (imageError || !imageData) {
        throw new Error("Image not found in database")
      }

      // Add to collection
      const { error: addError } = await supabase.from("collection_images").insert({
        collection_id: collections.id,
        image_id: imageData.id,
      })

      if (addError) {
        throw addError
      }

      // Show success message
      setError("")
      // You could add a toast notification here
      console.log("Image saved to collection successfully!")
    } catch (err) {
      console.error("Save to collection error:", err)
      setError("Failed to save to collection. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }, [generatedImage, supabase, router])

  const handleShare = useCallback(async () => {
    if (generatedImage) {
      try {
        await navigator.share({
          title: generatedImage.title,
          text: `Check out this AI-generated image: "${generatedImage.prompt}"`,
          url: window.location.href,
        })
      } catch (err) {
        await navigator.clipboard.writeText(window.location.href)
        // You could add a toast notification here
      }
    }
  }, [generatedImage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "Enter" && !isGenerating && prompt.trim()) {
          e.preventDefault()
          handleGenerate()
        }
      }
    },
    [handleGenerate, isGenerating, prompt],
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Main Prompt Input */}
      <Card className="border-2 border-cyan-100 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-lg font-heading font-semibold text-cyan-800">
                Describe your vision
                <span className="text-sm font-normal text-gray-500 ml-2">(Ctrl+Enter to generate)</span>
              </label>
              <Textarea
                id="prompt"
                placeholder="A futuristic city with flying cars and neon lights..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[120px] text-base resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                disabled={isGenerating}
              />
            </div>

            {enhancedPrompt && (
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-cyan-600" />
                  <span className="text-sm font-medium text-cyan-800">AI-Enhanced Prompt:</span>
                </div>
                <p className="text-sm text-cyan-700 italic">{enhancedPrompt}</p>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">AI Suggestions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100 transition-colors duration-200 p-2 text-xs"
                      onClick={() => setPrompt(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
            )}

            {/* Advanced Settings */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-cyan-600 hover:text-cyan-700"
              >
                <Settings className="mr-2 h-4 w-4" />
                {showAdvanced ? "Hide" : "Show"} Advanced Settings
              </Button>
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Style</label>
                  <Select value={settings.style} onValueChange={(value) => setSettings({ ...settings, style: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                      <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quality</label>
                  <Select
                    value={settings.quality}
                    onValueChange={(value) => setSettings({ ...settings, quality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Aspect Ratio</label>
                  <Select
                    value={settings.aspectRatio}
                    onValueChange={(value) => setSettings({ ...settings, aspectRatio: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      <SelectItem value="4:3">Classic (4:3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Creativity: {settings.creativity}%</label>
                  <Slider
                    value={[settings.creativity]}
                    onValueChange={(value) => setSettings({ ...settings, creativity: value[0] })}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  if (prompt.trim()) {
                    const enhanced = await enhancePrompt(prompt)
                    setEnhancedPrompt(enhanced)
                  }
                }}
                disabled={isEnhancing || !prompt.trim()}
                className="border-cyan-200 text-cyan-700 hover:bg-cyan-50"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance Prompt
                  </>
                )}
              </Button>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-heading font-semibold py-6 text-lg transition-all duration-200 hover:scale-[1.02]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating your masterpiece...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Categories */}
      {!generatedImage && (
        <div className="space-y-6">
          <h3 className="text-lg font-heading font-semibold text-cyan-800">Need inspiration? Try these prompts:</h3>
          {Object.entries(promptCategories).map(([category, prompts]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {prompts.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-cyan-100 transition-colors duration-200 p-2 text-sm max-w-xs"
                    onClick={() => setPrompt(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generated Image Display */}
      {generatedImage && (
        <Card className="border-2 border-cyan-100 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={generatedImage.url || "/placeholder.svg"}
                alt={generatedImage.prompt}
                className="w-full h-auto max-h-[600px] object-contain bg-gray-50"
                loading="lazy"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = generatedImage.url
                    link.download = `${generatedImage.title}.png`
                    link.click()
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-heading font-semibold text-cyan-800 mb-2">{generatedImage.title}</h3>
                <p className="text-gray-600 italic mb-2">"{generatedImage.prompt}"</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <Badge variant="outline">{generatedImage.style}</Badge>
                  <Badge variant="outline">{generatedImage.quality}</Badge>
                  <Badge variant="outline">{settings.aspectRatio}</Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1 border-cyan-200 text-cyan-700 hover:bg-cyan-50 bg-transparent"
                  onClick={handleSaveToCollection}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Save to Collection
                    </>
                  )}
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                  onClick={() => {
                    setGeneratedImage(null)
                    setPrompt("")
                    setEnhancedPrompt("")
                    setSuggestions([])
                  }}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Another
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
