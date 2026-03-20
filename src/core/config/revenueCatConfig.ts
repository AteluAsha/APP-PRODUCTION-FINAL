/**
 * RevenueCat configuration for SOUL SCHOOL
 *
 * Central config for RevenueCat SDK keys and app identifiers.
 * Used by the RevenueCat service for initialization at app start.
 * Apple and Android are bridged in RevenueCat.
 */

/** Android package name / app identifier (must match RevenueCat dashboard and store listing) */
export const REVENUECAT_APP_PACKAGE_NAME = "com.sevenchakras.SevenChakras"

/** Public SDK Key (Google Play) – used when REVENUECAT_API_KEY env is not set. */
export const REVENUECAT_PUBLIC_SDK_KEY_ANDROID =
  "goog_KtQEOatGTuuEJQzuPjkauMsrPSV"

/** Public SDK Key (App Store). */
export const REVENUECAT_PUBLIC_SDK_KEY_IOS =
  "appl_AiMuaJOOxeQBfwAVQcDndElOpmt"

/** App display name for RevenueCat user attributes */
export const REVENUECAT_APP_NAME = "SOUL SCHOOL"
