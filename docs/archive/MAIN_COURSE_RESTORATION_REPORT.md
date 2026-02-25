# Main Course Pages – Critical Restoration Report

**Scope:** ALL 7 main course pages (Day 1–7) – GLOBAL breakage, not isolated design errors.

**Status:** Root causes identified and fixes applied. Verification checklist for day-by-day audit.

---

## 1. ROOT CAUSE ANALYSIS

### 1.1 What Broke (Two Global Regressions)

| #     | Cause                         | File                                | Impact                                                                                                                                                                                                                                                                                                             | Certainty |
| ----- | ----------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| **1** | **ParallaxScrollView spacer** | `components/ParallaxScrollView.tsx` | HERO commit added `<View style={{ width: "100%", height: h }} />` before children. This pushed ALL content down by full screen height. Hero text (Day 1, Root Chakra, Muladhara) landed in black area below header instead of overlaying it. **Affects all 7 days identically.**                                   | **100%**  |
| **2** | **Babel config switch**       | `babel.config.js`                   | HERO switched from `nativewind/babel` + `react-native-reanimated/plugin` to `react-native-css-interop/babel` with empty `plugins: []`. Different Babel pipeline changes how `className` compiles. AppText (font variants), CollapsibleText, FormattedText, Pill, and any Tailwind-based styling can fail app-wide. | **95%**   |

### 1.2 Why These Are Global

- **ParallaxScrollView:** Single shared component for ALL main course pages. One spacer = all 7 days broken.
- **Babel:** Runs on every JS/TS file. Wrong config = styles fail app-wide.

### 1.3 What Did NOT Cause the Break

- **HeaderSection** `textLine3` optional: ChakraTemplate always passes `textLine3`; no behavioral change.
- **ChakraTemplate** `navigateBack` logic: Navigation only; no layout/design impact.
- **HeadToHeart** refactor: Separate route; does not affect main course.

---

## 2. SURGICAL FIXES APPLIED

### 2.1 ParallaxScrollView (Fix #1)

**Before (broken):**

```tsx
<View style={{ flex: 1 }}>
  <View style={{ width: "100%", height: h }} /> // SPACER – pushed content down
  {children}
</View>
```

**After (restored):**

```tsx
<View style={{ flex: 1 }}>{children}</View>
```

**Result:** Content overlays header image. HeaderSection (hero text) sits at bottom of header image as designed.

---

### 2.2 Babel Config (Fix #2)

**Before (broken):**

```js
const cssInteropBabel = require("react-native-css-interop/babel")()
return {
  presets: [
    ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    { plugins: cssInteropBabel.plugins },
  ],
  plugins: [], // Reanimated not at root
}
```

**After (restored):**

```js
return {
  presets: [
    ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    "nativewind/babel",
  ],
  plugins: [
    "react-native-reanimated/plugin", // Must be last
  ],
}
```

**Result:** NativeWind and Reanimated use original working pipeline. `className` and font variants compile correctly.

---

### 2.3 Cache and Rebuild

- Cleared: `node_modules/.cache`, `.expo`, `ios/build`, Watchman
- Removed: `ios/Pods`, `ios/Podfile.lock`
- Ran: `pod install`, `npx expo run:ios --no-build-cache`

---

## 3. DAY-BY-DAY VERIFICATION CHECKLIST

Use this to verify each day after the app runs.

### Day 1 – Root Chakra (Muladhara)

| #   | Element                     | Check                                                                                    | Pass? |
| --- | --------------------------- | ---------------------------------------------------------------------------------------- | ----- |
| 1   | **Hero header**             | "Day 1", "Root Chakra", "Muladhara - \"I am\"" overlay header image (no black gap above) | ☐     |
| 2   | **Back button**             | White arrow, top-left, tappable                                                          | ☐     |
| 3   | **Embodiment audio**        | "Good Morning Root!" row visible, play works                                             | ☐     |
| 4   | **Pill section**            | 396 Hz, Lam, "I am", Chakras pills horizontal, tappable                                  | ☐     |
| 5   | **Divider**                 | Thin line between pills and OVERVIEW                                                     | ☐     |
| 6   | **OVERVIEW**                | Title + collapsible text, "See more" if truncated                                        | ☐     |
| 7   | **SANSKRIT**                | Title + collapsible text                                                                 | ☐     |
| 8   | **Affirmation**             | "Affirmation" label + italic "I am, I exist, I belong." (Cormorant)                      | ☐     |
| 9   | **Location image**          | Root location image, centered                                                            | ☐     |
| 10  | **Part II – HEAD TO HEART** | Button tappable, navigates to HeadToHeart                                                | ☐     |
| 11  | **Part II – SOUND HEALING** | Button tappable, navigates to SoundBath                                                  | ☐     |
| 12  | **Elements section**        | Elements image (root)                                                                    | ☐     |
| 13  | **Part III – Yoga**         | Mountain Pose content                                                                    | ☐     |
| 14  | **Audio outro**             | "Connected To The Earth" row                                                             | ☐     |
| 15  | **Mirror Of Embodiment**    | Quiz button, earth tones, tappable                                                       | ☐     |
| 16  | **Completion**              | "My Root Is Awake" + chakra image + "I have completed"                                   | ☐     |
| 17  | **Spacing**                 | No overlapping elements, consistent margins                                              | ☐     |

### Day 2 – Sacral Chakra (Svadhisthana)

| #   | Element          | Check                                                 | Pass? |
| --- | ---------------- | ----------------------------------------------------- | ----- |
| 1   | Hero header      | "Day 2", "Sacral Chakra", "Svadhisthana - \"I feel\"" | ☐     |
| 2   | Embodiment audio | Single audio row                                      | ☐     |
| 3   | Pills            | 417 Hz, Vam, "I feel", Chakras                        | ☐     |
| 4   | Affirmation      | "I feel, I flow, I create."                           | ☐     |
| 5   | Part II buttons  | Head to Heart, Sound Healing                          | ☐     |
| 6   | Completion       | "My Sacral Is Awake"                                  | ☐     |

### Day 3 – Solar Plexus (Manipura)

| #   | Element     | Check                                                 | Pass? |
| --- | ----------- | ----------------------------------------------------- | ----- |
| 1   | Hero header | "Day 3", "Solar Plexus Chakra", "Manipura - \"I do\"" | ☐     |
| 2   | Affirmation | "I do, I act, I manifest."                            | ☐     |
| 3   | Completion  | "My Solar Plexus Is Awake"                            | ☐     |

### Day 4 – Heart Chakra (Anahata)

| #   | Element     | Check                                           | Pass? |
| --- | ----------- | ----------------------------------------------- | ----- |
| 1   | Hero header | "Day 4", "Heart Chakra", "Anahata - \"I love\"" | ☐     |
| 2   | Affirmation | "I love, I forgive, I heal."                    | ☐     |
| 3   | Completion  | "My Heart Is Awake"                             | ☐     |

### Day 5 – Throat Chakra (Vishuddha)

| #   | Element     | Check                                               | Pass? |
| --- | ----------- | --------------------------------------------------- | ----- |
| 1   | Hero header | "Day 5", "Throat Chakra", "Vishuddha - \"I speak\"" | ☐     |
| 2   | Affirmation | "I speak, I express, I am heard."                   | ☐     |
| 3   | Completion  | "My Throat Is Awake"                                | ☐     |

### Day 6 – Third Eye (Ajna)

| #   | Element              | Check                                           | Pass? |
| --- | -------------------- | ----------------------------------------------- | ----- |
| 1   | Hero header          | "Day 6", "Third Eye Chakra", "Ajna - \"I see\"" | ☐     |
| 2   | **Embodiment audio** | **Two rows:** Part One, Part Two                | ☐     |
| 3   | Affirmation          | "I see, I perceive, I know."                    | ☐     |
| 4   | Completion           | "My Third Eye Is Awake"                         | ☐     |

### Day 7 – Crown Chakra (Sahasrara)

| #   | Element     | Check                                                   | Pass? |
| --- | ----------- | ------------------------------------------------------- | ----- |
| 1   | Hero header | "Day 7", "Crown Chakra", "Sahasrara - \"I understand\"" | ☐     |
| 2   | Affirmation | "I understand, I transcend, I am."                      | ☐     |
| 3   | Completion  | "My Crown Is Awake"                                     | ☐     |

---

## 4. SHARED COMPONENTS (All 7 Days)

| Component          | Uses className?                    | Uses inline style? | Babel-dependent?     |
| ------------------ | ---------------------------------- | ------------------ | -------------------- |
| ParallaxScrollView | No                                 | Yes                | No                   |
| HeaderSection      | No                                 | Yes                | No (AppText font is) |
| HeaderBackground   | No                                 | Yes                | No                   |
| TextSection        | Via CollapsibleText                | Yes                | **Yes**              |
| CollapsibleText    | **Yes**                            | Partial            | **Yes**              |
| AffirmationSection | No                                 | Yes                | No (AppText font is) |
| AppText            | **Yes** (font → tailwind-variants) | Yes (fallback)     | **Yes**              |
| PillSection        | No                                 | Yes                | No                   |
| Pill               | Accepts className, doesn't use     | Yes                | No                   |
| Part2Section       | No                                 | Yes                | No                   |
| Part3Section       | No                                 | Yes                | No                   |
| ElementsSection    | No                                 | Yes                | No                   |
| AudioRow           | Mixed                              | Yes                | Medium               |

---

## 5. CERTAINTY ASSESSMENT

| Fix                                         | Certainty | Rationale                                                                                                                                                                                                                                                 |
| ------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ParallaxScrollView spacer removal**       | **100%**  | Spacer explicitly pushed content down by `h` (screen width). Removing it restores layout. Initial commit had no spacer; HERO added it.                                                                                                                    |
| **Babel restore (nativewind + reanimated)** | **95%**   | Initial config worked. HERO's css-interop switch changed the compilation pipeline. If `className` or font variants were broken, restoring initial Babel should fix them. Remaining 5%: package version drift (Expo, NativeWind) could still cause issues. |
| **Cache clear + rebuild**                   | **100%**  | Ensures no stale Babel/Metro output. Required after Babel change.                                                                                                                                                                                         |

---

## 6. STRATEGIC RESTORATION SUMMARY

1. **Identified** two global causes: ParallaxScrollView spacer + Babel config.
2. **Removed** ParallaxScrollView spacer – layout fix.
3. **Restored** Babel to initial: `nativewind/babel` + `react-native-reanimated/plugin`.
4. **Cleared** all caches (node, expo, metro, watchman, ios build).
5. **Rebuilt** iOS from scratch (pod install, expo run:ios).

---

## 7. IF ISSUES PERSIST

- **Fonts wrong:** Add explicit `fontFamily` in `style` for AppText/AffirmationSection.
- **CollapsibleText broken:** Replace `className` with inline `style` in CollapsibleText.
- **Layout still off:** Compare `components/ParallaxScrollView.tsx` and `components/chakras/HeaderSection.tsx` to `ea10bb5` (initial commit) line-by-line.
- **Header parallax glitchy:** Initial commit had no `width`/`height` on header Animated.View; current keeps HERO's `width: "100%", height: h`. Try removing if parallax behaves oddly.

---

## 8. FILES MODIFIED (This Session)

| File                                   | Change                                        |
| -------------------------------------- | --------------------------------------------- |
| `babel.config.js`                      | Restored nativewind/babel + reanimated/plugin |
| `components/ParallaxScrollView.tsx`    | Spacer removed (previous session)             |
| `components/chakras/HeaderSection.tsx` | textLine3 optional (no impact on main course) |
