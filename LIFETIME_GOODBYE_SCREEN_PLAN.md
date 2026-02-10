# Lifetime Goodbye Screen Plan

**Status: Implemented**

## Goal

When lifetime users click the complete box at the end of a chakra day, show the **Goodbye screen** (same as trials) instead of going straight to ChakraHub. When they close the Goodbye screen, return to ChakraHub (lifetime home).

The only difference between trial and lifetime in the Goodbye screen: the **clock/countdown copy** — for lifetime it teaches lunar/earth alignment but clarifies they are NOT locked out.

---

## Current Behavior

| User Type | Complete box tap | Result |
|-----------|------------------|--------|
| **Trial** | `navigateBack(true)` → `setCompletedChakra` → `router.back()` | ChakraHome → GoodbyeModal shows → Home → ChakraHome |
| **Lifetime** | Same flow | ChakraHub → No modal (goes straight to hub) |

**Root cause:** ChakraHub does not subscribe to `completedChakra` or render GoodbyeModal. ChakraHome does, but lifetime users go back to ChakraHub on `router.back()`.

---

## Required Changes

### Phase 1: Show GoodbyeModal for Lifetime Users

**1a. ChakraHub – Add GoodbyeModal and completion handling**

| Task | Details |
|------|---------|
| Subscribe to `useCompletedChakraStore` | `completedChakra`, `clearCompletedChakra` |
| Add `isModalVisible` state | Mirrors ChakraHome pattern |
| `useEffect` on `completedChakra` | When set → `setModalVisible(true)`, `markChakraCompleted(chakraDayIndex)` |
| `closeModal` | `setModalVisible(false)`, `clearCompletedChakra()` |
| Render `GoodbyeModal` | `isVisible={isModalVisible}`, `onClose={closeModal}`, `chakraDay={...}` |
| Pass `navigateToHubOnHome={false}` | So Home button only closes (we’re already on ChakraHub) |

**1b. GoodbyeModal – Handle “already on ChakraHub”**

| Task | Details |
|------|---------|
| Add prop `navigateToHubOnHome?: boolean` | Default `true` (ChakraHome behavior) |
| In `handleNavigateHome` when `hasLifetimeAccess` | If `navigateToHubOnHome` → `router.push('/(chakras)/ChakraHub')`; else → only `onClose()` |
| ChakraHome | Pass `navigateToHubOnHome={true}` (or omit, use default) |
| ChakraHub | Pass `navigateToHubOnHome={false}` |

**1c. ChakraTemplate – No change**

`navigateBack(true)` already sets `completedChakra` and calls `router.back()`. Lifetime users will land on ChakraHub, which will now show the modal.

---

### Phase 2: Clock Copy for Lifetime vs Trial

**2a. Show countdown for lifetime users**

| Current | Change |
|---------|--------|
| Countdown block: `{!hasLifetimeAccess && nextDay !== null && ...}` | Show for both trial and lifetime when `nextDay !== null` |

**2b. Different copy for the clock**

| User | Copy |
|------|------|
| **Trial** | `Opens at midnight: HH:MM:SS` (path unlocks at midnight) |
| **Lifetime** | `Aligns at midnight (lunar time) — you may continue anytime` or similar (informational, no lockout) |

**Implementation:** Add a conditional on `hasLifetimeAccess` for the clock text and optional subtitle.

**2c. Run countdown effect for lifetime**

| Current | Change |
|---------|--------|
| `if (!isVisible \|\| !nextDay \|\| hasLifetimeAccess) return` | Remove `hasLifetimeAccess` so the countdown runs for lifetime too |

---

## File Summary

| File | Changes |
|------|---------|
| `app/(chakras)/ChakraHub.tsx` | `useCompletedChakraStore`, `isModalVisible`, `useEffect`, `closeModal`, `GoodbyeModal` with `navigateToHubOnHome={false}` |
| `components/chakras/GoodbyeModal.tsx` | New prop `navigateToHubOnHome`, use it in `handleNavigateHome`; show countdown for lifetime with different copy; run countdown effect for lifetime |
| `components/chakras/ChakraHome.tsx` | Pass `navigateToHubOnHome={true}` (or rely on default) if needed for clarity |

---

## Flow After Implementation

| User | Complete box tap | Result |
|------|------------------|--------|
| **Trial** | Same as before | ChakraHome → GoodbyeModal (clock: “Opens at midnight”) → Home → ChakraHome |
| **Lifetime** | Same | ChakraHub → GoodbyeModal (clock: “Aligns at midnight — you may continue anytime”) → Home/Close → ChakraHub |

---

## Copy Suggestions for Lifetime Clock

- Option A: `Aligns at midnight (lunar time) — you may continue anytime`
- Option B: `Next path aligns at midnight — you’re always welcome to continue`
- Option C: `Keeps you aligned with lunar time and Earth — not a lockout`

Use whichever best fits the app’s tone.
