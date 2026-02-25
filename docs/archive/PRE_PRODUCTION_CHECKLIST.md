# Pre-Production Checklist – Soul School

Use this checklist before running your first production build.

---

## 1. Expo / EAS Login

Before running `eas build`, you must be logged in:

```bash
eas login
```

Or set `EXPO_TOKEN` for CI/automated builds.

---

## 2. EAS Secrets to Verify

Add these in [Expo Dashboard](https://expo.dev) → Project → Secrets, or via `eas secret:create`:

| Secret | Required | Notes |
|--------|----------|-------|
| `REVENUECAT_API_KEY` | When IAP ready | Production API key from RevenueCat dashboard |
| `FIREBASE_API_KEY` | Yes | Firebase config |
| `FIREBASE_AUTH_DOMAIN` | Yes | Firebase config |
| `FIREBASE_PROJECT_ID` | Yes | Firebase config |
| `FIREBASE_STORAGE_BUCKET` | Yes | Firebase config |
| `FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase config |
| `FIREBASE_APP_ID` | Yes | Firebase config |
| `FIREBASE_MEASUREMENT_ID` | Optional | Analytics |
| `GEMINI_API_KEY` | Yes | Primary Gemini key for Anua |
| `GEMINI_API_KEY_2` | Optional | Fallback |
| `GEMINI_API_KEY_3` | Optional | Fallback |
| `ELEVENLABS_API_KEY` | Yes | For Anua voice |
| `ANUA_VOICE_ID` | Yes | ElevenLabs voice ID |
| `STRIPE_PUBLISHABLE_KEY` | If using Stripe | Contribute / Energy Exchange |
| `STRIPE_BACKEND_URL` | If using Stripe | Backend verification |
| `SENTRY_DSN` | Optional | Error tracking |

**Source:** [app.config.js](app.config.js) lines 119–153

---

## 3. Production Build

```bash
eas build --platform ios --profile production
```

---

## 4. RevenueCat (When Ready)

**File:** [src/services/revenuecat.ts](src/services/revenuecat.ts) lines 80–87

**When:** After creating IAP products in App Store Connect and linking RevenueCat.

**Action:** Remove the early `return` so the SDK initializes:

```ts
// DELETE these lines:
  if (__DEV__) {
    console.log("[RevenueCat] Temporarily disabled...")
  }
  return
```

---

## 5. Post-Publish Updates

After the app is live:

- [ ] Update [constants/sharing.ts](constants/sharing.ts): `APP_STORE_URLS.ios`, `REVIEW_URL`
- [ ] Update App Store Connect metadata with live URLs

---

## Completed This Session

- [x] Format code with Prettier (`npx prettier --write .`)
- [x] TypeScript passes (`tsc --noEmit`)
- [x] EAS secrets checklist documented
