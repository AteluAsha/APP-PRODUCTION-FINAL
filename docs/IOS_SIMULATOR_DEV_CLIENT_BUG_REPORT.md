# iOS Simulator + Dev Client: Full Bug Report and Fixes

**Date:** 2026-03-18  
**Scope:** Dev client build, Metro reloads, splash stuck, iOS simulator connection.

---

## 1. Reloads Disabled (CI Mode) — ROOT CAUSE

**Symptom:** Metro log shows: *"Metro is running in CI mode, reloads are disabled."*

**Cause:** The command was run as:

```bash
npx expo start --dev-client --clear
```

instead of using the project npm scripts. In Cursor/CI and many environments, **`CI=true`** is set. Metro detects `CI` and disables:

- Watch mode / file watching
- Fast Refresh / reloads

**Fix:** The project already has correct scripts in `package.json` that **unset CI**:

- `start:dev-client:ios` → `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1 env -u CI expo start --dev-client`
- `start:clear` → `env -u CI expo start --clear`

Running the raw `npx expo start ...` bypasses `env -u CI`, so reloads stay disabled.

**Correct commands:**

- For dev client on iOS simulator **with clear cache:**  
  `npm run start:dev-client:ios:clear`  
  (added so one command does: clear + unset CI + packager host 127.0.0.1)

- Or:  
  `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1 env -u CI npx expo start --dev-client --clear`

**Verdict:** Nothing is “set to disable reloads” in code or config. Reloads are disabled only when the process runs with `CI` set because the **wrong command** was used. Use the npm scripts (or the full env + npx command above).

---

## 2. Stuck on Splash — ROOT CAUSES

**Symptom:** App stays on (native or in-app) splash and never loads.

**Possible causes:**

### 2.1 Bundle never loads (native splash never leaves)

- **Cause:** Simulator cannot reach Metro, or Metro is advertising the wrong host.
- **Why:** If you start Metro **without** `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1`, Metro may advertise your machine’s LAN IP (e.g. `192.168.x.x`). The iOS Simulator must use **127.0.0.1** to reach the host; that URL must be the one you tap in the dev launcher.
- **Fix:** Start Metro with the iOS script:  
  `npm run start:dev-client:ios` or `npm run start:dev-client:ios:clear`  
  so the dev launcher shows `http://127.0.0.1:8081`. Tap that in the launcher.

### 2.2 JS bundle loads but app stays on in-app splash

- **Logic:** `app/(chakras)/index.tsx` waits for `appReady = (storeRehydrationReady && rootNavigationState?.key) || forceReady`.
- **Safety:** `forceReady` is set after **5 seconds** (`FORCE_READY_MS`). So the app should never stay on the in-app splash longer than 5 seconds unless:
  - The screen never mounts (e.g. crash in root layout before Stack renders), or
  - A bug in `OpeningSplash` (e.g. `onComplete` never called).
- **Rehydration:** `useStoreRehydration` has a **2.5 s** safety (`safetyPassed`). So even if rehydration is slow, after 2.5 s we treat as ready; worst case 5 s with `forceReady`.
- **Verdict:** No intentional “stuck forever” in code. If you see stuck > 5 s, the next step is to check Metro and device logs for **runtime errors** (e.g. in rehydration, navigation, or Reanimated).

### 2.3 Native splash hidden only after (chakras)/index mounts

- **Flow:** Native splash is hidden in `(chakras)/index.tsx` after **80 ms** (`HIDE_NATIVE_SPLASH_MS`). So if the JS bundle **never** loads, `(chakras)/index` never runs and the **native** splash never hides.
- **Conclusion:** “Stuck on splash” with the **native** (storyboard) splash = bundle not loading = connection/URL/Metro host issue. Use the correct Metro start command and 127.0.0.1 in the launcher.

---

## 3. iOS Simulator “Coding” — NO BUGS FOUND

**Checked:**

- **AppDelegate.swift:** In DEBUG, `bundleURL()` uses `RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")`. `sourceURL(for:)` uses `bridge.bundleURL ?? bundleURL()`, which is correct for expo-dev-client (launcher supplies URL when you tap 127.0.0.1:8081). No hardcoded host; no incorrect URL logic.
- **Info.plist:** `NSAppTransportSecurity` allows localhost and 127.0.0.1 with `NSExceptionAllowsInsecureHTTPLoads = true`. Required for Metro on simulator. No missing keys.
- **Bundle React Native phase:** In Debug, `SKIP_BUNDLING=1` so the app does not embed the bundle and loads from Metro. Correct for dev client.
- **Podfile:** Hermes replace phase is no-op’d in post_install for Debug to avoid hang. No simulator-specific bug.

**Verdict:** No wrong or broken iOS simulator “coding” identified. Connection and behavior depend on **how Metro is started** and **which URL is chosen in the dev launcher**.

---

## 4. Not Loading Despite “Right Ports and URL”

**If Metro is on 8081 and you tapped `http://127.0.0.1:8081` but the app still doesn’t load:**

1. **Confirm Metro was started with the right host:**  
   Use `npm run start:dev-client:ios` or `npm run start:dev-client:ios:clear`. Then in the dev launcher you must see and select **http://127.0.0.1:8081** (not a LAN IP).

2. **Check Metro terminal:** Look for red errors (e.g. bundle build failure, syntax error, module not found). Those can prevent the bundle from loading or cause an immediate crash after load.

3. **Check device/simulator logs:** After tapping the URL, check Xcode → Window → Devices and Simulators → your simulator → Open Console, or run:  
   `xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "SoulSchool"'`  
   to see native/JS errors.

4. **Clear and retry:** Kill Metro, run `npm run start:dev-client:ios:clear`, wait for “Waiting on http://localhost:8081”, then open the app and tap 127.0.0.1:8081 again.

---

## 5. Settings / Config Summary

| Item | Status | Notes |
|------|--------|--------|
| **package.json scripts** | Correct | `start:dev-client:ios` uses `env -u CI` and `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1`. |
| **CI/reloads** | Correct when using scripts | Reloads disabled only if `CI` is set (e.g. when running raw `npx expo start` without `env -u CI`). |
| **Packager host for simulator** | Correct when using script | Must use `start:dev-client:ios` (or `start:dev-client:ios:clear`) so Metro advertises 127.0.0.1. |
| **app.config.js** | OK | ATS allows localhost/127.0.0.1; no incorrect simulator settings. |
| **ios/Info.plist** | OK | ATS exceptions for localhost and 127.0.0.1. |
| **Splash flow** | OK | Native splash hidden from (chakras)/index; in-app splash has 5 s force-ready; no infinite wait in code. |

**Verdict:** The “settings” are correct. The only incorrect setup is **how** Metro was started (missing `env -u CI` and/or `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1`). Use the npm scripts or the equivalent env + npx command.

---

## 6. Red Box: "Could not connect to development server"

**Symptom:** App shows Soul School splash, then a **red error box**: "Could not connect to development server" with URL `http://127.0.0.1:8081/...`.

**Meaning:** The app is correctly trying to load the bundle from 127.0.0.1:8081, but the connection is failing. Common causes:

1. **Metro is not running**  
   Start Metro first and leave it running:  
   `npm run start:dev-client:ios:clear`  
   Wait until you see "Waiting on http://localhost:8081" (or "Metro waiting on ...") before opening the app.

2. **Metro bound to IPv6 only**  
   On some systems Metro listens on IPv6 (`:::8081`) and the simulator’s request to 127.0.0.1 (IPv4) fails.  
   If `127.0.0.1:8081` keeps failing from the simulator, the practical fix is tunnel mode (next item).

3. **Tunnel fallback**  
   If you still see the red box after using the script above, try tunnel mode (ngrok opens an IPv4 path):  
   `npm run start:dev-client:ios:tunnel`  
   Then in the dev launcher use the **tunnel URL** shown in the terminal (e.g. `exp://xxx.exp.direct`) instead of 127.0.0.1.

4. **Verify Metro is reachable**  
   With Metro running, in a **new terminal** run:  
   `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8081/status`  
   You should see `200`. If you see `000` or connection refused, Metro is not listening on 127.0.0.1 or something is blocking it (firewall, wrong process).

---

## 7. Fixes Applied in This Repo

1. **New script `start:dev-client:ios:clear`**  
   - Runs: `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1 env -u CI expo start --dev-client --clear`  
   - Use this when you want: kill ports, then start Metro with clear cache, reloads enabled, and correct URL for iOS simulator.

2. **New script `start:dev-client:ios:tunnel`**  
   - Runs Metro with `--tunnel` as a fallback when 127.0.0.1 connection fails (e.g. IPv6-only binding). Use the tunnel URL in the dev launcher.

3. **This report**  
   - Documents why reloads were disabled, why splash can appear stuck, the "Could not connect" red box, and that iOS simulator code and config are correct.

---

## 8. Recommended Workflow (iOS Simulator + Dev Client)

1. **Kill ports (optional but useful):**  
   `lsof -ti:8081,19000,19001,19002 | xargs kill -9 2>/dev/null`

2. **Start Metro:**  
   `npm run start:dev-client:ios:clear`  
   (or `npm run start:dev-client:ios` if you don’t need `--clear`)

3. **Keep that terminal open.** Wait until you see Metro “Waiting on http://localhost:8081”.

4. **Open the Soul School (Expo Development Build) app** on the simulator.

5. **In the dev launcher,** tap **http://127.0.0.1:8081** (or enter it manually if it’s not listed).

6. The app should load the bundle and show the opening splash, then the rest of the flow. Use Cmd+R in the simulator (or shake → Reload) to reload after code changes; reloads work because CI is unset.

---

## 9. Summary

| Issue | Root cause | Fix |
|------|------------|-----|
| Reloads disabled | `CI` set when running raw `npx expo start` | Use `npm run start:dev-client:ios` or `start:dev-client:ios:clear` (or `env -u CI ...`) |
| Stuck on splash | Bundle not loading (wrong Metro host or URL) or rare JS crash | Start Metro with `start:dev-client:ios` / `start:dev-client:ios:clear`, tap 127.0.0.1:8081 in launcher; check Metro and simulator logs if still stuck |
| “Wrong” iOS simulator coding | None found | No code change; use correct Metro start command and launcher URL |
| Not loading with “right” URL | Possible cache, Metro errors, or wrong host advertised | Use the npm script, `--clear`, and 127.0.0.1 in launcher; check Metro and device logs |
| Red box "Could not connect to development server" | Metro not running, or Metro unreachable from simulator over IPv4 (often IPv6 binding) | Start Metro with `npm run start:dev-client:ios:clear`; if still failing, use `npm run start:dev-client:ios:tunnel` and connect using the tunnel URL |

All identified issues are **operational** (command, URL, and Metro reachability from the simulator over IPv4), not bugs in the iOS or splash code. The new scripts should prevent recurrence.
