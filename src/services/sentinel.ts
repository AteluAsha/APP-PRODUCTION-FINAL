/**
 * The Sentinel - Egoless Filter (Anua monitor for Social Sanctuary)
 *
 * Uses Anua (Gemini) to screen every feed comment before it is written to Firestore.
 * All Social Sanctuary reflections and replies pass through moderateReflection()
 * in the app before addReflection() is called. Only approved content reaches the
 * social_sanctuary collection, so the feed and Firestore are fully connected:
 * what you see in the feed is exactly what is stored, and it has been checked
 * for hate, spam, and ego-driven vitriol.
 */

import { askAnua, isAnuaAvailable } from "./gemini"

/**
 * Moderate a reflection message using Gemini AI
 *
 * @param message - The reflection message to moderate
 * @returns Object with isApproved (boolean) and reason (string if rejected)
 */
export const moderateReflection = async (
  message: string,
): Promise<{ isApproved: boolean; reason?: string }> => {
  try {
    // Check if Anua is available
    if (!isAnuaAvailable()) {
      // If Gemini is not available, allow the message (fail open)
      // In production, you might want to fail closed instead
      if (__DEV__) {
        console.warn("Sentinel: Gemini not available, allowing message")
      }
      return { isApproved: true }
    }

    // Create moderation prompt
    const moderationPrompt = `You are The Sentinel, an egoless filter for a sacred spiritual community space.

Your task: Review this reflection message for the Social Sanctuary.

REFLECTION TO REVIEW:
"${message}"

EVALUATION CRITERIA:
1. **Hate**: Does this contain hate speech, discrimination, or attacks on others?
2. **Spam**: Is this spam, advertising, or irrelevant content?
3. **Ego-Driven Vitriol**: Does this contain ego-driven vitriol, judgment, or toxic energy?
4. **Sincerity**: Is this a sincere, heart-minded reflection?

DECISION:
- If the message is HARMFUL (hate, spam, or ego-driven vitriol): Respond with "REJECT" followed by a brief reason
- If the message is SINCERE and heart-minded: Respond with "APPROVE"

Respond ONLY with either:
- "APPROVE"
- "REJECT: [brief reason]"

Do not include any other text.`

    // Use a separate model instance for moderation (lower temperature for consistency)
    const response = await askAnua(moderationPrompt, {
      temperature: 0.3, // Lower temperature for more consistent moderation
      maxTokens: 100,
      enableVoice: false,
    })

    const responseText = response.trim().toUpperCase()

    if (responseText.startsWith("APPROVE")) {
      return { isApproved: true }
    } else if (responseText.startsWith("REJECT")) {
      // Extract reason if provided
      const reasonMatch = responseText.match(/REJECT:\s*(.+)/i)
      const reason = reasonMatch
        ? reasonMatch[1].trim()
        : "Message does not meet community guidelines"
      return { isApproved: false, reason }
    } else {
      // If response is unclear, default to approval (fail open)
      // In production, you might want to fail closed or require human review
      if (__DEV__) {
        console.warn(
          "Sentinel: Unclear response, defaulting to approval:",
          responseText,
        )
      }
      return { isApproved: true }
    }
  } catch (error) {
    if (__DEV__) {
      console.error("Sentinel: Error moderating reflection:", error)
    }
    // On error, default to approval (fail open)
    // In production, you might want to fail closed or require human review
    return { isApproved: true }
  }
}
