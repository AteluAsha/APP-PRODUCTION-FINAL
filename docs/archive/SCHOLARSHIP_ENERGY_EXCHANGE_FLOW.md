# Scholarship to Energy Exchange Flow

## Overview

This document describes the scholarship path and Energy Exchange screen flow. Scholarship recipients go to Energy Exchange (not AccessGrantedModal). Paid and restore flows use AccessGrantedModal.

---

## Scholarship Path

```
CommitmentGate (paywall)
  → User selects "Scholarship" and taps "Enter Your Sacred Space"
  → ScholarshipModal opens

ScholarshipModal
  → User enters reason and taps "Enter Energy Exchange"
  → handleScholarshipContinue: logScholarshipRequest, grantLifetimeAccess("scholarship")
  → onComplete() (closes paywall)
  → router.replace("/(chakras)/EnergyExchange")

Energy Exchange (full screen)
  → User sees: "You're in—your path awaits"
  → Options: Share Video, Leave Review, Write to Us, OR "Enter Path" (primary CTA)
  → Enter Path / Complete exchange → ChakraHub (lifetime access)
```

---

## Paid Path

```
CommitmentGate
  → User selects "Complete Sacred Path" and taps "Enter Your Sacred Space"
  → purchase(PRODUCT_IDS.YEARLY) via RevenueCat
  → grantLifetimeAccess("paid") (from useRevenueCat hook)
  → AccessGrantedModal (sage/charcoal design)
  → User taps "Enter Your Sacred Space" or "Continue Weekly Journey"
  → onComplete() + router.push("/(chakras)/ChakraHub")
```

---

## Restore Path

```
CommitmentGate
  → User taps "Restore Purchases"
  → restore() via RevenueCat
  → If hasEntitlement: AccessGrantedModal
  → User taps button → ChakraHub
  → If no entitlement: restoreError shown
```

---

## Energy Exchange Screen

- **Entry**: Scholarship path only (CommitmentGate → handleScholarshipContinue → router.replace)
- **Design**: Sage borders, LinearGradient background, calming palette
- **Primary CTA**: "Enter Path" (sage gradient) → ChakraHub
- **Optional exchanges**:
  - **Share Video**: VideoRecorderModal → onComplete when share succeeds → ChakraHub
  - **Leave Review**: Linking.openURL(REVIEW_URL) → ChakraHub
  - **Write to Us**: WriteToUsModal → onComplete when user taps Send → ChakraHub
- **Skip**: "Continue to App" → handleBack() → ChakraHub

---

## Key Files

| File                                        | Role                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `components/chakras/CommitmentGate.tsx`     | handleScholarshipContinue: onComplete + router.replace EnergyExchange |
| `components/chakras/AccessGrantedModal.tsx` | Paid/restore celebration (sage design)                                |
| `components/chakras/ScholarshipModal.tsx`   | Form; button "Enter Energy Exchange"                                  |
| `app/(chakras)/EnergyExchange.tsx`          | Full screen; Enter Path, exchange options                             |
| `components/chakras/VideoRecorderModal.tsx` | onComplete when share succeeds                                        |
| `components/chakras/WriteToUsModal.tsx`     | onComplete in handleSend                                              |

---

## RevenueCat Note

Scholarship path does **not** use RevenueCat. Access is granted client-side via `grantLifetimeAccess("scholarship")`. RevenueCat applies only to paid purchases and restore.
