/**
 * Voice Response Moderation
 *
 * Moderates voice responses using transcription + Anua (Gemini AI).
 *
 * MVP Approach: Transcription-first moderation
 * - Transcribe audio to text
 * - Use existing Sentinel moderation (text-based)
 * - Future: Evolve to native Gemini audio analysis
 *
 * Philosophy: "Anua felt a distortion in this message. Please breathe and try again from the heart."
 */

import { moderateReflection } from "./sentinel"

export interface VoiceModerationResult {
  isApproved: boolean
  reason?: string
}

/**
 * Moderate a voice response
 *
 * MVP: Uses transcription for moderation (text-based)
 * Future: Will use native Gemini audio analysis for tonal qualities
 *
 * @param transcription - Transcribed text from audio (for MVP)
 * @param audioUri - Audio file URI (for future native audio moderation)
 * @returns Moderation result with approval status and reason if rejected
 */
export const moderateVoiceResponse = async (
  transcription: string,
  audioUri?: string, // Reserved for future native audio moderation
): Promise<VoiceModerationResult> => {
  try {
    // MVP: Use transcription-based moderation
    // This leverages existing Sentinel moderation logic
    // Future: Add native audio analysis here when Gemini audio API is available

    if (!transcription || transcription.trim().length === 0) {
      // If no transcription available, approve by default (fail open)
      // In production, you might want to fail closed or require transcription
      if (__DEV__) {
        console.warn(
          "Voice Moderation: No transcription available, approving by default",
        )
      }
      return { isApproved: true }
    }

    // Use existing Sentinel moderation (text-based)
    const moderationResult = await moderateReflection(transcription)

    if (moderationResult.isApproved) {
      return { isApproved: true }
    } else {
      // Return gentle, heart-minded rejection message
      const reason =
        moderationResult.reason ||
        "Anua felt a distortion in this message. Please breathe and try again from the heart."
      return { isApproved: false, reason }
    }
  } catch (error) {
    if (__DEV__) {
      console.error("Voice Moderation: Error moderating response:", error)
    }
    // On error, default to approval (fail open)
    // In production, you might want to fail closed or require human review
    return { isApproved: true }
  }
}
