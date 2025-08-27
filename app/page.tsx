import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import Navigation from "@/components/navigation"
import ImageGenerator from "@/components/image-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Zap, Users, Palette } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-bg">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-4 text-cyan-800">Connect Supabase to get started</h1>
          <p className="text-gray-600">Please configure your Supabase integration to use this application.</p>
        </div>
      </div>
    )
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        {user ? (
          // Authenticated user - show image generator
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-gradient animate-float">
                Unleash Your Imagination with AI Art
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Transform your words into stunning visuals effortlessly. Create, explore, and share your artistic
                vision.
              </p>
            </div>

            <ImageGenerator />
          </div>
        ) : (
          // Non-authenticated user - show landing page
          <div className="space-y-20">
            {/* Hero Section */}
            <div className="text-center space-y-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-gradient animate-float">
                Unleash Your Imagination with AI Art
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Transform your words into stunning visuals effortlessly. Join a community of creators and bring your
                ideas to life with cutting-edge AI technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-heading font-semibold px-8 py-6 text-lg transition-all duration-200 hover:scale-105 animate-pulse-glow"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Creating
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 font-heading font-semibold px-8 py-6 text-lg bg-transparent"
                  >
                    Explore Gallery
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 border-cyan-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-cyan-800">Lightning Fast</h3>
                  <p className="text-gray-600">
                    Generate high-quality images in seconds with our advanced AI models optimized for speed and quality.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-cyan-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-cyan-800">Unlimited Creativity</h3>
                  <p className="text-gray-600">
                    From photorealistic portraits to abstract art, create any style you can imagine with simple text
                    prompts.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-cyan-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-cyan-800">Creative Community</h3>
                  <p className="text-gray-600">
                    Share your creations, discover inspiring artwork, and connect with fellow artists in our vibrant
                    community.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sample Images Section */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-cyan-800 mb-4">See What's Possible</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Explore some of the amazing artwork created by our community
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Cyberpunk City",
                    prompt: "A futuristic cyberpunk cityscape at night with neon lights",
                    likes: 42,
                  },
                  {
                    title: "Mystical Forest",
                    prompt: "An enchanted forest with glowing mushrooms and magical creatures",
                    likes: 38,
                  },
                  {
                    title: "Space Explorer",
                    prompt: "An astronaut exploring an alien planet with purple skies",
                    likes: 55,
                  },
                  {
                    title: "Dragon Guardian",
                    prompt: "A majestic dragon guarding treasure in a mountain cave",
                    likes: 67,
                  },
                  {
                    title: "Ocean Depths",
                    prompt: "Deep sea creatures around a sunken pirate ship",
                    likes: 29,
                  },
                  {
                    title: "Steampunk Airship",
                    prompt: "Victorian airship flying through clouds with brass gears",
                    likes: 44,
                  },
                ].map((image, index) => (
                  <Card
                    key={index}
                    className="border-2 border-cyan-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={`/abstract-geometric-shapes.png?height=300&width=400&query=${encodeURIComponent(image.prompt)}`}
                        alt={image.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-sm font-medium text-gray-700">
                        ❤️ {image.likes}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-heading font-semibold text-cyan-800 mb-1">{image.title}</h3>
                      <p className="text-sm text-gray-600 italic">"{image.prompt}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Link href="/gallery">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 font-heading font-semibold px-8 py-4 bg-transparent"
                  >
                    View Full Gallery
                  </Button>
                </Link>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-12 space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-cyan-800">
                Ready to Create Something Amazing?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of creators who are already using AI to bring their imagination to life. Start your
                creative journey today.
              </p>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-heading font-semibold px-8 py-6 text-lg transition-all duration-200 hover:scale-105"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
