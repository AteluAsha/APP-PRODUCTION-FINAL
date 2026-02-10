# Comprehensive App Audit – February 2026

**Scope:** App1/App2 separation, lifetime user flows, lifetime somatic journey, production readiness.

---

## 1. App1 (Trial) – Clean Separation ✅

### Flow
- WelcomeScreen → DateSelection → ChakraHome (waiting → chakra stack)
- FloatingNavButtons (Leaf, Anua) – trial only
- No PermanentMenuBar
- Paywall after Trial 1 (all 7 on Sunday) or Trial 2 (Sunday)
- IntegratedProgressStack with trial timegates

### Status
- No App2 code in trial path
- `lifetimeChosenTimegateJourney` only affects lifetime users
- Trial users never see ChakraHub, AudioLibrary, PermanentMenuBar
- **Fix applied:** IntegratedProgressStack now passes `inCourseMode={hasLifetimeAccess}` for lifetime somatic journey (ChakraHome) so trial timegates apply correctly

---

## 2. App2 (Lifetime) – New Functions Verified ✅

### ChakraHub
- Full chakra grid (browse mode)
- Course mode: `inCourseMode = courseStartDate && journeyStarted`
- Illumination: current day scaled 1.15
- Opacity: current/completed/participated = 1, future = 0.4, missed = 0.3
- Locked balls: no navigation
- "Access course" / "Return to course" button → DateSelection or ChakraHome

### PermanentMenuBar
- Visible only when `hasLifetimeAccess`
- Hidden on WelcomeScreen, DateSelection, CommitmentGate
- MenuBarMiniPlayer for Music Room audio

### AudioLibrary (Music Room)
- Redirects trial users to ChakraHome
- Inline play/pause, playlist advance, mini player

### Routing Guards
- ChakraHub: trial → ChakraHome
- AudioLibrary: trial → ChakraHome
- ChakraHome route: lifetime (no somatic) → ChakraHub

---

## 3. Lifetime User – UX Flow Check ✅

### Entry (post-paywall)
- WelcomeScreen → ChakraHub (direct)
- AccessGrantedModal **fix:** `onComplete()` now called when user dismisses modal (Go to Hub, Continue Journey, or Close), not immediately after purchase. Prevents modal from disappearing before user sees it.

### ChakraHub → Somatic Journey
- "Select a start date" → DateSelection
- "Access course" → ChakraHome (when date set)
- `setLifetimeChosenTimegateJourney(true)` on button press
- DateSelection confirm: `setCourseStartDate`, `router.replace` ChakraHome, schedule notifications

### ChakraHub Course Mode (grid styling)
- When `inCourseMode`: balls get trial-style illumination + opacity
- "Exit course" via hamburger on ChakraHome → `setLifetimeChosenTimegateJourney(false)`, ChakraHub
- ChakraHub "Return to course" → ChakraHome (somatic flow)

---

## 4. Lifetime Somatic Journey – Systems Check ✅

### Flow
1. ChakraHub → "Access course" (or "Select a start date")
2. DateSelection → confirm date → ChakraHome
3. ChakraHome: WaitingScreen until Monday (or IntegratedProgressStack if started)
4. `shouldAutoStart` **fix:** `canAutoStart = completedTrialCourses === 0 || (hasLifetimeAccess && lifetimeChosenTimegateJourney)` so lifetime users can auto-start on Monday
5. IntegratedProgressStack **fix:** `inCourseMode={hasLifetimeAccess}` so trial timegates apply (not "all days accessible")
6. GoodbyeModal Home → ChakraHub, clears `lifetimeChosenTimegateJourney`

### Timegates
- `inCourseMode` in `isChakraDayAccessible`: lifetime somatic uses trial logic
- ChakraHub `getChakraBallProps`: `isChakraDayAccessible(..., true)` for course mode
- Waiting screen: `shouldShowWaitingScreen` with `lifetimeChosenTimegateJourney` for somatic flow

### Journey Notifications
- Scheduled on DateSelection confirm
- 3, 2, 1 days before at 9:00 AM
- Heart-minded preloaded messages

---

## 5. Fixes Applied This Audit

| Issue | Fix |
|-------|-----|
| IntegratedProgressStack: lifetime somatic showed all days | Added `inCourseMode` prop, pass to `isChakraDayAccessible` |
| AccessGrantedModal disappeared immediately after purchase | Move `onComplete()` to modal dismiss (onGoToHub, onContinueJourney, onClose) |
| Lifetime somatic auto-start blocked by `completedTrialCourses` | `canAutoStart` includes `hasLifetimeAccess && lifetimeChosenTimegateJourney` |

---

## 6. Production Build Status

### Dependencies
- expo-notifications added
- app.config.js: expo-notifications plugin, SCHEDULE_EXACT_ALARM

### Permissions
- Camera, microphone (existing)
- Notifications (requested after date selection)
- No extra usage strings required for notifications

### Lint
- Pre-existing Prettier/style issues (~18k) – run `npm run lint -- --fix` for bulk fix
- No new TypeScript/ESLint errors in modified files

### Build
- iOS: `npx expo run:ios` – CocoaPods install succeeds
- Android: Same config pattern

---

## 7. Remaining Items (Optional)

1. **ChakraStackIndicator / DayProgressIndicator** – If used in lifetime somatic context, consider adding `inCourseMode`. Currently not imported in main flows.
2. **"Continue Journey" in AccessGrantedModal** – Pushes to ChakraHome; with lifetime, ChakraHome redirects to ChakraHub. Both buttons effectively reach ChakraHub. Could change to DateSelection if "start somatic journey" is preferred.
3. **Lint** – Run `npm run lint -- --fix` before release to clean formatting.

---

## 8. Verification Checklist

- [x] Trial flow: WelcomeScreen → DateSelection → ChakraHome (no App2 UI)
- [x] Lifetime flow: WelcomeScreen → ChakraHub
- [x] Paywall → AccessGrantedModal visible, then navigation
- [x] ChakraHub somatic → DateSelection → ChakraHome (waiting/stack)
- [x] ChakraHub course mode: illumination + opacity on balls
- [x] IntegratedProgressStack: trial timegates in somatic journey
- [x] Lifetime auto-start on Monday (somatic)
- [x] Journey notifications scheduled on date confirm
- [x] No trial access to Music Room, ChakraHub
- [x] No lifetime (browse) landing on ChakraHome
