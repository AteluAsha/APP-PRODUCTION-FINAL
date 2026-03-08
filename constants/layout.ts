/**
 * Layout constants for consistent spacing across scroll screens.
 * Use when content must clear floating UI (e.g. FloatingNavButtons, Anua button).
 */
export const FLOATING_NAV_SCROLL_BOTTOM_PADDING = 140

/**
 * Extra scroll padding below content so users can scroll past a little and raise
 * bottom content up for clarity and control. Add to scroll content paddingBottom
 * on screens with clickable content at the bottom.
 */
export const SCROLL_BREATHING_BOTTOM_PADDING = 80

/**
 * TRIAL HOME ROOT CHAKRA POSITION - LOCKED
 * Do not change without explicit approval. These values ensure the root chakra
 * ball always starts at the same fixed position on the trials page.
 */
export const TRIAL_HOME_ROOT_CHAKRA = {
  /** Space between root chakra ball and bottom of content area (IntegratedProgressStack) */
  BOTTOM_PADDING: 48,
  /** ScrollView content top padding (ChakraHome) */
  SCROLL_PADDING_TOP: 32,
  /** ScrollView content bottom padding (ChakraHome) */
  SCROLL_PADDING_BOTTOM: 0,
} as const

/**
 * Somatic flow: screen and modal transition durations (ms).
 * Slower, gentler transitions for a calm, embodied feel across the app.
 */
export const SOMATIC_SCREEN_TRANSITION_MS = 520
export const SOMATIC_FADE_IN_MS = 1400
/** Shorter fade for in-screen content (sections, cards) – still gentle */
export const SOMATIC_CONTENT_FADE_MS = 640

/**
 * Android scroll UX: soft, smooth scroll and reduced two-finger overscroll.
 * Apply to ScrollView when Platform.OS === 'android' for consistent somatic feel.
 * - decelerationRate 0.97: gentler coast than "normal" (0.985), less abrupt/jolting stop.
 * - overScrollMode 'never': no edge glow, softer stop (two-finger scroll less twitchy).
 * - scrollEventThrottle: smooth scroll-linked updates.
 */
export const SCROLL_ANDROID_SMOOTH_PROPS = {
  decelerationRate: 0.97 as const,
  overScrollMode: "never" as const,
  scrollEventThrottle: 16,
} as const

/**
 * Touch UX: comfortable hit area and feedback.
 * Use for Pressable/TouchableOpacity hitSlop and activeOpacity where appropriate.
 */
export const TOUCH = {
  hitSlop: { top: 12, bottom: 12, left: 12, right: 12 },
  activeOpacity: 0.85,
} as const

/**
 * Android touch responsiveness: Pressable uses an internal delay (~130ms) before
 * onPressIn to avoid triggering during scroll. On Android (and especially in
 * emulator) this can feel like lag. Use delayPressIn={0} for primary buttons
 * that are NOT inside a ScrollView to get instant feedback. Real devices often
 * feel snappier than emulator; test on device before assuming a problem.
 */
export const ANDROID_PRESS_DELAY_MS = 0

/** Production-approved icon and control sizes (play screens, sound screens, global) */
export const ICON = {
  /** Close (X) and back arrow – action bar */
  actionBar: 24,
  /** Home / chakra icon in top-right */
  homeButton: 40,
  homeIcon: 24,
  /** Audio player: skip 10s rewind/forward */
  skipControl: 26,
  /** Audio player: main play/pause circle diameter */
  playPauseCircle: 52,
  /** Audio player: play/pause icon inside circle */
  playPauseIcon: 20,
  /** Horizontal gap between rewind / play / forward */
  controlsGap: 36,
} as const
