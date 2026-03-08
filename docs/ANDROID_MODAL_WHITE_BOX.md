# Android: White box when opening "Open Your Gift" (Goodbye → ChakraCardRevealModal)

## What you see

When tapping **Open Your Gift** (or the chakra card) on the Goodbye screen, a white or light grey curved shape can appear at the left edge of the screen (e.g. to the left of the hero affirmation). This is an **Android-only** artifact.

## Root cause (build / layering)

It is **not** a stray React view or a bug in GoodbyeModal. It comes from how React Native’s `<Modal>` works on Android:

1. **`transparent={true}`**  
   With a transparent Modal, React Native does **not** use a custom backdrop. The **first child** of the Modal must paint the entire modal surface. There is no separate “window background” prop that applies when `transparent` is true; the platform uses whatever the view hierarchy draws.

2. **Unpainted area = platform default**  
   Our first child was `GestureHandlerRootView` with only `flex: 1` and **no `backgroundColor`**. The next wrapper was `SafeAreaView` (with insets), also with no background. So:
   - The area **inside** the safe area was filled by the inner `View` with `backgroundColor: "rgba(0, 0, 0, 0.95)"`.
   - The area **outside** that (e.g. the left inset strip, or the modal window’s rounded corner) was never painted by our views.
   - On Android, unpainted regions of the modal window show the **platform default**, which is **white**. That’s the “weird white box” or curved strip.

So the bug is: **the modal’s root view (and SafeAreaView) had no background, so the Android modal window’s default (white) showed in the gaps.**

## Fix (correct, not “covering”)

- **Do not** try to “hide” it with an extra overlay or by moving content. That would be masking the cause.
- **Do** give the modal a defined surface from the root:
  - Set **`backgroundColor: "#000"`** (or your intended modal color) on:
    - The **first child of Modal** (e.g. `GestureHandlerRootView`), and
    - The **SafeAreaView** that wraps the content.
  - Then the whole modal window is painted by our views and the platform default never appears.

Applied in: `components/chakras/ChakraCardRevealModal.tsx` (root and SafeAreaView both have `backgroundColor: "#000"` on all platforms).

## Summary

| Item | Explanation |
|------|-------------|
| **Exact error** | Modal root (and SafeAreaView) had no `backgroundColor`; Android shows white in unpainted regions. |
| **Type** | Layering / view hierarchy: we didn’t define the modal surface, so the platform default showed. |
| **Fix** | Set explicit `backgroundColor` on the modal root and SafeAreaView so the surface is fully defined. |
