# Onboarding Fix – February 2026

## Root Cause

Users with **persisted `courseStartDate`** (from previous testing or old installs) were skipping WelcomeScreen and DateSelection entirely. A migration in `useChakraJourneyStore` auto-set `hasCompletedHeroOnboarding = true` whenever `courseStartDate` existed, so the app went straight to ChakraHome/WaitingScreen.

## Fixes Applied

### 1. Migration removed

**File:** `hooks/useChakraJourneyStore.ts`

The migration that set `hasCompletedHeroOnboarding = true` when `courseStartDate` existed has been removed. The flow is now:

**Splash → WelcomeScreen → DateSelection → Begin → ChakraHome (WaitingScreen)**

### 2. Reset onboarding (dev only)

**File:** `hooks/useChakraJourneyStore.ts`

- Added `resetOnboarding()` to clear onboarding state.
- Clears: `hasCompletedHeroOnboarding`, `courseStartDate`, `initialOpenDate`, `journeyStarted`, `journeyWeekStartDate`, `completedChakras`, `participatedDays`, `allChakrasCompleted`.

**File:** `components/dev/TrialTestFlow.tsx`

- Added **Reset onboarding** button (yellow arrow-undo icon) at the top of the dev button stack.
- Tapping it: clears onboarding state, resets first launch, navigates to WelcomeScreen.
- Use this in dev to re-test the full flow.

### 3. Dev tools kept

- **TrialTestFlow** remains in ChakraHome and WaitingScreen (dev only).
- **CaptureAll** remains for web dev (web + `__DEV__` only).
- No dev-only logic that changes production behavior.

## How to Test the Full Flow

### Option A: Clear caches and rebuild (recommended)

```bash
./CLEAR_ALL_CACHES_AND_REBUILD.sh
```

This script:

1. Kills Metro/Expo
2. Clears Watchman
3. Clears Metro, Expo, and iOS build caches
4. Uninstalls the app from the simulator (clears AsyncStorage)
5. Reinstalls CocoaPods
6. Runs a fresh build

### Option B: Use Reset onboarding (dev only)

1. Run the app in dev.
2. If you land on ChakraHome or WaitingScreen (stale data), use the **yellow arrow-undo** button in the dev button stack (top right).
3. You will be sent to WelcomeScreen and can go through the full flow again.

### Option C: Delete app from simulator

1. Long-press the app icon on the simulator.
2. Delete the app.
3. Run `npx expo run:ios` again.

## Expected Flow After Fix

1. **Splash** – Soul School hero logo
2. **WelcomeScreen** – Soul School header, OPEN PATHWAYS, Seven Chakras card, Enter Path button
3. **DateSelection** – Pick Monday, confirm, Begin Your Journey
4. **ChakraHome** – WaitingScreen (if before start date) or chakra stack

## DEV vs Production

- **TrialTestFlow** – Only rendered when `__DEV__` is true.
- **CaptureAll** – Only used when `Platform.OS === "web"` and `__DEV__`.
- **RevenueCat** – Disabled in `__DEV__` (expected).
- **resetOnboarding** – Dev-only action; not exposed in production builds.

Production builds do not include dev tools or bypasses.
