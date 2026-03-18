# iOS: ChakraHub & Goodbye Screen – No Visible Changes – Report

## Summary

**If you did a full nuclear rebuild and still see no visible changes (and no test banners), then either:**

1. **The iOS clean was incomplete** – something that can still serve or use an old bundle was not cleared, or  
2. **The “bundle not updating” explanation is wrong** – the cause is elsewhere (e.g. wrong screen/route, conditionals, or a different code path).

This doc keeps the original “stale bundle” theory as one possible cause but no longer treats it as the only explanation when a nuclear rebuild has already been done with no effect.

**16KB and Apple:** In this repo, **16KB is an Android-only topic** (ELF alignment, NDK, `expo.useLegacyPackaging`). There is no iOS-specific 16KB config, and no evidence that “iOS 16kb output for Apple” is causing these two screens to ignore updates. Apple’s 16KB page size (e.g. on Apple Silicon) affects native binaries and memory alignment; it does not explain why JS/React changes would fail to show.

---

## 1. Connection between the two issues

| Observation | ChakraHub (lifetime home) | Goodbye screen |
|------------|---------------------------|-----------------|
| Code changes | Stack raise, day title next to ball, comments | In-flow bottom section, no X, minHeight: 0, etc. |
| User sees | No change – stack still low, title not next to ball | No change – layout unchanged |
| Single explanation | **Same app instance is running an old JS bundle.** | **Same.** |

So the **connection** is: one delivery problem (bundle not updating) would affect **both** screens. The edits are in the right files; the device/simulator may not be running that code. **However**, if a nuclear rebuild was done and nothing changed, either the clean missed something or this theory is false (see §6).

---

## 2. Why the bundle might not update (iOS)

- **Metro not used:** App might be using an embedded or pre-built bundle (e.g. from a build that didn’t start Metro, or a release/dev build that doesn’t talk to Metro).
- **Cache:** Metro or the dev client serving a cached bundle; `expo start --clear` and a full reload (Cmd+R) not done after changes.
- **Wrong target:** Simulator or device running a different build/scheme that doesn’t point at your current Metro server.
- **Reload not done:** After a clean build, the app must do a **full reload** (Cmd+R in simulator, or shake → Reload) so it fetches the latest bundle from Metro.

None of these are “16KB” or “iOS 16kb output” issues in this codebase.

---

## 3. 16KB in this repo (Android only)

- **`docs/ANDROID_16KB_PAGE_SIZE.md`**, **`docs/ANDROID_REAL_DEVICE_FIX_PLAN.md`**, **`docs/ANDROID_16KB_COMPATIBILITY_DIALOG.md`**: all describe **Android** 16 KB page size (ELF alignment, “LOAD segment not aligned”, legacy packaging).
- **`android/build.gradle`**: comment about NDK for “16 KB page alignment” is for **Android**.
- There is **no** iOS 16KB config, no `NODE_OPTIONS` or page-size setting for Apple, and no reference to “16kb” affecting the iOS bundle or these two screens.

**Conclusion:** The “update to ios 16kb output for apple” is **not** the root cause of ChakraHub and Goodbye not updating in this project. The repo’s 16KB work is Android-only.

---

## 4. Test indicators added (to confirm we’re on the right screen and bundle)

Two **dev-only, iOS-only** banners were added so we can see if the **new** bundle is running:

1. **ChakraHub**  
   - When: `__DEV__ && Platform.OS === "ios"`  
   - What: A **green** bar at the top with text: **`CHAKRAHUB UPDATED — bundle loaded`**  
   - If you **see** it → ChakraHub is the screen being shown and the new bundle is loaded.  
   - If you **don’t** see it → Either you’re not on ChakraHub, or the app is not loading the new bundle.

2. **GoodbyeModal**  
   - When: `__DEV__ && Platform.OS === "ios" && isVisible`  
   - What: A **magenta** bar at the top of the goodbye overlay with text: **`GOODBYE UPDATED — bundle loaded`**  
   - If you **see** it → GoodbyeModal is the component being shown and the new bundle is loaded.  
   - If you **don’t** see it → Either the modal isn’t visible, or the app is not loading the new bundle.

**How to use:**  
- Do a clean build and start Metro (e.g. `npx expo start --clear`), then open the app and do a **full reload** (Cmd+R).  
- Go to **lifetime home** (ChakraHub) → look for the **green** banner.  
- Open a **Goodbye** screen on iOS → look for the **magenta** banner.  
- If **neither** banner appears, the problem is **bundle delivery** (Metro/cache/reload), not the layout code or 16KB.

---

## 5. What to do next

1. **Confirm bundle:**  
   Reload the app (Cmd+R) and check for the green (ChakraHub) and magenta (Goodbye) banners. If they appear, the same bundle includes the layout fixes; if they still don’t show, focus on Metro, cache, and reload.

2. **Remove banners later:**  
   Once you’ve confirmed the bundle is updating, remove the two test blocks (search for `CHAKRAHUB UPDATED` and `GOODBYE UPDATED`).

3. **Do not attribute to 16KB on iOS:**  
   There is no 16KB-related iOS or “apple 16kb output” change in this repo that would block these two screens from updating.

---

## 6. Nuclear rebuild with no change: incomplete clean vs logic false

If you already did a **nuclear rebuild** and still see no visible changes (and no green/magenta banners), then either:

- **The clean was incomplete** – some cache or build product that can still provide or use an old JS bundle was not cleared, or  
- **The “bundle not updating” explanation is false** – the real cause is something else (e.g. wrong screen/route, `__DEV__` or platform conditionals, or a build path that doesn’t include these files).

### 6a. What “nuclear clean” must include (iOS)

The **only** script in this repo that clears **both** JS caches **and** full iOS build artifacts is:

- **`CLEAR_ALL_CACHES_AND_REBUILD.sh`** (project root)  
  - Clears: Metro/Expo processes, Watchman, `node_modules/.cache`, `.expo`, `~/.expo`, `ios/build`, **`~/Library/Developer/Xcode/DerivedData/SoulSchool-*`**, Pods, Podfile.lock; uninstalls app; runs `pod install`; then `env -u CI npx expo run:ios`.

Other scripts do **not** clear iOS build/DerivedData:

- **`scripts/clear-and-run-ios.sh`** – Clears only `node_modules/.cache`, `.expo`, Watchman, TMPDIR Metro/haste. Does **not** clear `ios/build` or DerivedData. If this was used as “nuclear”, the **native iOS build was not fully cleaned**.
- **`scripts/clean-metro-ios-test.sh`** – Clears same as above, then starts Metro with `--clear` and runs `expo run:ios --no-bundler`. Also does **not** clear `ios/build` or DerivedData.

So if “nuclear” was done with something other than `CLEAR_ALL_CACHES_AND_REBUILD.sh`, the **entire** iOS build (including any place an old bundle could be referenced) was not necessarily cleared.

### 6b. DerivedData pattern

- The **actual** Xcode project name is **`SoulSchool`** (capital S, capital S).  
- **`CLEAR_ALL_CACHES_AND_REBUILD.sh`** correctly uses: `~/Library/Developer/Xcode/DerivedData/SoulSchool-*`.  
- Some older docs say `soulschool-*` (lowercase). On a case-insensitive filesystem that can still match; to be safe you can clear both:  
  `rm -rf ~/Library/Developer/Xcode/DerivedData/SoulSchool-* ~/Library/Developer/Xcode/DerivedData/soulschool-*`

### 6c. Metro not started with `--clear` in nuclear script

**`CLEAR_ALL_CACHES_AND_REBUILD.sh`** ends with `env -u CI npx expo run:ios`. That command **starts Metro itself** and does **not** pass `--clear` to Metro. So we rely on having already deleted `node_modules/.cache` and `.expo` so that when Metro starts it has no on-disk cache. To be **certain** Metro uses a cleared cache, use a two-step flow:

1. Start Metro explicitly with a cleared cache:  
   `env -u CI npx expo start --clear`  
   (keep this terminal open)
2. In another terminal, build and run without starting a second Metro:  
   `env -u CI npx expo run:ios --no-bundler`

Then the app will connect to the Metro instance that was started with `--clear`.

### 6d. How to interpret the test banners

- **If the green (ChakraHub) and/or magenta (Goodbye) banners appear** after a proper full clean + Metro with `--clear` + reload → the new bundle is loading; layout/behavior issues are in the code or conditions, not bundle delivery.
- **If neither banner appears** after that flow → either something is still serving an old bundle (clean still incomplete) or the “bundle not updating” theory is wrong and the cause is elsewhere (e.g. different route, conditionals hiding the UI, or a build that doesn’t include these components). In that case, the next step is to verify which screen/component is actually mounted and which bundle the app is loading (e.g. dev tools, logging, or a minimal one-line change in a file that is definitely on the critical path).

---

## 7. When the app never loads in the iOS simulator (CLI build hangs)

If `npx expo run:ios` or `npx expo run:ios --no-bundler` runs for a long time (e.g. 10+ minutes) and never finishes—often stuck on a step like **Hermes** or **expo-dev-menu**—the app never gets installed and never loads. Use **Xcode** to build and run instead; Metro can still serve the bundle.

### 7a. Steps (Xcode + Metro)

1. **Stop any stuck CLI build**  
   - In the terminal where `expo run:ios` is running: `Ctrl+C`.  
   - If needed: `pkill -f "expo run:ios"` and `pkill -f "xcodebuild"`.

2. **Start Metro with a clear cache** (keep this terminal open)  
   - From project root:  
     `env -u CI npx expo start --clear`  
   - Or: `npm run start:clear`  
   - Wait until it shows "Metro waiting on …" and the QR/log.

3. **Open the iOS workspace in Xcode**  
   - Open **`ios/SoulSchool.xcworkspace`** (not the `.xcodeproj`).  
   - In Xcode: pick an **iPhone simulator** (e.g. iPhone 16) as the run destination.

4. **Build and run from Xcode**  
   - **Product → Run** (or **⌘R**).  
   - Xcode will compile, install the app on the simulator, and launch it.  
   - The app will connect to Metro on port 8081 and load the JS bundle.

5. **Reload after code changes**  
   - In the simulator: **⌘R** (or Device → Shake → Reload) so the app fetches the latest bundle from Metro.

### 7b. If the app is already installed

If a previous build already installed the app on the simulator:

1. Start Metro: `env -u CI npx expo start --clear`.  
2. In the simulator, open the **Soul School** app.  
3. Reload once: **⌘R** (or shake → Reload).

No need to run `expo run:ios` or build in Xcode again unless you changed native code or dependencies.

### 7c. Hermes script hang (optional fix already applied)

The Hermes build phase **"[Hermes] Replace Hermes for the right configuration"** can hang when run by `xcodebuild` (e.g. stdout/pipe blocking). In this project:

- **`ios/.xcode.env`** uses an explicit `NODE_BINARY=/usr/local/bin/node` so script phases don’t run `find-node-for-xcode.sh` (which can hang on nvm/nodenv).
- **`ios/Pods/Pods.xcodeproj/project.pbxproj`** was patched so that Hermes script phase redirects its output to `${TARGET_TEMP_DIR}/hermes-replace.log`, avoiding pipe blocking. **Note:** This patch is in the Pods project; if you run `pod install` again, the patch is overwritten. If the build starts hanging again at Hermes, re-apply the same redirect in the Hermes script phase in `Pods.xcodeproj`, or use the Xcode GUI flow in §7a.
