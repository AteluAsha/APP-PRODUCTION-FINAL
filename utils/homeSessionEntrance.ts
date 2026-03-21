/**
 * Process-scoped guard for the home dashboard "somatic entrance" fade.
 * Resets only when the JS bundle reloads (true cold start). Not persisted.
 * First home screen to mount with ready content consumes the ritual; later
 * navigations to ChakraHome/ChakraHub in the same session see instant opacity.
 *
 * Chakra Home Reveal Breath: call `requestChakraHubRevealBreath()` before navigating
 * to ChakraHub from paywall / scholarship / Energy Exchange so the hub uses the long
 * fade (same ms as cold start) instead of warm return.
 */
let isFirstHomeEntranceInSession = true

let pendingChakraHubRevealBreath = false

export function requestChakraHubRevealBreath() {
  pendingChakraHubRevealBreath = true
}

/** True once when navigation to ChakraHub was prefaced with requestChakraHubRevealBreath(). */
export function consumeChakraHubRevealBreathIfPending(): boolean {
  if (!pendingChakraHubRevealBreath) return false
  pendingChakraHubRevealBreath = false
  isFirstHomeEntranceInSession = false
  return true
}

export function consumeHomeEntranceIfFirst(): boolean {
  if (!isFirstHomeEntranceInSession) return false
  isFirstHomeEntranceInSession = false
  return true
}
