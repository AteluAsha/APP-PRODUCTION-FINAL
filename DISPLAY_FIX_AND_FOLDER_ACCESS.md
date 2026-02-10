# Display fix and folder access investigation

## 1. Folder access – no blocking found

Checked that important folders are not ignored or excluded from the build:

| Check | Result |
|-------|--------|
| **.gitignore** | Does not ignore `assets/`, `components/`, `hooks/`, or `app/`. Only `assets/dev-gallery/snapshots/` and `7-chakras-master-path/` (and standard node_modules, .expo, etc.) are excluded. |
| **.easignore** | Used only for EAS cloud builds. Excludes `ios/`, `android/`, and `assets/dev-gallery/snapshots/`. Does **not** exclude `assets/images/`, `hooks/`, or `components/`. |
| **metro.config.js** | No `blockList`. Resolver only adjusts `assetExts`/`sourceExts` for SVG. All source and asset paths resolve normally. |
| **tsconfig.json** | `exclude` is only `node_modules`, `.expo`, `dist`, `7-chakras-master-path`. `include` covers `**/*.ts`, `**/*.tsx` – hooks, components, and app are all included. |
| **tailwind.config.js** | `content` is `["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"]`. All UI that uses Tailwind is in `app/` or `components/`, so no missing content. |

**Conclusion:** No config is blocking access to `assets`, `hooks`, or `components`. If the `assets` folder appears greyed out in the IDE, that is an editor/Git indicator (e.g. untracked or ignored subfolders), not a build exclusion.

---

## 2. Root cause of “faint” text on Waiting Room

**Observation:** On the Waiting Room screen, the “I will open on Monday, February 9” line was visible (cyan), while countdown numbers, DAYS/HOURS/MINS labels, “For Deepest Embodiment”, and the paragraph were barely visible (faint outlines).

**Cause:**  
`AppText` builds `className` at **runtime** with `textVariants({ font, size, className })` and passes that single string to `RNText`. NativeWind (react-native-css-interop) works at **compile time**: it turns **static** `className` strings in the source into styles. It does not resolve **dynamic** class names computed at runtime. So the merged string from `textVariants()` was never turned into styles, and those `AppText` instances fell back to default (effectively unstyled) text, which looked faint.

The line that was visible (“I will open on Monday, February 9”) already used an **inline** `style={{ color: "rgba(6, 182, 212, 0.95)" }}`, so it did not depend on `className` for color.

**Fix applied:**  
For every `AppText` on `WaitingScreen` that relied on `className` for color, an explicit **inline** `style={{ color: "..." }}` was added, matching the intended opacity (e.g. `text-white` → `#ffffff`, `text-white/50` → `rgba(255,255,255,0.5)`). Countdown numbers, labels (DAYS, HOURS, MINS, SECS), “For Deepest Embodiment”, body copy, “Build Your Tribe”, “Friends invited”, menu labels (Preview, Chakras 101, tribe, Anua), “Your 7 Day Journey Begins”, “Each day of the week…”, and “Exit course mode” now all have an explicit color in `style`. This makes their visibility independent of NativeWind resolving dynamic class names.

---

## 3. If other screens show faint text

Any screen that uses `AppText` with only `className` for color (e.g. `text-white`, `text-white/90`) and no inline `style` can show the same faint text when NativeWind does not apply the dynamic class string. For those screens, add an explicit `style={{ color: "..." }}` (and keep the `className` for layout/size if desired). No change to folder access or Tailwind content is required for this.

---

## 4. Modified vs untracked hooks (from your file list)

- **Modified hooks** (`useChakrasData`, `useCurrentAudioStore`, `useEmbodimentAudio`, `usePreloadAssets`): Changes there can affect data, audio, or preload behavior, but they do **not** block folder access. The faint text was due to dynamic `className` on `AppText`, not to hooks or preload.
- **Untracked hooks** (`useCrystalBowlAudioStore`, `useJourneyNotesStore`, `useMenuBarStore`, `usePillBottomSheetStore`): Untracked means they are not in Git yet; they are still part of the project and are imported and bundled like any other file. They were not causing the Waiting Room display issue.

---

## 5. Summary

- **Folders:** No evidence that `assets`, `hooks`, or `components` are blocked by Git, Metro, EAS, or TypeScript. Assets and source are included as expected.
- **Display:** Waiting Room faint text was caused by dynamic `className` on `AppText` not being turned into styles by NativeWind. Inline `style={{ color: "..." }}` was added for all affected text on `WaitingScreen` so the display matches the intended hero look regardless of NativeWind’s handling of dynamic class names.

After pulling these changes, run the app (e.g. `npx expo run:ios` or your usual flow) and confirm the Waiting Room countdown, labels, and body text are clearly visible. If another screen still shows faint text, apply the same pattern: add an explicit `color` in the `style` prop for that `AppText`.
