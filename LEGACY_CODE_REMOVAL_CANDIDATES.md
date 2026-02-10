## Phase 1: Dev-only tools (safe to remove later)

1a. **Dev gallery + trigger**

- `components/dev/DevGallery.tsx`
- `components/dev/DevGalleryTrigger.tsx`
- Currently disabled (`return null`)
- Goal: Remove when final build is ready

**Implementation Notes:**

- Remove imports from `app/_layout.tsx` if present
- Confirm no dev-only routes are referenced

1b. **TrialTestFlow**

- `components/dev/TrialTestFlow.tsx`
- Rendered only in `__DEV__` (ChakraHome, WaitingScreen)
- Goal: Remove for production build

## Phase 2: Old audio placeholders / test assets

2a. **Placeholder audio outros**

- `constants/chakras/content.tsx`
- Shared outro files (`root-erin-1.mp3`, `root-ethan-1.mp3`)
- Goal: Replace with final assets or remove feature

## Phase 3: Debug-only logs and bypasses

3a. **Dev-only timegate bypass**

- `src/services/timegate.ts` (guards)
- Ensure `__DEV__` bypass does not ship to prod
- Goal: keep for dev, remove or hard-disable for prod if required

3b. **Verbose debug logging**

- `ChakraTemplate`, `AudioLibrary`, `audioDownload`, etc.
- Mostly `if (__DEV__) console.log(...)`
- Goal: prune in final polishing pass

## Phase 4: Temporary build workarounds

4a. **iOS build patches**

- Documented in `IOS_BUILD_FIX.md`
- Node_modules edits for `expo-application` / `expo-notifications`
- Goal: remove once Expo SDK packages align upstream

## Phase 5: Review before removal

5a. **Confirm no dependency**

- Verify no runtime calls from production flows
- Verify only dev paths or toggles
- Goal: avoid regressions

