# Date Selection & Waiting Room Verification

**Date:** February 2026  
**Scope:** Audit of date selection lock and waiting room logic per Healing Course UX plan.

---

## DateSelection.tsx

| Check | Status | Notes |
|-------|--------|-------|
| Back (trial) → WelcomeScreen | OK | `handleBack` uses `router.replace("/(chakras)/WelcomeScreen")` when `!hasLifetimeAccess` |
| Back (lifetime) → ChakraHub | OK | `handleBack` uses `router.replace("/(chakras)/ChakraHub")` when `hasLifetimeAccess` |
| Date lock messaging | OK | ScrollDatePicker limits to Mondays; DateConfirmationModal shows selected date |
| Confirm sets courseStartDate | OK | `handleConfirmDate` calls `setCourseStartDate(selectedDateISO)` |
| Begin Your Journey → ChakraHome | OK | `handleBeginJourney` calls `router.replace("/(chakras)/ChakraHome")` |
| lifetimeChosenTimegateJourney cleared on back | OK | `handleBack` calls `setLifetimeChosenTimegateJourney(false)` |

---

## WaitingScreen.tsx

| Check | Status | Notes |
|-------|--------|-------|
| Countdown to course start | OK | Uses `getTimeRemaining`, `formatCountdown`; updates every second |
| Preview button | OK | `onPreviewPress` prop; renders when provided |
| Chakras 101 button | OK | `onLearnAboutChakrasPress` prop; renders when provided |
| Build Your Tribe | OK | Invite friend modal; `addInvitedFriend` from store |
| Gallery button | OK | `onGalleryPress` when `hasUnlockedCards`; ChakraHome passes when `hasEverCompletedChakra` |
| Begin Again (Trial 2) | OK | `onBeginAgainPress` when `completedTrialCourses === 1` (now any day) |

---

## timegate.ts

| Check | Status | Notes |
|-------|--------|-------|
| shouldShowTrialWaitingScreen | OK | Returns `!hasReachedStartDate || !isMonday || !journeyStarted` |
| shouldShowWaitingScreen | OK | Routes: lifetime+somatic → trial logic; lifetime → false; trial → trial logic |
| Dev override | OK | `isDevelopmentOverrideActive()` bypasses timegates for testing |
| isChakraDayAccessible | OK | Trial: progressive reveal; Lifetime: all accessible; Course mode: trial logic |

---

## Edge Cases

- **userChoseTrial2:** When user taps "Continue to Trial 2" on paywall, `userChoseTrial2` suppresses paywall until Trial 2 ends. Verified in ChakraHome `shouldShowCommitmentGate`.
- **Begin Again any day:** No longer restricted to Monday; available any day when `completedTrialCourses === 1`.

---

## Conclusion

No gaps or logic errors found. Date selection and waiting room flows are consistent with the intended somatic healing course design.
