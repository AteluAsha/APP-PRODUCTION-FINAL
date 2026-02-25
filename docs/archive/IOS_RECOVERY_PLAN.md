# iOS Recovery Plan – Last Chance to Save the App

## Build Status: SUCCESS

**Verified just now:**

- ✅ TypeScript: passes (`npx tsc --noEmit`)
- ✅ Expo export: succeeds (`npx expo export --platform ios`)
- ✅ Native iOS build: **Build Succeeded** (0 errors, 4 warnings)
- ✅ App launches and runs (ChakraTemplate, Firebase, Anua logs confirmed)

## Critical Fix Applied

**ParallaxScrollView crash** – When `headerHeight` was 0 (from `useWindowDimensions()` before layout), Reanimated's `interpolate` received duplicate input values and crashed.  
**Fix:** `const h = Math.max(headerHeight, 1)` so interpolate always gets valid input.

## How to Run the App

1. **Simulator:**

   ```bash
   npx expo run:ios
   ```

   Keep Metro running. App installs and opens automatically.

2. **Physical device (Expo Go):**
   ```bash
   npx expo start
   ```
   Then tap "soul-school" in Expo Go, or scan the QR code. Device and Mac must be on the same Wi‑Fi.

## Non-Blocking Issues (Not Code)

- **Firebase Storage 404s:** Crystal bowl and tuning fork audio for Day 6 (Third Eye) are missing in Storage. App still runs; those files need to be uploaded.
- **"Could not connect to development server":** Metro isn’t running or the device can’t reach it. Start `npx expo start` and ensure the same Wi‑Fi.

## Files Changed This Session (Revert if Needed)

| File                                                | Purpose                                      |
| --------------------------------------------------- | -------------------------------------------- |
| `components/ParallaxScrollView.tsx`                 | Crash fix (h = Math.max(headerHeight, 1))    |
| `components/chakras/HeaderBackground.tsx`           | Hero image fix (explicit height, flex-start) |
| `components/chakras/ChakraTemplate.tsx`             | Passes height to HeaderBackground            |
| `app/(chakras)/ChakraHub.tsx`                       | DAY_INDEX_TO_CHAKRA_IMAGE, header redesign   |
| `components/chakras/GalleryOfGnosis/ChakraCard.tsx` | imageSource safety check                     |
| `app/_layout.tsx`                                   | Preload 3 more images                        |

**Revert all:**

```bash
git checkout -- components/ParallaxScrollView.tsx components/chakras/HeaderBackground.tsx components/chakras/ChakraTemplate.tsx app/\(chakras\)/ChakraHub.tsx components/chakras/GalleryOfGnosis/ChakraCard.tsx app/_layout.tsx
```

## Summary

The iOS build and app run successfully. If you still see "Could not connect to development server", start Metro with `npx expo start` and connect from your device. For simulator, use `npx expo run:ios`.
