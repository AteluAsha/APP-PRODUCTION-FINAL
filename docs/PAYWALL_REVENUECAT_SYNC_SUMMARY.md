# Paywall & RevenueCat Sync Summary

**Last updated:** From codebase state after App Store + Google Play + RevenueCat config updates.

---

## 1. RevenueCat configuration (app code)

| Item | Value | Notes |
|------|--------|------|
| **Entitlement** | `premium` | Single entitlement for full sanctuary access. Used for hasPro, restore, and status. |
| **Offering** | **Current** | `Purchases.getOfferings().current` — whatever is set as "Current" in the RevenueCat dashboard (e.g. default). No fixed offering id. |
| **SDK keys** | `revenueCatConfig.ts` | Android: `goog_...`, iOS: `appl_...`. Env override: `expoConfig.extra.revenuecat.apiKey`. |
| **Init** | `app/_layout.tsx` | `initializeRevenueCat(userId)` runs at app start after user is available. |

---

## 2. Package identifiers (RevenueCat dashboard)

The app uses **Package** identifiers from the Current offering so RevenueCat handles platform mapping:

| Option | Package identifier | Notes |
|--------|--------------------|------|
| **Monthly** (New Awakenings, $7/mo) | `$rc_monthly` | Resolves to correct store product on Apple/Google. |
| **Annual** (Full Sanctuary, $55/yr) | `$rc_annual` | Resolves to correct store product on Apple/Google. |
| **Lifetime** (optional) | `$rc_lifetime` | Only shown if present in Current offering. |
| **Scholarship** | Not in RevenueCat | Energy exchange bypass. |

- **Source:** `src/services/revenuecat.ts` — `PACKAGE_IDENTIFIERS.MONTHLY`, `PACKAGE_IDENTIFIERS.ANNUAL`, `PACKAGE_IDENTIFIERS.LIFETIME`.
- **Purchase flow:** `getPackages()` returns packages from **Current** offering. The app finds the package where `pkg.identifier === '$rc_monthly'` or `'$rc_annual'` and purchases that package. RevenueCat maps each package to the correct store product per platform; no hardcoded store product IDs in purchase logic.
- **Status label:** After purchase, `entitlement.productIdentifier` (store id) is mapped to "New Awakenings" / "Full Sanctuary" via `KNOWN_PRODUCT_IDS_FOR_LABEL` for display only.

---

## 3. Where the paywall appears

| Entry | Screen / component | When |
|-------|--------------------|------|
| **Trial end** | `CommitmentGate` (inside ChakraHome) | After trial 2 ends (or when `shouldShowCommitmentGate` is true). |
| **“Open Full Course”** | Hamburger → **Account** → “Open Full Course” | Trial only. Pushes `/(chakras)/Paywall`. |
| **“Upgrade to Lifetime”** | Hamburger → **Soul School** → “Upgrade to Lifetime” | Trial only. Pushes `/(chakras)/Paywall`. |
| **Paywall route** | `app/(chakras)/Paywall.tsx` | Renders `CommitmentGate` with back button. Used by both entry points above. |

- **CommitmentGate** shows: **Monthly Awakening** ($7/mo), **Full Sanctuary** ($55/yr, only if `yearlyPackage` exists), **Scholarship** (Energy Exchange free). Restore Purchases and success path use entitlement `premium`.
- **RevenueCatPaywall** (Monthly + Full Sanctuary + Lifetime cards) exists in code but is **not** used in the main app flow; the live paywall is CommitmentGate only.

---

## 4. Purchase and restore flow

- **Purchase:** User taps Monthly or Full Sanctuary → `purchase(PRODUCT_IDS.MONTHLY)` or `purchase(PRODUCT_IDS.YEARLY)` → RevenueCat finds the matching package by `product.identifier` → native sheet (Apple/Google) → on success, `info.entitlements.active[ENTITLEMENT_ID]` is set → app calls `grantLifetimeAccess("paid")` and shows AccessGrantedModal.
- **Restore:** Restore Purchases → `restorePurchases()` → app checks `info.entitlements.active[ENTITLEMENT_ID]` → if present, same success path (AccessGrantedModal); otherwise platform-specific “No purchases found” message.
- **Scholarship:** No RevenueCat call. User chooses Scholarship → ScholarshipModal → Energy Exchange → `grantLifetimeAccess("scholarship")` → ChakraHub. Option 3 is fully separate from RevenueCat.

---

## 5. Dashboard / store checklist (your side)

For everything to be synced and ready:

**RevenueCat dashboard**

- [ ] Entitlement **premium** exists and is attached to the correct products.
- [ ] Offering **ofrng2ffd88d786** exists and contains:
  - A package that maps to **monthly** (e.g. $rc_monthly) → store products `ss_monthly_7` (Google) and `prod46ac7140ca` (Apple).
  - A package that maps to **annual** (e.g. $rc_annual) → store products `ss_yearly_55` (Google) and `prod817dd44ada` (Apple).
- [ ] Default offering (or this offering) is set so the app can load packages.

**Google Play**

- [ ] In-app products (or subscriptions) with IDs **ss_monthly_7** and **ss_yearly_55** exist and are active.
- [ ] They are linked in RevenueCat to the correct offering/packages and to entitlement **premium**.

**App Store Connect**

- [ ] In-app purchases (subscriptions) with product IDs **prod46ac7140ca** (monthly) and **prod817dd44ada** (annual) exist and are approved.
- [ ] They are linked in RevenueCat to the same offering and to entitlement **premium**.

**App**

- [ ] No code change needed for “synced” beyond what’s already in repo: entitlement `premium`, offering ID `ofrng2ffd88d786`, and platform-specific product IDs above.

---

## 6. Status: are they synced and ready?

- **App code:** Yes. One entitlement (`premium`), one offering ID (`ofrng2ffd88d786`), platform-specific product IDs for monthly and annual, and all paywall/restore paths use the same RevenueCat APIs and entitlement check.
- **Stores + RevenueCat:** Synced and ready only if the dashboard and both stores are configured as in section 5. If any of those products or links are missing, purchases or restore can fail or packages may not load (e.g. Full Sanctuary card hidden if `yearlyPackage` is null).

**Quick test:** On a real device (iOS and Android), open the paywall (e.g. Account → “Open Full Course”), confirm both Monthly and Full Sanctuary options appear and show correct prices, then run a sandbox/test purchase and Restore Purchases. If both options appear and restore reflects the entitlement, the path is synced end-to-end.
