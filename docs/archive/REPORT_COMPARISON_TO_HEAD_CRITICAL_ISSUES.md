# Report: Comparison to Last Committed State (HEAD) — Critical Issues

**Scope:** Find the change(s) that affected the entire app layout (images not loading, buttons not loading).  
**Baseline:** Git HEAD = initial commit `ea10bb5` (Dec 31, 2025). There is no “3 days ago” commit; this compares **current working tree** to **HEAD** only.  
**Action:** No code changes were made; this is the report only.

---

## 1. Files That Can Affect the Entire App (Layout / Build)

Compared:

- `app/_layout.tsx` — root layout, fonts, preload, splash, app shell
- `app/(chakras)/_layout.tsx` — (chakras) stack and providers
- `app/(chakras)/index.tsx` — first screen (already restored to ChakraHome)
- `babel.config.js` — NativeWind / Babel (affects all `className` styling)
- `metro.config.js` — bundler
- `components/SplashScreenReveal.tsx` — splash transition

---

## 2. Critical Finding #1 — Babel / NativeWind (Highest Priority)

**File:** `babel.config.js`

**HEAD (original):**

- Presets: `["babel-preset-expo", { jsxImportSource: "nativewind" }]`, **`"nativewind/babel"`**
- Plugins: `"react-native-reanimated/plugin"`

**Current:**

- Presets: same Expo preset, but **`nativewindBabelWrapper`** instead of `"nativewind/babel"`
- The wrapper:
  - Patches `Module.prototype.require` to stub `react-native-worklets/plugin`
  - Calls `require("nativewind/babel")` and filters out worklets from the result
  - On any error, uses a **fallback** config: only `react-native-css-interop` babel plugin + `@babel/plugin-transform-react-jsx` with `importSource: "react-native-css-interop"`

**Why this can break the whole app:**

- If the wrapper throws or the fallback is used, the Babel pipeline for NativeWind may not match the original `nativewind/babel` behavior.
- **All screens use `className` (Tailwind/NativeWind).** If `className` is not compiled or applied correctly app-wide, you get:
  - Wrong or missing layout/sizing
  - “Buttons not loading” (buttons may render with zero size or wrong styles)
  - “Images not loading” (container styles can collapse or hide images)

**Conclusion:** The Babel change is the **single most likely cause of app-wide layout and styling breakage**. Restoring direct `"nativewind/babel"` (and only adding a workaround if worklets actually error) should be tried first.

---

## 3. Critical Finding #2 — Root Layout Image Preload List

**File:** `app/_layout.tsx`

**HEAD (original) preloaded many images**, including:

- Chakra assets: root, sacral, solar, heart, throat, thirdeye, crown
- Header chakra: muladhara, svadhisthana, manipura, anahata, vishuddha, ajna, sahasrara
- Location assets: rootlocation, sacrallocation, solarlocation, heartlocation, throatlocation, thirdeyelocation, crownlocation
- Headers: 1header–7header, 5header.jpeg
- Elements: elementsroot, elementssacral, elementssolar, elementsheart, elementsthroat, elementsthirdeye, elementscrown
- Shared: 7chakras, yoga-logo, rootyogapose, part2bg, soundhealingbg, chakraman, colorbar, meditationlogotemp, ibelong, heartoutline

**Current** preloads only **9 images**:

- root, sacral, solar, heart, throat, thirdeye, crown, 1header, SoulSchool_HERO_Logo

**Why this can cause “images not loading”:**

- Screens that use the removed images (e.g. `2header.png`, `3header.png`, elements, locations) are no longer pre-cached at startup.
- On first visit or under load, those images can load late, fail, or appear as blank if there are timing/network/cache issues.
- So **images not loading** can be partly explained by the **large reduction in preloaded images** in the root layout.

**Conclusion:** Restoring the full image preload list from HEAD in `app/_layout.tsx` is recommended to match original behavior and reduce “images not loading.”

---

## 4. Critical Finding #3 — Root Layout Structure (Wrappers + Overlay)

**File:** `app/_layout.tsx`

**HEAD (original) main app tree:**

- `ThemeProvider` → `GestureHandlerRootView` → `View (flex:1, bg black)` → `Animated.View` → **Stack** (screens only) + **StatusBar**
- No SafeAreaProvider or BottomSheetModalProvider at root.
- No overlay View, no PermanentMenuBar, FloatingNavButtons, GlobalHomeButton, GlobalAnuaChat, PathSelectionGate, ProfileSheet in the root layout.

**Current main app tree:**

- `ThemeProvider` → **SafeAreaProvider** → **GestureHandlerRootView** → **BottomSheetModalProvider** → `View (styles.root)` → `Animated.View` → **Stack** + **View (absoluteFillObject, pointerEvents="box-none")** containing:
  - MusicRoomAudioManager
  - PermanentMenuBar
  - FloatingNavButtons
  - GlobalHomeButton
  - GlobalAnuaChat
- Plus **PathSelectionGate** and **ProfileSheet** as siblings.

**Why this can cause “buttons not loading” / layout issues:**

- The overlay View is `StyleSheet.absoluteFillObject` and sits on top of the Stack. If any child (e.g. PermanentMenuBar, FloatingNavButtons) has incorrect dimensions, zIndex, or pointer events, it can:
  - Cover screen content and block touches (buttons seem not to work).
  - Affect layout of the rest of the app if they participate in layout.
- Adding SafeAreaProvider/BottomSheetModalProvider at root can change layout/safe areas for every screen.

**Conclusion:** The **addition of the overlay and extra root wrappers** is a plausible contributor to “buttons not loading” or layout problems. If reverting Babel and preload does not fix everything, reverting the root layout to the HEAD structure (no root SafeAreaProvider/BottomSheetModalProvider, no overlay in `_layout`) is the next step, then re-adding only what’s strictly needed elsewhere (e.g. in (chakras) layout or per-screen).

---

## 5. Other Compared Files (Summary)

| File                                  | HEAD vs current                                                                                                                                            | Impact on “entire app” layout                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **app/(chakras)/\_layout.tsx**        | Current adds Stack.Screen entries: WelcomeScreen, ChakraHome, TribeChat, DevPaywall, DateSelection, CoursePreview, AudioLibrary, NotesAlongTheWay, Donate. | Low for layout; mainly adds routes.                                                                           |
| **app/(chakras)/index.tsx**           | Effectively same (ChakraHome); only comment added.                                                                                                         | None.                                                                                                         |
| **metro.config.js**                   | Current adds `blockList` for `7-chakras-master-path`.                                                                                                      | Unlikely to affect layout.                                                                                    |
| **components/SplashScreenReveal.tsx** | Current: breathing animation, 2s/5s timeouts, then fade out and onAnimationComplete. HEAD: single sequence (scale up, hold, fade out) then callback.       | Both call onAnimationComplete; timing differs but app does transition. Unlikely root cause of images/buttons. |

---

## 6. Recommended Order of Fixes (After You Approve)

1. **Revert Babel to use `"nativewind/babel"`** (and only add a minimal worklets workaround if you actually see a runtime error). This is the top candidate for app-wide layout/buttons/images.
2. **Restore the full image preload list** in `app/_layout.tsx` from HEAD to address “images not loading.”
3. If issues remain, **revert root layout** to HEAD’s simpler structure (no root SafeAreaProvider/BottomSheetModalProvider, no overlay in `_layout`), and reintroduce overlays/providers only where necessary (e.g. (chakras) layout or specific screens).

---

## 7. Note on “3 Days Ago”

- There is **only one commit** in the repo: `ea10bb5` (Dec 31, 2025).
- So “code from 3 days ago” could not be compared to another commit; this report compares **current working tree vs that single committed state (HEAD)**.
- If the “perfected and locked” state exists only locally (e.g. in another branch or before uncommitted changes), the same comparison method can be used against that state by checking out or diffing to that ref/patch.

No code was changed; this report is for review before applying any fixes.
