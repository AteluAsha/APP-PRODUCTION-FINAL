# Restoration: Root Cause and Fixes (No New Designs)

## What Was Blocking All the Final Designs

**Root cause: NativeWind (Tailwind) `className` was not being compiled correctly.**

- **Evidence:** Tribe Chat works because it uses **StyleSheet** and **inline `style={}`** only (zero `className`). WaitingScreen, RevenueCatPaywall, ChakraTemplate, WelcomeModal, Anua chat, and others use **dozens of `className`** for layout and text color (e.g. `text-white`, `text-white/80`, `bg-black`). When those classes don’t compile, text and backgrounds can be invisible or wrong.
- **Cause:** In `babel.config.js`, the preset was changed from **`"nativewind/babel"`** (original) to **`nativewindBabelWrapper`**. The wrapper was added to avoid a worklets plugin error, but it (or its fallback path) can break how NativeWind compiles `className`, so styles never apply.

## Fixes Applied (Restore Only)

### 1. Babel restored to original (critical)

- **File:** `babel.config.js`
- **Change:** Restored the original config from git HEAD: preset **`"nativewind/babel"`** directly, no wrapper.
- **Why:** So `className` and Tailwind classes compile again app‑wide. This should restore:
  - WaitingScreen (countdown labels, “For Deepest Embodiment” text)
  - Paywall and CommitmentGate text/backgrounds
  - Chakras 101 and chakra day content (where they use `className`)
  - Anua chat styling
  - Any screen that relied on NativeWind for colors/layout.

If the build fails with a worklets-related error, we can add a minimal workaround that only stubs the worklets plugin and still uses `nativewind/babel` (no fallback config).

### 2. Soul School logo on RevenueCat paywall

- **File:** `components/chakras/RevenueCatPaywall.tsx`
- **Change:** Added the Soul School hero logo image above “Unlock Soul School Pro” in the header (same asset as CommitmentGate: `SoulSchool_HERO_Logo.png`), using inline `style` so it does not depend on `className`.
- **Why:** You reported the Soul School logo missing from the paywall. CommitmentGate already had the logo; RevenueCatPaywall did not. This restores a consistent paywall look.

## Why Tribe Chat Was a Clue

- Tribe Chat (**TribeChatContent**) uses **only StyleSheet and `style={}`** (no `className`).
- So it was unaffected when NativeWind compilation was broken.
- Other screens depend heavily on `className` for text color and layout; those broke.
- **Takeaway:** Restoring NativeWind (Babel) fixes the global styling break; we did not recreate designs.

## What You Should Do Next

1. **Clear caches and run iOS with a fresh bundle** (so the new Babel config is used):
   ```bash
   ./scripts/clear-and-run-ios.sh
   ```
   Or: stop Metro, then `rm -rf node_modules/.cache .expo`, then `npx expo run:ios`.

2. **Confirm:**
   - Splash → welcome (or ChakraHome with WelcomeModal) → date selection / waiting room.
   - WaitingScreen: countdown labels and “For Deepest Embodiment” text visible.
   - Paywall(s): Soul School logo and all text readable.
   - Chakras 101 and 7‑day chakra content: content and layout visible, not just icons.
   - Anua chat: designs and layout restored.

3. **If the build fails** (e.g. “react-native-worklets” or NativeWind error): tell me the exact error and we’ll add a minimal Babel fix that keeps `"nativewind/babel"` and only stubs the worklets plugin, without changing to the fallback config that broke styles.

## Not Done (Intentional)

- No new designs or new components.
- No wholesale rewrite of screens; only the root cause (Babel/NativeWind) and the missing paywall logo were fixed.
- Chakras 101, Anua chat, and Invite styling are expected to come back once `className` compiles again; if something is still wrong after a clean run, we can compare that screen to the last known good version (e.g. from git or backup) and restore only what changed.
