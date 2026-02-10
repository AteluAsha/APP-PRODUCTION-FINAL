/**
 * Anua Navigation Service
 *
 * Divine Navigation: Anua can navigate users to specific screens based on
 * their requests. When a student asks to 'start Day 4' or 'find sound healing
 * for the Heart Chakra,' Anua responds: 'I am taking you there now,' and then
 * physically triggers the navigation to that screen.
 */

import { router } from "expo-router"
import { askAnua } from "./gemini"
import { speakAsAnua, isElevenLabsAvailable } from "./elevenlabs"

/**
 * Navigation route mapping
 * Maps user-friendly descriptions to actual app routes
 */
const NAVIGATION_ROUTES = {
  // Chakra days
  "day 1": "/(chakras)/root",
  "day 2": "/(chakras)/sacral",
  "day 3": "/(chakras)/solar",
  "day 4": "/(chakras)/heart",
  "day 5": "/(chakras)/throat",
  "day 6": "/(chakras)/thirdeye",
  "day 7": "/(chakras)/crown",
  "root chakra": "/(chakras)/root",
  "sacral chakra": "/(chakras)/sacral",
  "solar plexus": "/(chakras)/solar",
  "solar plexus chakra": "/(chakras)/solar",
  "heart chakra": "/(chakras)/heart",
  "throat chakra": "/(chakras)/throat",
  "third eye chakra": "/(chakras)/thirdeye",
  "third eye": "/(chakras)/thirdeye",
  "crown chakra": "/(chakras)/crown",

  // Sound healing
  "sound healing": "/(chakras)/SoundBath",
  "sound bath": "/(chakras)/SoundBath",
  "sound healing for root": "/(chakras)/SoundBath?chakra=root",
  "sound healing for sacral": "/(chakras)/SoundBath?chakra=sacral",
  "sound healing for solar plexus": "/(chakras)/SoundBath?chakra=solar",
  "sound healing for heart": "/(chakras)/SoundBath?chakra=heart",
  "sound healing for heart chakra": "/(chakras)/SoundBath?chakra=heart",
  "sound healing for throat": "/(chakras)/SoundBath?chakra=throat",
  "sound healing for third eye": "/(chakras)/SoundBath?chakra=thirdeye",
  "sound healing for crown": "/(chakras)/SoundBath?chakra=crown",

  // Chakra study
  "chakras 101": "/(chakras)/Chakras101",
  "chakra study": "/(chakras)/Chakras101",
  "learn about chakras": "/(chakras)/Chakras101",

  // Head to Heart
  "head to heart": "/(chakras)/HeadToHeart",
  "from head to heart": "/(chakras)/HeadToHeart",

  // Other sections
  home: "/(chakras)/",
  "main screen": "/(chakras)/",
  accountability: "/(chakras)/AccountabilityOfAwakening",
  "accountability of awakening": "/(chakras)/AccountabilityOfAwakening",
} as const

/**
 * Parse user request and determine navigation target
 *
 * @param userRequest - The user's navigation request
 * @returns The route path or null if not found
 */
export const parseNavigationRequest = async (
  userRequest: string,
): Promise<string | null> => {
  try {
    // First, try direct mapping
    const lowerRequest = userRequest.toLowerCase().trim()
    const directMatch =
      NAVIGATION_ROUTES[lowerRequest as keyof typeof NAVIGATION_ROUTES]
    if (directMatch) {
      return directMatch
    }

    // If no direct match, use Anua to interpret the request
    const interpretationPrompt = `A student has requested: "${userRequest}"

Based on this request, determine which screen in the Soul School app they want to navigate to.

Available screens:
- Day 1-7 / Root, Sacral, Solar Plexus, Heart, Throat, Third Eye, Crown chakras
- Sound Healing / Sound Bath (can be for specific chakras)
- Chakra Study / Chakras 101
- Head to Heart
- Home / Main screen
- Accountability of Awakening

Respond with ONLY the route path in this exact format:
- For chakras: /(chakras)/[chakra_name] (e.g., /(chakras)/heart)
- For sound healing: /(chakras)/SoundBath?chakra=[chakra_name] (e.g., /(chakras)/SoundBath?chakra=heart)
- For chakra study: /(chakras)/Chakras101
- For head to heart: /(chakras)/HeadToHeart
- For home: /(chakras)/
- For accountability: /(chakras)/AccountabilityOfAwakening

If the request is unclear or doesn't match any screen, respond with: null

Return ONLY the route path or "null", nothing else.`

    const interpretation = await askAnua(interpretationPrompt, {
      temperature: 0.3, // Lower temperature for more precise interpretation
      maxTokens: 100,
      enableVoice: false, // Don't speak the interpretation prompt
    })

    const route = interpretation.trim().toLowerCase()
    if (route === "null" || route === "") {
      return null
    }

    // Validate the route format
    if (route.startsWith("/(chakras)/")) {
      return route
    }

    return null
  } catch (error) {
    console.error("Error parsing navigation request:", error)
    return null
  }
}

/**
 * Navigate to a screen with Anua's guidance
 *
 * Anua responds: 'I am taking you there now,' and then navigates.
 *
 * @param userRequest - The user's navigation request
 * @param router - The router instance for navigation
 * @returns Promise that resolves when navigation completes
 */
export const navigateWithAnua = async (
  userRequest: string,
  routerInstance: typeof router,
): Promise<boolean> => {
  try {
    // Parse the navigation request
    const route = await parseNavigationRequest(userRequest)

    if (!route) {
      // Anua responds that she couldn't find the location
      if (isElevenLabsAvailable()) {
        await speakAsAnua(
          "I'm not sure where you'd like to go. Could you be more specific? You can ask for a specific day, chakra, sound healing, or chakra study.",
        )
      }
      return false
    }

    // Anua responds that she's taking them there
    if (isElevenLabsAvailable()) {
      await speakAsAnua("I am taking you there now.")
    }

    // Small delay for the message to be heard
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Navigate to the route
    routerInstance.push(route as any)

    return true
  } catch (error) {
    if (__DEV__) {
      console.error("Error navigating with Anua:", error)
    }
    return false
  }
}

/**
 * React hook for Anua navigation
 *
 * @param router - The router instance
 * @returns Navigation functions
 */
export const useAnuaNavigation = (routerInstance: typeof router) => {
  return {
    navigate: (userRequest: string) =>
      navigateWithAnua(userRequest, routerInstance),
    parseRequest: (userRequest: string) => parseNavigationRequest(userRequest),
  }
}
