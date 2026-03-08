# Emulator / Simulator Audio

Audio in iOS Simulator and Android Emulator is often poor (crackling, lag, cutouts). That’s a limitation of the emulators, not the app. **Real device is the source of truth for audio quality and flow.**

## Build safety

All emulator-specific tweaks are **dev-only** and **do not run in production**:

- They run only when `__DEV__ === true` **and** the app is not on a physical device (`Constants.isDevice === false`).
- Release builds have `__DEV__ === false`, so none of this code runs in the final app.

## What we do in dev on emulator

To make emulator testing a bit more stable (without changing real-device or production behavior):

1. **Lighter progress updates** – Playback status is requested every 1000 ms instead of 500 ms, so the emulator does fewer JS/native callbacks.
2. **Slightly longer pre-play delay on Android** – 100 ms instead of 50 ms before creating the Sound, to give the Android emulator audio session time to settle.

Implemented in:

- `constants/emulator.ts` – `isEmulatorOrSimulator()`
- `app/AudioPlayer.tsx` – progress interval and Android delay
- `components/audio/MusicRoomAudioManager.tsx` – progress interval
- `components/audio/OtherOriginAudioManager.tsx` – progress interval

## Testing tips

- **Flow and UI:** Use the emulator; accept that audio may be rough.
- **Audio quality and reliability:** Test on a **real device** (iOS and Android).
- **Android emulator:** If audio is unusable, you can disable it in the AVD config (`hw.audioInput = no`, `hw.audioOutput = no`) and use the emulator for non-audio flows only. See `docs/ANDROID_AUDIO_TROUBLESHOOTING.md`.
