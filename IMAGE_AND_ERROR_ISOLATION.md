# Image & Error Isolation – What Was Fixed

## Issue 1: Red Error Banner ("Error fetching tuning fork audio for thirdeye")
**Root cause:** Firebase Storage 404s (missing audio files) were logged with `console.error`, which triggers React Native's red LogBox overlay.

**Fix:**
- `useTuningForkAudio.ts` and `useCrystalBowlAudio.ts`: For 404/object-not-found errors, use `console.warn` instead of `console.error` (expected when files aren't in Storage).
- `_layout.tsx`: Added `LogBox.ignoreLogs()` to suppress these messages as a safety net.

## Issue 2: "Could not connect to development server"
**Root cause:** Metro (the dev server) is not running or the device cannot reach it. This is a dev-environment issue, not a code bug.

**Fix:** Keep Metro running:
```bash
npx expo start
```
Or use `npx expo run:ios` (starts Metro and simulator). Device and Mac must be on the same Wi-Fi.

## Issue 3: "Images show up then go away"
**Likely cause:** When the red error overlay appeared, it covered the screen. With the Firebase errors now suppressed, the overlay should not appear and the UI should remain visible.

If images still disappear, the app may be losing connection to Metro (see Issue 2) and attempting to reload, which fails when Metro is unreachable.
