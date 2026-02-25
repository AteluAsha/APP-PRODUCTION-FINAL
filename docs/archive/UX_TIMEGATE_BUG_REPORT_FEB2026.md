# UX, Timegate & Course Mode Bug Report – February 2026

**Scope:** UX vs timegates, App 1 trials 1 & 2, post-paywall flows, course mode (lifetime somatic journey) toggle, production risks.

**Status:** Fixes applied Feb 2026. See implementation summary below.

---

## 1. UX vs Timegates – Summary

### Timegate Service (`src/services/timegate.ts`)

- **`isChakraDayAccessible`** – Correctly routes by `hasLifetimeAccess` and `inCourseMode`:
  - Dev: all days accessible
  - Lifetime + `inCourseMode`: trial-style (current day + participated)
  - Lifetime: all days accessible
  - Trial: trial logic (current day + participated)
- **`shouldShowWaitingScreen`** – Correctly routes by `lifetimeChosenTimegateJourney`:
  - Lifetime + somatic journey: trial waiting logic (until Monday)
  - Lifetime normal: never show
  - Trial: trial waiting logic

### ChakraHome

- Passes `inCourseMode={hasLifetimeAccess}` to `IntegratedProgressStack` when lifetime user is in somatic journey – correct.
- Redirects lifetime users to ChakraHub when `!lifetimeChosenTimegateJourney` – correct.
- Trial timegate logic (day-by-day unlock) applies only when `!hasLifetimeAccess` or when `lifetimeChosenTimegateJourney` – correct.

### IntegratedProgressStack

- Uses `isChakraDayAccessible` with `inCourseMode` – correct.
- Trial users: `inCourseMode=false`, trial timegates apply.
- Lifetime somatic journey: `inCourseMode=true`, trial timegates apply.

---

## 2. App 1 Trials 1 & 2 UX Pathways

### Trial 1

- WelcomeScreen → DateSelection → ChakraHome (waiting until Monday)
- Monday: auto-start (`canAutoStart` when `completedTrialCourses === 0`)
- Day-by-day unlock via `isTrialChakraAccessible`
- Sunday + all 7 completed → CommitmentGate (paywall)
- Sunday + not all completed → reset on next Monday, Trial 2 available

### Trial 2

- After Trial 1: waiting screen with "Begin Again" (only on Monday)
- User taps "Begin Again" → `startJourney(currentWeekStartDate)`
- Day-by-day unlock same as Trial 1
- Sunday (regardless of completion) → CommitmentGate
- "Trial 2 of 2" label shown when `completedTrialCourses === 1 && journeyStarted`

### Verified

- `completedTrialCourses` only increments when `!hasLifetimeAccess`
- Paywall (`shouldShowCommitmentGate`) only when `!hasLifetimeAccess`
- "Trial 1 of 2" / "Trial 2 of 2" only when `!hasLifetimeAccess`
- "Continue Your Journey" (post-trial paywall CTA) only when `completedTrialCourses === 2 && !hasLifetimeAccess`

---

## 3. Post-Paywall – Trial Crossover Check

### After `grantLifetimeAccess`

- `hasLifetimeAccess = true`
- `completedTrialCourses` remains (e.g. 2) – used for accountability, not for gating
- ChakraHome redirects to ChakraHub when `hasLifetimeAccess && !lifetimeChosenTimegateJourney`
- CommitmentGate `onComplete` → `setShowPaymentGate(false)` → ChakraHome re-renders → redirect to ChakraHub

### Verified

- Post-paywall users do not see trial 1/2 UI; they are routed to ChakraHub.
- Trial-specific UI (`completedTrialCourses`, "Trial 1 of 2", etc.) is behind `!hasLifetimeAccess`.
- AccessGrantedModal "Go to Hub" and "Continue Journey" both end at ChakraHub (Continue Journey briefly shows ChakraHome, then redirects).

---

## 4. Course Mode (Lifetime Somatic Journey) – Issues

### 4.1 BUG: ChakraHub `inCourseMode` After Exiting Course Mode

**Location:** `app/(chakras)/ChakraHub.tsx` line 109

```ts
const inCourseMode = Boolean(courseStartDate && journeyStarted)
```

**Issue:** When a lifetime user exits course mode (hamburger or "Exit course mode"), they land on ChakraHub with `courseStartDate` and `journeyStarted` still set. So `inCourseMode` stays `true`, and chakra balls use trial-style timegates (current day + participated) instead of all unlocked.

**Expected:** After exiting course mode, ChakraHub should show full App 2 (all balls unlocked).

**Fix:** Use `lifetimeChosenTimegateJourney` so that when the user is on ChakraHub, course mode is off:

```ts
const lifetimeChosenTimegateJourney = useChakraJourneyStore(
  (s) => s.lifetimeChosenTimegateJourney,
)
const inCourseMode = Boolean(
  courseStartDate && journeyStarted && lifetimeChosenTimegateJourney,
)
```

When on ChakraHub, `lifetimeChosenTimegateJourney` is always `false` (they either never chose it or exited), so `inCourseMode` will be `false` and all balls will be unlocked.

---

### 4.2 BUG: DateSelection Back Button for Lifetime Users

**Location:** `app/(chakras)/DateSelection.tsx` lines 75–79

```ts
const handleBack = useCallback(() => {
  addHapticFeedback(HapticStrength.Light)
  useChakraJourneyStore.getState().setLifetimeChosenTimegateJourney(false)
  router.replace("/(chakras)/WelcomeScreen")
}, [router])
```

**Issue:** For lifetime users coming from ChakraHub (ChakraHub → DateSelection), back goes to WelcomeScreen instead of ChakraHub.

**Expected:** Lifetime users should return to ChakraHub.

**Fix:** Route by `hasLifetimeAccess`:

```ts
const handleBack = useCallback(() => {
  addHapticFeedback(HapticStrength.Light)
  useChakraJourneyStore.getState().setLifetimeChosenTimegateJourney(false)
  if (hasLifetimeAccess) {
    router.replace("/(chakras)/ChakraHub")
  } else {
    router.replace("/(chakras)/WelcomeScreen")
  }
}, [router, hasLifetimeAccess])
```

---

### 4.3 BUG: DateSelection & DateConfirmationModal Trial Language for Lifetime Users

**Location:**

- `app/(chakras)/DateSelection.tsx` lines 253–264 (Trials Info)
- `app/(chakras)/DateSelection.tsx` line 395 (offeringNumber)
- `components/chakras/DateConfirmationModal.tsx` lines 94–95, 135

**Issue:** When a lifetime user chooses a somatic journey start date (ChakraHub → DateSelection), they see:

1. "Two complete 7-day journeys await you" / "One more complete 7-day journey awaits you" (Trials Info)
2. "Two free trials of the course, as a gift. Use them wisely." (DateConfirmationModal)
3. "Confirm 1st offering" / "Confirm 2nd offering" (DateConfirmationModal button)

**Expected:** Course mode should use course/journey language, not trial language.

**Fix:**

- Hide Trials Info when `hasLifetimeAccess`.
- For lifetime users, pass different copy to DateConfirmationModal (e.g. "Confirm your journey start date" instead of trial/offering language).
- Optionally add a `isCourseMode` prop to DateConfirmationModal to switch copy.

---

## 5. Potential Bugs & UX Considerations

### 5.1 GoodbyeModal "Return Home" for Lifetime in Somatic Journey

**Location:** `components/chakras/GoodbyeModal.tsx` lines 124–128

When a lifetime user completes a chakra during somatic journey, "Return home" clears `lifetimeChosenTimegateJourney` and navigates to ChakraHub.

**Consideration:** Some users might expect to return to ChakraHome (somatic journey) to continue the day-by-day flow. Current behavior exits course mode. This may be intentional (hub as home for lifetime users) but is worth validating.

---

### 5.2 Index Route Flash for Lifetime Users

**Location:** `app/(chakras)/index.tsx`

For lifetime users, index renders ChakraHome, which then redirects to ChakraHub. There can be a brief ChakraHome flash before redirect. Low impact but noticeable on slower devices.

---

### 5.3 AccessGrantedModal "Continue Journey"

**Location:** `components/chakras/CommitmentGate.tsx` lines 537–540

"Continue Journey" navigates to ChakraHome. Because ChakraHome redirects lifetime users to ChakraHub, both "Go to Hub" and "Continue Journey" end at ChakraHub. "Continue Journey" may cause a short ChakraHome flash. Consider routing "Continue Journey" directly to ChakraHub for consistency.

---

## 6. Production Risks & App Store Concerns

### 6.1 Scholarship Expiry

- `checkScholarshipExpiry` runs in `onRehydrateStorage` and can revoke access.
- Ensure users see clear messaging before expiry and a path to renew or re-apply.

### 6.2 Trial vs Course Terminology

- WaitingScreen uses "Exit course mode" for lifetime – correct.
- DateConfirmationModal and DateSelection still use trial/offering language for lifetime users – can confuse and should be fixed (see 4.3).

### 6.3 RevenueCat / Payment Sync

- `grantLifetimeAccess` is called from `_layout.tsx` when RevenueCat reports paid.
- CommitmentGate also calls `grantLifetimeAccess("scholarship")` for scholarship.
- Ensure no double-grant or race conditions if both paths can fire.

### 6.4 Session-Only State

- `lifetimeChosenTimegateJourney` is not persisted. After app restart during somatic journey, user returns to ChakraHub. This is documented but may surprise users who expect to resume course mode.

### 6.5 Dev-Only Code

- `TrialTestFlow`, `devOpenPaywall`, `DevGallery` – confirm these are excluded or disabled in production builds.

---

## 7. Summary of Confirmed Bugs

| #   | Bug                                                                        | Location                                     | Severity |
| --- | -------------------------------------------------------------------------- | -------------------------------------------- | -------- |
| 1   | ChakraHub shows trial-style balls after exiting course mode                | ChakraHub.tsx:109                            | High     |
| 2   | DateSelection back sends lifetime users to WelcomeScreen                   | DateSelection.tsx:78                         | Medium   |
| 3   | DateSelection/DateConfirmationModal show trial language for lifetime users | DateSelection.tsx, DateConfirmationModal.tsx | Medium   |

---

## 8. Fixes Applied (Feb 2026)

1. **ChakraHub `inCourseMode`** – Added `lifetimeChosenTimegateJourney` so exiting course mode shows all balls unlocked.
2. **DateSelection back** – Lifetime users now route to ChakraHub.
3. **DateSelection/DateConfirmationModal** – Course-mode copy for lifetime users (hide Trials Info, `isCourseMode` prop, "Confirm start date" button).
4. **Post-trial gate** – Index redirects to DateSelection when `completedTrialCourses === 2`; `shouldShowCommitmentGate` true for trial 2 regardless of day; Begin from DateSelection goes to ChakraHome (shows paywall).
5. **GoodbyeModal + ChakraTemplate** – Lifetime in course mode: ChakraTemplate replaces to ChakraHome; GoodbyeModal `navigateToHubOnHome={false}` so Home stays on ChakraHome.
6. **GlobalHomeButton** – Shown on ChakraHome for lifetime (course mode); chakra icon navigates to ChakraHub.
