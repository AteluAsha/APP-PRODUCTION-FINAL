# App1 & App2 Full Flow Audit

**Scope:** All flows, pathways, buttons, UX; old code and conflicts removed.

---

## 1. App1 (Trial) Flow

| Step | Screen / Component | Entry / Action |
|------|--------------------|----------------|
| 1 | **WelcomeScreen** (index) | App open. Enter Path = card tap or PathSelectionGate. |
| 2 | **DateSelection** | Trial: pick date → confirm → "Begin Your Journey". |
| 3 | **ChakraHome** | Trial home. Shows WaitingScreen if before start date / not Monday. |
| 4 | **WaitingScreen** (inside ChakraHome) | Build Your Tribe, Preview Course, countdown. |
| 5 | **IntegratedProgressStack** (ChakraHome) | When Monday + start date reached: chakra stack, tap → [chakra]. |
| 6 | **[chakra]** → ChakraTemplate | Day content; complete → GoodbyeModal; Home → ChakraHome. |
| 7 | **SoundBath / Chakras101 / etc.** | From chakra or GlobalHomeButton. Back → ChakraHome. |
| 8 | **CommitmentGate** (paywall) | After 2 trials or conditions; on complete → ChakraHub. |

**App1-only UI:** FloatingNavButtons (Leaf = Notes, Anua = Sanctuary). GlobalHomeButton (chakra icon → Chakras101 or home). PathSelectionGate on welcome. No PermanentMenuBar.

---

## 2. App2 (Lifetime) Flow

| Step | Screen / Component | Entry / Action |
|------|--------------------|----------------|
| 1 | **ChakraHub** | After paywall/scholarship or Enter Path when hasLifetimeAccess. |
| 2 | **Chakra balls / Somatic Alignment** | Tap chakra → [chakra]. Somatic Alignment → DateSelection (timegate journey). |
| 3 | **DateSelection** (from ChakraHub) | Sets courseStartDate + lifetimeChosenTimegateJourney → ChakraHome. |
| 4 | **ChakraHome** (timegate journey) | Only when lifetimeChosenTimegateJourney; else redirect to ChakraHub. |
| 5 | **[chakra] / SoundBath / Gallery / etc.** | Back / Home → ChakraHub. GoodbyeModal Home → ChakraHub. |
| 6 | **PermanentMenuBar** | Music, Community, Gallery, Notes, Anua, Tribe. |

**App2-only UI:** PermanentMenuBar. No FloatingNavButtons. GlobalHomeButton → ChakraHub or Chakras101. ChakraHub hamburger = Profile.

---

## 3. Routing Guards (Verified)

| File | Guard | Status |
|------|-------|--------|
| ChakraHome (screen) | hasLifetimeAccess && !lifetimeChosenTimegateJourney → replace ChakraHub | OK |
| ChakraHub | !hasLifetimeAccess → replace ChakraHome; all hooks before return | Fixed |
| [chakra].tsx | Invalid chakra → replace ChakraHub or ChakraHome by hasLifetimeAccess | OK |
| SoundBath | Invalid chakra → replace ChakraHub or ChakraHome | OK |
| EnergyExchange | handleBack → ChakraHub or ChakraHome | OK |
| AudioLibrary | !hasLifetimeAccess → replace ChakraHome | OK |
| GalleryOfGnosis | handleBack: lifetime → ChakraHub; trial → back() | OK |
| ChakraTemplate | On complete → replace ChakraHub or ChakraHome | OK |
| GoodbyeModal | Home: navigateToHubOnHome ? ChakraHub : ChakraHome (and close) | OK |
| CommitmentGate | On complete → push ChakraHub (trial) or ChakraHome (fallback) | OK |

---

## 4. Fixes Applied

### 4.1 ChakraHub – Rules of Hooks
- **Issue:** useMemo and useFocusEffect were called after `if (!hasLifetimeAccess) return null`, so hooks ran conditionally.
- **Fix:** All hooks moved above the early return. useMemos return safe defaults (0, []) when !hasLifetimeAccess; useFocusEffect runs unconditionally. Early return `if (!hasLifetimeAccess) return null` kept after all hooks.

### 4.2 ChakraHub – Unused handler
- **Issue:** handleNavigateToChakras101 was never used (GlobalHomeButton handles Chakras 101).
- **Fix:** Removed handleNavigateToChakras101.

### 4.3 PaymentGate – Dead code
- **Issue:** PaymentGate.tsx was never imported; ChakraHome uses CommitmentGate only.
- **Fix:** Deleted `components/chakras/PaymentGate.tsx`.

### 4.4 EnergyExchange – Unused import
- **Issue:** Linking imported but not used.
- **Fix:** Removed Linking from imports.

---

## 5. Old Code & Conflicts – Summary

| Item | Action |
|------|--------|
| PaymentGate.tsx | Removed (unused; CommitmentGate used) |
| shareInvite (invite.ts) | Already deprecated; not used (share system uses openSystemShare + picker) |
| ChakraHub conditional hooks | Fixed (hooks before return) |
| handleNavigateToChakras101 | Removed (unused) |
| EnergyExchange Linking | Removed (unused) |

---

## 6. Button & Pathway Checklist

- **WelcomeScreen:** Enter Path (card + PathSelectionGate) → DateSelection or ChakraHub. OK.
- **DateSelection:** Back → back(); Begin Your Journey → ChakraHome. OK.
- **ChakraHome:** Paywall (CommitmentGate) when due; Goodbye/Home → ChakraHub when post-paywall. OK.
- **ChakraHub:** Back → back() or WelcomeScreen; Somatic Alignment → DateSelection; chakra balls → [chakra]. OK.
- **GoodbyeModal:** Home → ChakraHub (navigateToHubOnHome) or ChakraHome; Gallery, etc. OK.
- **CommitmentGate:** Purchase/scholarship complete → ChakraHub. OK.
- **GlobalHomeButton:** Hidden on welcome, date selection, paywall, Tribe, Chakras101, waiting. On home → Chakras101; else → ChakraHome or ChakraHub. OK.
- **FloatingNavButtons:** Hidden when hasLifetimeAccess; shown on trial chakra/day screens; hidden on welcome, waiting, paywall. OK.
- **PermanentMenuBar:** Shown only when hasLifetimeAccess; hidden on welcome, date selection, paywall, TribeChat. OK.

---

## 7. Remaining Dev-Only / Optional Cleanup

- **TrialTestFlow:** Rendered in __DEV__ only (ChakraHome, WaitingScreen). Leave for dev or remove for production.
- **DevPaywall:** Standalone route for testing CommitmentGate. Leave for dev.
- **LEGACY_CODE_REMOVAL_CANDIDATES.md:** Lists DevGallery, TrialTestFlow, placeholder audio, etc. Optional follow-up.

No further conflicts or flow issues identified in App1/App2 pathways or buttons.
