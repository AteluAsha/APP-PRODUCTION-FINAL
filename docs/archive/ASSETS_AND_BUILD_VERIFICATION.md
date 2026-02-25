# Assets and build verification

## Assets are accessed correctly

- **Not ignored:** `.gitignore` does **not** exclude `assets/`. Only `assets/dev-gallery/snapshots/` is ignored. If the `assets` folder appears greyed out in the IDE, that is usually "untracked" or a display preference—it does **not** mean the folder is excluded from the build or from Git.
- **Paths:**
  - `app.config.js` uses `./assets/images/7chakras.png` and `./assets/images/SoulSchool_HERO_Logo.png` (relative to project root). Expo resolves these correctly.
  - Code uses `require("@/assets/images/...")`; `@` maps to project root in `tsconfig.json`, so these resolve to `./assets/images/...`.
- **Metro:** No `blockList` or config that excludes `assets/`. Default Expo/Metro includes assets from the project root.
- **EAS:** `.easignore` excludes `ios/` and `android/` for cloud builds; it does **not** exclude `assets/`, so images are included in EAS builds.
- **Files present:** `assets/images/` contains `7chakras.png`, `SoulSchool_HERO_Logo.png`, and all other referenced images (chakras, headers, etc.).

**Conclusion:** Asset paths and folder access are correct. No code or config changes were required for asset loading.

---

## Full iOS rebuild and simulator run (completed)

Steps performed:

1. **Ports cleared:** Killed any process on 8081, 19000, 19001, 19002.
2. **Caches cleared:** Removed `.expo`, `node_modules/.cache`, and `ios/build`. Cleared Watchman watches.
3. **Full iOS build:** Ran `npx expo run:ios` (clean CocoaPods install, Xcode build, Metro bundler with clean state).
4. **Result:** Build succeeded (0 errors, 5 non-blocking warnings). App was installed and opened on **iPhone 17 Pro** simulator. Metro bundled the JS (2071 modules). Runtime logs showed Firestore, Anua, ChakraHome (7 chakras loaded), and audio preload/cache working.

**One runtime warning (non-fatal):**  
`Attempt to present <RCTFabricModalHostViewController> on <UIViewController> while a presentation is in progress.`  
This can happen when the welcome modal and another modal try to present at the same time. The app still runs; if you see overlapping modals, we can add a short delay or guard so only one presents at a time.

---

## How to reproduce a full clean run

```bash
# From project root
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:19000 | xargs kill -9 2>/dev/null
rm -rf .expo node_modules/.cache ios/build
watchman watch-del-all 2>/dev/null || true
npx expo run:ios
```

Then confirm in the simulator: splash (hero logo) → welcome/date selection (if first launch) → waiting room or Chakra home, with images and styling correct.
