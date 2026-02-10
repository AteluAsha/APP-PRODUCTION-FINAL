# Restoration: What Was Blocking the Hero Designs (No New Design Choices)

## What was reverted

All design changes that were added in previous sessions have been reverted so only restoration remains:

- **ChakraHome:** WelcomeModal is no longer rendered on top of WaitingScreen (back to original behavior).
- **WaitingScreen:** All added `style={{ color: ... }}` overrides removed; original class-based styling and the cyan “I will open on” design restored.
- **SplashScreenReveal:** Minimum display time back to 2 seconds (no 2.5s change).

No new design choices were introduced; only config/code that blocks the original designs was changed.

---

## Root cause: which Babel config was actually running

- **Preset in use:** `"nativewind/babel"` in `babel.config.js`.
- **What that does:** `nativewind/babel` is `require("react-native-css-interop/babel")`.
- **Resolution:** When that `require` runs from inside `node_modules/nativewind/`, Node resolves `"react-native-css-interop"` from **nativewind’s own `node_modules` first**, so it loads **nativewind/node_modules/react-native-css-interop** (v0.2.1), not the project’s top-level **react-native-css-interop** (v0.1.22).

So the app was not using the original, working Babel setup:

- **Nested (0.2.1):** Babel config includes `"react-native-worklets/plugin"` (Reanimated 4). That package isn’t in the project, so a stub was added and the chain kept running, but the **exact plugin order and behavior** are the nested package’s, which can differ from the original.
- **Top-level (0.1.22):** Babel config uses `"react-native-reanimated/plugin"` (Reanimated 3) and matches the original, production setup that had “perfect” display.

So the **global blocker** was: **the wrong (nested) react-native-css-interop Babel config was being used**, instead of the top-level one that corresponded to the hero designs.

---

## Restoration (hero config only)

### 1. `babel.config.js` – use top-level css-interop Babel

- **Before:** Preset `"nativewind/babel"` (which pulled in nested 0.2.1 and its worklets dependency).
- **After:** Preset list includes the **top-level** `react-native-css-interop/babel` plugins explicitly, so Babel no longer loads the nested package’s config:
  - `require("react-native-css-interop/babel")()` is called from the project root, so it resolves to **node_modules/react-native-css-interop** (0.1.22).
  - Its `plugins` (css-interop plugin, JSX transform with `importSource: "react-native-css-interop"`, and `react-native-reanimated/plugin`) are used as a preset.
- **Result:** Same Babel pipeline as the original working app: NativeWind/className compile via the top-level css-interop, Reanimated 3 plugin last, no worklets, no stub required for Babel.

### 2. `metro.config.js` – match initial commit

- **Removed:** `blockList` that excluded `7-chakras-master-path`.
- **Reason:** Initial commit had no blockList; reverted to that so Metro doesn’t block any path that might be needed for resolving or transforming styles/assets.

### 3. No design or UI code changed

- No new colors, layouts, or copy.
- No new components or flows.
- Only the **global** Babel/Metro setup was adjusted so the **existing** production designs and formatting can display again.

---

## What to do next

1. **Clear Metro cache and run** (no full native rebuild required if you prefer):
   - Stop Metro, then: `npx expo start --clear` (or your usual start command).
2. **Reload the app** and confirm:
   - Splash, welcome, date selection, waiting room, and chakra home all show the **original** layouts, typography, and colors (including the intended layering and clock styling).
3. **If anything still looks wrong:** The next place to check is that no other file or dependency is forcing the nested `react-native-css-interop` (or a different Babel/Metro path) into the build. The restoration above only fixes the Babel preset and Metro blockList.

---

## Summary

- **Blocker:** `"nativewind/babel"` caused the **nested** react-native-css-interop (0.2.1) Babel config to run instead of the **top-level** (0.1.22) one that matched the hero, production setup.
- **Restoration:** Use the top-level `react-native-css-interop/babel` plugins in `babel.config.js` and remove the Metro `blockList` so the original Babel/Metro behavior is restored. No design or content changes were made; only this global config was fixed.
