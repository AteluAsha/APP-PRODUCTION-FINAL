# APP1 & APP2 Comprehensive UX & Coding Audit Report

**Date:** January 30, 2026  
**Scope:** Cross-coding, UX consistency, end-to-end flows for Trial (APP1) and Lifetime (APP2)

---

## Executive Summary

The app implements a "Two Apps in One" architecture with clear separation via `hasLifetimeAccess`. The audit identified **one fix applied** (SocialSanctuaryModal CommunityHalls route) and **several observations** for consideration. Core flows are correctly gated.

---

## 1. Architecture Overview

| Mode | Home | Nav | Key Entry |
|------|------|-----|-----------|
| **APP1 (Trial)** | ChakraHome | FloatingNavButtons (Leaf, Anua) | WelcomeScreen → DateSelection → ChakraHome |
| **APP2 (Lifetime)** | ChakraHub | PermanentMenuBar (Music, Community, Gallery, Notes, Anua) | ChakraHub (after paywall/scholarship) |

**Mode Switch:** `hasLifetimeAccess` from `useChakraJourneyStore` (persisted). RevenueCat/scholarship grant updates this.

---

## 2. Cross-Coding & Conditional Logic

### ✅ Correctly Gated

| Component | APP1 Behavior | APP2 Behavior |
|-----------|---------------|---------------|
| **FloatingNavButtons** | Shows Leaf + Anua on chakra day screens | Returns `null` (early exit if `hasLifetimeAccess`) |
| **PermanentMenuBar** | Returns `null` (early exit if `!hasLifetimeAccess`) | Shows on ChakraHub and all healing screens |
| **ChakraHome redirect** | Stays (trial home) | Redirects to ChakraHub unless `lifetimeChosenTimegateJourney` |
| **ChakraHub** | Never reached (redirect from ChakraHome) | Home screen; shows Somatic Alignment button |
| **AudioLibrary** | Redirects to ChakraHome if `!hasLifetimeAccess` | Accessible from menu |
| **[chakra].tsx invalid** | Redirects to ChakraHome | Redirects to ChakraHub |
| **SoundBath back** | ChakraHome | ChakraHub |
| **EnergyExchange back** | ChakraHome | ChakraHub |
| **GoodbyeModal Home** | ChakraHome | ChakraHub (clears `lifetimeChosenTimegateJourney`) |

### ✅ Timegate Journey Flag

`lifetimeChosenTimegateJourney` (non-persisted) controls lifetime users re-entering the timegated flow:

- **Set `true`:** ChakraHub Somatic Alignment button → DateSelection
- **Cleared `false`:** DateSelection handleBack, GoodbyeModal handleNavigateHome, ChakraHome hamburger menu

---

## 3. Fixes Applied

### 3.1 SocialSanctuaryModal Community Route

- **Issue:** `router.push('/(chakras)/CommunityHalls')` — CommunityHalls is at app root, not under (chakras).
- **Fix:** Changed to `router.push('/CommunityHalls')`.

### 3.2 APP2 Pathway Selection → ChakraHub (No DateSelection)

- **Issue:** Lifetime users were routed WelcomeScreen → DateSelection → ChakraHome → redirect ChakraHub. DateSelection should never appear in the post-paywall opening flow.
- **Fix:** In WelcomeScreen `handleEnterPath`, when `hasLifetimeAccess` is true, navigate directly to ChakraHub. DateSelection is now **only** reachable for lifetime users via the Somatic Alignment button on ChakraHub.

---

## 4. APP1 (Trial) End-to-End Flow

```
Splash (Hero Logo) 
  → WelcomeScreen 
    → [Enter Path] → DateSelection 
      → [Back] → WelcomeScreen 
      → [Select Date, Confirm] → ChakraHome
        → WaitingScreen (if before Monday / journey not started)
          → [Learn About Chakras] → Chakras101 → Back → ChakraHome
          → [Invite Friend] → Modal
          → [Preview Journey] → PreviewJourney
        → Chakra Stack (when Monday + journey started)
          → Tap chakra → [chakra] screen 
            → HeadToHeart, SoundBath, etc.
            → GoodbyeModal on completion → ChakraHome
        → CommitmentGate (after Trial 1 or Trial 2 Sunday)
          → [Pay/Scholarship] → ChakraHub (APP2)
```

**Verification checklist (manual):**

- [ ] Splash shows, then WelcomeScreen
- [ ] DateSelection: back returns to WelcomeScreen
- [ ] DateSelection: confirm navigates to ChakraHome
- [ ] WaitingScreen shows before first Monday
- [ ] FloatingNavButtons (Leaf, Anua) show on chakra day screens, not on ChakraHome
- [ ] GlobalHomeButton shows on chakra screens (except Chakras101, etc.)
- [ ] Paywall appears after Trial 1 completion or Trial 2 Sunday

---

## 5. APP2 (Lifetime) End-to-End Flow

```
Paywall/Scholarship grant 
  → hasLifetimeAccess = true 
  → ChakraHub (or AccessGrantedModal → ChakraHub)

ChakraHub:
  - All chakras grid (tap → [chakra])
  - Sanctuary (Gallery, Community, Anua, Accountability)
  - Somatic Alignment button → DateSelection (timegate journey)
  - PermanentMenuBar (Music, Community, Gallery, Notes, Anua)

From ChakraHub:
  - Music → AudioLibrary
  - Community → CommunityHalls
  - Gallery → GalleryOfGnosis
  - Notes → NotesAlongTheWay
  - Anua → Sanctuary / Chat
  - Chakra ball → [chakra] screen
  - Somatic Alignment → DateSelection → ChakraHome (timegate mode)
```

**Lifetime user opening app (post-paywall):**

```
Splash → Pathway Selection (WelcomeScreen) → [Enter/Select 7 Chakras] → ChakraHub
(No DateSelection in this flow)
```

**Lifetime user choosing timegate journey (only path to DateSelection):**

```
ChakraHub → [Somatic Alignment button] → DateSelection → [Confirm] → ChakraHome (waiting/trial flow)
```

**Verification checklist (manual):**

- [ ] ChakraHub shows PermanentMenuBar with toggle
- [ ] Post-paywall: Splash → Pathway selection → ChakraHub (NO DateSelection)
- [ ] ChakraHub Somatic Alignment button is the ONLY path to DateSelection for lifetime users
- [ ] From ChakraHub Somatic Alignment → DateSelection → confirm: ChakraHome with waiting room / trial flow
- [ ] Hamburger on ChakraHome (timegate mode) returns to ChakraHub
- [ ] GoodbyeModal "Home" (lifetime) → ChakraHub

---

## 6. UX Observations (Non-Blocking)

### 6.1 APP2 Opening Flow (Fixed)

- **Correct flow:** Splash → Pathway Selection (WelcomeScreen) → ChakraHub. No DateSelection.
- **DateSelection for lifetime:** Only when tapping Somatic Alignment button on ChakraHub.

### 6.2 FloatingNavButtons Hide on ChakraHome

- **Current:** `isWaitingScreen` includes `pathname?.includes('ChakraHome')`, so FNB hides whenever on ChakraHome.
- **Impact:** Trial users on ChakraHome (with chakra stack) don’t see Leaf/Anua; they appear on chakra day screens.
- **Assessment:** Likely intentional; Leaf/Anua are for in-journey screens.

### 6.3 Chakras101 Back for Lifetime Users

- **Current:** Uses `router.back()` for lifetime users.
- **Assessment:** Correct when opened from ChakraHub via GlobalHomeButton.

---

## 7. Route Summary

| Route | APP1 | APP2 |
|-------|------|------|
| WelcomeScreen | Entry | Entry (then redirect) |
| DateSelection | Onboarding | Timegate journey start |
| ChakraHome | Trial home | Timegate journey only |
| ChakraHub | Never | Lifetime home |
| [chakra] | Trial days | All days |
| SoundBath | Yes | Yes |
| AudioLibrary | Redirect out | Yes |
| GalleryOfGnosis | Yes | Yes |
| Chakras101 | Yes | Yes |
| EnergyExchange | Scholarship flow | Yes |
| CommunityHalls | Via Sanctuary | Via menu |
| CommitmentGate | Trial paywall | Never |

---

## 8. Testing Recommendations

1. **APP1:** Fresh install → WelcomeScreen → DateSelection → confirm → WaitingScreen → Monday → chakra stack → complete day → GoodbyeModal → ChakraHome.
2. **APP2:** Grant scholarship/paywall → ChakraHub → verify menu bar, Somatic Alignment, and all menu routes.
3. **Timegate journey:** ChakraHub → Somatic Alignment → DateSelection → confirm → ChakraHome (waiting/trial) → complete day → GoodbyeModal → ChakraHub.
4. **Community route:** From Sanctuary (APP1 or APP2) → Community Halls → verify navigation.

---

## 9. Conclusion

- **Cross-coding:** Correctly isolated by `hasLifetimeAccess`; no mode bleed found.
- **Timegate flow:** `lifetimeChosenTimegateJourney` is set and cleared in the right places.
- **Fix:** SocialSanctuaryModal CommunityHalls route updated to `/CommunityHalls`.
- **Optional improvement:** Redirect returning lifetime users from WelcomeScreen to ChakraHub for faster re-entry.
