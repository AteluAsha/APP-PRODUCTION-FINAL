# Final restoration: causes, status, disconnect, and fix

## What caused the issues (list)

1. **Babel pipeline change (root cause of faint text)**
   - **Hero:** Used `"nativewind/babel"` preset. That pipeline compiled `className` so that text and layout styles applied.
   - **Current:** We switched to `require("react-native-css-interop/babel")()` because `"nativewind/babel"` pulled in nested `react-native-css-interop@0.2.1`, which depends on `react-native-worklets/plugin` (Reanimated 4). The app uses Reanimated 3; the build failed.
   - **Effect:** With top-level css-interop, **dynamic** class names (e.g. from `textVariants({ font, size, className })` in `AppText`) are **not** compiled at build time. So any text that relied only on `className` for color got no style and rendered as default (faint/invisible).
   - **Resolved:** Yes. `AppText` now applies a **default style** `[{ color: "#ffffff" }, style]` so text is always visible. Screens that need another color (e.g. cyan) already pass `style={{ color: "..." }}`, which overrides the default.

2. **Splash and first-paint flow**
   - **Hero:** Hid native splash on mount so the custom hero logo was the first thing shown.
   - **Current (before fix):** Native splash was hidden only after the hero logo animation completed.
   - **Resolved:** Yes. Root layout again calls `SplashScreen.hideAsync()` on mount.

3. **Dev-only storage reset**
   - **Hero:** No reset of journey/first-launch storage on every dev run.
   - **Current (before fix):** A dev-only effect cleared `chakra-journey-storage` and `first-launch-storage`, so the app always looked like “first launch.”
   - **Resolved:** Yes. That effect was removed so state persists like hero.

4. **Welcome / date selection not shown first**
   - **Hero:** First launch showed welcome (date selection) then waiting room.
   - **Current (before fix):** Waiting screen could show without the welcome modal on top.
   - **Resolved:** Yes. ChakraHome renders both WaitingScreen and WelcomeModal when appropriate so the welcome/date flow appears first.

5. **App icon and splash assets**
   - **Hero:** `7chakras.png` (icon), `SoulSchool_HERO_Logo.png` (splash, imageWidth 300).
   - **Current (before fix):** Different paths (e.g. ChakraWheel, splash-blank).
   - **Resolved:** Yes. app.config.js was reverted to hero icon and splash paths.

6. **Metro blockList**
   - **Hero:** No blockList.
   - **Current (before fix):** blockList had been added for `7-chakras-master-path`.
   - **Resolved:** Yes. blockList removed so Metro matches hero.

---

## Have they been resolved?

| Cause                                  | Resolved | How                                                                                           |
| -------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| Babel / dynamic className → faint text | **Yes**  | Default `color: "#ffffff"` in AppText so text is visible even when NativeWind does not apply. |
| Splash hide timing                     | Yes      | hideAsync on mount in \_layout.                                                               |
| Dev storage reset                      | Yes      | Removed dev reset effect.                                                                     |
| Welcome-first flow                     | Yes      | WelcomeModal + WaitingScreen both rendered when needed.                                       |
| Icon/splash assets                     | Yes      | app.config.js uses 7chakras.png and SoulSchool_HERO_Logo.png.                                 |
| Metro blockList                        | Yes      | Removed.                                                                                      |

---

## What was still in conflict / disconnect

- **“You said it works but the app doesn’t render that way”**
  - **Disconnect:** Fixes were applied **only on WaitingScreen** (inline `style={{ color: "..." }}` on many AppText). The **same** issue (dynamic className, no applied color) affects **every** screen that uses AppText with only `className` for color. So in the real app, WelcomeModal, DateSelection, ChakraHub, ChakraTemplate, etc. could still show faint text.
  - **How it was checked before:** We had only verified WaitingScreen and/or assumed one screen was representative. We did not apply a single fix app-wide.
  - **Fix:** Instead of adding inline color in dozens of files, **AppText** now applies a default text color for all usages. One change restores visible text app-wide without changing any design.

- **Hero vs current Babel**
  - Hero used `"nativewind/babel"`. We cannot use that without resolving the worklets/Reanimated 4 conflict. So we are **not** on the exact hero Babel pipeline; we are on a compatible one (css-interop) plus a **reliable fallback** (default color in AppText) so the **result** matches hero (visible text, same layout and flow).

---

## What is working well (and how it was checked)

- **Config:** Babel uses top-level css-interop (no worklets). Metro has no blockList. Tailwind and globals.css match hero.
- **Paths:** tsconfig, .gitignore, .easignore do not block assets, hooks, or components.
- **Flow:** Splash → hide native on mount → hero logo → welcome/date selection → waiting room → Chakra home is restored in code (ChakraHome + \_layout).
- **Assets:** app.config points to 7chakras.png and SoulSchool_HERO_Logo.png; those files exist under assets/images.
- **Checked by:** Reading babel.config.js, metro.config.js, app.config.js, \_layout.tsx, ChakraHome.tsx, and AppText.tsx; verifying no blockList and correct asset paths; and confirming the default color fix in AppText.

---

## What we did not do (no new designs)

- No new layouts, colors, or copy.
- Only relinked/restored: Babel path, Metro, splash timing, dev reset removal, welcome-first rendering, icon/splash paths, and **one** reliability fix (default text color in AppText) so the existing design renders as intended.

---

## Final fix summary

1. **AppText** – `style={[{ color: "#ffffff" }, style]}` so every AppText has a visible default color; callers can still override with `style`.
2. **WaitingScreen** – Already had inline colors added earlier; they remain and work with the new default.
3. **Full clean iOS run** – Kill ports, clear caches and build dirs, then `npx expo run:ios` so the app runs with the above changes and a clean bundle.

After the clean rebuild, the skeleton (config, flow, assets, and default text visibility) matches the previous production state; the only intentional difference is the Babel preset (css-interop instead of nativewind/babel), with visibility guaranteed by AppText’s default color.
