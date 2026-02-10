# Flow system test: Splash → Welcome → Date selection → Waiting room → Chakra home

**Run this after a clean install or after clearing app data to verify the full path.**

## Expected flow

1. **Open the app**
   - **Splash screen** (Soul School hero logo) shows for at least 2.5 seconds, then fades out.

2. **First launch**
   - **Welcome modal** appears on top (welcome copy + date picker / “Enter path”).
   - Behind it you may see the **waiting room** (countdown, “I will open on Monday…”).
   - Text should be **clearly visible** (white/light on dark), including “For Deepest Embodiment”, “Build Your Tribe”, DAYS/HOURS/MINS/SECS, and body copy.

3. **Enter path**
   - User picks a start date in the welcome modal and continues.
   - Modal closes; **waiting room** is fully visible with countdown and actions.

4. **Chakra home**
   - When the course has started (e.g. Monday of the chosen week), user can proceed to **Chakra home** with the 7 chakras.
   - Tapping a chakra opens the **7-day chakra pages** as designed.

## If splash or welcome don’t appear

- **Splash**
  - Native splash is kept with `SplashScreen.preventAutoHideAsync()` and is only hidden in `handleHeroLogoComplete` after the custom splash animation.
  - If you still don’t see it, do a **full cache clear and rebuild** so the bundle isn’t stale:
    - Stop Metro, then run: `./scripts/clear-and-run-ios.sh`
  - On simulator, **delete the app** and run again so the new bundle and native code are used.

- **Welcome modal**
  - It is shown when `showWelcomeModal` is true (driven by `isFirstLaunch`).
  - It is now rendered **on top of the waiting screen** when ChakraHome shows the waiting screen, so the welcome/date selection step is never skipped on first launch.
  - In **dev**, the root layout resets first-launch and journey storage when the build id changes (or when `DEV_FORCE_TRIAL_HERO` is true) so the first-launch flow is testable.
  - If the modal still doesn’t appear, **delete the app** on the simulator (to clear AsyncStorage) and reinstall/run again.

## If text is still dim or invisible

- **WaitingScreen** has explicit `style={{ color: '...' }}` on critical text (countdown labels, “For Deepest Embodiment”, “Build Your Tribe”, “I will open on…”, titles) so they stay visible even if NativeWind `className` doesn’t apply.
- **Babel** must use the `"nativewind/babel"` preset (see `babel.config.js` and `APP_WIDE_STYLING_AUDIT.md`). After any Babel or styling change, run the clear-and-rebuild script and re-test.

## Quick checklist

- [ ] Splash (hero logo) visible for ≥ 2.5s on cold start
- [ ] Welcome modal appears on first launch (on top of waiting screen)
- [ ] Date selection / “Enter path” works from welcome
- [ ] Waiting room shows with readable text (countdown, embodiment copy, buttons)
- [ ] From waiting room, can reach Chakra home and 7-day chakra pages when the course has started
