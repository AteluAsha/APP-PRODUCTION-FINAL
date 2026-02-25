# App Store Readiness Audit – February 2026

## Executive Summary

The app is structurally sound with no competing code paths. One critical bug was fixed (Contribute error handler). RevenueCat is intentionally disabled until App Store Connect is configured. Below is what remains for App Store compliance and functionality.

---

## ✅ What's Clean & Working

### Competing Code

- **None found.** Single implementations for: paywall, timegates, date selection, waiting room, splash flow.
- Navigation uses `router.replace` consistently where needed (no back-stack issues).
- State: `useChakraJourneyStore` (Zustand + MMKV) – no duplicate sources.

### Timegates

- Centralized in `src/services/timegate.ts`.
- Consistent across ChakraHome, ChakraHub, WaitingScreen, IntegratedProgressStack.
- Edge cases: first Monday, trial 1 vs 2, lifetime somatic journey – all handled.

### App Store Compliance (Already in Place)

- **Privacy Policy:** https://soulschool.app/privacy (CommitmentGate, RevenueCatPaywall)
- **Terms of Service:** https://soulschool.app/terms
- **Support:** mailto:support@soulschool.app
- **Restore Purchases:** Button in RevenueCatPaywall
- **Subscription disclosure:** "Subscriptions auto-renew unless cancelled"
- **Non-profit:** Project Starseed 501(c)(3) disclosed
- **Secrets:** No hardcoded API keys; all from env

---

## 🔧 Fix Applied This Session

| Bug                                         | Location                 | Fix                            |
| ------------------------------------------- | ------------------------ | ------------------------------ |
| Undefined `SCHOLARSHIP_LINK` in catch block | `Contribute.tsx` line 68 | Replaced with `CONTRIBUTE_URL` |

---

## ⚠️ Critical: Before App Store Submission

### 1. Enable RevenueCat

**File:** `src/services/revenuecat.ts` lines 79–87

**Current:** Early `return` prevents SDK initialization in all builds.

**Action:** Remove the early return when App Store Connect is ready:

```ts
// DELETE these lines before production:
if (__DEV__) {
  console.log("[RevenueCat] Temporarily disabled...")
}
return
```

**When:** After creating IAP products in App Store Connect and configuring RevenueCat.

### 2. App Store Connect Setup (Manual)

- [ ] Create products: `yearly` (subscription), `lifetime` (non-consumable)
- [ ] Optional: `contribution_7`, `contribution_11`, `contribution_22`, `contribution_55` for Contribute screen
- [ ] Add RevenueCat production API key to EAS secrets
- [ ] Link RevenueCat to App Store Connect products
- [ ] Test purchase + restore in sandbox

### 3. EAS / Environment

- [ ] `REVENUECAT_API_KEY` in EAS Build secrets
- [ ] Firebase config for production
- [ ] Any other env vars required at runtime

---

## 📋 Content Pending

| Item                                 | Status                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------- |
| **7 integration (audioOutro) files** | Replace `root-ethan-1.mp3` per chakra                                       |
| **App store URLs**                   | Update `constants/sharing.ts` when published (APP_STORE_URLS.ios, .android) |
| **REVIEW_URL**                       | Replace soulschool.app/community with App Store review URL when live        |

---

## 🔒 Security Checklist

| Item                          | Status                  |
| ----------------------------- | ----------------------- |
| No hardcoded secrets          | ✅                      |
| API keys from env             | ✅                      |
| Stripe secret on backend only | ✅ (if used)            |
| EAS secrets for production    | ⬜ Verify before submit |

---

## 📱 Apple & Google Play Standards

### Apple IAP

- In-app purchases via App Store (RevenueCat) ✅
- Restore purchases ✅
- Privacy/Terms/Support links ✅
- Subscription auto-renew disclosure ✅

### Google Play

- Same disclosures apply ✅
- Ensure product IDs match in Google Play Console

---

## What's Left (Besides 7 Integration Audio Files)

1. **RevenueCat:** Remove early return when App Store Connect is configured
2. **App Store Connect:** Create products, link RevenueCat, test sandbox
3. **EAS:** Confirm production secrets (RevenueCat, Firebase, etc.)
4. **App store URLs:** Update in `constants/sharing.ts` after publish
5. **REVIEW_URL:** Update to App Store review link when app is live

---

## Optional / Low Priority

- **PathSelectionGate:** Referenced in comments but not rendered; add or remove comment
- **Stripe verifyPayment:** Returns false; only relevant if web checkout is used
- **Contribute products:** Add to App Store Connect if in-app contributions are desired
