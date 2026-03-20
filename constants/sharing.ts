/**
 * Sharing Configuration
 *
 * Centralized sharing constants and feature flags
 */

// QR Code for app sharing
export const APP_QR_CODE_URL = "https://qrtiger.com/temp/1767694040509.png"

// Feature flag to enable/disable QR code sharing
export const ENABLE_QR_CODE_SHARING = true

// App store URLs (update these when app is published)
export const APP_STORE_URLS = {
  ios: "https://apps.apple.com/app/soul-school", // Placeholder - update when published
  android:
    "https://play.google.com/store/apps/details?id=com.sevenchakras.SevenChakras", // Placeholder
} as const

// Referral/invite link (placeholder - replace when referral system is ready)
export const REFERRAL_BASE_URL = "https://soulschool.app/invite"

// Project Starseed – mother ship and contribute (scholarships)
export const PROJECT_STARSEED_URL = "https://projectstarseed.org/"
export const CONTRIBUTE_URL = "https://projectstarseed.org/contribute"

// PENDING: Replace with App Store review URL when app is published
export const REVIEW_URL = "https://www.soulschool.app/community"

// SOUL SCHOOL hero site – archetype quiz (waiting room + ChakraHub)
export const ARCHETYPE_QUIZ_URL = "https://www.soulschool.app/archetypequiz"

// Contact / support email (opens in device mail client)
export const SUPPORT_EMAIL = "hello@soulschool.app"

// Share message template
export const SHARE_MESSAGE = `Join me on SOUL SCHOOL — 7 Chakras: The Map from Self to Soul. ✨`
