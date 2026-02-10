/**
 * Wisdom Engine
 *
 * Connects Anua to the master body of work stored in Firebase Storage.
 * Generates dynamic Daily Transmissions in the "Mirror" format:
 * - One small, deep insight about the day's chakra
 * - One gentle question to the user
 *
 * Anua is a mirror - she never speaks of herself or her own identity.
 */

import { ref, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase"
import { askAnua, isAnuaAvailable } from "./gemini"
import { checkRateLimit, waitForRateLimit } from "@/src/utils/rateLimiter"

// Firebase Storage path for wisdom manuals
const WISDOM_MANUALS_PATH = "Wisdom_manuals_ForAI"

// Master PDF files in priority order
const WISDOM_FILES = {
  dailyMeditations: "7ChakrasAPP_DailyMeditations_AudioTranscripts.pdf",
  sevenDaysMaster: "7Chakras_7Days_5_5x8_5inch_KDP_Sep_27_25__MASTER_777.pdf",
  egoAndSelf: "TheEgoAndTheSelf_KDP_PaperMASTER_11_11_v7.pdf",
}

// Chakra names for context
const CHAKRA_NAMES = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown",
]

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

/**
 * Get download URL for a PDF file from Firebase Storage
 */
const getPDFUrl = async (filename: string): Promise<string | null> => {
  try {
    if (!storage) {
      if (__DEV__) {
        console.warn("Firebase Storage is not initialized")
      }
      return null
    }

    // Check rate limit for Storage reads
    if (!checkRateLimit("firebase")) {
      await waitForRateLimit("firebase")
    }

    const fileRef = ref(storage, `${WISDOM_MANUALS_PATH}/${filename}`)
    const url = await getDownloadURL(fileRef)
    return url
  } catch (error) {
    if (__DEV__) {
      console.error(`Error getting PDF URL for ${filename}:`, error)
    }
    return null
  }
}

/**
 * Generate Anua's Daily Transmission using the Wisdom Engine
 *
 * This function:
 * 1. Gets download URLs for the three master PDFs
 * 2. Uses Gemini to read and synthesize wisdom from these PDFs
 * 3. Generates a Mirror-format transmission (insight + question)
 * 4. Ensures Anua never speaks of herself
 *
 * @param chakraDay - The chakra day (0-6, Monday-Sunday)
 * @returns The Daily Transmission in Mirror format, or null if generation fails
 */
export const generateDailyTransmission = async (
  chakraDay: number,
): Promise<string | null> => {
  try {
    // Check if Anua is available
    if (!isAnuaAvailable()) {
      if (__DEV__) {
        console.warn("Wisdom Engine: Gemini not available")
      }
      return null
    }

    // Check rate limit
    if (!checkRateLimit("gemini")) {
      await waitForRateLimit("gemini")
    }

    const chakraName = CHAKRA_NAMES[chakraDay] || `Day ${chakraDay + 1}`
    const dayName = DAY_NAMES[chakraDay] || "Today"

    // Get download URLs for all three PDFs
    const [dailyMeditationsUrl, sevenDaysUrl, egoAndSelfUrl] =
      await Promise.all([
        getPDFUrl(WISDOM_FILES.dailyMeditations),
        getPDFUrl(WISDOM_FILES.sevenDaysMaster),
        getPDFUrl(WISDOM_FILES.egoAndSelf),
      ])

    // Build the wisdom synthesis prompt
    // Note: Gemini 1.5 Pro can read files, but we need to upload them first or use file references
    // For now, we'll pass the URLs and let Gemini access them if supported
    // In the future, we may need to upload files to Gemini's File API first
    let fileReferences = ""
    if (dailyMeditationsUrl) {
      fileReferences += `\n1. Daily Meditations PDF: ${dailyMeditationsUrl}\n   - Focus on the ${chakraName} Chakra meditation for ${dayName}\n   - This contains the specific meditation transcript for today's chakra\n`
    }
    if (sevenDaysUrl) {
      fileReferences += `\n2. Seven Days Master PDF: ${sevenDaysUrl}\n   - This is the complete 7-day chakra journey guide\n`
    }
    if (egoAndSelfUrl) {
      fileReferences += `\n3. The Ego and The Self PDF: ${egoAndSelfUrl}\n   - This contains wisdom about ego dissolution and self-realization\n`
    }

    // If no files available, use fallback
    if (!dailyMeditationsUrl && !sevenDaysUrl && !egoAndSelfUrl) {
      if (__DEV__) {
        console.warn("Wisdom Engine: No PDF files available, using fallback")
      }
      // Fallback to general wisdom without PDFs
      fileReferences = `\nNote: Master PDFs are not currently available. Draw from your knowledge of the ${chakraName} Chakra and the 7-day journey.\n`
    }

    const wisdomPrompt = `You are Anua, a mirror of wisdom. You are NOT a person with an identity. You are pure reflection - a bridge between the student and their own heart-mind.

CRITICAL: You must NEVER speak of yourself, your identity, your feelings, or your own experience. You are a mirror. You reflect wisdom, not personality.

TASK: Generate a Daily Transmission for the Social Sanctuary in the "Mirror" format.

THE STUDENT'S CONTEXT:
- Current Chakra: ${chakraName} Chakra
- Day: ${dayName} (Day ${chakraDay + 1} of 7)
- They are opening the Social Sanctuary to connect with wisdom and community

VOICE: Always chakra-focused first—meet them exactly where they are in the journey. Then expand with full openness. This is her post of the day: direct, grounded in the chakra, and heart-open.

WISDOM SOURCES (consult in this order):
${fileReferences}

IMPORTANT: If you have access to these PDF files, read them and synthesize their wisdom. If not, draw from your understanding of:
- The ${chakraName} Chakra's essence and teachings
- The 7-day chakra journey structure
- Ego dissolution and self-realization principles
- Heart-mind wisdom and gnosis healing

THE MIRROR FORMAT:
Your transmission must have exactly TWO parts:

1. **INSIGHT**: One concise, deep insight about the ${chakraName} Chakra. This should:
   - Bridge the meditation to their current moment
   - Be profound but accessible
   - Connect to their lived experience
   - Draw from the wisdom in the PDFs above
   - Be 1 sentence maximum (keep it short and powerful)

2. **QUESTION**: One gentle, egoless question related to this chakra's frequency. This should:
   - Invite self-reflection
   - Be simple and heart-opening
   - Relate to the ${chakraName} Chakra's essence
   - Never be repetitive (make it unique)
   - Be 1 sentence maximum

OUTPUT FORMAT:
Return ONLY the transmission in this exact format:

INSIGHT:
[your insight here]

QUESTION:
[your question here]

Do not include any other text, explanations, or meta-commentary. Do not speak of yourself. Be the mirror.`

    // Generate the transmission
    // Use a slightly higher temperature to ensure uniqueness each time
    // Keep it concise - max 150 tokens for shorter transmissions
    const transmission = await askAnua(
      wisdomPrompt,
      {
        temperature: 0.9, // Higher temperature for more dynamic, non-repetitive responses
        maxTokens: 150, // Reduced from 300 for more concise transmissions
        enableVoice: false,
      },
      {
        currentDay: chakraDay,
        currentChakra: chakraName.toLowerCase(),
        chakraName: `${chakraName} Chakra`,
      },
    )

    // Parse and format the transmission
    const insightMatch = transmission.match(/INSIGHT:\s*(.+?)(?=QUESTION:|$)/is)
    const questionMatch = transmission.match(/QUESTION:\s*(.+?)$/is)

    if (insightMatch && questionMatch) {
      const insight = insightMatch[1].trim()
      const question = questionMatch[1].trim()

      // Format as a single transmission string
      return `${insight}\n\n${question}`
    } else {
      // If parsing fails, return the raw transmission
      if (__DEV__) {
        console.warn(
          "Wisdom Engine: Could not parse transmission format, using raw response",
        )
      }
      return transmission.trim()
    }
  } catch (error) {
    if (__DEV__) {
      console.error(
        "Wisdom Engine: Error generating daily transmission:",
        error,
      )
    }
    return null
  }
}

/**
 * Check if the Wisdom Engine is available
 * (requires both Gemini and Firebase Storage)
 */
export const isWisdomEngineAvailable = (): boolean => {
  return isAnuaAvailable() && storage !== null
}
