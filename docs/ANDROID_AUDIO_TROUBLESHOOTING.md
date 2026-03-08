# Android Audio Troubleshooting

## Scratchy / glitchy / crash on all audio

If **all** audio on Android is scratchy, glitchy, or causes crashes, work through the following.

### 1. Emulator vs real device (most common)

The **Android emulator** is known for poor audio quality (crackling, echo, noise). This is often due to the emulator enabling microphone and audio output in a way that degrades playback, especially with certain host configurations.

- **First step:** Test on a **real Android device**. If audio is clean on device but bad in the emulator, the issue is the emulator, not app code.
- **Emulator workaround (optional):** Edit the AVD config (e.g. `~/.android/avd/<emulator_name>.avd/config.ini`) and set `hw.audioInput = no` and `hw.audioOutput = no` if you need to reduce emulator audio issues; note this disables emulator audio I/O.

#### Dev-only emulator audio tweaks (do not affect production)

When running in **development** on an **emulator or simulator** (not a physical device), the app applies optional workarounds to reduce load and improve stability:

- **Lighter progress updates:** Playback status is polled every 1000 ms instead of 500 ms, so the emulator does fewer callbacks (see `constants/emulator.ts`, `AudioPlayer`, `MusicRoomAudioManager`, `OtherOriginAudioManager`).
- **Slightly longer pre-play delay on Android:** 100 ms instead of 50 ms before creating the Sound on Android emulator, to let the audio session settle.

These paths are gated by `__DEV__` and `Constants.isDevice === false`. **Release builds and real devices never use them**; production behavior is unchanged.

### 2. Clean build (rule out cache / stale native code)

If the problem persists on a real device, or you suspect the build is not updating:

1. Stop Metro and any running Android build.
2. Clear caches and rebuild:
   - `npx expo start --clear` (Metro cache)
   - In `android/`: `./gradlew clean` (Gradle cache)
   - Delete `android/app/build` and `android/build` if present.
3. Rebuild and run with Metro so the app loads the latest bundle:
   - `npx expo run:android` (builds, installs, and starts Metro).

Always run the app with Metro connected so JS and native changes are reflected.

### 3. App audio configuration (already applied)

- **Android playback engine:** The app uses `androidImplementation: 'MediaPlayer'` when creating `Audio.Sound` on Android (expo-av). Expo defaults to ExoPlayer; MediaPlayer can be more stable for some formats and devices. All playback paths (AudioPlayer, OtherOriginAudioManager, MusicRoomAudioManager, SoundBath, DropInButton, ElevenLabs) set this on Android.
- **Audio mode:** `setAudioModeAsync` is called at app start and before playback with `playThroughEarpieceAndroid: false`, `shouldDuckAndroid: true`, and `InterruptionModeAndroid.DuckOthers`.

If you still see issues on a **real device** after a clean build, the next step is to capture a device log (e.g. `adb logcat`) during playback to check for native audio errors or crashes.
