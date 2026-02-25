# Resurrection: Fixes Applied to Restore Hero Working Flow

Using the comparison (hero = initial commit) and the restoration plan, these changes were applied to bring the app back to the hero working flow. No new design choices—only restoration of flow and config.

---

## 1. Welcome-first flow (ChakraHome)

**Issue:** When the app showed the waiting screen on first launch, it returned only `<WaitingScreen />`, so the welcome/date-selection step was never shown.

**Fix:** When `showWaitingScreen` is true, ChakraHome now renders both `<WaitingScreen />` and `<WelcomeModal />` (when `showWelcomeModal` is true). First-time users see the welcome modal on top, pick their date, then see the waiting room.

**Result:** Flow again matches hero: **Splash → Welcome (date selection) → Waiting room → Chakra home** when the course has started.

---

## 2. Hero splash behavior (app/\_layout.tsx)

**Issue:** Hero hid the native splash on mount so the custom hero logo was the first thing users saw. Current code only hid it when the hero animation completed, which could delay or change what appears first.

**Fix:** Restored a `useEffect` that runs on mount and calls `SplashScreen.hideAsync()`, so the native splash is hidden immediately and the custom SplashScreenReveal (hero logo) is the first visible screen.

**Result:** Same as hero: native splash goes away right away; users see the Soul School hero logo animation first.

---

## 3. Dev reset removed (app/\_layout.tsx)

**Issue:** In hero there was no dev-only reset. Current code cleared `chakra-journey-storage` and `first-launch-storage` on every dev run (when build id changed or `DEV_FORCE_TRIAL_HERO`), so first-launch and journey state did not persist like hero.

**Fix:** Removed the entire dev reset `useEffect`. Removed unused imports: `useFirstLaunchStore`, `AsyncStorage`, `Constants`.

**Result:** First-launch and journey state persist across app restarts in dev, matching hero. Users who have already completed welcome will not be forced back to first-launch every time.

---

## 4. Hero icon and splash in app.config.js

**Issue:** app.config pointed at different assets (ChakraWheel, splash-blank) than hero (7chakras.png, SoulSchool_HERO_Logo with imageWidth 300). That could make native splash/icon look wrong or missing.

**Fix:** Restored hero assets in `app.config.js`:

- **icon:** `./assets/images/7chakras.png` (main, iOS, and Android adaptive icon).
- **splash:** `./assets/images/SoulSchool_HERO_Logo.png` with `backgroundColor: "#000000"`, `resizeMode: "contain"`, `imageWidth: 300`.
- **expo-splash-screen plugin:** Same splash image and options.

**Result:** Native splash and app icon use the same assets as hero. Ensure `7chakras.png` and `SoulSchool_HERO_Logo.png` exist under `assets/images/`.

---

## Already in place (from earlier work)

- **Babel:** Uses top-level `react-native-css-interop/babel` so NativeWind/className compile correctly and the nested worklets dependency is avoided.
- **Metro:** No blockList; matches hero. `globals.css` and Tailwind unchanged.
- **No design overrides:** WaitingScreen and other screens keep their original class-based styling and designs; no new inline color overrides were added in this resurrection.

---

## How to verify

1. **Clean install (or clear app data)** so first-launch and journey state are fresh.
2. **Open the app.** You should see:
   - Native splash disappear quickly.
   - Custom hero logo (Soul School) for ~2 seconds.
   - Then welcome modal (date selection) on top.
   - After completing welcome, waiting room with countdown.
   - When the course has started (e.g. Monday of chosen week), Chakra home with the 7 chakras.
3. **Close and reopen (dev).** Welcome should not show again; journey and first-launch state should persist.
4. **Check styling.** Text and layouts should match your production designs (className / NativeWind applying as intended).

If you want to test “first launch” again without uninstalling, you can temporarily add back a one-off dev reset behind a flag (e.g. `RESTORE_FIRST_LAUNCH=true`) and use it only when you need to simulate a new user.

---

This set of fixes is the **final resurrection** applied from the comparison and hero state: welcome-first flow, hero splash behavior, persisted state, and hero icon/splash assets, with Babel already fixed for styling.
