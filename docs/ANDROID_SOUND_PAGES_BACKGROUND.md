# Android: Exposed background on Sound Healing / Sound Frequency pages

## What you see

On Sound Bath (per-chakra tuning fork + crystal bowl) and Audio Library (Frequency of Gnosis), the dark/sound-healing background can end mid-screen on Android. Below that, a different image (e.g. blue water) or the default window shows.

## Root cause (not a “cover-up”)

**SoundBath (and any screen using the same pattern):**

- The screen wrapped scroll content in **ResponsiveImageBackground**, which sets its height from the image aspect ratio: `height = width / aspectRatio`. So it was a **fixed-height** layer, not full-screen.
- That layer ended at a fixed vertical position. Everything **below** it was outside the background view, so the host window or another underlying view showed through.
- So the bug was: **using a fixed-height background (ResponsiveImageBackground) instead of a full-bleed background**, which on Android made the “exposed” strip obvious.

**Fix (root-level):**

1. **SoundBath**
   - Removed the inner **ResponsiveImageBackground** so there is a **single** full-bleed `ImageBackground` for the whole screen.
   - Content is now: `ImageBackground` (full-bleed) → `SafeAreaView` → `View` (flex: 1) → `BackgroundOpacity` + `ScrollView`. The background no longer has a fixed height, so it doesn’t “end” and expose anything.
   - On Android, the root `ImageBackground` also uses `minHeight: Dimensions.get("window").height` so it always covers at least the full window.

2. **AudioLibrary (Frequency of Gnosis)**
   - Already used a single `ImageBackground` with `flex: 1`. On Android, added the same `minHeight: Dimensions.get("window").height` so the background is forced full-bleed and never exposes the window.

## Why previous “layer extensions” didn’t fix it

If only extra overlays or gradients were added without changing layout, the **underlying layout** was still a fixed-height background. The new layers could sit on top of that, but the **root cause** was the background view not filling the screen. Fixing that required:

- Removing the fixed-height wrapper (ResponsiveImageBackground) on SoundBath, and
- Ensuring the only background layer is full-bleed (flex + minHeight on Android).

## Summary

| Issue              | Cause                                      | Fix                                                                 |
|--------------------|--------------------------------------------|---------------------------------------------------------------------|
| Exposed background | Fixed-height ResponsiveImageBackground     | Single full-bleed ImageBackground; no inner ResponsiveImageBackground |
| Android gap        | flex: 1 sometimes not filling on Android   | minHeight: screen height on the root ImageBackground (both screens) |
