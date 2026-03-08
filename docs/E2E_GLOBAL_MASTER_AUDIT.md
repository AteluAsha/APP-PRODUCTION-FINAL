# E2E Global Master Audit – Pre-Production

**Scope:** All systems, all code, iOS + Android. Final version before production. Minor Android tests on real Pixel to continue before full production builds.

**Quick reference:**
- **Audio:** Local-first; preload from WaitingScreen + ChakraHome (once, guarded); Download all in AudioLibrary (lifetime); same cache and logic iOS/Android.
- **Timegates:** index → ChakraHub / DateSelection / ChakraHome / WelcomeScreen; timegate.ts + ChakraHome; trial/lifetime and somatic journey correct.
- **Fail-safes:** ErrorBoundary (root), BackHandler (Android), deep links, RevenueCat, scholarship expiry; dev-only code gated.
- **Missing UX (optional):** Delete note UI, Wi‑Fi-only for download all, preload progress, clear cache, offline banner; accessibility pass.
- **Rating:** 88/100. Master code for production; continue minor Android Pixel testing.

---

## 1. Audio Playback (Global)

### Architecture

- **Local-first (locked):** [src/utils/audioDownload.ts](src/utils/audioDownload.ts), [src/utils/crystalBowlPlayback.ts](src/utils/crystalBowlPlayback.ts). Once a file is on device (`getLocalAudioUri` / `localUri`), playback uses it only. Never stream from URL when local exists. Prevents cutoff under high traffic or network drop.
- **Cache dir:** `FileSystem.cacheDirectory/audio/`. Same on iOS and Android. Full-file and head (~3 min) cache; long files use resumable download.
- **Playback ownership:** [components/audio/MusicRoomAudioManager.tsx](components/audio/MusicRoomAudioManager.tsx), [components/audio/OtherOriginAudioManager.tsx](components/audio/OtherOriginAudioManager.tsx). When `pathname?.includes("AudioPlayer")`, managers do not own the track (AudioPlayer does). No double-play. Trial never sets `audioOrigin === "music-room"`; AudioLibrary redirects trial to ChakraHome.

### Preload triggers (iOS + Android)

- **Guard:** [src/utils/audioPreloadGuard.ts](src/utils/audioPreloadGuard.ts) – `getAudioPreloadStarted()` / `setAudioPreloadStarted()`. Ensures full head+full preload runs only once per user (persisted in AsyncStorage).
- **WaitingScreen:** On mount, if guard not set → `setAudioPreloadStarted()` then `preloadAllAudioHeads(storage)` then `preloadAllAudioFullFiles(storage)`. One-time when user is on waiting room.
- **ChakraHome:** Same guard; when `!showWaitingScreen` or `journeyStarted` and guard not set, runs same head then full preload. Covers users who land on ChakraHome without having been on WaitingScreen (e.g. returning trial, or lifetime in somatic journey).
- **Manifest:** [src/utils/audioPreloadManifest.ts](src/utils/audioPreloadManifest.ts) – Crystal Bowl ×7, Tuning Fork ×7, Embodiment ×8. Rate limiting and one-at-a-time to avoid Firebase throttling. No platform-specific logic; same flow on iOS and Android.

### Download buttons

- **AudioLibrary (lifetime only):** [app/(chakras)/AudioLibrary.tsx](app/(chakras)/AudioLibrary.tsx). Per-track `handleDownload` and **Download all** `handleDownloadAll`. Uses `downloadAndCacheAudio` for normal files and `downloadAndCacheAudioResumable` for crystal bowl. Same on iOS and Android. Trial users never see AudioLibrary (redirect to ChakraHome).
- **No separate “Download all” on WaitingScreen:** Preload runs automatically (heads then full) when user is on waiting room or ChakraHome and guard not set. No extra button required; UX is “preparing course materials” in background.

### Caches and playback path

- **Hooks:** useCrystalBowlAudio, useTuningForkAudio, useEmbodimentAudio, useAncestralWisdomAudio – all check local first, then Firebase URL. [constants/firebaseStoragePaths.ts](constants/firebaseStoragePaths.ts) is single source of truth for folder names.
- **crystalBowlPlayback:** `prepareLongAudioForPlay` – full → head (with min size) → download head and play → optional background full download. `prepareCrystalBowlForPlay` wraps it. Master Embodiment / Head to Heart use `requireFullDownload: true` so head path is never used (avoids truncated playback).
- **AudioPlayer:** [app/AudioPlayer.tsx](app/AudioPlayer.tsx). X button always navigates back (router.back()); entry points use `router.push` so stack is preserved. Unload on close; managers do not play while on AudioPlayer.

**Verdict:** Audio playback, caches, download buttons, and preload triggers are correct globally. iOS and Android use the same logic and cache dir. No platform-specific audio bugs identified.

---

## 2. Timegates

### Entry (index)

- [app/(chakras)/index.tsx](app/(chakras)/index.tsx): After store rehydration and root navigator ready – lifetime → ChakraHub; trial with `completedTrialCourses === 1` → DateSelection; trial with `courseStartDate` → ChakraHome; else → WelcomeScreen. No ghosts; single routing logic.

### Timegate service

- [src/services/timegate.ts](src/services/timegate.ts): `isDevelopmentOverrideActive()` (__DEV__), `shouldBypassTimegate(hasLifetimeAccess)`, `isChakraDayAccessible`, `shouldShowWaitingScreen`. Trial: progressive reveal (current day + participated). Lifetime: all days unless `inCourseMode` (somatic journey). `shouldShowWaitingScreen` includes lifetime somatic journey (lock until Monday). Clear and used consistently.

### ChakraHome

- Waiting screen vs main home: `shouldShowWaitingScreenCheck` from timegate; `shouldShowCommitmentGate` (paywall) – never for lifetime; trial 1 complete (Sunday + all 7) or trial 2 ended. Sequence cards (SimpleGraceTransition, Seal, etc.) trial-only; `hasLifetimeAccess` check in `shouldShowCommitmentGate` is mandatory and must not be removed.

**Verdict:** Timegates are correct and fail-safed. No bypass in production for trial.

---

## 3. UX Pathways (Global)

### Opening

- Splash (SplashScreenReveal) → Path selection (WelcomeScreen) or direct (index) → DateSelection | WaitingScreen | ChakraHome | ChakraHub.

### Trial (APP_1)

- WelcomeScreen → DateSelection → (Begin) → ChakraHome (waiting or main). WaitingScreen: preload runs once; notifications optional; invite; Learn About Chakras → Chakras101. ChakraHome: WaitingScreen | IntegratedProgressStack | CommitmentGate (paywall). Paywall: annual (RevenueCat) or scholarship → Energy Exchange or AccessGranted → ChakraHub. Trial 1 complete (Sunday, all 7) → “Continue to trial 2” → DateSelection. Trial 2 end → Paywall only path.

### Lifetime (APP_2)

- index → ChakraHub. Course mode (somatic journey): ChakraHub → DateSelection → ChakraHome (waiting until Monday) → same timegate as trial for that journey. Menu bar: Notes, Anua, Tribe, Gallery, etc. AudioLibrary (Music Room), Download all. No paywall.

### Invite and date sync

- Invite link includes `ref` and `start=YYYY-MM-DD`. Deep link stores ref + start; InviteRefApplier applies ref then pending start date (setCourseStartDate, startJourney). Both phones sync to same journey week when invitee opens link.

### Navigation

- Back: ActionBar default `router.back()`. Android: root BackHandler in _layout (router.back() when canGoBack()). Notes sheet: BackHandler in FloatingNavButtons when notes open. AudioPlayer: X → router.back(). No orphan routes; all Stack.Screen names match files.

**Verdict:** All UX pathways are consistent and correctly gated. No missing critical paths.

---

## 4. Fail-safes and Standards

### Error handling

- **ErrorBoundary:** Root layout wraps app in [components/ErrorBoundary.tsx](components/ErrorBoundary.tsx). Catches React errors, reports to Sentry, shows “Something went wrong” + Try Again. AnuaChatModal and CaptureAll use ErrorBoundary for sub-trees. No white screen of death.

### Back / exit

- **Android Back:** _layout: BackHandler → router.back() when canGoBack(); else return false (system handles exit). FloatingNavButtons: when notes sheet open, Back dismisses sheet. AnuaChat: Back closes chat. No trap on CoursePreview or other screens.

### Deep links

- `/invite?ref=...&start=YYYY-MM-DD` – store ref and start (start validated YYYY-MM-DD). `/payment-success?session_id=...` – Stripe verify + grantLifetimeAccess. Errors caught; no throw to user.

### RevenueCat

- Init in _layout after getUserId(); no early return in production. Graceful when API key missing. Sync entitlement to journey store on init and after purchase/restore. Restore message platform-aware (Google account / Apple ID).

### Scholarship

- Grant is client-side; Firestore audit log (scholarship_requests) and user doc (isScholarshipUser, scholarshipExpiryDate). Expiry checked every 5 min in _layout; access revoked so user sees paywall again.

### Store rehydration

- useStoreRehydration and journey store persist. Index waits for rehydration before routing. Prevents wrong initial route.

**Verdict:** Fail-safes and standards are in place. App store–relevant behavior (back, deep links, errors) is handled.

---

## 5. App Store Common Bugs (iOS + Android)

- **Back button:** Handled globally (Android) and per-screen where needed. No “stuck” screens identified.
- **Deep links:** Handled; invite and payment-success. No crash on bad URL.
- **Permissions:** Notifications requested with pre-prompt (CommunicationReminderModal); channelId set for Android scheduled notifications.
- **Modals:** CommitmentGate, ScholarshipModal, AccessGrantedModal, etc. use explicit background (no white box on Android). GoodbyeModal design locked per .cursorrules.
- **Keyboard:** KeyboardAvoidingView used on forms (ScholarshipModal, Notes, etc.); behavior differs iOS vs Android where needed.
- **Safe area:** SafeAreaView / insets used on main screens and modals.
- **Dev-only UI:** TrialTestFlow, DevPaywall, CaptureAll (web + EXPO_PUBLIC_CAPTURE_SCREENS) gated by __DEV__ or env. Production builds do not show dev buttons.

**Verdict:** No app store–blocking bugs identified. Android-specific items (back, modal background, notifications channel) are addressed.

---

## 6. Ghosts and Orphans

- **TrialTestFlow:** Rendered only when `__DEV__` in WaitingScreen, ChakraHome, ChakraHub. Not in production.
- **CaptureAll:** Rendered only when Platform.OS === "web" && __DEV__ && EXPO_PUBLIC_CAPTURE_SCREENS === "1". Not in native production.
- **DevPaywall / DevGallery:** Dev-only routes; not linked from production UI.
- **RevenueCatPaywall component:** Not used in main flow; CommitmentGate is the paywall. RevenueCatPaywall referenced in dev/docs; no removal required.
- **Comment in _layout:** “TribeChatModal not in codebase” – accurate; no dead import.
- **Stripe deep link:** Used for payment-success; verifyPayment and grantLifetimeAccess. No orphan code found that would run incorrectly in production.

**Verdict:** No harmful ghosts. Dev-only code is properly gated.

---

## 7. Missing UX Functions (List)

- **Delete note:** Journey notes store has `deleteNote(id)` but no UI exposes it. Optional enhancement: per-note delete or “Clear all” with confirmation.
- **Wi‑Fi only for download all:** AudioLibrary “Download all” does not check Wi‑Fi; optional preference “Download over Wi‑Fi only” not implemented (documented in archive plan).
- **Preload progress in UI:** WaitingScreen/ChakraHome run preload in background with no progress bar. Optional: “Preparing your course materials…” with optional progress.
- **Clear audio cache:** No in-app “Clear cache” for audio. User can clear app storage in OS settings. Optional: Settings → Clear audio cache.
- **Offline indicator:** No global “you’re offline” banner. Invite and payment deep links require network; playback prefers local once cached.
- **Accessibility:** Labels and hints present on key actions; full VoiceOver/TalkBack audit not in scope of this doc. Recommend a dedicated pass.

These are enhancements or polish, not blockers for production.

---

## 8. Potential Bugs / Issues (Code Audit)

- **ChakraHome preload effect deps:** Effect runs when `showWaitingScreen`, `journeyStarted`, or `hasLifetimeAccess` change. If WaitingScreen already set the guard, ChakraHome’s effect will no-op (alreadyStarted). Safe.
- **InviteRefApplier:** Uses store getState() after async; correct. Applies pending start date only when no existing courseStartDate; avoids overwriting.
- **AudioPlayer close:** Multiple code paths (X, back, completion) call closePlayerAndNavigate or equivalent; ensure single unload. Code uses reset() and unload; no double-free observed.
- **FloatingNavButtons BackHandler:** Depends on `isNotesSheetOpen` (sheet index >= 0). If sheet state and ref get out of sync, Back might not dismiss. Low likelihood; acceptable for current design.
- **timegate __DEV__:** In __DEV__, all timegates bypassed. Production builds (release) have __DEV__ false; no accidental bypass in prod.

No critical or high-severity bugs identified. Minor items above are acceptable for production with continued testing.

---

## 9. Final Rating and Rationale

### Overall score: **88 / 100**

**Breakdown:**

- **Audio (global, iOS + Android):** 95. Local-first, preload triggers, download all, cache and playback path correct. Same behavior on both platforms. Small gap: no Wi‑Fi-only option for download all (optional).
- **Timegates and pathways:** 92. Clear index routing, timegate service, trial/lifetime/invite flows. No pathway holes.
- **Fail-safes and app store:** 90. ErrorBoundary, Back handling, deep links, RevenueCat, scholarship expiry. Dev-only code gated. Minor: no global offline banner.
- **Code quality and ghosts:** 88. No harmful ghosts; dev tools gated. Some optional UX (delete note, clear cache) missing; not blockers.
- **UX completeness:** 85. Core flows complete; list of missing UX items (Section 7) is small and optional. Accessibility could be deepened.

**Why not higher:** Optional polish (Wi‑Fi-only, preload progress, delete note, clear cache, offline indicator) and the fact that Android real-device testing (Pixel) is still ongoing. No critical or high bugs; safe to treat as master code for production with continued minor Android testing.

**Why not lower:** Architecture is sound, audio is bulletproof, timegates and paywall/scholarship are correct, and fail-safes cover back, errors, and deep links. Codebase is production-ready with the noted follow-ups.

---

## 10. Master Code Status

This codebase is designated the **current MASTER CODE** for production (iOS and Android) as of this audit.

- **iOS:** Ready for production build and submission after standard QA.
- **Android:** Ready for production build; **minor tests on real Pixel to continue for a few days** before full production rollout. No known blocking issues; audit confirms preload, download, playback, and navigation are correct on both platforms.

After any further changes, re-run critical paths (opening sequence, timegates, paywall, scholarship, invite date sync, audio playback and download all) and update this doc if needed.
