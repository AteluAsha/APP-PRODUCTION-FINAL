# Comprehensive End-to-End Verification: APP1 & APP2

**Date**: January 30, 2025  
**Scope**: Verify APP1 (Trial) and APP2 (Lifetime) operate correctly and independently with shared codebase.

---

## 1. Architecture Summary

| Aspect | APP1 (Trial) | APP2 (Lifetime) |
|--------|--------------|-----------------|
| **Entry** | WelcomeScreen → DateSelection → ChakraHome | ChakraHub (post-paywall) |
| **Home** | ChakraHome (progressive reveal) | ChakraHub (all chakras) |
| **Navigation** | FloatingNavButtons (leaf + Anua) | PermanentMenuBar |
| **Timegate** | Progressive (day-by-day) | Bypassed |
| **Waiting Room** | Shown before first Monday | Never |
| **Paywall** | CommitmentGate after 2 trials | Never |

---

## 2. Routing Guards (APP1 ↔ APP2 Separation)

| File | Guard | Status |
|------|-------|--------|
| `app/(chakras)/ChakraHome.tsx` | Lifetime → redirect to ChakraHub | ✅ |
| `app/(chakras)/ChakraHub.tsx` | Trial → redirect to ChakraHome | ✅ |
| `app/(chakras)/[chakra].tsx` | Invalid chakra → home by mode | ✅ Fixed |
| `app/(chakras)/SoundBath.tsx` | Invalid chakra → home by mode | ✅ Fixed |
| `app/(chakras)/EnergyExchange.tsx` | Back handlers → ChakraHub or ChakraHome | ✅ Fixed |

---

## 3. Navigation Flows

### APP1 (Trial)

| Flow | Path | Verified |
|------|------|----------|
| Onboarding | index → WelcomeScreen → DateSelection → ChakraHome | ✅ |
| Waiting Room | ChakraHome shows WaitingScreen when pre-Monday / not started | ✅ |
| Journey Start | Monday + course start date → IntegratedProgressStack | ✅ |
| Chakra Detail | Tap chakra → `/(chakras)/[chakra]` | ✅ |
| Chakras 101 | Global home button or Learn About Chakras | ✅ |
| Gallery | Goodbye modal, CommitmentGate (if unlocked) | ✅ |
| Notes | Floating leaf button → JourneyNotesView sheet | ✅ |
| Anua | Floating Anua → Sanctuary → Talk to Anua → Chat | ✅ |
| Anua (Waiting Room) | Anua icon → Chat directly | ✅ |
| Paywall | CommitmentGate after Trial 2 Sunday | ✅ |

### APP2 (Lifetime)

| Flow | Path | Verified |
|------|------|----------|
| Home | ChakraHub (all 7 chakras visible) | ✅ |
| Chakra Detail | Tap chakra → `/(chakras)/[chakra]` | ✅ |
| Notes | Menu bar → JourneyNotesView sheet | ✅ |
| Anua | Menu bar → Sanctuary → Talk to Anua → Chat | ✅ |
| Gallery | Menu bar or Goodbye modal | ✅ |
| Back from invalid routes | ChakraHub (not ChakraHome) | ✅ Fixed |

---

## 4. Anua Flow (Post-Implementation)

| Location | Behavior | Verified |
|----------|----------|----------|
| **Waiting Room** | Anua icon → Chat directly (`open({ isWaitingRoom: true })`) | ✅ |
| **Everywhere else (APP1)** | Floating Anua → Sanctuary → Talk to Anua → Chat | ✅ |
| **APP2** | Menu Anua → Sanctuary → Talk to Anua → Chat | ✅ |
| **Sanctuary "Talk to Anua"** | Parent dismisses notes, closes sanctuary, 200ms delay, opens chat | ✅ |

---

## 5. Timegate Service

| Function | APP1 | APP2 | Verified |
|----------|------|------|----------|
| `shouldBypassTimegate` | false | true | ✅ |
| `shouldShowWaitingScreen` | Trial logic | false | ✅ |
| `isChakraDayAccessible` | Progressive | true | ✅ |
| `__DEV__` override | Bypasses for testing | Bypasses | ✅ |

---

## 6. Fixes Applied This Session

1. **EnergyExchange**: Back/Review/WriteToUs/Skip now route to ChakraHub when `hasLifetimeAccess`, ChakraHome otherwise. Added `onBackPress` to ActionBar.
2. **[chakra].tsx**: Invalid chakra redirects to ChakraHub (APP2) or ChakraHome (APP1).
3. **SoundBath.tsx**: Invalid chakra redirects to ChakraHub (APP2) or ChakraHome (APP1).
4. **ActionBar**: Added optional `onBackPress` prop for custom back behavior.

---

## 7. Shared Components – Mode Awareness

| Component | APP1 Behavior | APP2 Behavior | Notes |
|-----------|---------------|---------------|-------|
| GlobalHomeButton | ChakraHome | ChakraHub | ✅ |
| GoodbyeModal | Home → ChakraHome, Gallery → GalleryOfGnosis | Home → ChakraHub | ✅ |
| CommitmentGate AccessGranted | onGoToHub → ChakraHub, onContinueJourney → ChakraHome | Same (both valid post-paywall) | ✅ |
| SocialSanctuaryModal | isLimitedMode on Chakras101 | isLimitedMode=false | ✅ |
| IntegratedProgressStack | Trial timegate | Receives hasLifetimeAccess for timegate | ✅ |
| ChakraTemplate | Used by both | Used by both | ✅ |

---

## 8. Potential Edge Cases to Test Manually

1. **Trial → Purchase**: Complete CommitmentGate purchase → verify redirect to ChakraHub.
2. **Trial → Scholarship**: Scholarship flow → AccessGranted → ChakraHub.
3. **Direct URL / deep link** to `/(chakras)/EnergyExchange` with lifetime → Back goes to ChakraHub.
4. **Notes "Send thought to Anua"** from both APP1 and APP2 → opens chat with initial message.
5. **Gallery** from Goodbye (APP1) and menu (APP2) → cards centered, titles with "Chakra" suffix.

---

## 9. TypeScript & Lint

- `npx tsc --noEmit`: ✅ Passes
- No new linter errors introduced

---

## Summary

APP1 and APP2 are correctly separated by `hasLifetimeAccess`. Routing guards, back navigation, invalid-route redirects, and Anua flows respect app mode. All fixes applied preserve the shared codebase while ensuring each app behaves independently.
