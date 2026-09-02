/**
 * Layout constants for consistent spacing across scroll screens.
 * Use when content must clear the menu bar / bottom nav area.
 */

/** JS splash (AnimatedSplashScreen) must stay visible at least this long after mount (wall clock before fade may start). */
export const SPLASH_MIN_DISPLAY_MS = 4000

/** After assets are ready, hold the pulsing hero this long before fade-out (rest breath). */
export const SPLASH_BREATH_HOLD_BEFORE_FADE_MS = 1200

export const FLOATING_NAV_SCROLL_BOTTOM_PADDING = 140

/**
 * OPENING SPLASH – SOUL SCHOOL hero logo size (single source of truth)
 * ChakraHome !contentReady placeholder uses OPENING_LOGO below.
 * Native shield uses SoulSchool_APP_HeroLoadImage (app.config.js).
 */
export const OPENING_LOGO = {
  width: { ios: 260, android: 218 },
  height: { ios: 130, android: 109 },
} as const

/**
 * Opening JS splash only (`AnimatedSplashScreen` + `SoulSchool_HERO_Logo.png`).
 * Does not resize the native shield golden 7 (`SoulSchool_APP_HeroLoadImage` in app.config.js).
 */
export const OPENING_SPLASH_LOGO = {
  width: { ios: 300, android: 270 },
  height: { ios: 150, android: 135 },
} as const

/**
 * Extra scroll padding below content so users can scroll past a little and raise
 * bottom content up for clarity and control. Add to scroll content paddingBottom
 * on screens with clickable content at the bottom.
 */
export const SCROLL_BREATHING_BOTTOM_PADDING = 80

/**
 * TRIAL HOME CHAKRA STACK POSITION - LOCKED
 * The full 7 chakra balls must ALWAYS be pinned to the base (bottom) of the
 * main phone screen on trials home. They must NEVER be centered.
 * - Stack is pinned via IntegratedProgressStack (viewportHeight container +
 *   justifyContent: "flex-end" + paddingBottom). Do not change to center.
 * - Android and all platforms: base-pinned placement is non-negotiable.
 */
/** Approximate height of one chakra ball in the stack (for spacing). */
const CHAKRA_BALL_HEIGHT_APPROX = 88

/** iOS lifetime hub (ChakraHub): reduce the stack block height by this so the stack sits higher (root well above alpha-omega symbols). Stack and alpha/omega are separate; this reserve keeps the stack from being dragged down. */
export const LIFETIME_HUB_STACK_RAISE_IOS = 320

/**
 * ChakraHub α/Ω strip sits below the ScrollView (not over the stack).
 * First-open stack height = window minus this footer minus the status-bar inset
 * so the 7 balls optically center on the opening screen.
 */
export const HUB_ALPHA_OMEGA_FOOTER_PADDING_TOP = 10
export const HUB_ALPHA_OMEGA_GLYPH_LINE = 28

export function hubAlphaOmegaFooterHeight(insetsBottom: number): number {
    return (
        HUB_ALPHA_OMEGA_FOOTER_PADDING_TOP +
        HUB_ALPHA_OMEGA_GLYPH_LINE +
        Math.max(insetsBottom, 12)
    )
}

export function lifetimeHubFirstScreenStackHeight(
    windowHeight: number,
    insetsTop: number,
    insetsBottom: number,
): number {
    return Math.max(
        windowHeight - hubAlphaOmegaFooterHeight(insetsBottom) - insetsTop,
        420,
    )
}

/** iOS lifetime hub: bottom padding under the stack so the root ball is pinned higher (single source for pin offset). */
export const ROOT_BOTTOM_OFFSET_LIFETIME_HUB_IOS =
  20 + CHAKRA_BALL_HEIGHT_APPROX + LIFETIME_HUB_STACK_RAISE_IOS

/**
 * Lifetime hub (ChakraHub): PulsingButton smallDivisor (smaller divisor = larger orbs).
 * Base was 9.5; +10% orb size → 9.5 / 1.1. Keeps IntegratedProgressStack title math in sync.
 */
export const LIFETIME_HUB_CHAKRA_BALL_DIVISOR = 9.5 / 1.1

/**
 * Trial ChakraHome stack: PulsingButton uses small=true with this divisor (was implicit H/8.5 via small=false).
 * From base: 7% smaller (÷0.93), 10% smaller (÷0.9), then 5% larger (×1.05 on size → ÷1.05 on divisor). Lifetime hub uses LIFETIME_HUB_CHAKRA_BALL_DIVISOR only.
 */
export const TRIAL_HOME_CHAKRA_BALL_DIVISOR = 8.5 / (0.93 * 0.9 * 1.05)

/** Lifetime hub: horizontal gap between the day title (left of orb) and the orb edge (absolute label). */
export const LIFETIME_HUB_DAY_TITLE_SIDE_GAP = 12

export const TRIAL_HOME_ROOT_CHAKRA = {
  /** Vertical padding under the stack (root ball pinned this far from bottom); lower = stack sits lower (trial home). */
  BOTTOM_PADDING: 20,
  /**
   * Android trial only: slightly less than BOTTOM_PADDING so the root orb sits a bit lower on screen,
   * balancing the pillar when many orbs are visible (reduces top crowding vs empty band below).
   */
  BOTTOM_PADDING_ANDROID_TRIAL: 12,
  /** iOS lifetime hub only: root ball sits higher by ~one ball height so entire stack is raised. */
  BOTTOM_PADDING_LIFETIME_HUB_IOS: 20 + CHAKRA_BALL_HEIGHT_APPROX,
  /** Space between day title (e.g. "Monday – Root Day") and the chakra ball icon; gentle black spacing above ball */
  DAY_LABEL_TO_BALL_GAP: 28,
  /** ScrollView content top padding (ChakraHome) – Android. */
  SCROLL_PADDING_TOP: 32,
  /** ScrollView content top padding (ChakraHome) – iOS. LOCKED: trial home stack viewport is reduced by this so full stack (including root ball) fits on screen; do not alter. */
  SCROLL_PADDING_TOP_IOS: 16,
  /** ScrollView content bottom padding (ChakraHome) */
  SCROLL_PADDING_BOTTOM: 0,
} as const

/**
 * Somatic flow: screen and modal transition durations (ms).
 * Slower, gentler transitions for a calm, embodied feel across the app.
 *
 * UX rule (homescreens and app-wide): Preload all screen content first; when
 * ready, cue a single soft fade so all elements appear together. Avoid
 * staggered or late-loading elements (e.g. one chakra ball popping in after others).
 *
 * Stacks: Use animationDuration: SOMATIC_SCREEN_TRANSITION_MS for all screen transitions.
 * Modals: Use animationType="fade" for soft open/close; avoid "slide" for consistency.
 */
export const SOMATIC_SCREEN_TRANSITION_MS = 520
/** iOS: slightly longer transition for softer screen openings (all stacks). */
export const SOMATIC_SCREEN_TRANSITION_MS_IOS = 680
export const SOMATIC_FADE_IN_MS = 1400
/** First paint of home dashboard after cold start (ChakraHome / ChakraHub); session-scoped in useHomeSomaticEntrance */
export const SOMATIC_HOME_COLD_START_FADE_MS = 3000
/**
 * Chakra Home Reveal Breath: lifetime ChakraHub dashboard fade after paywall, scholarship,
 * Access Granted → hub, or Energy Exchange (Enter Path). Same duration as cold-start home fade.
 */
export const CHAKRA_HUB_REVEAL_BREATH_MS = SOMATIC_HOME_COLD_START_FADE_MS
/** (chakras) Stack fade for index / Welcome / ChakraHome / ChakraHub — calm handoff before screen body entrance */
export const SOMATIC_HOME_STACK_FADE_MS = 600
/** Reanimated fade when returning to home in-session (not cold start ritual) */
export const SOMATIC_HOME_WARM_RETURN_MS = 400
/** Welcome path-selection screen: content reveal after hero images load */
export const SOMATIC_WELCOME_ENTRANCE_MS = 2000
/** Shorter fade for in-screen content (sections, cards) – still gentle */
export const SOMATIC_CONTENT_FADE_MS = 640

/** Large hero / background `Image` materialization (Reanimated opacity on load) */
export const SOMATIC_HERO_IMAGE_FADE_MS = 1000

/** Full-screen or centered `ActivityIndicator` panels: soft fade-out before unmount */
export const SOMATIC_SPINNER_FADE_OUT_MS = 380

/**
 * Card-style modals: max width so popups are wide and easy to read on Android (and iOS).
 * Use for centered modal cards; full-screen modals ignore this.
 */
export const MODAL_CARD_MAX_WIDTH = 420

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
