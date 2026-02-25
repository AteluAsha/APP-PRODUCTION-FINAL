# Investigation: Placeholder Welcome, No Splash, All Screens Broken

## What Was Found

### 1. Original (Perfect) Flow (from initial commit `ea10bb5`)

- **`app/(chakras)/index.tsx`** was a single line: it rendered **`<ChakraHome />`** only. There was no separate “welcome” route; the home screen **was** ChakraHome.
- **ChakraHome** contained the full experience:
  - **WelcomeModal** (date selection, “Begin Your Journey”) on first launch (`isFirstLaunch`)
  - **WaitingScreen** when not yet Monday / journey not started
  - Chakra stack, GoodbyeModal, CommitmentGate, etc.
- **Root `_layout.tsx`** showed SplashScreenReveal (hero logo), then after animation: ThemeProvider, GestureHandlerRootView, Stack with `(chakras)` only. No SafeAreaProvider/BottomSheetModalProvider at root (those lived in `(chakras)/_layout`).
- **(chakras)/\_layout** had SafeAreaProvider, GestureHandlerRootView, BottomSheetModalProvider, Stack with: **index**, ChakraHub, [chakra], SoundBath, HeadToHeart, Chakras101, etc. **No** WelcomeScreen or DateSelection routes.

So the intended flow was: **Splash (hero logo) → index (= ChakraHome) → WelcomeModal (date selection) → WaitingScreen / chakra journey**. All welcome/date logic lived inside ChakraHome via WelcomeModal.

### 2. What Changed (What Broke)

- **`index.tsx`** was replaced with a **minimal placeholder**: “Welcome”, “Soul School”, “Tap Enter Path → …”, and an “Enter Path” button that pushes to `/(chakras)/DateSelection`. So the app no longer opens into ChakraHome; it opens into this placeholder, then a standalone DateSelection screen, then ChakraHome.
- **WelcomeScreen** and **DateSelection** were added as separate routes. The “real” welcome (WelcomeModal inside ChakraHome) was bypassed; users now see the placeholder and a full-screen DateSelection instead of ChakraHome’s WelcomeModal.
- **Splash**: Root layout was later restored to use SplashScreenReveal and fonts/preload, but the **first screen** after splash is still the placeholder (index), so it feels like “no splash” or “splash then wrong screen” because the next screen isn’t the real welcome.

### 3. Why “All Screens Broken” / “Sizing Insane”

- The **placeholder index** uses raw `<Text>` and inline styles (no `AppText`, no `className`). So the first screen doesn’t rely on global fonts or NativeWind.
- **DateSelection** and most other screens use **AppText** (Instrument Sans) and **NativeWind** (`className`). If the app opens first into the placeholder and then navigates to DateSelection, the same root layout and (chakras) layout are in place, so fonts and NativeWind should still apply. The “sizing insane” and “missing wrappers” could be:
  - **Fonts not ready** when the main app first paints (root layout doesn’t block on `fontsLoaded` before showing the main Stack; it only waits for splash animation).
  - **Different structure**: Original flow kept users inside ChakraHome (one tree). New flow goes index → DateSelection → ChakraHome, so different screens mount in a different order; any layout or context that assumed “home = ChakraHome” could behave differently.
- No evidence was found that a **global wrapper** was removed; the current root layout actually has _more_ wrappers (SafeAreaProvider, BottomSheetModalProvider at root). So “missing wrappers” may refer to the **removal of the real home (ChakraHome)** and its internal structure (WelcomeModal, WaitingScreen, etc.), not a single missing provider.

### 4. Root Cause Summary

| Issue                                 | Cause                                                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| No splash / wrong first screen        | Splash may show, but first content is the placeholder index instead of ChakraHome.                                                                  |
| Placeholder instead of real welcome   | `index.tsx` was changed from `<ChakraHome />` to a minimal View + “Enter Path” → DateSelection.                                                     |
| Date selection / “all screens” broken | Entry flow was changed to placeholder → DateSelection → ChakraHome; original flow was index = ChakraHome with WelcomeModal and full layout.         |
| Sizing / wrappers “globally”          | Likely downstream of wrong entry (placeholder + different route order); original design had one home (ChakraHome) with consistent layout and fonts. |

## Fix Applied (Restore Original Code)

- **Restore `app/(chakras)/index.tsx`** to the original content from commit `ea10bb5`: render **`<ChakraHome />`** only. No placeholder, no redirect to DateSelection from index.
- This brings back: **Splash → ChakraHome → WelcomeModal (date selection on first launch) → WaitingScreen / chakra journey**. The “real” welcome is again the WelcomeModal inside ChakraHome, and all screens are again reached from that single home tree.

No rebuild or new architecture; this is a direct restoration of the original index component.
