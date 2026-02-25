# Global imagery and layout fixes (no new designs)

Two app-wide causes were fixed so hero imagery and layout render again. No design changes—only relinking what was already there.

---

## 1. ParallaxScrollView: header image was hidden by content

**Cause:** The parallax header (hero background + chakra image) is in an `Animated.View` with **`zIndex: -1`**, so it renders _behind_ the scroll content. The scroll content had **no top spacer**, so it started at y=0 and sat on top of the header. The header was fully covered and looked like a black bar.

**Fix:** A **top spacer** `View` with `height: h` (header height) was added at the start of the scroll content. The first `h` pixels of the scroll are now transparent, so the header (behind) is visible. Content still starts at the same logical position below the header.

**File:** `components/ParallaxScrollView.tsx`  
**Effect:** All chakra detail pages (Root through Crown) that use `ChakraTemplate` + `ParallaxScrollView` now show the hero header image and chakra image again.

---

## 2. Image / ImageBackground: no size when only `className` was used

**Cause:** Many `Image` and `ImageBackground` components used only **`className`** (e.g. `w-32 h-32`, `w-full h-full`, `w-64 h-32`) for dimensions. With the current Babel setup, `className` on native components is not always applied. When it isn’t, those elements get no width/height and don’t display.

**Fix:** Explicit **`style`** with width/height (or `width: "100%"`, `height: "100%"` where appropriate) was added so images and backgrounds render regardless of `className`:

| Location                 | Change                                                                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chakras101**           | `ImageBackground`: `style={{ width: "100%", minHeight: 400, paddingBottom: 32 }}`. `Image` (7chakras): `style={{ alignSelf: "center", width: 128, height: 128, marginTop: 32 }}`. |
| **WelcomeModal**         | Hero logo `Image`: `style={{ width: 256, height: 128, marginBottom: 16 }}`.                                                                                                       |
| **DateSelection**        | Hero logo `Image`: `style={{ width: 256, height: 128, marginBottom: 16 }}`.                                                                                                       |
| **ChakraTemplate**       | Goodbye chakra `Image`: `style={{ width: 128, height: 128 }}`.                                                                                                                    |
| **ChakraCard** (Gallery) | Card `Image`: `style={{ width: "100%", height: "100%", borderRadius: 24 }}`.                                                                                                      |
| **YogaSection**          | Yoga logo `Image`: `style={{ width: 40, height: 40, alignSelf: "center", marginBottom: 8 }}`.                                                                                     |
| **AccessGrantedModal**   | 7chakras `Image`: `style={{ width: 96, height: 96 }}`.                                                                                                                            |
| **HeadToHeart**          | Meditation logo `Image`: `style={{ width: 48, height: 48, alignSelf: "center", marginTop: 40 }}`.                                                                                 |
| **ResponsiveImage**      | `resizeMode` moved from `style` to the `Image` prop so layout is correct.                                                                                                         |

**Effect:** Chakras 101, welcome/date screens, chakra detail hero and goodbye images, gallery cards, yoga/meditation logos, and responsive elements section now show their images.

---

## Summary

- **One layout fix:** ParallaxScrollView top spacer so the header is no longer covered (all 7 chakra pages).
- **One pattern fix:** Explicit dimensions on every critical `Image` / `ImageBackground` that previously relied only on `className`, so imagery shows even when NativeWind doesn’t apply to those components.

Re-run the app (e.g. `npx expo run:ios` or Metro + open on device) to confirm hero imagery and chakra pages render as before.
