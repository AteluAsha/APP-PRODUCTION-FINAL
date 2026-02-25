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
  BOTTOM_PADDING: 28,
  /** ScrollView content top padding (ChakraHome) */
  SCROLL_PADDING_TOP: 32,
  /** ScrollView content bottom padding (ChakraHome) */
  SCROLL_PADDING_BOTTOM: 0,
} as const

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
