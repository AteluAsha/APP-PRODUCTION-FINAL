# Android 16 KB Page Size Compatibility

## What you saw

On Android 15+ devices (e.g. Pixel 9), the system may show an **"Android App Compatibility"** dialog:

- **"This app isn't 16 KB compatible. ELF alignment check failed."**
- **"LOAD segment not aligned"** for native libraries under `lib/arm64-v8a/` (e.g. `libgesturehandler.so`, `libreanimated.so`, `libhermes.so`).

That happens because these devices use **16 KB memory pages**. Native `.so` files built with the older **4 KB** alignment fail the check. Misaligned libs can cause broken touch/gestures (e.g. buttons and pinch zoom not working).

## What we did (workaround)

In **`android/gradle.properties`** we set:

```properties
expo.useLegacyPackaging=true
```

This uses **legacy packaging** for native libraries so they are not subject to the 16 KB alignment requirement in the same way. The app can run on 16 KB devices without recompiling every dependency.

- **Trade-off:** Slightly larger install size (native libs are packaged in a way that can increase APK size).
- **No code or dependency upgrades required** for this workaround.

## Long-term fix (optional)

For a proper 16 KB–aligned build and smaller install size:

1. Upgrade to **Expo SDK 54+** and **React Native 0.81+** (and update native deps like Reanimated, Stripe, etc.).
2. Use **NDK r28+** and ensure **AGP 8.5.1+** (this project already uses AGP 8.6 from RN’s catalog).
3. After upgrading, set `expo.useLegacyPackaging=false` again and do a clean Android build.
4. Verify in Android Studio’s APK Analyzer that `.so` files show 16 KB alignment (or no alignment warning).

References:

- [Android 16 KB page size](https://developer.android.com/16kb-page-size)
- [Expo / 16 KB (e.g. GitHub issue #37440)](https://github.com/expo/expo/issues/37440)

## Clean build after changing packaging

After changing `expo.useLegacyPackaging` or when moving to the long-term fix:

```bash
cd android
./gradlew clean
cd ..
# Then build and run as usual, e.g.:
env -u CI npx expo run:android
```

Removing `android/app/build` and `android/.cxx` before building can also help avoid stale native artifacts.
