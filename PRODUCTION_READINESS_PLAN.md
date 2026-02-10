# Production Readiness Plan

**Date:** January 30, 2026  
**Scope:** Fixes, conflicts, UX improvements, and heart-minded polish for final production

---

## Critical Fixes (Must Do Before Launch)

### 1. ChakraHome Route Wrapper – Timegate Journey Broken ✅ FIXED

**Severity:** CRITICAL – Lifetime users cannot complete the timegate journey

**Issue:** The route wrapper redirected ALL lifetime users to ChakraHub, ignoring `lifetimeChosenTimegateJourney`. The timegate journey was unreachable.

**Fix applied:** Route wrapper now checks `lifetimeChosenTimegateJourney`. Only redirects when `hasLifetimeAccess && !lifetimeChosenTimegateJourney`. Renders `<ChakraHome />` when a lifetime user intentionally chose the timegate journey.

**File:** `app/(chakras)/ChakraHome.tsx`

---

## Heart-Minded Copy Updates (Soften Technical Language)

Replace cold or technical messaging with warmer, more embodied language that aligns with the app's healing intent.

| Location | Current | Suggested |
|----------|---------|-----------|
| SocialSanctuaryModal | "Loading reflections..." | "Gathering reflections..." |
| SocialSanctuaryModal | "Failed to load reflections. Please try again." | "Reflections are taking a moment to arrive. Please try again." |
| SocialSanctuaryModal | "Failed to submit reflection. Please try again." | "Your reflection is taking a moment to reach the community. Please try again." |
| CrystalBowlButton | "Loading..." | "Preparing your sound healing..." |
| RevenueCatPaywall | "Loading offers..." | "Preparing your path..." |
| ChakraCard (Gallery) | "Image could not be loaded" | "This card is taking a moment to appear. Please try again." |
| SoundBathButton | "Loading..." | "Preparing..." |

---

## Incomplete Features (Consider Before Launch)

### EnergyExchange – Review & Write to Us Buttons

**Current:** `handleReview` and `handleWriteToUs` both call `handleBack()` without performing any action. Users tap "Leave a Review" or "Write to Us" and are sent back—no app store link, no email.

**Options:**
1. **Implement:** Use `Linking.openURL()` for App Store review and `mailto:` for support email.
2. **Disable:** Hide or disable these buttons until implemented, with a gentler message.
3. **Keep as-is:** If intentional for MVP (e.g., "coming soon").

**File:** `app/(chakras)/EnergyExchange.tsx`

### Donate – Processing

**Current:** Donation flow has TODO for processing. Buttons may give false expectation of completing a donation.

**Recommendation:** Ensure UI clearly indicates "coming soon" or disable until backend is ready.

**Files:** `app/(chakras)/Donate.tsx`, `components/chakras/DonationModal.tsx`

---

## Dev-Only Verification (No Changes Needed)

| Item | Status |
|------|--------|
| TrialTestFlow | ✅ Wrapped in `__DEV__` – won't appear in production |
| ChakraHome debug console.log | ✅ `__DEV__` gated |
| ChakraTemplate debug console.log | ✅ `__DEV__` gated |
| CaptureAll (web dev) | ✅ `Platform.OS === 'web' && __DEV__` – production safe |
| Console.error/warn in catch blocks | ✅ Most are `__DEV__` gated |

---

## Accessibility Improvements (Optional)

**Current:** 37 `accessibilityLabel` / `accessibilityHint` usages across 14 files.

**Recommendation:** Add labels to high-traffic interactive elements:
- Chakra balls on ChakraHub
- Sanctuary list items (Gallery, Community, Anua, Accountability)
- Somatic Alignment button
- Main CTAs (e.g., "Continue Your Journey", paywall buttons)

---

## Error Handling Consistency

**Current state:**
- **ChakraTemplate (embodiment audio):** ✅ "The audio is taking a moment to arrive. Please try again, or continue your journey."
- **AnuaChatModal:** ✅ Gentle, contextual error messages
- **ChakraHome (chakras fetch):** ✅ "The chakras are taking a moment to arrive"
- **SocialSanctuaryModal:** ⚠️ "Failed to load reflections" – more technical
- **ErrorBoundary:** ✅ "Something went wrong" + "We're sorry for the inconvenience"

**Recommendation:** Align SocialSanctuaryModal and any remaining technical messages with the softer, heart-minded pattern.

---

## Summary Checklist

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Fix ChakraHome route wrapper for timegate journey | ✅ Done |
| P1 | Heart-minded copy: SocialSanctuaryModal, CrystalBowl, RevenueCat, ChakraCard, SoundBath | ✅ Done |
| P2 | EnergyExchange: Implement or clearly gate Review/Write to Us | Medium |
| P2 | Donate: Clarify or disable until processing ready | Small |
| P3 | Accessibility labels for main interactive elements | ✅ Done |
| P3 | Broader error-message consistency | ✅ Done |

---

## Implementation Order

1. **ChakraHome route fix** – ✅ Done. Unblocks lifetime timegate flow.
2. **Heart-minded copy** – ✅ Done. Quick wins, better tone.
3. **EnergyExchange** – Decide implement vs. gate; update UX accordingly.
4. **Donate** – Ensure copy/state matches actual capability.
5. **Accessibility** – ✅ Done. Added labels to ChakraHub (Sanctuary items, chakra balls, Somatic Alignment), ChakraHome (Continue Journey, Gallery, Learn About Chakras), CommitmentGate, RevenueCatPaywall.
