# Android Paywall, RevenueCat, and Scholarship UX Audit

## Summary

Audit of paywall functions, RevenueCat systems, and scholarship UX from start to finish. One code fix applied (platform-aware restore message). All pathways, buttons, and systems are correctly wired for both iOS and Android.

---

## 1. RevenueCat Systems

### Configuration

- **Keys:** [src/core/config/revenueCatConfig.ts](src/core/config/revenueCatConfig.ts) – `REVENUECAT_PUBLIC_SDK_KEY_ANDROID`, `REVENUECAT_PUBLIC_SDK_KEY_IOS`. Env override via `expoConfig.extra.revenuecat.apiKey`.
- **Init:** [app/_layout.tsx](app/_layout.tsx) – `useEffect` calls `initializeRevenueCat(userId)` after `getUserId()`. Runs once on app start; no early return in production.
- **Service:** [src/services/revenuecat.ts](src/services/revenuecat.ts) – `initializeRevenueCat` configures SDK by platform (iOS/Android), links `userId` via `Purchases.logIn`, sets attributes, then syncs entitlement to journey store (`hasActiveEntitlement` → `grantLifetimeAccess("paid")`).

### Entitlement and Products

- **Entitlement ID:** `"Soul School Pro"` – grants full access.
- **Product IDs:** `yearly` (annual), `lifetime`, plus contribution products (`contribution_7`, etc.) for Contribute screen. Paywall uses **yearly** only; scholarship does not use RevenueCat.
- **Hook:** [hooks/useRevenueCat.ts](hooks/useRevenueCat.ts) – `checkStatus` (entitlement + packages), `purchase`, `restore`, `openCustomerCenter`, `getProductPackage`. On successful purchase/restore, hook calls `grantLifetimeAccess("paid")`.

### Purchase and Restore

- **Purchase:** `purchaseProduct(productId)` → native payment sheet (iOS/Android). On success, `useRevenueCat` sets `hasPro` and calls `grantLifetimeAccess("paid")`.
- **Restore:** `restorePurchases()` → `Purchases.restorePurchases()`. CommitmentGate checks `info.entitlements.active[ENTITLEMENT_ID]`; if present, shows AccessGrantedModal; otherwise shows **platform-aware** error (see fix below).
- **Customer Center:** `presentCustomerCenter()` → `Purchases.showManageSubscriptions()` on both platforms.

### Fix applied

- **Restore error message:** CommitmentGate previously showed "sign in with the same Apple ID" for all platforms. It now shows "sign in with the same **Google account**" on Android and "Apple ID" on iOS.

---

## 2. Paywall Pathways and Buttons

### Entry points to paywall

| Entry | Route / component | When |
|-------|-------------------|------|
| **ChakraHome overlay** | CommitmentGate rendered inside ChakraHome | Trial user when `shouldShowCommitmentGate` (Trial 1 complete on Sunday, or Trial 2 ended). |
| **Standalone Paywall screen** | [app/(chakras)/Paywall.tsx](app/(chakras)/Paywall.tsx) | Trial user taps "Upgrade to Lifetime" in Profile (ProfileSheet) or otherwise navigates to Paywall. Renders CommitmentGate with `onBack`, `onComplete` → ChakraHub, `showContinueToTrial2` when first trial complete. |
| **DevPaywall** | [app/(chakras)/DevPaywall.tsx](app/(chakras)/DevPaywall.tsx) | Dev only; TrialTestFlow / DevGallery. Same CommitmentGate for testing. |

### CommitmentGate (main paywall UI)

- **Location:** [components/chakras/CommitmentGate.tsx](components/chakras/CommitmentGate.tsx).
- **Options:** "Complete Sacred Path" (annual / RevenueCat) and "Monthly Course Pass" (scholarship).
- **Primary CTA:** "Enter Your Sacred Space" – either starts purchase (annual) or opens ScholarshipModal (scholarship).
- **Restore Purchases:** Footer link; platform-aware error if no entitlement.
- **Continue to trial number 2:** Shown when `showContinueToTrial2` (Trial 1 complete, Sunday); navigates to DateSelection.
- **Back button:** Shown when `onBack` is provided (e.g. Paywall route); calls `onBack()`.
- **Post-purchase:** AccessGrantedModal → "Enter Your Sacred Space" / "Continue Weekly Journey" → `onComplete()` and/or `router.replace("/(chakras)/ChakraHub")`.

### RevenueCatPaywall component

- **Location:** [components/chakras/RevenueCatPaywall.tsx](components/chakras/RevenueCatPaywall.tsx).
- **Usage:** Not used in the main app flow. Referenced in dev (CaptureAll, docs). Main production paywall is **CommitmentGate** (annual + scholarship + restore).

### Index and routing

- **Lifetime:** [app/(chakras)/index.tsx](app/(chakras)/index.tsx) → `router.replace("/(chakras)/ChakraHub")`.
- **Trial after trial 1:** → `DateSelection`.
- **Trial with courseStartDate:** → `ChakraHome` (waiting room or main home; ChakraHome may show CommitmentGate when `shouldShowCommitmentGate`).
- **Trial first time:** → `WelcomeScreen`.

---

## 3. Scholarship UX (Start to Finish)

### Flow

1. **CommitmentGate** – User selects "Monthly Course Pass" (scholarship) and taps "Enter Your Sacred Space".
2. **ScholarshipModal** – [components/chakras/ScholarshipModal.tsx](components/chakras/ScholarshipModal.tsx). User enters reason (required, max 500 chars), taps "Enter Energy Exchange".
3. **CommitmentGate.handleScholarshipContinue** – Logs request via `logScholarshipRequest(userId, reason)`, calls `grantLifetimeAccess("scholarship")`, closes modal, calls `onComplete()`, then `router.replace("/(chakras)/EnergyExchange")`.
4. **Energy Exchange** – [app/(chakras)/EnergyExchange.tsx](app/(chakras)/EnergyExchange.tsx). Optional connection (Share Video, Leave Review, Write to Us). Primary CTA "Enter Path" → ChakraHub. "Continue to App" same as Enter Path.

### Scholarship state and expiry

- **Grant:** [hooks/useChakraJourneyStore.ts](hooks/useChakraJourneyStore.ts) – `grantLifetimeAccess("scholarship")` sets `hasLifetimeAccess: true`, `paymentStatus: "scholarship"`, `scholarshipExpiryDate` to 30 days from now. Fire-and-forget: [src/services/userScholarshipStatus.ts](src/services/userScholarshipStatus.ts) updates Firestore `users/{userId}` with `isScholarshipUser: true`, `scholarshipExpiryDate`.
- **Audit log:** [src/services/scholarshipAudit.ts](src/services/scholarshipAudit.ts) – `logScholarshipRequest(userId, reason)` writes to `scholarship_requests` (fire-and-forget). Does not block grant.
- **Expiry check:** [app/_layout.tsx](app/_layout.tsx) – Every 5 minutes, if `paymentStatus === "scholarship"` and `new Date() > scholarshipExpiryDate`, store is updated to `hasLifetimeAccess: false`, `paymentStatus: "pending"`, `scholarshipExpiryDate: null`. User then sees paywall again on next ChakraHome (CommitmentGate) and can re-apply or pay.

### Firestore

- **scholarship_requests:** create with `userId`, `reason` (≤500), `timestamp`; no update/delete.
- **users/{userId}:** create/update with `isScholarshipUser` (bool); used for cross-device persistence of scholarship status.

---

## 4. Android-Specific Notes

- RevenueCat Android key is set in revenueCatConfig; init uses same flow as iOS (`Purchases.configure`, `logIn(userId)`, `showManageSubscriptions`).
- Restore error message now says "Google account" on Android, "Apple ID" on iOS.
- CommitmentGate, ScholarshipModal, AccessGrantedModal, and Energy Exchange use StyleSheet or inline styles; no Android-specific layout issues identified for paywall/scholarship.

---

## 5. Checklist for Android Device

- [ ] **RevenueCat:** Open paywall (from Profile "Upgrade to Lifetime" or after trial). Purchase yearly (sandbox/test). Confirm AccessGrantedModal and navigation to ChakraHub.
- [ ] **Restore:** On second device or after reinstall, open paywall → Restore Purchases. Confirm either AccessGrantedModal or the "No purchases found… sign in with the same Google account" message.
- [ ] **Scholarship:** Select "Monthly Course Pass" → Enter reason → "Enter Energy Exchange". Confirm Energy Exchange screen then "Enter Path" → ChakraHub.
- [ ] **Scholarship expiry:** (Hard to test without mocking time.) After 30 days, app should revoke access and show paywall again; user can re-apply or pay.
- [ ] **Profile:** As trial user, open Profile → "Upgrade to Lifetime" → Paywall (CommitmentGate) with back button. Complete or back out.
