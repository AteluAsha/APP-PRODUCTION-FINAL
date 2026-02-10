# Global production readiness – App Store (App1 + App2)

**Date:** Feb 2026  
**Scope:** End-to-end check of trial (App1), lifetime (App2), payments, content, and config.

---

## Critical – must fix before submission

### 1. RevenueCat disabled in all builds

**File:** `src/services/revenuecat.ts`  
**Issue:** `initializeRevenueCat` has an unconditional early `return` (lines 77–82), so the SDK never initializes in development or production. Purchases and restore will not work.

```ts
// TEMPORARILY DISABLED: ...
if (__DEV__) { console.log(...) }
return   // <-- runs in ALL environments
try { ... Purchases.configure(...) ...
```

**Action:** Remove the early `return` (and the `if (__DEV__)` log above it) so initialization runs. Ensure `REVENUECAT_API_KEY` is set in EAS Build secrets / App Store Connect config and that App Store Connect products and RevenueCat are configured per `APP_STORE_READINESS_CHECKLIST.md`.

---

### 2. Audio placeholders (outro same for all chakras)

**File:** `constants/chakras/content.tsx`  
**Issue:** All 7 chakras use the same files for `audioOutro`:
- `audioOutro.source: require("@/assets/audio/root-ethan-1.mp3")` (and Root `audioIntro` uses `root-erin-1.mp3`).

So every chakra’s outro plays the same Root clip. Documented in `FINAL_PRODUCTION_STATUS.md`.

**Options:**
- Replace with chakra-specific outro (and intro if desired) per chakra, or
- Remove or repurpose `audioOutro` if a single shared clip is intentional, or
- Document clearly as intentional and leave as-is.

**Action:** Decide and either add chakra-specific assets or document the current behavior.

---

## High – verify before launch

### 3. App Store Connect & RevenueCat (manual)

From `APP_STORE_READINESS_CHECKLIST.md`:

- [ ] **App Store Connect:** Privacy Policy URL, Terms URL, Support URL/email, app description with non-profit disclosure.
- [ ] **In-App Purchases:** Create subscription group; create `yearly` (auto-renewable) and `lifetime` (non-consumable); product IDs must match code and RevenueCat.
- [ ] **RevenueCat:** Production API key in EAS secrets; products linked to App Store Connect; entitlement (e.g. "Soul School Pro") configured; sandbox purchase and restore tested.

### 4. Environment variables (production build)

**File:** `app.config.js` (via `process.env` / EAS)

Confirm these are set for production EAS builds (no secrets in repo):

- Firebase: `FIREBASE_*`
- RevenueCat: `REVENUECAT_API_KEY`
- Sentry (optional): `SENTRY_DSN`
- Gemini: `GEMINI_API_KEY` (and backups if used)
- ElevenLabs: `ELEVENLABS_API_KEY`
- Stripe (if used): `STRIPE_PUBLISHABLE_KEY`, `STRIPE_BACKEND_URL`
- Google Speech (if used): `GOOGLE_CLOUD_SPEECH_API_KEY`

### 5. Timegates in production

**File:** `src/services/timegate.ts`  
**Logic:** `shouldBypassTimegate` returns `true` when `__DEV__ === true`, so in production `__DEV__` is false and trial timegates apply. No change needed; just confirm production builds are not dev (e.g. EAS production profile).

### 6. Dev-only UI

- **TrialTestFlow:** Rendered only when `__DEV__` (ChakraHome, WaitingScreen). ✅  
- **DevGalleryTrigger:** Returns `null` when `!__DEV__`. ✅  
- **CaptureAll (web):** Only when `Platform.OS === "web" && __DEV__` in `_layout.tsx`. ✅  

No dev-only UI in production builds.

---

## App1 (trial) – flow summary

| Step | Screen / logic | Status |
|------|----------------|--------|
| Entry | (chakras)/index → WelcomeScreen | ✅ |
| Path choice | WelcomeScreen "Enter Path" → DateSelection | ✅ |
| Date | DateSelection confirm → ChakraHome (waiting room) | ✅ |
| Preload | WaitingScreen mount → preloadAllAudioHeads once (audioPreloadGuard) | ✅ |
| Waiting | WaitingScreen until start date + Monday, then IntegratedProgressStack | ✅ |
| Timegates | isChakraDayAccessible (current + participated); no bypass in prod | ✅ |
| Paywall | CommitmentGate after Trial 1 or Trial 2 complete (Sunday) | ✅ |
| Post-pay | grantLifetimeAccess → ChakraHome effect → replace to ChakraHub | ✅ |

Guards: Trial cannot open ChakraHub, AudioLibrary, or see PermanentMenuBar (no `hasLifetimeAccess`).

---

## App2 (lifetime) – flow summary

| Step | Screen / logic | Status |
|------|----------------|--------|
| Entry | WelcomeScreen "Enter Path" → ChakraHub | ✅ |
| Somatic (optional) | ChakraHub → "Select start date" / "Access course" → DateSelection → ChakraHome | ✅ |
| Menu | PermanentMenuBar (Music, Community, Gallery, Notes, Anua) only when hasLifetimeAccess | ✅ |
| Music Room | AudioLibrary; redirects trial to ChakraHome | ✅ |
| Timegates | Bypassed for normal hub; trial-style when lifetime somatic journey (inCourseMode) | ✅ |

Guards: ChakraHub and AudioLibrary redirect trial users; ChakraHome redirects lifetime (non–somatic) to ChakraHub.

---

## Code / config checklist

| Area | Status |
|------|--------|
| Payments (RevenueCat) | ⚠️ Re-enable init (remove early return) |
| Paywall / CommitmentGate / PaymentGate | Disclosures, Privacy/Terms/Support links ✅ (per checklist) |
| Audio preload | Auto-trigger in waiting room; guard; no first-paint preload ✅ |
| Audio playback | prepareLongAudioForPlay; head cache; ChakraTemplate localUri ✅ |
| Dev-only code | TrialTestFlow, DevGallery, CaptureAll gated by __DEV__ / platform ✅ |
| Error tracking | Sentry optional; captureException used in key services ✅ |
| Firebase | Config from env; offline persistence ✅ |
| Deep links | Stripe payment-success handled in _layout ✅ |

---

## Recommended order of work

1. **RevenueCat:** Remove the early return in `initializeRevenueCat`, set production API key, configure products and entitlement, test purchase + restore in sandbox.
2. **Audio:** Resolve placeholders (chakra-specific outro/intro or documented intentional use).
3. **App Store Connect:** Metadata, URLs, IAP products, subscription group, non-profit disclosure.
4. **EAS production build:** Verify env vars and run full test on device (trial flow, paywall, purchase, lifetime flow, Music Room, preload).

---

## Summary

| Priority | Item | Action |
|----------|------|--------|
| **Critical** | RevenueCat never initializes | Remove early `return` in `initializeRevenueCat`; configure and test IAP |
| **Critical** | Audio outro same for all chakras | Replace with chakra-specific files or document as intentional |
| **High** | App Store Connect | Products, URLs, descriptions, non-profit text |
| **High** | EAS production env | Confirm all required env vars for production profile |
| **Done** | App1/App2 separation, guards, preload, playback | No further code changes for production flow |

**Bottom line:** App1 and App2 flows and guards are in good shape. Two critical items remain: **re-enable RevenueCat initialization** and **resolve or document audio placeholders**. After that, complete App Store Connect and EAS config and run a full production test pass.
