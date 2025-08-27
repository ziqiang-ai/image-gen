import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  let prompt: string, style: string, creativity: number

  try {
    const body = await request.json()
    prompt = body.prompt
    style = body.style
    creativity = body.creativity

    const { text: enhancedPrompt } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt: `You are an expert AI image generation prompt engineer. Your task is to enhance and optimize prompts for AI image generation.

Given prompt: "${prompt}"
Style preference: ${style}
Creativity level: ${creativity}/100

Please enhance this prompt by:
1. Adding specific visual details and artistic elements
2. Including appropriate style modifiers for "${style}" aesthetic
3. Adjusting creativity level (${creativity < 30 ? "more traditional and conventional" : creativity > 70 ? "more innovative and experimental" : "balanced and harmonious"})
4. Adding quality enhancers and technical specifications
5. Ensuring the prompt is optimized for AI image generation

Return ONLY the enhanced prompt text, no explanations or additional text.`,
      maxTokens: 200,
      temperature: creativity / 100, // Use creativity level as temperature
    })

    const { text: suggestions } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt: `Based on the image prompt "${prompt}" with ${style} style, generate 3 short alternative prompt suggestions that would create similar but varied images. Each suggestion should be on a new line and be concise (max 10 words each).`,
      maxTokens: 100,
      temperature: 0.8,
    })

    const suggestionsList = suggestions
      .split("\n")
      .filter((s) => s.trim())
      .slice(0, 3)

    return NextResponse.json({
      enhancedPrompt: enhancedPrompt.trim(),
      originalPrompt: prompt,
      appliedStyle: style,
      creativityLevel: creativity,
      suggestions: suggestionsList,
    })
  } catch (error) {
    console.error("Prompt enhancement error:", error)

    // Fixed variable scope issue by declaring variables outside try block
    const styleModifiers = {
      realistic: "photorealistic, highly detailed, professional photography, sharp focus",
      artistic: "artistic masterpiece, painterly style, creative composition, vibrant colors",
      fantasy: "fantasy art, magical atmosphere, ethereal lighting, mystical elements",
      cyberpunk: "cyberpunk aesthetic, neon lights, futuristic technology, high-tech",
      vintage: "vintage style, retro aesthetic, classic composition, nostalgic mood",
    }

    const fallbackPrompt = [
      prompt || "beautiful landscape",
      styleModifiers[style as keyof typeof styleModifiers] || styleModifiers.realistic,
      "high quality, detailed, professional",
    ].join(", ")

    return NextResponse.json({
      enhancedPrompt: fallbackPrompt,
      originalPrompt: prompt || "",
      appliedStyle: style || "realistic",
      creativityLevel: creativity || 50,
      suggestions: ["Enhanced version", "Alternative style", "Creative variation"],
      fallback: true,
    })
  }
}
