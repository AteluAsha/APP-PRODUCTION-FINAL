# Android touch responsiveness

## Emulator vs real device

Touch response on the **Android emulator** is often slower than on a **real device**. Input latency and frame timing differ in the emulator, so buttons can feel laggy even when the app is fine. Always confirm touch feel on a physical device before treating it as an app bug.

## What we tune

- **Pressable delay:** React Native’s `Pressable` uses an internal delay (on the order of ~130ms) before firing `onPressIn`, to avoid triggering during scroll. That can feel like lag on Android.
- **`ANDROID_PRESS_DELAY_MS`** in `constants/layout.ts` is set to `0` and used on primary buttons that are **not** inside a ScrollView (e.g. GlobalHomeButton, FloatingNavButtons). That gives immediate press feedback on those buttons.
- We do **not** set this on every Pressable; doing so can make scrollable lists trigger presses while scrolling.

## Where it’s applied

- `GlobalHomeButton` – chakra icon (top-right)
- `FloatingNavButtons` – Notes (leaf), Tribe Chat, Sanctuary (Anua) buttons

Other screens use `TOUCH.hitSlop` and `TOUCH.activeOpacity` from `constants/layout.ts` for hit area and visual feedback.

## If touch still feels slow on device

1. Confirm you’re testing a **release** or **release-like** build; dev builds can feel slower.
2. Check for heavy work on the JS thread (e.g. during press) that could block the UI.
3. Consider applying `delayPressIn={ANDROID_PRESS_DELAY_MS}` (with `Platform.OS === "android"`) only to other **standalone** primary buttons (not inside ScrollView/FlatList).
