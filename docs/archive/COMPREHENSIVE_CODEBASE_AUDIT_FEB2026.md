# Comprehensive Codebase Audit – 7chakras7days_app

**Date:** February 19, 2026  
**Scope:** Critical flows, error handling, state management, API integrations, performance, security, edge cases, third-party dependencies

---

## Executive Summary

The Soul School app (7chakras7days_app) is a React Native/Expo chakra meditation journey with a two-app architecture: Trial (App1) and Lifetime (App2). The codebase is well-structured with clear separation of concerns, documented flows, and robust error handling in many areas. Several pre-production blockers exist, notably **RevenueCat disabled in dev** and **no user-facing purchase error handling** in CommitmentGate.

**Overall App Store Readiness:** **72/100**

---

## 1. Critical Flows

### 1.1 Onboarding Flow

| Component                   | Location                                                                 | Confidence |
| --------------------------- | ------------------------------------------------------------------------ | ---------- |
| Path selection (Enter Path) | `PathSelectionGate.tsx`, `app/(chakras)/index.tsx`                       | **High**   |
| Welcome screen              | `WelcomeScreen.tsx`, `ChakraHome.tsx` (WelcomeModal)                     | **High**   |
| Date selection              | `DateSelection.tsx`, `ScrollDatePicker.tsx`, `DateConfirmationModal.tsx` | **High**   |
| Hero onboarding             | `hasCompletedHeroOnboarding` in `useChakraJourneyStore`                  | **High**   |
| First launch                | `useFirstLaunchStore.ts`, `useStoreRehydration.ts`                       | **High**   |

**Strengths:**

- `PathSelectionGate` ensures Enter Path is never blocked (`PathSelectionGate.tsx:7`)
- Index NEVER bypasses WelcomeScreen; no flag (hasCompletedHeroOnboarding, courseStartDate, etc.) skips path selection
- Rehydration guards prevent showing wrong screen before store loads (`useStoreRehydration.ts`, `index.tsx:53-54`)
- 2.5s safety timeout prevents indefinite blocking (`useStoreRehydration.ts:9`)

**Concerns:**

- `index.tsx:53-54`: Blank black view during rehydration may feel like a hang
- `DateSelection.tsx:134-140`: `handleBeginJourney` does not call `startJourney()` – only `setHasCompletedHeroOnboarding` and `setFirstLaunchComplete`. The journey starts on ChakraHome when Monday arrives. Verify this flow matches intent.

### 1.2 Trial 1 & Trial 2

| Component      | Location                                                   | Confidence |
| -------------- | ---------------------------------------------------------- | ---------- |
| Trial 1 start  | `ChakraHome.tsx`, `timegate.ts`, `useChakraWeekTransition` | **High**   |
| Trial 2 start  | `resetJourney()` in `useChakraJourneyStore`                | **Medium** |
| Trial reset    | `useChakraWeekTransition.ts`, `resetJourney()`             | **High**   |
| Between trials | `WaitingScreen.tsx`, "Begin Again"                         | **Medium** |

**Strengths:**

- `resetJourney()` correctly preserves `trialHistory`, `completedTrialCourses` (`useChakraJourneyStore.ts:330-398`)
- `hasEverCompletedChakra()` uses `trialHistory` for gallery persistence
- `useChakraWeekTransition` handles week rollover and resets

**Concerns:**

- `COMPLETE_TIMEGATE_FLOW_TEST.md` says Trial 2 does NOT auto-start; user must press "Begin Again" on Monday. Verify `useChakraWeekTransition` does not auto-start Trial 2 when `completedTrialCourses === 1`.
- `ChakraHome.tsx:203-215`: `shouldShowCommitmentGate` logic – `isSecondTrialEnded` when `currentTrialNumber === 2`; ensure `currentTrialNumber` is correctly derived from `trialHistory.length + 1`.

### 1.3 Paywall

| Component         | Location                                            | Confidence |
| ----------------- | --------------------------------------------------- | ---------- |
| CommitmentGate    | `CommitmentGate.tsx`                                | **Medium** |
| RevenueCat        | `useRevenueCat.ts`, `src/services/revenuecat.ts`    | **Low**    |
| Purchase flow     | `CommitmentGate.tsx:73-98`, `RevenueCatPaywall.tsx` | **Medium** |
| Restore purchases | `useRevenueCat.ts:150-174`                          | **Medium** |

**Strengths:**

- `CommitmentGate` shows annual vs scholarship options
- `useRevenueCat` calls `grantLifetimeAccess("paid")` on successful purchase
- `revenuecat.ts` syncs entitlement to store on init (lines 194-204)

**Critical concerns:**

- **RevenueCat disabled in dev** (`revenuecat.ts:77-86`): `initializeRevenueCat` returns early in `__DEV__`. E2E checklist notes this must be removed for production.
- **No user-facing error** in `CommitmentGate.tsx:86-91`: `catch` only logs; user sees no feedback and button stays disabled.
- **Scholarship path** grants access immediately without validation (`CommitmentGate.tsx:100-106`): `grantLifetimeAccess("scholarship")` is called without server verification.

### 1.4 Lifetime Access

| Component          | Location                                          | Confidence |
| ------------------ | ------------------------------------------------- | ---------- |
| ChakraHub entry    | `ChakraHub.tsx:133-138`, `index.tsx:31`           | **High**   |
| Timegate bypass    | `timegate.ts:36-43`, `isChakraDayAccessible`      | **High**   |
| Scholarship expiry | `app/_layout.tsx:84-104`, `useChakraJourneyStore` | **High**   |

**Strengths:**

- `ChakraHub` redirects non-lifetime users to ChakraHome
- Scholarship expiry checked on mount and every 5 minutes
- `onRehydrateStorage` handles scholarship expiry on load

### 1.5 Course Mode Toggle

| Component                       | Location                    | Confidence |
| ------------------------------- | --------------------------- | ---------- |
| Course mode                     | `ChakraHub.tsx:111-114`     | **High**   |
| `lifetimeChosenTimegateJourney` | Session-only, not persisted | **Medium** |

**Strengths:**

- `inCourseMode` = `courseStartDate && journeyStarted && lifetimeChosenTimegateJourney`
- `timegate.ts` supports `inCourseMode` for trial-style timegates in lifetime

**Concerns:**

- `lifetimeChosenTimegateJourney` is session-only (`useChakraJourneyStore.ts:416`): "Return to course" does not persist across app restarts. `APP2_COURSE_MODE_PLAN.md` recommends persisted `courseModeActive`.
- `courseModeActive` from plan is not implemented; current `lifetimeChosenTimegateJourney` is session-only.

---

## 2. Error Handling

### 2.1 Error Boundaries

| Component               | Location                       | Confidence |
| ----------------------- | ------------------------------ | ---------- |
| Root ErrorBoundary      | `app/_layout.tsx:274`          | **High**   |
| ErrorBoundary component | `components/ErrorBoundary.tsx` | **High**   |
| Sentry integration      | `ErrorBoundary.tsx:43-47`      | **High**   |

**Strengths:**

- Root layout wrapped in `ErrorBoundary`
- Sentry `captureException` with context
- User-friendly fallback UI ("Something went wrong", "Try Again")
- Dev-only error stack display

**Concerns:**

- `handleReset` in ErrorBoundary clears state but does not re-mount children; may cause repeated errors if root cause persists.
- No nested ErrorBoundaries for critical flows (e.g., paywall, ChakraHome).

### 2.2 Try/Catch & Fallbacks

| Area          | Pattern                                | Confidence |
| ------------- | -------------------------------------- | ---------- |
| RevenueCat    | try/catch, graceful exit if no API key | **Medium** |
| Firebase      | try/catch, fallback to getFirestore    | **Medium** |
| ElevenLabs    | try/catch, Sentry capture              | **High**   |
| Gemini        | try/catch, cache fallback, Sentry      | **High**   |
| Asset preload | try/catch, no block on failure         | **High**   |

**Strengths:**

- `gemini.ts` has fallback chain: community cache → built-in cache → default chakra response
- `apiHelpers.ts`: `robustApiCall`, `withTimeout`, `withRetry`, `requestDeduplicator`
- `elevenlabs.ts`: rate limiting, retries, Sentry capture

**Concerns:**

- `CommitmentGate` purchase error: no user feedback
- `RevenueCatPaywall.tsx:48-54`: `handleRestore` catch only logs; no error state shown to user

### 2.3 Offline Behavior

| Component  | Behavior                         | Confidence |
| ---------- | -------------------------------- | ---------- |
| Firebase   | Offline persistence 200MB        | **High**   |
| Firestore  | `initializeFirestore` with cache | **High**   |
| Gemini     | Cache fallback                   | **High**   |
| ElevenLabs | No offline fallback              | **Low**    |
| RevenueCat | No offline handling              | **Medium** |

**Concerns:**

- Anua voice (ElevenLabs) requires network; no offline fallback.
- Audio: some streams from Firebase Storage; may fail offline without clear messaging.

---

## 3. State Management

### 3.1 Zustand Persistence

| Store                 | Storage      | Key                    | Confidence |
| --------------------- | ------------ | ---------------------- | ---------- |
| useChakraJourneyStore | AsyncStorage | chakra-journey-storage | **High**   |
| useFirstLaunchStore   | AsyncStorage | first-launch-storage   | **High**   |
| useStoreRehydration   | In-memory    | -                      | **High**   |
| usePresenceStore      | AsyncStorage | -                      | **High**   |
| useJourneyNotesStore  | AsyncStorage | -                      | **High**   |
| useAnuaMemoryStore    | AsyncStorage | -                      | **High**   |

**Strengths:**

- `partialize` excludes session-only fields (`lifetimeChosenTimegateJourney`, `devOpenPaywall`)
- `onRehydrateStorage` handles scholarship expiry and migration
- Rehydration coordinated via `useStoreRehydration`

**Concerns:**

- **AsyncStorage vs MMKV**: `.cursorrules` recommends MMKV; codebase uses AsyncStorage. AsyncStorage can be slower and cause rehydration delays.
- **Race conditions**: `useChakraWeekTransition` and `resetJourney` run in effects; rapid state changes could cause race conditions. No explicit locking.
- **Corrupted storage**: No handling for malformed JSON in AsyncStorage; could crash on rehydration.

### 3.2 Rehydration

| Aspect              | Implementation                                     | Confidence |
| ------------------- | -------------------------------------------------- | ---------- |
| Safety timeout      | 2.5s in `useStoreRehydration`                      | **High**   |
| Coordinated signals | `setJourneyRehydrated`, `setFirstLaunchRehydrated` | **High**   |
| Blank screen        | `index.tsx:53-54`                                  | **Medium** |

**Concerns:**

- 2.5s may be too short on slow devices; too long on fast devices.
- No loading indicator during rehydration; user sees black screen.

---

## 4. API/Service Integrations

### 4.1 RevenueCat

| Aspect           | Status                      | Confidence |
| ---------------- | --------------------------- | ---------- |
| Init             | Disabled in **DEV**         | **Low**    |
| API key          | From env via expo-constants | **High**   |
| Entitlement sync | On init                     | **High**   |
| Purchase flow    | Native sheet                | **High**   |
| Restore          | Implemented                 | **Medium** |

**File:** `src/services/revenuecat.ts`  
**Lines:** 77-86 (early return in dev), 194-204 (sync to store)

### 4.2 Firebase

| Aspect    | Status                    | Confidence |
| --------- | ------------------------- | ---------- |
| Init      | Graceful if no config     | **High**   |
| Firestore | Offline persistence 200MB | **High**   |
| Storage   | For asset URLs            | **High**   |

**File:** `src/services/firebase.ts`  
**Lines:** 30-54 (config), 78-96 (Firestore init)

### 4.3 Sentry

| Aspect           | Status                         | Confidence |
| ---------------- | ------------------------------ | ---------- |
| Init             | Disabled in dev unless enabled | **High**   |
| captureException | Safe if not initialized        | **High**   |
| DSN              | From env                       | **High**   |

**File:** `src/services/sentry.ts`  
**Note:** Sentry may not be installed (`@sentry/react-native`); dynamic import handles missing package.

### 4.4 ElevenLabs

| Aspect        | Status                      | Confidence |
| ------------- | --------------------------- | ---------- |
| API key       | From env; throws if missing | **Medium** |
| Rate limiting | `rateLimiter.ts`            | **High**   |
| Retries       | `robustApiCall`             | **High**   |
| Sentry        | captureException on error   | **High**   |

**File:** `src/services/elevenlabs.ts`  
**Concern:** `getElevenLabsApiKey()` throws if not configured; could crash app on load if env missing.

### 4.5 Gemini

| Aspect   | Status                                     | Confidence |
| -------- | ------------------------------------------ | ---------- |
| API keys | Up to 3 for rotation                       | **High**   |
| Fallback | Community cache → built-in cache → default | **High**   |
| Retries  | robustApiCall                              | **High**   |

**File:** `src/services/gemini.ts`  
**Graceful:** Returns empty array if no keys; `askAnua` throws with helpful message.

---

## 5. Performance

### 5.1 Asset Loading

| Aspect           | Implementation                    | Confidence |
| ---------------- | --------------------------------- | ---------- |
| Preload          | `usePreloadAssets` in root layout | **High**   |
| Images           | 30+ images preloaded              | **High**   |
| Audio            | 4 audio files preloaded           | **Medium** |
| Failure handling | try/catch, don't block            | **High**   |

**File:** `app/_layout.tsx:120-175`  
**Concern:** 30+ images preloaded on startup; may slow cold start. Consider lazy loading non-critical assets.

### 5.2 Audio Preloading

| Aspect       | Implementation                                 | Confidence |
| ------------ | ---------------------------------------------- | ---------- |
| Guard        | `audioPreloadGuard.ts`                         | **High**   |
| Manifest     | `audioPreloadManifest.ts`                      | **High**   |
| Waiting room | Preload starts after user reaches waiting room | **Medium** |

**Concern:** Only 4 audio files preloaded at root; `audioPreloadGuard` suggests head preload in waiting room. Verify full flow.

### 5.3 List Virtualization

| Component | Implementation                    | Confidence |
| --------- | --------------------------------- | ---------- |
| Lists     | ScrollView, no FlatList/FlashList | **Low**    |

**Concern:** `.cursorrules` recommends LegendList; codebase uses ScrollView. No virtualization for long lists (e.g., AudioLibrary, CommunityHalls). May impact performance on large lists.

---

## 6. Security

### 6.1 API Keys

| Key        | Storage                | Exposure Risk               |
| ---------- | ---------------------- | --------------------------- |
| Firebase   | env → app.config.extra | **Low** (client keys)       |
| RevenueCat | env → app.config.extra | **Low**                     |
| Gemini     | env → app.config.extra | **Medium** (bundled in app) |
| ElevenLabs | env → app.config.extra | **Medium**                  |
| Stripe     | env → app.config.extra | **Low** (publishable key)   |
| Sentry DSN | env                    | **Low**                     |

**Strengths:**

- Keys via `process.env` and `Constants.expoConfig?.extra`
- No hardcoded secrets
- Stripe secret key on backend (not in app)

**Concerns:**

- API keys are bundled in the app binary; extractable. Gemini/ElevenLabs keys should ideally be behind a backend proxy for production.
- `.env` not in repo (assumed); ensure `.env` in `.gitignore`.

### 6.2 User Data

| Data             | Storage      | Sensitivity |
| ---------------- | ------------ | ----------- |
| Journey progress | AsyncStorage | Low         |
| User ID          | AsyncStorage | Low         |
| Notes            | AsyncStorage | Medium      |
| Anua memory      | AsyncStorage | Medium      |

**Concerns:**

- No encryption at rest for AsyncStorage.
- No explicit handling of concurrent sessions (e.g., same device, different users).

### 6.3 Payment Flows

| Flow             | Security                           | Confidence |
| ---------------- | ---------------------------------- | ---------- |
| RevenueCat       | Native SDK, server-side validation | **High**   |
| Scholarship      | Client-side grant only             | **Low**    |
| Stripe deep link | `verifyPayment` server call        | **Medium** |

**Concerns:**

- Scholarship path: `grantLifetimeAccess("scholarship")` is client-only; no server validation. Could be abused.
- Deep link `/payment-success` in `_layout.tsx:223-229`: `verifyPayment` called; ensure backend validates session.

---

## 7. Edge Cases

### 7.1 Network Failures

| Area      | Handling                           | Confidence |
| --------- | ---------------------------------- | ---------- |
| API calls | Timeout, retry, Sentry             | **High**   |
| Firebase  | Offline persistence                | **High**   |
| Purchase  | Network error not surfaced to user | **Low**    |

### 7.2 Corrupted Storage

| Scenario       | Handling         | Confidence |
| -------------- | ---------------- | ---------- |
| Malformed JSON | Not handled      | **Low**    |
| Missing keys   | Zustand defaults | **Medium** |

**Concern:** If AsyncStorage returns corrupted JSON, `persist` middleware may throw. No try/catch around rehydration.

### 7.3 Concurrent Sessions

| Scenario                     | Handling             | Confidence |
| ---------------------------- | -------------------- | ---------- |
| Same device, different users | No explicit handling | **Low**    |
| Restore purchases            | RevenueCat handles   | **High**   |

**Concern:** User ID from `userId.ts` is device-based; no account switching. Restore purchases links to RevenueCat anonymous ID.

### 7.4 Time/Date Edge Cases

| Scenario          | Handling                                 | Confidence |
| ----------------- | ---------------------------------------- | ---------- |
| Timezone changes  | `getLocalDateISO`, `getCurrentDayOfWeek` | **Medium** |
| Device clock skew | No explicit handling                     | **Low**    |
| Midnight rollover | `useChakraWeekTransition`                | **High**   |

---

## 8. Third-Party Dependencies

### 8.1 Expo / React Native

| Package      | Version  | Notes              |
| ------------ | -------- | ------------------ |
| expo         | ~52.0.49 | Current            |
| react-native | 0.76.9   | Current            |
| expo-router  | ~4.0.22  | File-based routing |

**Strengths:**

- `expo-doctor` exclusions for known issues
- Hermes enabled
- New architecture enabled

### 8.2 Native Modules

| Module                 | Purpose         | Risk |
| ---------------------- | --------------- | ---- |
| react-native-purchases | RevenueCat      | Low  |
| expo-av                | Audio           | Low  |
| expo-camera            | Video recording | Low  |
| @expo/vector-icons     | Icons           | Low  |

**Concern:** `expo-doctor` excludes several packages; verify compatibility.

---

## 9. Critical UX/App Functions – Confidence Summary

| Function                         | Confidence | Notes                                              |
| -------------------------------- | ---------- | -------------------------------------------------- |
| Onboarding (path → date → begin) | **High**   | Rehydration guards, PathSelectionGate              |
| Trial 1/2 progression            | **High**   | resetJourney, trialHistory                         |
| Paywall display                  | **High**   | CommitmentGate logic                               |
| Purchase flow                    | **Low**    | RevenueCat disabled in dev; no user error feedback |
| Restore purchases                | **Medium** | Implemented; no error UI                           |
| Lifetime access                  | **High**   | ChakraHub guard, scholarship expiry                |
| Course mode                      | **Medium** | Session-only; no persist across restart            |
| Chakra content access            | **High**   | timegate.ts                                        |
| Anua chat                        | **High**   | Cache fallback; rate limiting                      |
| Audio playback                   | **Medium** | Preload limited; streaming                         |
| Gallery persistence              | **High**   | hasEverCompletedChakra                             |

---

## 10. Specific Concerns with File/Line References

| Concern                        | File                                     | Line(s)      |
| ------------------------------ | ---------------------------------------- | ------------ |
| RevenueCat disabled in dev     | `src/services/revenuecat.ts`             | 77-86        |
| No purchase error UI           | `components/chakras/CommitmentGate.tsx`  | 86-91        |
| Scholarship client-only grant  | `components/chakras/CommitmentGate.tsx`  | 100-106      |
| ElevenLabs throws if no key    | `src/services/elevenlabs.ts`             | 30-40        |
| AsyncStorage vs MMKV           | `.cursorrules` vs codebase               | -            |
| No list virtualization         | Various components                       | -            |
| Rehydration blank screen       | `app/(chakras)/index.tsx`                | 53-54        |
| courseModeActive not persisted | `ChakraHub.tsx`, `useChakraJourneyStore` | 111-114, 416 |
| No corrupted storage handling  | `useChakraJourneyStore` persist          | -            |
| LogBox ignores Firebase errors | `app/_layout.tsx`                        | 38-45        |

---

## 11. Overall App Store Readiness: 72/100

### Justification

**Strengths (+):**

- Clear architecture (App1/App2)
- Error boundaries and Sentry
- Robust API helpers (timeout, retry, dedup)
- Gemini cache fallback
- Firebase offline persistence
- Timegate logic well-tested
- Rehydration guards

**Deductions (-):**

- **-10**: RevenueCat disabled in dev; no user-facing purchase errors
- **-5**: Scholarship path unvalidated; client-only grant
- **-5**: Course mode not persisted across restart
- **-3**: AsyncStorage performance; no MMKV
- **-3**: No list virtualization
- **-2**: ElevenLabs throws on missing config
- **-2**: No corrupted storage handling

### Recommended Pre-Launch Actions

1. **Critical:** Re-enable RevenueCat in production; add user-facing error handling in CommitmentGate.
2. **Critical:** Add server validation for scholarship path (or document intentional design).
3. **High:** Implement persisted `courseModeActive` for "Return to course" across restarts.
4. **High:** Add loading indicator during rehydration.
5. **Medium:** Consider MMKV for performance-critical stores.
6. **Medium:** Add try/catch around Zustand rehydration for corrupted storage.
7. **Low:** Add list virtualization for long lists (AudioLibrary, CommunityHalls).

---

_End of audit report_
