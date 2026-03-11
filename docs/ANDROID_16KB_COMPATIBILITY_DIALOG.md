# Android 16 KB page size compatibility dialog

When running a **debuggable** build on some Android devices, the system may show a dialog titled **"Android App Compatibility"** that says the app is not 16 KB compatible and lists native libraries (e.g. `libreanimated.so`, `libhermes.so`) with "LOAD segment not aligned."

## What it is

- **System dialog:** This is shown by the Android platform, not by the app. The app cannot change its text, layout, or styling.
- **Debug-only:** The message states it appears because the app is debuggable and being tested. Production (release) builds may not show it, or it may be suppressed once the app and its native dependencies are 16 KB aligned.
- **Does not block features:** Functionality (e.g. profile photo upload) continues to work; the dialog is informational.

## What you can do

- **Dismiss:** Tap **OK** or **Don't Show Again** so it does not reappear during development.
- **For release:** Follow [Android 16 KB page size](https://developer.android.com/16kb-page-size) guidance to align native libs if required for target devices.

## Summary

The dialog is expected in debug and cannot be made "nicer" from app code. Use "Don't Show Again" during development; address 16 KB alignment for production if needed.
