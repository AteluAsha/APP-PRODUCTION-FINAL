/**
 * Anua Ritual Service
 *
 * Coordinates the 'Threshold' (Intro) and 'Bridge' (Outro) rituals for each chakra day.
 *
 * Intro Ritual: Triggered when the main audio intro finishes
 * Outro Ritual: Triggered when the 'Complete Day' button is pressed
 */

import { speakAsAnua, synthesizeAnuaVoice } from './elevenlabs'
import { askAnua } from './gemini'
import { ANUA_INTRO_RITUAL_SCRIPT } from '@/src/constants/anuaScripts'
import { Chakra } from '@/types/chakras/Chakra'
import { chakraContent } from '@/constants/chakras/content'

/**
 * Voice configuration for ritualistic tone
 * Stability and similarity set to 0.8 for a grounded, ritualistic tone
 */
const RITUAL_VOICE_CONFIG = {
    stability: 0.8,
    similarity_boost: 0.8,
    style: 0.6, // Slightly lower style for more measured, ritualistic delivery
} as const

/**
 * Intro Ritual (Threshold)
 *
 * Triggered when the main audio intro finishes.
 * Anua speaks the intro ritual script to prepare the student for their journey.
 *
 * @returns Promise that resolves when the ritual completes
 */
export const performIntroRitual = async (): Promise<void> => {
    try {
        await speakAsAnua(ANUA_INTRO_RITUAL_SCRIPT, RITUAL_VOICE_CONFIG)
    } catch (error) {
        if (__DEV__) {
            console.error('Error performing Intro Ritual:', error)
        }
        throw error
    }
}

/**
 * Outro Ritual (Bridge)
 *
 * Triggered when the 'Complete Day' button is pressed.
 * Anua provides a moment of integration with:
 * - Yoga posture suggestion for that day's chakra
 * - Food suggestion for that day's chakra
 * - Hero Mantra repeated three times
 * - Simple chakra metaphor
 *
 * @param chakra - The chakra that was just completed
 * @returns Promise that resolves when the ritual completes
 */
export const performOutroRitual = async (chakra: Chakra): Promise<void> => {
    try {
        const content = chakraContent[chakra]

        // Build the outro ritual script
        const outroScript = await buildOutroRitualScript(chakra, content)

        // Speak the outro ritual with ritualistic voice
        await speakAsAnua(outroScript, RITUAL_VOICE_CONFIG)
    } catch (error) {
        if (__DEV__) {
            console.error('Error performing Outro Ritual:', error)
        }
        throw error
    }
}

/**
 * Build the Outro Ritual script
 *
 * Combines yoga posture, food, Hero Mantra (repeated 3x), and chakra metaphor
 */
const buildOutroRitualScript = async (
    chakra: Chakra,
    content: typeof chakraContent[Chakra],
): Promise<string> => {
    // Get yoga posture
    const yogaPose = content.yoga.pose
    const yogaDescription = content.yoga.poseDescription

    // Get food suggestion
    const foods = content.elements.foods

    // Get Hero Mantra (Seed Mantra)
    const heroMantra = content.pills.seedMantra.title

    // Generate a simple chakra metaphor using Anua
    const metaphorPrompt = `Generate a simple, beautiful metaphor for the ${content.header.textLine2} (${content.header.textLine3}). 

This metaphor should:
- Be simple and accessible
- Connect the chakra to everyday life
- Help the student understand the chakra's essence through imagery
- Be poetic but practical
- Be one or two sentences

Return ONLY the metaphor, nothing else.`

    let chakraMetaphor: string
    try {
        chakraMetaphor = await askAnua(metaphorPrompt, {
            temperature: 0.9,
            maxTokens: 100,
            enableVoice: false, // Don't speak the generation prompt
        })
    } catch (error) {
        if (__DEV__) {
            console.warn('Error generating chakra metaphor, using fallback:', error)
        }
        chakraMetaphor = `The ${content.header.textLine2} is like a foundation, grounding you in your authentic power.`
    }

    // Build the complete outro script
    const script = `A moment of integration for your ${content.header.textLine2} journey.

For your body, I suggest the ${yogaPose}. ${yogaDescription}

For your nourishment, consider ${foods}. These foods support the energy of your ${content.header.textLine2}.

Now, let us honor your Hero Mantra. Repeat after me three times: ${heroMantra}. ${heroMantra}. ${heroMantra}.

${chakraMetaphor}

You have completed your ${content.header.textLine2} journey for today. Carry this wisdom with you.`

    return script
}

/**
 * React hook for using Anua Ritual Service
 */
export const useAnuaRitual = () => {
    return {
        performIntroRitual,
        performOutroRitual,
    }
}

