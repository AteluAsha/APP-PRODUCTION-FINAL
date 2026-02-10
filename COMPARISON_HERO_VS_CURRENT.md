# Thorough Comparison: Hero (Initial Commit / 3 Days Ago) vs Current

**Reference:** `ea10bb5` (Initial commit – treated as “3 days ago” hero state)  
**Current:** Working tree as of this report  
**Scope:** 199 files changed. Below is section-by-section with connections and areas of concern.

---

## 1. GLOBAL CONFIG (app-wide build & style)

### 1.1 `babel.config.js`

| Aspect | Hero (3 days ago) | Current | Notes |
|--------|-------------------|---------|------|
| Presets | `["babel-preset-expo", { jsxImportSource: "nativewind" }]`, `"nativewind/babel"` | Same preset list, but second preset is `{ plugins: cssInteropBabel.plugins }` from `require("react-native-css-interop/babel")()` | **CHANGED.** Current forces top-level react-native-css-interop (0.1.22) so Babel no longer loads nested nativewind’s css-interop (0.2.1) and avoids `react-native-worklets/plugin`. |
| Plugins | `["react-native-reanimated/plugin"]` | `[]` | Reanimated is now only inside `cssInteropBabel.plugins` (still last there). |

**Connection:** Babel runs on every JS/TS/TSx file. This is the main place that compiles `className` (NativeWind). Wrong preset/plugins = styles can fail app-wide.

---

### 1.2 `metro.config.js`

| Aspect | Hero | Current | Notes |
|--------|------|---------|------|
| Content | `getDefaultConfig(__dirname, { isCSSEnabled: true })`, SVG transformer, `withNativeWind(config, { input: "./globals.css" })` | **Identical** (no blockList in hero; blockList was removed in current) | **MATCH.** No diff vs hero. |

**Connection:** Metro decides which transformer runs and how CSS is resolved. Unchanged from hero.

---

### 1.3 `tailwind.config.js`

| Aspect | Hero | Current | Notes |
|--------|------|---------|------|
| content, presets, theme | Same | Same | **MATCH.** No diff. |

---

### 1.4 `globals.css`

| Aspect | Hero | Current | Notes |
|--------|------|---------|------|
| Content | `@tailwind base;` `components;` `utilities;` | Same | **MATCH.** No diff. |

**Connection:** Root layout imports this; NativeWind/Metro resolve it. Unchanged.

---

### 1.5 `tsconfig.json`

| Aspect | Hero | Current | Notes |
|--------|------|---------|------|
| compilerOptions | `strict`, `target`, `paths` | Same + `"module": "esnext"` | **CHANGED.** Added module. |
| exclude | (none) | `["node_modules", ".expo", "dist", "7-chakras-master-path"]` | **CHANGED.** Excludes build dirs and removed path alias. |

**Connection:** Type-checking and path resolution only. Unlikely to affect runtime display; `7-chakras-master-path` is deleted so excluding it is correct.

---

### 1.6 `package.json`

| Aspect | Hero | Current | Notes |
|--------|------|---------|------|
| scripts | `start`, `reset-project`, android/ios/web, test, lint, preview-android, knip | Added: `postinstall`, `start:clear`, `dev:ios`, `lint:fix`, `deploy:firestore`, compress scripts; `start` uses `env -u CI`; removed `knip` | **CHANGED.** More tooling; CI unset for Metro. |
| dependencies | Expo ~52.0.29, RN 0.76.6, async-storage ^2.1.2, reanimated ~3.16.1, svg ^15.11.2, no expo-camera/contacts/notifications/file-system/clipboard/image-picker | Expo ~52.0.49, RN 0.76.9, async-storage 1.23.1, reanimated ^3.16.1, svg 15.8.0, added expo-camera, clipboard, contacts, file-system, image-picker, notifications, sharing, html2canvas, @types/html2canvas; removed react-native-webview | **CHANGED.** Version bumps and feature deps. |
| devDependencies | jest-expo ~52.0.3, knip, eas-cli | jest-expo ~52.0.6, patch-package, react-dom, sharp; no knip, no eas-cli | **CHANGED.** |
| expo.doctor | (none) | reactNativeDirectoryCheck exclude list | **CHANGED.** |

**Connection:** `postinstall` runs worklets stub script (for when nativewind/babel was used). With current Babel using top-level css-interop only, stub is optional. Dependency changes can affect native build and runtime; exact versions can matter for styling (e.g. react-native-css-interop / nativewind).

---

### 1.7 `app.config.js`

| Aspect | Hero | Current | Notes |
|--------|------|---------|------|
| name/slug | SevenChakras, SevenChakras | Soul School, soul-school | **CHANGED.** Rebrand. |
| icon/splash | icon 7chakras.png; splash image SoulSchool_HERO_Logo, width 300 | icon ChakraWheel_ONBLACK_300DPI; splash splash-blank.png, backgroundColor, resizeMode | **CHANGED.** Different assets and splash config. |
| scheme | myapp | soul-school | **CHANGED.** |
| ios.infoPlist | UIBackgroundModes, camera, mic | + CFBundleDisplayName, LSApplicationQueriesSchemes, same | **CHANGED.** |
| android.permissions | CAMERA, RECORD_AUDIO, READ/WRITE_EXTERNAL_STORAGE | + SCHEDULE_EXACT_ALARM, READ_CONTACTS | **CHANGED.** |
| plugins | expo-router, splash-screen (backgroundColor, image, imageWidth), expo-font, expo-camera | + expo-splash-screen (splash-blank.png), expo-camera, expo-notifications, expo-contacts | **CHANGED.** |
| extra (env) | firebase, revenuecat, gemini, elevenlabs, sentry | Same + fallbacks `\|\| ""`, + googleCloudSpeechApiKey, stripe, anuaVoiceId hardcoded | **CHANGED.** |
| owner / eas projectId | seven-chakras, a698bc4b-... | theprofessor1111s-organization, 778607df-... | **CHANGED.** |
| dotenv | require('dotenv').config() | try/catch, optional | **CHANGED.** |

**Connection:** Affects app name, icons, splash, permissions, and env at build time. Splash asset path and config differ from hero; if splash-blank.png or ChakraWheel asset is missing or wrong, native splash can look wrong.

---

## 2. ROOT LAYER – `app/_layout.tsx`

| Area | Hero | Current | Notes |
|------|------|---------|-------|
| Imports | Firebase, RevenueCat, Sentry, basic layout/fonts | + BottomSheetModalProvider, LogBox, Audio, PermanentMenuBar, MusicRoomAudioManager, FloatingNavButtons, GlobalHomeButton, GlobalAnuaChat, ProfileSheet, useChakraJourneyStore, useFirstLaunchStore, Linking, AsyncStorage, Constants, journeyNotifications | **CHANGED.** Many new global providers and services. |
| LogBox | (none) | ignoreLogs([tuning fork, crystal bowl, object-not-found, permissions, cache, FirebaseError]) | **CHANGED.** |
| State | showHeroLogo | + assetsReady | **CHANGED.** |
| DEV_FORCE_TRIAL_HERO | (none) | `const DEV_FORCE_TRIAL_HERO = __DEV__` | **CHANGED.** |
| useEffects | (minimal) | Audio setup, scholarship expiry check, **dev-only reset** (multiRemove chakra-journey-storage, first-launch-storage, resetJourney, resetForTesting), RevenueCat init with getUserId, Sentry init, placeholders (1s delay), anuaCommunityCache (2s), **deep link** (payment-success), assetsReady set when fonts+images+audios loaded | **CHANGED.** |
| Splash hide | `useEffect` that calls `SplashScreen.hideAsync()` on mount | No early hide; **only** `handleHeroLogoComplete` calls `SplashScreen.hideAsync()` | **CHANGED.** Hero hid native splash immediately; current waits for hero logo completion. |
| handleHeroLogoComplete | setShowHeroLogo(false) | SplashScreen.hideAsync() + setShowHeroLogo(false) | **CHANGED.** |
| Web dev | (none) | if (Platform.OS === "web" && __DEV__) return CaptureAll | **CHANGED.** |
| SplashScreenReveal | onAnimationComplete only | + assetsReady prop | **CHANGED.** |
| Main app wrap | ThemeProvider → GestureHandlerRootView → View → Animated.View → Stack | + **BottomSheetModalProvider**; View → Animated.View → Stack + **MusicRoomAudioManager, PermanentMenuBar, FloatingNavButtons, GlobalHomeButton, GlobalAnuaChat**, StatusBar; + **ProfileSheet**; CommunityHalls animation "slide" → "fade" | **CHANGED.** |

**Connections:**

- **Splash:** Hero hid native splash on mount, then showed custom hero logo. Current hides native splash only after hero logo animation completes. If `handleHeroLogoComplete` is never called (e.g. SplashScreenReveal logic change), splash could hang or main app never show.
- **Dev reset:** In __DEV__, every load can clear journey and first-launch storage (when buildId changes or DEV_FORCE_TRIAL_HERO). That forces “first launch” and can change which screen appears first; good for testing, can surprise if you expect persisted state.
- **Global UI:** PermanentMenuBar, FloatingNavButtons, GlobalHomeButton, GlobalAnuaChat, ProfileSheet, MusicRoomAudioManager are all mounted here; any of them can affect layout or overlays app-wide.

---

## 3. CHAKRAS LAYER – routing and entry

### 3.1 `app/(chakras)/_layout.tsx`

| Hero | Current | Notes |
|------|---------|-------|
| Stack: index, ChakraHub, [chakra], SoundBath, HeadToHeart, Chakras101, EnergyExchange, AccountabilityOfAwakening, GalleryOfGnosis | + **WelcomeScreen, ChakraHome**, TribeChat, **DevPaywall, DateSelection**, CoursePreview, **AudioLibrary**, **NotesAlongTheWay, Donate** | **CHANGED.** More screens; order and names differ. |

**Connection:** Index is still the first screen. Hero had index → then ChakraHub and others. Current has index (ChakraHome) plus explicit WelcomeScreen, ChakraHome, DateSelection, etc. Navigation and initial route depend on this and on what index renders.

### 3.2 `app/(chakras)/index.tsx`

| Hero | Current | Notes |
|------|---------|-------|
| `import { ChakraHome } from "@/components/chakras/ChakraHome"`; `export default function HomeScreen() { return <ChakraHome /> }` | Same + **comment block** (ChakraHome is single entry, WelcomeModal/WaitingScreen flow, cache note) | **MATCH** (comment only). |

**Connection:** (chakras) stack still boots into ChakraHome. No behavioral change.

---

## 4. DELETED FILES (vs hero) & IMPACT

| Deleted | Impact / replacement |
|---------|----------------------|
| `7-chakras-master-path` | Path alias removed; tsconfig excludes it. No imports reference it. |
| `app.json` | Replaced by `app.config.js` (dynamic config). Normal for Expo. |
| `assets/audio/396.mp3` | If any code still references this path, audio will fail. |
| `assets/images/adaptive-icon.png`, `favicon.png`, `icon.png`, `rootElementsBackground.png` | app.config and UI may reference different assets now (e.g. ChakraWheel, splash-blank). |
| `components/chakras/DevOverrideSystem.tsx` | **Removed.** No remaining imports. |
| `components/chakras/DeveloperTools.tsx` | **Removed.** No remaining imports. |
| `components/chakras/PaymentGate.tsx` | **Removed.** ChakraHome uses **CommitmentGate** and `showPaymentGate` state; no import of PaymentGate. Intentional replacement. |
| `ios/SevenChakras.*` (entire old iOS project) | **Replaced** by `ios/SoulSchool/` and SoulSchool.xcodeproj. Project rename; not a regression. |

**Connection:** Only risk is code or config still pointing at deleted assets (e.g. 396.mp3 or old icon paths). Rest is intentional removal or rename.

---

## 5. KEY COMPONENTS (summary of change size)

- **SplashScreenReveal:** Hero: simple fade + scale, then hold, then fade out. Current: breathing animation, `assetsReady` prop, different timing (e.g. 2s minimum), fade-out in two stages. **Large change** – can affect first paint and when main app appears.
- **ChakraHome:** 1000+ line diff – flow, trial/lifetime, waiting screen, payment gate (CommitmentGate), modals, dev reset interaction. **Central to app flow and global UX.**
- **WaitingScreen:** 1400+ line diff – layout, copy, countdown, buttons, Anua/tribe. **Directly affects “waiting room” and any screen that looks like your screenshot.**
- **CommitmentGate / RevenueCatPaywall / GoodbyeModal / WelcomeModal:** Large diffs – paywall and lifecycle. **Affect when and how paywall and welcome appear.**
- **ErrorBoundary, LoadingSpinner, ParallaxScrollView, ActionBar, etc.:** Various smaller changes.

**Connection:** ChakraHome + WaitingScreen + splash + root layout together define: first paint (splash) → first screen (ChakraHome or welcome) → waiting vs home. Any of these can cause “wrong first screen” or “missing/invisible content” if state or conditions differ from hero.

---

## 6. HOOKS & SERVICES (summary)

- **useChakraJourneyStore:** 764 line diff – journey state, trial/lifetime, payment status, first launch, course start. **Global:** determines whether user sees trial vs lifetime, waiting vs home, paywall.
- **useFirstLaunchStore:** Used by root layout (dev reset) and ChakraHome (welcome). If hero had different persistence or no dev reset, behavior would differ.
- **useRevenueCat, useChakrasData, useAnuaMemoryStore, useEmbodimentAudio, etc.:** Substantial diffs – affect paywall, data loading, and audio. Can affect what appears on screen and when.
- **timegate.ts:** 306 line diff – `shouldShowWaitingScreen` and related logic. **Global:** directly controls when WaitingScreen is shown.
- **gemini, elevenlabs, anuaCache, firebase, revenuecat, sentry:** Config and API usage changes; can affect errors or missing data, indirectly affecting UI.

**Connection:** Journey store + first launch + timegate + RevenueCat drive the decision “show welcome vs waiting vs home vs paywall.” Any change there can make the app “open right to” a different screen than hero.

---

## 7. ASSETS

- Many **images** changed (smaller sizes in current – likely recompressed or different files). If any path or name changed and is still referenced by old path, images will not load.
- **app.config.js** points to `ChakraWheel_ONBLACK_300DPI.png` and `splash-blank.png`. If these are missing or different from hero assets, icon/splash will be wrong.
- **ios:** Hero had SevenChakras; current has SoulSchool. Native splash and app icon are now driven by SoulSchool assets and app.config.

**Connection:** “Images not loading” can be: (1) wrong path/name in code or config, (2) asset missing in bundle, (3) styling (e.g. className) hiding or shrinking them. (1) and (2) are tied to asset and config changes above.

---

## 8. AREAS OF CONCERN / LIKELY GLOBAL ISSUE SOURCES

1. **Babel / NativeWind (global styling)**  
   - **Current fix:** Babel uses top-level `react-native-css-interop/babel` plugins instead of `nativewind/babel` (which pulled nested 0.2.1 and worklets).  
   - **Risk:** If any other tool or dependency assumes `nativewind/babel` or the nested package, or if plugin order differs from hero in a meaningful way, some styles could still miscompile.  
   - **Suggestion:** Keep Babel as-is; if styles still fail, compare compiled output for one screen (e.g. WaitingScreen) vs hero.

2. **Root layout splash and first screen**  
   - Hero: native splash hidden on mount; then custom hero logo; then main app.  
   - Current: native splash hidden only in `handleHeroLogoComplete`; `assetsReady` gates nothing critical for transition; dev reset clears first-launch and journey.  
   - **Risks:** SplashScreenReveal never calling `onAnimationComplete` (e.g. due to timing or `assetsReady`); or dev reset + timegate making the app show WaitingScreen before welcome.  
   - **Suggestion:** Ensure SplashScreenReveal always calls `onAnimationComplete` after a bounded time (e.g. safety timeout). Ensure desired “welcome first” flow is explicit in ChakraHome/timegate when `isFirstLaunch` is true.

3. **ChakraHome + timegate + first launch**  
   - ChakraHome and timegate have large diffs; they decide welcome vs waiting vs home vs paywall.  
   - **Risk:** Condition for “show welcome” (e.g. `showWelcomeModal` / `isFirstLaunch`) might be false too often (e.g. dev reset race, or persist rehydration), so app lands on waiting or home instead of welcome.  
   - **Suggestion:** Trace one path: cold start → dev reset (if __DEV__) → first paint of ChakraHome → value of `isFirstLaunch` and `showWelcomeModal` and `showWaitingScreen`. Confirm they match the intended hero flow.

4. **app.config.js icon and splash paths**  
   - Hero: icon 7chakras.png; splash SoulSchool_HERO_Logo, width 300.  
   - Current: icon ChakraWheel_ONBLACK_300DPI.png; splash splash-blank.png.  
   - **Risk:** Missing or wrong files for new paths cause native splash/icon to be blank or wrong.  
   - **Suggestion:** Verify `assets/images/ChakraWheel_ONBLACK_300DPI.png` and `assets/images/splash-blank.png` exist and are correct; if you want hero look, point config back to hero assets.

5. **Deleted assets still referenced**  
   - e.g. `assets/audio/396.mp3`, old icon/splash paths.  
   - **Risk:** Runtime errors or missing media if code or config still references them.  
   - **Suggestion:** Search codebase and app.config for 396.mp3, adaptive-icon, favicon, icon, rootElementsBackground and fix or remove references.

6. **Global UI in root layout**  
   - PermanentMenuBar, FloatingNavButtons, GlobalHomeButton, GlobalAnuaChat, ProfileSheet, MusicRoomAudioManager.  
   - **Risk:** Z-index, layout, or conditional render in any of these can cover or shift main content.  
   - **Suggestion:** If a screen looks correct in isolation but wrong in the app, toggle these one by one to see which affects it.

7. **Dependency versions**  
   - Expo, RN, react-native-css-interop, nativewind, reanimated, etc. all differ from hero.  
   - **Risk:** Different behavior or bugs in styling or navigation.  
   - **Suggestion:** If restoring “exactly hero behavior,” consider locking to hero’s package.json versions for the key deps (expo, react-native, nativewind, react-native-css-interop, reanimated).

8. **tsconfig exclude `7-chakras-master-path`**  
   - Path no longer exists; exclude is correct. Only concern would be any script or tool that still expects that path; no code imports found.

---

## 9. TRACKING LIST – CHANGES THAT TOUCH GLOBAL BEHAVIOR

| # | File / area | Change type | Connects to |
|---|-------------|------------|-------------|
| 1 | babel.config.js | Use top-level css-interop plugins instead of nativewind/babel | All className/NativeWind styling |
| 2 | app/_layout.tsx | Splash only hidden in handleHeroLogoComplete; dev reset; global UI components; assetsReady | First screen, splash, overlays |
| 3 | app/(chakras)/_layout.tsx | More Stack screens (WelcomeScreen, ChakraHome, DateSelection, etc.) | Routing, initial screen |
| 4 | package.json | postinstall, deps, scripts | Build and runtime deps |
| 5 | app.config.js | Name, slug, icon, splash, scheme, plugins, env | Native splash, icon, env |
| 6 | tsconfig.json | module, exclude | Paths and build only |
| 7 | ChakraHome (component) | Large flow and state changes | Welcome vs waiting vs home vs paywall |
| 8 | useChakraJourneyStore | Large state and logic changes | Trial/lifetime, payment, first launch |
| 9 | timegate.ts | shouldShowWaitingScreen and related | When waiting screen shows |
| 10 | SplashScreenReveal | Breathing animation, assetsReady, timing | When main app appears |
| 11 | Deleted: PaymentGate, DevOverrideSystem, DeveloperTools | Removed; CommitmentGate used instead | Paywall and dev behavior |
| 12 | Deleted: ios/SevenChakras | Replaced by SoulSchool | Native project only |
| 13 | Deleted assets (396.mp3, old icons, etc.) | Removed or renamed | Any code still referencing them |

---

## 10. DEFAULT TO HERO – WHAT TO RESTORE FIRST IF YOU WANT “3 DAYS AGO” BEHAVIOR

1. **Styling:** Babel is already adjusted to use top-level css-interop (to avoid nested worklets). If you prefer exact hero Babel, restore hero’s `babel.config.js` (preset `"nativewind/babel"` and plugins `["react-native-reanimated/plugin"]`) and keep the worklets stub so the nested babel doesn’t break the build.
2. **Splash:** In `app/_layout.tsx`, hero hid native splash in a `useEffect` on mount. Restore that if you want “native splash gone immediately, then custom hero” exactly like hero.
3. **First screen / flow:** In hero, (chakras) index was ChakraHome and there was no dev reset. To mimic hero: disable or gate the dev-only reset (so first-launch and journey persist), and ensure ChakraHome + timegate show welcome when `isFirstLaunch` is true.
4. **app.config.js:** To get hero icon/splash back, point icon and splash back to hero assets (e.g. 7chakras.png, SoulSchool_HERO_Logo.png with imageWidth 300) if those files still exist.
5. **Root layout global UI:** If hero had no PermanentMenuBar, FloatingNavButtons, GlobalHomeButton, GlobalAnuaChat, ProfileSheet, or MusicRoomAudioManager, removing or gating them will match hero’s root layout.

Using this list and the sections above, you can restore or compare file-by-file against the hero commit while keeping the global app in focus.
