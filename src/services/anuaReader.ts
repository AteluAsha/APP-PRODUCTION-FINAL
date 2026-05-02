/**
 * Anua Reader Service
 *
 * Global service that allows Anua to read any text component in the app aloud
 * using her custom voice ID. Acts as an audiobook guide for all materials.
 */

import { speakAsAnua, isElevenLabsAvailable } from "./elevenlabs"
import { askAnua } from "./gemini"

/**
 * Read text aloud using Anua's voice
 *
 * @param text - The text content to read
 * @param options - Optional configuration
 * @returns Promise that resolves when reading completes
 */
export const readAsAnua = async (
  text: string,
  options?: {
    includeReflection?: boolean // Whether to include a Heart-Mind Reflection at the end
    sectionType?:
      | "chakra"
      | "sound_healing"
      | "chakra_study"
      | "shadow_work"
      | "head_to_heart"
      | "general"
  },
): Promise<void> => {
  try {
    if (!isElevenLabsAvailable()) {
      if (__DEV__) {
        console.warn("ElevenLabs is not configured. Cannot read text aloud.")
      }
      return
    }

    // Read the main text
    await speakAsAnua(text)

    // If reflection is requested, generate and speak a Heart-Mind Reflection
    if (options?.includeReflection) {
      const reflection = await generateHeartMindReflection(
        text,
        options.sectionType,
      )
      if (reflection) {
        // Small pause before reflection
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await speakAsAnua(reflection)
      }
    }
  } catch (error) {
    console.error("Error reading as Anua:", error)
    throw error
  }
}

/**
 * Generate a Heart-Mind Reflection question
 *
 * When Anua reads a section, she ends with a direct, wise question
 * that forces the student to stop reading and start embodying the lesson.
 *
 * @param text - The text that was just read
 * @param sectionType - The type of section being read
 * @returns A Heart-Mind Reflection question
 */
const generateHeartMindReflection = async (
  text: string,
  sectionType?: string,
): Promise<string | null> => {
  try {
    const prompt = `You are Anua, a Master Teacher and Guide. A student has just read or heard this content:

${text.substring(0, 1000)}${text.length > 1000 ? "..." : ""}

${sectionType ? `This is from the ${sectionType} section.` : ""}

Generate a single, direct, wise Heart-Mind Reflection question that:
- Forces the student to stop reading and start embodying the lesson
- Connects the content to their personal experience
- Guides them from Head to Heart - from intellectual understanding to felt experience
- Is specific to the content they just read
- Is intimate and personal, like a friend who truly knows them
- Draws from the wisdom of Innana and Marimane Mara
- Embodies 5D consciousness - unconditional love and unity

Return ONLY the question, nothing else. Make it powerful and transformative.`

    const reflection = await askAnua(prompt, {
      temperature: 0.95,
      maxTokens: 200,
      enableVoice: false, // Don't speak the reflection generation prompt
    })

    return reflection.trim()
  } catch (error) {
    console.error("Error generating Heart-Mind Reflection:", error)
    return null
  }
}

/**
 * Read a text component with Anua's voice
 * Convenience function for components to use
 *
 * @param text - The text to read
 * @param includeReflection - Whether to include a Heart-Mind Reflection
 * @param sectionType - The type of section
 */
export const useAnuaReader = () => {
  return {
    read: (
      text: string,
      options?: { includeReflection?: boolean; sectionType?: string },
    ) =>
      readAsAnua(text, {
        includeReflection: options?.includeReflection,
        sectionType: options?.sectionType as any,
      }),
    isAvailable: isElevenLabsAvailable(),
  }
}
