/**
 * Voice Sanctuary Feature Flag
 *
 * Safety Lock: Checks if Voice Sanctuary feature is available.
 * Feature requires Google Cloud Speech-to-Text API key for moderation.
 *
 * If API key is missing, feature is completely disabled to prevent
 * unmoderated audio from being posted.
 */

import { isSpeechToTextAvailable } from "@/src/services/speechToText"

/**
 * Check if Voice Sanctuary feature is available
 *
 * @returns true if feature is enabled (API key present), false otherwise
 */
export const isVoiceSanctuaryAvailable = (): boolean => {
  return isSpeechToTextAvailable()
}
