# Lifetime Somatic Journey Button – Fix Plan

**Status: Executed**

## Problem

1. **Wrong flow:** Lifetime user taps "Select a start date" → selects date → is sent to the "root day goodbye screen" instead of the waiting screen
2. **Button states:** The bottom button should be:
   - **Before date selected:** "Select a start date" → opens DateSelection
   - **After date selected:** "Access course" → links to trial-by-date flow (ChakraHome with waiting/chakra stack)
3. **Lock mode:** After they select a date, they should see the waiting screen until the chosen Monday
4. **Return path:** Lifetime users have the top-right chakra icon (hamburger) to return to ChakraHub

---

## Root Cause

**Timegate service:** `shouldShowWaitingScreen` treats all lifetime users the same and always returns `false`, so they never see the waiting screen. When a lifetime user selects a date and lands on ChakraHome, they skip the waiting screen and go straight to the chakra stack.

```typescript
// timegate.ts - current (wrong for somatic journey)
if (hasLifetimeAccess) {
  return shouldShowLifetimeWaitingScreen() // always false
}
```

**Intended behavior:** For lifetime users who chose the somatic journey (ChakraHub → DateSelection → ChakraHome), use trial-style waiting logic so they see the waiting screen until the chosen Monday.

---

## Required Changes

### Phase 1: Waiting Screen for Lifetime Somatic Journey

**1a. Update `shouldShowWaitingScreen` in `src/services/timegate.ts`**

- Add optional `lifetimeChosenTimegateJourney?: boolean`
- When `hasLifetimeAccess && lifetimeChosenTimegateJourney` → use trial waiting logic (same as trials)
- When `hasLifetimeAccess && !lifetimeChosenTimegateJourney` → return false (normal lifetime)

**1b. Update ChakraHome's useEffect** (`components/chakras/ChakraHome.tsx`)

- Pass `lifetimeChosenTimegateJourney` into `shouldShowWaitingScreen`
- Call will look like:
  `shouldShowWaitingScreen(hasLifetimeAccess, hasReachedStartDate, isMonday, journeyStarted, isFirstLaunch, courseStartDate, lifetimeChosenTimegateJourney)`

**1c. Update timegate signature**

- Extend `shouldShowWaitingScreen` to accept the new parameter and branch on it

---

### Phase 2: ChakraHub Button States

**2a. Show "Access course" when a somatic journey is scheduled**

- **"Access course" when:** `courseStartDate` is set (user has chosen a date)
- **"Select a start date" when:** `courseStartDate` is null

**2b. Button actions**

| State       | Label                 | Action                                                                              |
| ----------- | --------------------- | ----------------------------------------------------------------------------------- |
| No date set | "Select a start date" | `setLifetimeChosenTimegateJourney(true)`, `router.push('/(chakras)/DateSelection')` |
| Date set    | "Access course"       | `setLifetimeChosenTimegateJourney(true)`, `router.replace('/(chakras)/ChakraHome')` |

**2c. ChakraHub changes** (`app/(chakras)/ChakraHub.tsx`)

- Subscribe to `courseStartDate` from `useChakraJourneyStore`
- Conditionally render label and `onPress` based on `courseStartDate`
- "Access course" should go to ChakraHome (trial-by-date flow)

---

### Phase 3: Dev Mode

**3a. Timegate dev override**

- In `shouldShowTrialWaitingScreen`, the dev override can bypass the waiting screen
- For lifetime somatic journey, we want waiting to apply even in dev (or keep existing trial dev logic when `lifetimeChosenTimegateJourney` is true)
- Ensure lifetime somatic journey uses the same trial logic path, so dev overrides behave consistently

---

## File Summary

| File                                | Changes                                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/services/timegate.ts`          | Add `lifetimeChosenTimegateJourney` and branch so lifetime somatic journey uses trial waiting logic |
| `components/chakras/ChakraHome.tsx` | Pass `lifetimeChosenTimegateJourney` into `shouldShowWaitingScreen`                                 |
| `app/(chakras)/ChakraHub.tsx`       | Button label and action driven by `courseStartDate`; "Access course" when date set                  |

---

## Flow After Implementation

| Step | User Action                 | Result                                           |
| ---- | --------------------------- | ------------------------------------------------ |
| 1    | Tap "Select a start date"   | → DateSelection                                  |
| 2    | Confirm date                | → ChakraHome (WaitingScreen until chosen Monday) |
| 3    | Wait until Monday           | → ChakraHome shows chakra stack (trial-by-date)  |
| 4    | Tap chakra icon (top right) | → ChakraHub                                      |
| 5    | On ChakraHub                | Button shows "Access course"                     |
| 6    | Tap "Access course"         | → ChakraHome (waiting or chakra stack)           |

---

## Clarification on "Root Day Goodbye Screen"

If the user still sees a goodbye-style screen after these changes, possible causes:

1. `completedChakra` persisting across navigations
2. Stale state causing GoodbyeModal to open on ChakraHome
3. A different screen being shown than intended

The main fix is ensuring the waiting screen is shown for lifetime somatic journey users instead of jumping to the chakra stack.
