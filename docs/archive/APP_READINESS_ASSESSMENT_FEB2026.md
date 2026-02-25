# App Readiness Assessment – Soul School

**Date:** February 2026  
**Scope:** Global audit – critical UX, app functions, App Store readiness, heavy-traffic use

---

## 1. Critical UX & App Functions – Confidence List

### Fully Confident

| Function                    | Why                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------- |
| **Onboarding flow**         | PathSelectionGate, rehydration guards, `hasCompletedHeroOnboarding`, clear sequence    |
| **Trial 1/2 progression**   | `resetJourney`, `trialHistory`, `useChakraWeekTransition`, timegate logic              |
| **Timegate logic**          | `getLocalDateISO`, `hasReachedCourseStartDate` fixed; local timezone used consistently |
| **Post-trial paywall gate** | Index → DateSelection; Begin → ChakraHome paywall; no waiting room without paying      |
| **Lifetime access routing** | ChakraHub guard, scholarship expiry checks, RevenueCat sync on init                    |
| **Course mode toggle**      | `lifetimeChosenTimegateJourney`, ChakraHub `inCourseMode`, GoodbyeModal → ChakraHome   |
| **Chakra content access**   | `isChakraDayAccessible`, `shouldShowWaitingScreen` – correct routing                   |
| **Gallery persistence**     | `hasEverCompletedChakra` uses `trialHistory`                                           |
| **Error boundaries**        | Root ErrorBoundary, Sentry capture, fallback UI                                        |
| **API resilience**          | `robustApiCall`, timeout, retry, deduplication                                         |
| **Gemini fallback**         | Community cache → built-in cache → default chakra response                             |
| **Firebase offline**        | 200MB Firestore cache                                                                  |
| **Date/time sync**          | `getLocalDateISO`, local parsing; RevenueCat sync to store                             |

### Confident with Minor Caveats

| Function              | Caveat                                                         |
| --------------------- | -------------------------------------------------------------- |
| **Audio playback**    | Preload limited; streaming from Firebase; retry logic in place |
| **Anua chat**         | Cache fallback; ElevenLabs requires network                    |
| **Restore purchases** | Implemented; no user-facing error UI on failure                |

### Concerned

| Function                       | Concern                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| **Purchase flow**              | RevenueCat disabled in `__DEV__`; no user-facing error when purchase fails (catch only logs) |
| **Scholarship path**           | Client-only `grantLifetimeAccess("scholarship")`; no server validation; abusable             |
| **Course mode across restart** | `lifetimeChosenTimegateJourney` is session-only; no "Return to course" after app restart     |
| **Corrupted AsyncStorage**     | No try/catch around Zustand rehydration; malformed JSON could crash                          |
| **ElevenLabs config**          | Throws if API key missing; could crash on load                                               |
| **List performance**           | ScrollView for long lists (AudioLibrary, CommunityHalls); no virtualization                  |
| **Rehydration UX**             | Blank black screen during load; no loading indicator                                         |

---

## 2. What’s Working Well

- **Architecture:** Clear App1/App2 split; timegate service centralizes logic
- **State management:** Rehydration with safety timeout; migration in `onRehydrateStorage`
- **Error handling:** ErrorBoundary, Sentry, robust API helpers
- **Offline:** Firestore cache; Gemini cache fallback
- **Time logic:** Local dates; RevenueCat sync; scholarship expiry checks
- **UX flows:** Post-trial gate, course mode toggle, GoodbyeModal routing
- **Security:** Keys via env; no hardcoded secrets; Stripe secret on backend

---

## 3. Concerns (Inside & Outside the Box)

### Inside the Box

1. **RevenueCat disabled in dev** – E2E purchase testing blocked until re-enabled
2. **Purchase error UX** – User sees no feedback on failure; button stays disabled
3. **Scholarship abuse** – Anyone can tap Scholarship and get access without validation
4. **Course mode not persisted** – Lifetime user in somatic journey loses “course mode” on restart
5. **AsyncStorage** – Slower than MMKV; no handling for corrupted storage
6. **LogBox ignores Firebase** – Errors may be hidden during development

### Outside the Box

1. **App Store review** – Scholarship path may raise questions (free access, no verification)
2. **Non-profit compliance** – Energy Exchange / scholarship flow should align with 501(c)(3) rules
3. **Heavy traffic** – Firebase/Firestore scale; no explicit rate limiting on reads
4. **API key exposure** – Gemini/ElevenLabs keys bundled; consider proxy for production
5. **Concurrent users** – No account switching; device-based user ID
6. **Cold start** – 30+ images preloaded; may slow launch on low-end devices

---

## 4. Overall App Store Readiness Rating

### **75/100**

### Breakdown

| Category       | Score | Notes                                                                     |
| -------------- | ----- | ------------------------------------------------------------------------- |
| Core flows     | 90    | Onboarding, trial, timegate, lifetime – solid                             |
| Payment        | 55    | RevenueCat disabled in dev; no purchase error UI; scholarship unvalidated |
| Error handling | 85    | ErrorBoundary, Sentry, API helpers                                        |
| Performance    | 70    | No list virtualization; heavy preload                                     |
| Security       | 75    | Keys via env; scholarship client-only                                     |
| Offline        | 80    | Firestore cache; Gemini fallback                                          |
| UX polish      | 75    | Rehydration blank screen; minor gaps                                      |

### Justification

**Strengths (+):**

- Core journey and timegate logic are reliable
- Error handling and resilience are strong
- Architecture is clear and maintainable
- Recent fixes (time sync, UX/timegate, post-trial gate) improve robustness

**Deductions (-):**

- **-10:** RevenueCat disabled in dev; no user-facing purchase errors
- **-5:** Scholarship path unvalidated; potential abuse
- **-5:** Course mode not persisted
- **-3:** No corrupted storage handling
- **-2:** List performance; no virtualization

### Heavy-Traffic Use

**Rating: 70/100**

- Firebase/Firestore can scale, but no explicit quotas or caching strategy for high read volume
- API calls (Gemini, ElevenLabs) have rate limiting; backend capacity matters
- AsyncStorage is per-device; no server-side session management for scale

---

## 5. Pre-Launch Priority List

### Critical (Must Fix)

1. Re-enable RevenueCat in production (remove early return in `revenuecat.ts`)
2. Add user-facing error handling in CommitmentGate purchase flow
3. Add server validation for scholarship path (or document intentional design and accept risk)

### High (Should Fix)

4. Persist course mode for “Return to course” across restarts
5. Add loading indicator during rehydration
6. Add try/catch around Zustand rehydration for corrupted storage

### Medium (Nice to Have)

7. Consider MMKV for performance-critical stores
8. Add list virtualization for long lists
9. Add NetInfo-based offline indicator for Anua/audio

### Low

10. Consider backend proxy for Gemini/ElevenLabs keys
11. Reduce or lazy-load non-critical preloaded images

---

_Assessment based on codebase audit, recent fixes (time sync, UX/timegate), and production-readiness best practices._
