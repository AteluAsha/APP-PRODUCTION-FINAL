/**
 * Layout constants for consistent spacing across scroll screens.
 * Use when content must clear floating UI (e.g. FloatingNavButtons, Anua button).
 */
export const FLOATING_NAV_SCROLL_BOTTOM_PADDING = 140

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
