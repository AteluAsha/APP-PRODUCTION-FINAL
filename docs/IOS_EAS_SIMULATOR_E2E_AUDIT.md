# iOS EAS → Simulator → Metro: E2E Audit Report

Full line-by-line and standard-practices check for the EAS-to-simulator flow. No code changes in this document; findings and recommendations only.

---

## 1. EAS Build Configuration

### eas.json

| Item | Status | Notes |
|------|--------|--------|
| **simulator profile** | OK | `ios.simulator: true`, `developmentClient: true`, `distribution: "internal"`, `node: "20.19.0"`, `ios.image: "latest"` (avoids old Xcode/UIGlassEffect). |
| **development profile** | OK | `developmentClient: true`, `distribution: "internal"`. |
| **env in simulator** | N/A | No `env` needed for Metro URL; URL is chosen at runtime when user taps a server in the dev client launcher. |
| **extends** | Optional | Simulator could `"extends": "development"` to avoid duplicating developmentClient/distribution; current setup is valid. |

**Verdict:** EAS config is correct for simulator dev builds. No change required for basic functionality.

---

## 2. App Config (app.config.js) – EAS Prebuild Source

Because `.easignore` **excludes `ios/`**, EAS Build does **not** upload your local `ios` folder. Native iOS config comes from **app.config.js** (prebuild in the cloud). So anything in `ios/` only affects **local** `expo run:ios`; EAS builds use app.config.

| Item | Status | Notes |
|------|--------|--------|
| **ios.infoPlist.NSAppTransportSecurity** | OK | Present with `NSAllowsLocalNetworking: true` and `NSExceptionDomains` for `localhost` and `127.0.0.1` with `NSExceptionAllowsInsecureHTTPLoads: true`. Required so the simulator can load the bundle from `http://127.0.0.1:8081`. |
| **scheme** | OK | `soul-school` and `exp+soul-school` for dev client. |
| **bundleIdentifier** | OK | `com.sevenchakras.SevenChakras`. |
| **expo-dev-client plugin** | Not present | expo-dev-client is installed in package.json; plugin is optional. Default `launchMode` is `"most-recent"`. You could add `["expo-dev-client", { "launchMode": "launcher" }]` to always show the launcher and pick 127.0.0.1. |
| **newArchEnabled / jsEngine** | OK | Hermes and New Arch as intended; no simulator-specific issue. |

**Verdict:** App config is sufficient for EAS simulator builds and Metro over localhost. ATS will not block Metro in EAS-built apps.

---

## 3. Metro and Packager Host

| Item | Status | Notes |
|------|--------|--------|
| **start:dev-client:ios** | OK | `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1 env -u CI expo start --dev-client`. Metro advertises 127.0.0.1 so the dev client launcher shows `http://127.0.0.1:8081`. |
| **start:dev-client** | Risk | Does **not** set packager host. Metro may advertise the machine’s LAN IP (e.g. 192.168.1.29). On simulator that often fails; use **start:dev-client:ios** for simulator. |
| **env -u CI** | OK | Used in both scripts so Metro runs with watch mode and reloads enabled. |
| **metro.config.js** | OK | Standard Expo + NativeWind + SVG; no server host binding; correct. |

**Verdict:** For simulator, **always** start Metro with `npm run start:dev-client:ios`. No new code blocks the simulator; using the wrong script can.

---

## 4. iOS Native (Local and EAS-Prebuilt)

### 4.1 Info.plist (ios/SoulSchool/Info.plist)

- Used by **local** builds (`expo run:ios` / Xcode).
- **EAS** builds get their plist from app.config.js (prebuild); the ATS entries there match and are correct.
- Local `Info.plist` has `NSAppTransportSecurity` with `localhost` and `127.0.0.1` exceptions. LSMinimumSystemVersion 12.0. No missing keys for simulator.

### 4.2 AppDelegate.swift

- `bundleURL()` returns `RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")` in DEBUG.
- `sourceURL(for:)` uses `bridge.bundleURL ?? bundleURL()` so expo-dev-client can supply the URL when the app is opened from the launcher (e.g. when user taps `http://127.0.0.1:8081`).
- No hardcoded host or port; no code here blocks the simulator. URL is determined by the launcher + RCTBundleURLProvider.

### 4.3 Podfile / Xcode

- iOS deployment target 15.1; Hermes enabled; standard Expo/React Native setup. No simulator-specific blockers.

**Verdict:** Native iOS and simulator connection path are correctly configured. No new code blocks the simulator.

---

## 5. App Entry and Opening Flow (JS)

| Item | Status | Notes |
|------|--------|--------|
| **RevenueCat in _layout** | OK | Initialize is done via **dynamic** `import("@/src/services/revenuecat")` in a useEffect so `react-native-purchases` is not loaded at bundle load time; avoids simulator crash on startup. |
| **nativeReady** | OK | 80 ms delay then full tree; no infinite block. |
| **Store rehydration** | OK | 2.5 s safety in useStoreRehydration; app never waits forever for rehydration. |
| **OpeningSplash / (chakras)/index** | OK | Splash and navigation logic are sound; no simulator-only branch that could block. |

**Verdict:** No JS in the opening path that blocks or breaks the simulator specifically.

---

## 6. New Apple / iOS Simulator Behavior

| Item | Status | Notes |
|------|--------|--------|
| **UIGlassEffect / Xcode** | Addressed | EAS simulator profile uses `"image": "latest"` so the build uses a recent Xcode image and avoids “cannot find 'UIGlassEffect' in scope”. |
| **iOS 26 schemeapproval.plist** | Known issue | On **newly created** iOS 26 simulators, LaunchServices may show a URL scheme confirmation dialog when opening the app via URL (e.g. “press i” or simctl openurl). Workaround: open the **Expo Development Build** app from the simulator home screen, then tap `http://127.0.0.1:8081` in the launcher. No project code change required. |
| **ATS / localhost** | Addressed | NSExceptionDomains for localhost and 127.0.0.1 are set in app.config and in local Info.plist; required for Metro on simulator. |

**Verdict:** Current setup is compatible with new Xcode/iOS. No further “new Apple” code is required for the simulator build; the only caveat is iOS 26 launcher behavior, which is bypassed by using the in-app launcher.

---

## 7. .easignore and Build Artifacts

- **ios/** and **android/** are excluded; EAS generates native projects from app.config and plugins. So:
  - EAS simulator builds **do** get NSAppTransportSecurity from app.config.
  - Local-only changes in `ios/` do **not** affect EAS builds; they only affect `expo run:ios` / Xcode.

**Verdict:** Correct for EAS; no change needed.

---

## 8. Standard Practices Checklist

| Practice | Done | Notes |
|----------|------|--------|
| Simulator profile has `developmentClient: true` | Yes | eas.json simulator. |
| Simulator profile has `distribution: "internal"` | Yes | eas.json simulator. |
| Simulator profile uses `ios.simulator: true` | Yes | eas.json simulator. |
| Metro started before opening app | Documented | Use `npm run start:dev-client:ios` first. |
| Packager host 127.0.0.1 for simulator | Yes | start:dev-client:ios. |
| ATS allows localhost HTTP | Yes | app.config + local Info.plist. |
| Dev client receives URL from launcher | Yes | AppDelegate + expo-dev-client. |
| No static import of react-native-purchases at app entry | Yes | Dynamic import in _layout. |
| EAS build uses latest image for simulator | Yes | ios.image: "latest". |

**Verdict:** Standard practices for EAS → simulator → Metro are satisfied.

---

## 9. What Still Needs to Be “Connected” (Operational)

Nothing in code is missing for the iOS app to be **functional** in the EAS-to-simulator flow. The remaining requirements are **operational** and **order of operations**:

1. **Build**  
   - Run: `eas build --platform ios --profile simulator`  
   - Wait for success; download the `.tar.gz` and install the `.app` on the simulator (drag to simulator or use Expo Orbit).

2. **Metro**  
   - Run: `npm run start:dev-client:ios`  
   - Leave it running until you see “Waiting on http://localhost:8081”.

3. **Simulator**  
   - Open the **Soul School** (Expo Development Build) app.  
   - In the launcher, tap **`http://127.0.0.1:8081`** (or “Enter URL manually” and enter that).  
   - The app will load the bundle from Metro and run.

4. **If “Could not connect”**  
   - Confirm Metro is running and that you used **start:dev-client:ios** (so the launcher shows 127.0.0.1).  
   - If the launcher only shows a LAN IP, enter `http://127.0.0.1:8081` manually.

5. **If app is not on simulator**  
   - The EAS artifact is a `.app`; it must be **installed** (e.g. drag onto simulator window or install via Expo Orbit).  
   - Local `expo run:ios` must **complete** a full build (including main app target and Info.plist/executable in the .app) before install; an incomplete build will show “Missing bundle ID” and not install.

---

## 10. Summary

- **EAS:** Simulator profile and build config are correct; no updates required for the simulator flow.  
- **Metro:** Use `npm run start:dev-client:ios` for simulator so the packager host is 127.0.0.1.  
- **Simulator:** No new code blocks the simulator; ATS and AppDelegate are correctly set for dev client + Metro.  
- **Apple / new Xcode:** Handled via `image: "latest"` and ATS; iOS 26 launcher quirk is avoided by opening the app and tapping the URL in the launcher.  
- **E2E:** Code and config are sufficient for a functional EAS → simulator → Metro flow. Making the app functional on the simulator is a matter of: (1) installing a **complete** EAS or local build, and (2) starting Metro with **start:dev-client:ios** and connecting from the launcher to **http://127.0.0.1:8081**.

No upgrades or new simulator/EAS build code are strictly required for the flow to work; optional improvements (e.g. expo-dev-client plugin with `launchMode: "launcher"`, or simulator profile `extends: "development"`) are minor and do not block functionality.
