# Comprehensive Critical App Evaluation

**Why you're still seeing the broken experience (no splash, minimal “Welcome” with “Enter Path”, all info on one screen)**

---

## 1. What you're seeing vs what the code says

| What you see on device                                                                                                              | What the repo code does                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No Soul School logo splash (pulsing)                                                                                                | Root layout is written to show **SplashScreenReveal** first when `showHeroLogo === true`, then main app after `handleHeroLogoComplete`.                                                    |
| Minimal “Welcome” / “Soul School” / “Tap Enter Path → pick your date → Begin Your Journey → Waiting Room” / one “Enter Path” button | **That exact UI is not in the current codebase.** It was the old **placeholder** that used to live in `app/(chakras)/index.tsx`.                                                           |
| All info on one screen                                                                                                              | That’s the old single-screen placeholder. The intended flow is: **splash → ChakraHome → WelcomeModal** (multi-step: logo, date picker, confirmation, “Begin Your Journey”) → waiting room. |

So: the **source code in the repo** is set up for splash → ChakraHome → WelcomeModal. The **app on your device** is still running an **old bundle** that contains the removed placeholder and likely an older root layout that didn’t show the hero splash.

---

## 2. Root cause: stale bundle / cache

- **`app/(chakras)/index.tsx`** in the repo now only renders **`<ChakraHome />`**. There is no “Welcome”, “Tap Enter Path…”, or single “Enter Path” screen in that file.
- The screen you described matches the **previous** index that was replaced during the “minimal placeholder” period.
- So the JS bundle that’s running on the device/simulator was built from **old code** and is being reused (Metro cache, Expo cache, or an old native build).

Until that bundle is replaced with one built from **current** code, you will keep seeing:

- No (or wrong) splash
- The old one-screen “Welcome” placeholder
- “All the info on one screen”

---

## 3. Why splash might not show (even after cache fix)

In **`app/_layout.tsx`**:

1. **Native splash is hidden too early**  
   There is a `useEffect` that runs `SplashScreen.hideAsync()` on mount. That runs after the first React paint. If the first paint is the splash branch (`showHeroLogo === true`), you should still see SplashScreenReveal. But hiding the native splash immediately can create a brief “blank” moment or make it look like the splash never appears. **Recommendation:** Only call `SplashScreen.hideAsync()` when transitioning from hero splash to main app (e.g. in `handleHeroLogoComplete`), not in a generic `useEffect`.

2. **Heavy work on first frame**  
   Root layout uses `useFonts`, `usePreloadAssets` (many images/audio), and several `useEffect` hooks (audio, scholarship check, dev reset, RevenueCat, Sentry, community placeholders, anua cache, deep link). If any of these throws or blocks the main thread before the first paint, the splash branch might not render or might be skipped. The layout does not block rendering on `fontsLoaded` or `assetsReady` for showing the splash (it only uses `assetsReady` for SplashScreenReveal), so in principle the splash should still show first.

3. **Dev reset and first launch**  
   In dev, `resetDevStateIfNeeded` clears `first-launch-storage` and calls `resetForTesting()`, so `isFirstLaunch` is true again. That’s correct for showing WelcomeModal when index = ChakraHome. It does not explain the placeholder screen, which only exists in the old bundle.

---

## 4. Intended flow (current code)

1. **Splash**
   - Native splash (Expo/iOS) until we hide it.
   - Then **SplashScreenReveal** (Soul School logo, pulsing/breathing), then `onAnimationComplete` → `setShowHeroLogo(false)`.

2. **Welcome**
   - Root Stack shows `(chakras)` → (chakras) Stack shows **index** → index renders **ChakraHome**.
   - On first launch, ChakraHome opens **WelcomeModal** (hero logo, “Your Path Awaits”, date picker, confirmation modal, “Begin Your Journey”). That is the “beautiful welcome screen to open path”; it is **not** a single line of text and one button.

3. **After “Begin Your Journey”**
   - WelcomeModal closes, first launch is marked complete, ChakraHome shows **WaitingScreen** until the chosen Monday.

So: **splash (Soul School logo) → ChakraHome with WelcomeModal (multi-step welcome) → waiting room** is what the code is designed to do.

---

## 5. What’s wrong in code (summary)

| Issue                          | Severity              | Location           | Fix                                                                                                                                       |
| ------------------------------ | --------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Stale bundle / cache           | **Critical**          | Device/simulator   | Clear Metro cache, delete app, rebuild (see below).                                                                                       |
| Native splash hidden too early | High                  | `app/_layout.tsx`  | Remove `SplashScreen.hideAsync()` from the generic `useEffect`; call it only when leaving hero splash (e.g. in `handleHeroLogoComplete`). |
| Old placeholder UI             | N/A (removed in code) | Only in old bundle | Clearing cache and rebuilding replaces the bundle so the placeholder can’t show.                                                          |

No other file in the repo still renders the “Welcome” + “Tap Enter Path → …” + single “Enter Path” button screen; that was the old index placeholder.

---

## 6. Required steps to get the correct behavior

Do these in order:

1. **Stop Metro**  
   Stop the current Expo/Metro process (Ctrl+C or stop in IDE).

2. **Clear Metro / Expo caches**
   - From project root:  
     `npx expo start -c`  
     (the `-c` clears the Metro cache), or
   - Manually:  
      `rm -rf node_modules/.cache .expo`  
     then start again with `npx expo start` or `npx expo run:ios`.

3. **Remove the app from the simulator/device**
   - iOS Simulator: long-press app icon → Delete App.
   - This forces a fresh install so the new bundle and native code are used.

4. **Rebuild and run**
   - For a full native build:  
     `npx expo run:ios`
   - Or start with cache clear and open in Expo Go:  
     `npx expo start -c`  
     then scan/open the project and ensure “Reload” is used so the new bundle loads.

5. **Confirm the flow**
   - You should see: **Soul School logo splash (pulsing) → WelcomeModal (date selection, confirmation, “Begin Your Journey”) → Waiting room.**
   - If you still see the old one-screen “Welcome” + “Enter Path”, the device is still using an old bundle; repeat steps 1–4 and ensure no other Metro/Expo process or old build is serving the app.

---

## 7. Code change applied in this pass

- **`app/_layout.tsx`**
  - The `useEffect` that only called `SplashScreen.hideAsync()` has been removed.
  - Native splash is now hidden only when transitioning from hero splash to main app (inside `handleHeroLogoComplete`).
  - This keeps the native splash visible until we intentionally switch to the in-app hero splash, then to the main app, and avoids the splash “disappearing” or feeling like it never showed.

After a clean run (cache clear + delete app + rebuild), the app should open to the Soul School logo splash, then to the proper welcome (ChakraHome + WelcomeModal), with no single-screen placeholder.
