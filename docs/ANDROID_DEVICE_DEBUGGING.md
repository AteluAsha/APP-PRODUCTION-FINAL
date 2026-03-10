# Android device visibility and "11+ only" clarification

## App supports Android 7.0+ (API 24), not "11+ only"

- **minSdkVersion** is **24** (Android 7.0) by default. See [android/build.gradle](android/build.gradle): `minSdkVersion` defaults to `'24'` when `android.minSdkVersion` is not set in `gradle.properties`.
- [android/gradle.properties](android/gradle.properties) does **not** set `android.minSdkVersion`, so the app is built for **Android 7.0+**.
- Any "only for Android 11+" message is not from this app's build (e.g. may be Play Store, system, or another app).

To require Android 11+ intentionally, set in `android/gradle.properties`:

```properties
android.minSdkVersion=30
```

## When the phone (e.g. Pixel 9 Pro XL) is not seen

`npx expo run:android` and device scripts use **ADB**. If the device does not appear in `adb devices`, the build system will never see it. This is a **connection/setup** issue, not the app's build config.

### Quick check

```bash
adb devices
```

- If the device appears as `device` (not `unauthorized`), Expo and scripts should see it.
- If it does **not** appear, fix connection (see below). No Gradle or code change will make the phone visible.

### Checklist: device not listed

| Cause | What to check |
|-------|----------------|
| **USB** | Cable supports data (not charge-only); USB debugging enabled in Developer options; "Allow USB debugging?" accepted for this computer; on Windows, correct USB driver. |
| **Wireless** | Device and Mac on same Wi‑Fi; Wireless debugging enabled (Android 11+); pair with `adb pair <IP:port>` then `adb connect <IP:port>`. |
| **ADB** | Run `adb kill-server` then `adb start-server` and `adb devices` again; try another USB port or cable. |
| **Android Studio** | Is the device visible in Device Manager / Running Devices? If not there either, the issue is connection/ADB. |

### References

- [Enable USB debugging](https://developer.android.com/studio/run/device.html#developer-device-options)
- [Wireless debugging (Android 11+)](https://developer.android.com/studio/command-line/adb#connect-to-a-device-over-wi-fi)
