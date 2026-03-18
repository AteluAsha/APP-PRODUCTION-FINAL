# Android Paywall Investigation

## Why "all payment gates failed" on Android

When **every** paywall action fails on Android (monthly, annual, and possibly restore), the cause is almost always one of the following.

---

### 1. **RevenueCat packages empty on Android**

The app purchases by **package identifier**: `$rc_monthly` and `$rc_annual`. Those come from RevenueCat’s **Current** offering.

**Flow in code:**

- `CommitmentGate` → `purchase(PACKAGE_IDENTIFIERS.MONTHLY)` or `ANNUAL`
- `useRevenueCat().purchase()` → `purchaseProduct(packageOrProductId)` in `src/services/revenuecat.ts`
- `purchaseProduct()` calls `getPackages()` (from **Current** offering), then finds a package with `identifier === "$rc_monthly"` or `"$rc_annual"` (or matching product identifier)
- If **no package is found** → throws:  
  `"Package or product $rc_monthly not found"` (or `$rc_annual`)

So if **Current** has no packages for Android, or the Android app’s products aren’t attached to those package IDs, **every** purchase attempt fails with “not found.”

**What to check in RevenueCat dashboard:**

- **Project** → **Offerings** → **Current** offering:
  - Contains packages with identifiers exactly: `$rc_monthly`, `$rc_annual` (names can differ).
- For **Android**:
  - Each of those packages must be tied to a **Google Play** product (product ID from Play Console).
  - App must be in sync: same **applicationId** / package name as in RevenueCat (e.g. `org.projectstarseed.soulschool` or your production id).
- **Products** in RevenueCat must match the **product IDs** you created in Google Play Console (subscriptions/in‑app products).

If you rename or re-create products in RevenueCat, ensure the **Current** offering is updated and that **Android** is selected for that offering with the correct Google Play products linked.

---

### 2. **RevenueCat Android API key**

- Key is in `src/core/config/revenueCatConfig.ts`:  
  `REVENUECAT_PUBLIC_SDK_KEY_ANDROID` (Google Play public API key from RevenueCat project).
- If the key is wrong, missing, or for a different project, RevenueCat may not initialize or may return no offerings → again, `getPackages()` is empty → “Package not found” on purchase.

When you “redo all the RevenueCat names and update to next exact,” make sure the **Android SDK key** in `revenueCatConfig.ts` is the one from the same RevenueCat project and the **Current** offering uses the new names/IDs.

---

### 3. **Initialization / timing**

- RevenueCat is initialized in `app/_layout.tsx` (or root) at app start.
- `useRevenueCat()` then runs `getPackages()` and exposes `packages` and `getProductPackage()`.
- If initialization fails on Android (e.g. wrong key, or store not ready), `packages` stay empty and every purchase fails as above.

Check in logs (or add temporary logging) that:

- RevenueCat initializes without throwing on Android.
- After init, `getPackages()` returns a non‑empty array on Android when the offering is correctly set up.

---

### 4. **Scholarship “issues” on Android**

- Scholarship path does **not** use RevenueCat: user selects The Seeker → **Enter Your Sacred Space** → **ScholarshipModal** → **Enter Energy Exchange** → `grantLifetimeAccess("scholarship")` + `router.replace("/(chakras)/EnergyExchange")`.
- If something “failed” on Android for scholarship, likely causes:
  - **Navigation:** `router.replace()` on Android can behave differently (stack / back). Test that after **Enter Energy Exchange** the user lands on **Energy Exchange** and can tap **Enter Path** to reach ChakraHub.
  - **Modal:** ScholarshipModal uses `presentationStyle="pageSheet"` (iOS); on Android it’s fullscreen. If the modal doesn’t close or the next screen doesn’t show, check for Android-specific navigation or overlay issues.

No RevenueCat change will fix scholarship; that path is client-side only. When you streamline RevenueCat, keep scholarship flow in mind for QA on Android.

---

## Checklist after you redo RevenueCat names

1. **RevenueCat dashboard**
   - **Current** offering has packages with identifiers `$rc_monthly` and `$rc_annual`.
   - For **Android**, both packages are linked to the correct **Google Play** product IDs.
   - Product IDs in RevenueCat match exactly what’s in Play Console.

2. **App config**
   - `revenueCatConfig.ts`: `REVENUECAT_PUBLIC_SDK_KEY_ANDROID` is the Google Play key for this project.
   - No typos in package identifiers in `src/services/revenuecat.ts` (`PACKAGE_IDENTIFIERS.MONTHLY` / `ANNUAL`).

3. **Runtime**
   - On Android, open paywall and (if you can) log or inspect:  
     `getProductPackage(PACKAGE_IDENTIFIERS.MONTHLY)` and `...ANNUAL` — both should be defined when RevenueCat and Current offering are correct.
   - If they’re undefined, fix dashboard/API key first; the in-app “payment options not available” handling will then only be a fallback.

---

## In-app defensive handling (this repo)

- **CommitmentGate** disables the main CTA while `isProcessing || revenueCatLoading`, so if RevenueCat is still loading, the user can’t tap and get a confusing error.
- When you’re ready, we can add an explicit check: if the user has selected monthly or annual and `getProductPackage(selected)` is `undefined`, show a short message like “Payment options are loading…” or “Payment options are not available right now. Try again later or use Restore Purchases,” and keep the button disabled until packages exist. That makes “all payment gates failed” on Android easier to interpret as “packages not available” rather than a generic purchase error.

Once RevenueCat is streamlined and the checklist above is done, we can re-test Android paywall and adjust any copy or error handling as needed.
