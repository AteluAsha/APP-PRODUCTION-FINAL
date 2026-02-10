# Preload: auto-trigger (no popup)

## Decision

**No confirmation popup.** Preload is auto-triggered:

1. User selects the 7 chakras path (tap "Enter Path" on WelcomeScreen) → navigate straight to DateSelection.
2. User confirms date → lands on WaitingScreen.
3. When WaitingScreen mounts, preload starts automatically (first ~3 min of all audio). One-time guard so it runs only once. Done forever.

No modal, no "Preload?" / "Maybe later". Choosing the path is the intent; the actual download begins in the waiting room (low-usage / overnight).

## Implementation (done)

- **WelcomeScreen:** On "Enter Path" (trial) call `router.push("/(chakras)/DateSelection")` only. No modal.
- **WaitingScreen:** Run preload when `!getAudioPreloadStarted()`. Anyone who reaches the waiting room gets preload once. Guard lives in `src/utils/audioPreloadGuard.ts`.
- **Cleanup:** Removed unused `PreloadCourseMaterialsModal` and old preference helpers; only the one-time guard remains.

## Result

Path selection → Date selection → Waiting room → preload begins automatically. No extra step, no popup.
