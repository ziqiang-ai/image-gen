"use client"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Github } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signInWithEmail, signUpWithEmail } from "@/lib/actions"
import { createClient } from "@/lib/supabase/client"

function SubmitButton({ isSignUp }: { isSignUp: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isSignUp ? "Creating account..." : "Signing in..."}
        </>
      ) : isSignUp ? (
        "Create Account"
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

interface AuthFormProps {
  isSignUp?: boolean
}

export default function AuthForm({ isSignUp = false }: AuthFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(isSignUp ? signUpWithEmail : signInWithEmail, null)
  const supabase = createClient()

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success && !isSignUp) {
      router.push("/")
    }
  }, [state, router, isSignUp])

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error("OAuth error:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {isSignUp ? "Join our AI image generation community" : "Sign in to generate amazing AI images"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Buttons */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => handleOAuthSignIn("google")}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => handleOAuthSignIn("github")}
            >
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-gray-300">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg text-sm">
                {state.success}
              </div>
            )}

            <div className="space-y-2">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            <SubmitButton isSignUp={isSignUp} />
          </form>

          <div className="text-center text-sm text-gray-300">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 underline">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
