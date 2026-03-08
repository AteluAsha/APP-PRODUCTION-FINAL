# Android real device: 16 KB build first, then audio logic

## Why previous logic failed

The "Android App Compatibility" dialogs point to **native build issues**, not just app logic:

- **"This app isn't 16 KB compatible. ELF alignment check failed"**
- **"LOAD segment not aligned"** for: `libexpo-av.so`, `libhermes.so`, `libreactnative.so`, `librnscreens.so`, `libreanimated.so`, and others under `lib/arm64-v8a/`

When these native libraries load with wrong alignment on 16 KB page-size devices:

- **Hermes / React Native** can misbehave → blank screen, freezes after dev bypass.
- **expo-av** can misbehave → audio "took forever to load," crystal bowl freeze, two audios at once, "cannot turn it off."
- **React Native Screens / Reanimated** can misbehave → navigation and UI glitches.

**JavaScript-level fixes (e.g. awaiting stop+unload in AudioPlayer) cannot fix instability caused by misaligned native code.** Fix the build first, then keep the app-level audio fix so behavior is correct once the app runs stably.

---

## Current state

- Expo SDK 52, NDK 26.1.
- `android/gradle.properties` has `expo.useLegacyPackaging=true`.
- `android/app/build.gradle` uses it: `useLegacyPackaging (findProperty('expo.useLegacyPackaging')?.toBoolean() ?: false)`.
- After clean rebuild and reinstall, the compatibility dialog and issues still appear → legacy packaging may not be enough on this device/OS, or misaligned libs still cause subtle failures.

---

## Plan

### 1. Confirm legacy packaging is applied (quick check)

- Ensure `expo.useLegacyPackaging=true` is in `android/gradle.properties`.
- Clean Android build: remove `android/app/build`, `android/.cxx`, run `./gradlew clean` in `android/`, then `npx expo run:android`.
- Test on the same real device. If dialog and issues persist, proceed to (2).

### 2. Fix 16 KB compatibility properly (recommended)

Expo SDK 52 does not fully support 16 KB–aligned builds. Full support is in **Expo SDK 53+** (React Native 0.77) and more robust in **SDK 54+**.

- **Upgrade path:** Upgrade to **Expo SDK 53 or 54** (and related deps: React Native, react-native-reanimated, react-native-screens, expo-av, etc.), following Expo upgrade guide and Expo 16 KB issue notes.
- **Build config:** After upgrading, use NDK r28+ and AGP 8.5.1+. Set `expo.useLegacyPackaging=false` and do a clean build so native libs are 16 KB aligned.
- **Verification:** Confirm the compatibility dialog no longer appears and that blank screen, freezes, and audio issues are gone or greatly reduced.

References:

- https://developer.android.com/16kb-page-size
- https://github.com/expo/expo/issues/37440 (Expo 16 KB)
- Stack Overflow: "How to properly upgrade from Expo SDK 52 to 54 to meet the 16KB memory page requirement?"

### 3. Keep app-level audio single-owner fix (still required)

Once the app runs stably, ensure only one audio path owns playback.

- In **`app/AudioPlayer.tsx`**, in the `useFocusEffect` cleanup when the user leaves the screen:
  - Do **not** call `reset()` until the current track has been stopped and unloaded.
  - Run: capture `trackRef.current` → `await track.stopAsync()` → `await track.unloadAsync()` (try/catch) → then call `reset()`.
  - Use an async IIFE so the cleanup still returns a synchronous function.

This prevents embodiment continuing after leaving the player and prevents two audios when starting crystal bowl.

### 4. Optional: Crystal bowl freeze (after 1–3)

If, after fixing 16 KB and the AudioPlayer cleanup, crystal bowl still freezes, investigate Android-specific behavior in `src/utils/crystalBowlPlayback.ts` and long-audio handling.

---

## Summary

| Priority | What | Why |
|----------|------|-----|
| 1 | Verify legacy packaging + clean build; if issues persist → upgrade to Expo 53/54 and 16 KB–aligned build | Native "LOAD segment not aligned" explains freezes and audio bugs; JS logic cannot fix this. |
| 2 | AudioPlayer: await stop+unload before reset() in focus cleanup | Ensures single-audio ownership once the build is stable. |
| 3 | Re-test on real device after (1) and (2) | Confirm dialog gone or reduced and audio behavior correct. |

**Bottom line:** Treat the compatibility dialog as the main root cause. Fix the build (legacy packaging verified or upgrade to Expo 53/54), then keep the audio cleanup fix so playback logic is correct when the app runs correctly.
