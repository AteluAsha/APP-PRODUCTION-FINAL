# Main Course Pages – Design Break Investigation

**Mission:** Identify what caused ALL main course page designs to break (content, spacing, fonts).

**Method:** Systematic diff analysis, component tree audit, config verification.

---

## 1. CHANGES THAT AFFECT MAIN COURSE PAGES (ChakraTemplate → Day 1–7)

### 1.1 ParallaxScrollView (CRITICAL – layout)

| Version               | Content structure                                         | Effect                                                |
| --------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| **Initial (ea10bb5)** | `<View style={{ flex: 1 }}>{children}</View>` – no spacer | Content overlays header image                         |
| **HERO (35b7f79)**    | Spacer `<View height={h} />` before children              | Content pushed down by full screen height → black gap |
| **Current**           | Spacer removed – back to initial structure                | Content overlays header again                         |

**Conclusion:** Spacer removal restores initial layout. If designs are still broken, the cause is elsewhere.

---

### 1.2 HeaderSection (minor)

| Change                                                                    | Impact on main course                                                             |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `textLine3` made optional (`{textLine3 ? <AppText>...</AppText> : null}`) | **None** – ChakraTemplate always passes `textLine3` (e.g. `'Muladhara - "I am"'`) |

---

### 1.3 ChakraTemplate (navigation only)

| Change                                                  | Impact on layout/design    |
| ------------------------------------------------------- | -------------------------- |
| `lifetimeChosenTimegateJourney` in `navigateBack` logic | **None** – navigation only |

---

## 2. GLOBAL CONFIG – POSSIBLE ROOT CAUSES

### 2.1 Babel config (HIGH RISK)

| Version               | Presets                                             | Plugins                          | Notes                               |
| --------------------- | --------------------------------------------------- | -------------------------------- | ----------------------------------- |
| **Initial (ea10bb5)** | `nativewind/babel`                                  | `react-native-reanimated/plugin` | Original working setup              |
| **HERO (35b7f79)**    | `react-native-css-interop/babel` (top-level 0.1.22) | `[]` (empty)                     | Switched to avoid worklets conflict |
| **Current**           | Same as HERO                                        | Same as HERO                     | No change from HERO                 |

**Risk:**

- Different Babel pipeline for `className` (NativeWind vs css-interop) can change how styles compile.
- Reanimated plugin moved from root to inside css-interop; if not applied correctly, animations/layout can break.
- If “locked final design” was built with **initial** Babel, HERO’s Babel change could have broken styling app-wide.

---

### 2.2 Metro, Tailwind, globals.css

- **metro.config.js:** No diff vs HERO.
- **tailwind.config.js:** No diff vs HERO.
- **globals.css:** No diff vs HERO.

---

## 3. MAIN COURSE COMPONENT TREE – STYLING SOURCES

| Component          | Uses `className`?                                                           | Uses inline `style`?          | NativeWind risk?             |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------- | ---------------------------- |
| ChakraTemplate     | No                                                                          | Yes                           | Low                          |
| ParallaxScrollView | No                                                                          | Yes                           | Low                          |
| HeaderSection      | No                                                                          | Yes (“no className reliance”) | Low                          |
| HeaderBackground   | No                                                                          | Yes                           | Low                          |
| TextSection        | No (uses CollapsibleText)                                                   | Yes                           | Medium (via CollapsibleText) |
| CollapsibleText    | **Yes** (`containerClassName`, `textClassName`)                             | Partial                       | **High**                     |
| AffirmationSection | No                                                                          | Yes                           | Low                          |
| PillSection        | No                                                                          | Yes                           | Low                          |
| Pill               | Accepts `className` but **does not use it**                                 | Yes                           | None                         |
| FormattedText      | **Yes** (`baseClassName`, `paragraphSpacingClassName`, `segment.className`) | Partial                       | **High**                     |
| Part2Section       | No                                                                          | Yes                           | Low                          |
| Part3Section       | No                                                                          | Yes                           | Low                          |
| ElementsSection    | No                                                                          | Yes                           | Low                          |
| AudioRow           | Mixed                                                                       | Yes                           | Medium                       |
| AppText            | **Yes** (via `textVariants` → `className`)                                  | Yes (fallback color)          | **High**                     |

**Conclusion:** AppText, CollapsibleText, FormattedText, and any component using `className` depend on NativeWind/css-interop. If the Babel pipeline changed how `className` is compiled, these are the first places to break.

---

## 4. HYPOTHESIS MATRIX

| #   | Hypothesis                                                    | Evidence                                                              | Likelihood                                      |
| --- | ------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | **ParallaxScrollView spacer** caused layout break             | Plan identified spacer as cause; spacer removed                       | Addressed – if still broken, not the only cause |
| 2   | **Babel: nativewind → css-interop** changed style compilation | Initial used `nativewind/babel`; HERO/current use `css-interop/babel` | **High**                                        |
| 3   | **Reanimated plugin** not applied correctly                   | Root `plugins: []`; reanimated only inside css-interop                | Medium                                          |
| 4   | **AppText / tailwind-variants** `className` not applied       | AppText uses `tv()` → `className`; runtime class resolution can fail  | **High**                                        |
| 5   | **CollapsibleText / FormattedText** `className` fails         | Both use `className` for layout and text                              | **High**                                        |
| 6   | **Font loading** (KohSantepheap, Cormorant) fails             | Fonts in `useFonts`; `assetsReady` gates render                       | Medium                                          |
| 7   | **Metro/cache** stale build                                   | Old CSS or JS cached                                                  | Medium                                          |
| 8   | **Package version drift** (Expo, RN, nativewind, css-interop) | COMPARISON doc notes version changes                                  | Medium                                          |

---

## 5. VERIFICATION CHECKLIST

### 5.1 Layout (ParallaxScrollView)

- [ ] Hero text (Day 1, Root Chakra, Muladhara) overlays header image
- [ ] No large black gap between header and content
- [ ] HeaderSection sits at bottom of header image

### 5.2 Typography (AppText, fonts)

- [ ] KohSantepheap loads and applies for hero titles
- [ ] Cormorant italic loads and applies for affirmation
- [ ] Instrument Sans applies for body text
- [ ] No system fallback fonts where custom fonts should appear

### 5.3 Spacing and structure

- [ ] TextSection (OVERVIEW, SANSKRIT) margins correct
- [ ] AffirmationSection spacing and borders correct
- [ ] PillSection horizontal layout correct
- [ ] Part2Section (HEAD TO HEART, SOUND HEALING) layout correct
- [ ] Part3Section (Yoga) layout correct

### 5.4 NativeWind / className

- [ ] CollapsibleText `textClassName`, `containerClassName` apply
- [ ] FormattedText `baseClassName`, `paragraphSpacingClassName` apply
- [ ] AppText `textVariants` → `className` applies (font, size, color)
- [ ] Pill `className` – currently unused; verify Pill layout regardless

---

## 6. RECOMMENDED ACTIONS (in order)

1. **Confirm reference state**
   - Is “locked final design” = initial (ea10bb5) or HERO (35b7f79)?

2. **If initial = reference:**
   - Restore `babel.config.js` to initial: `nativewind/babel` + `react-native-reanimated/plugin`.
   - Clear Metro cache: `npx expo start --clear`.
   - Rebuild and re-test main course pages.

3. **If HERO = reference:**
   - ParallaxScrollView spacer removal is correct.
   - Focus on Babel / NativeWind: verify `className` and font application.
   - Add explicit `fontFamily` in `style` where fonts look wrong.

4. **Cache reset (always):**

   ```bash
   npx expo start --clear
   rm -rf node_modules/.cache
   ```

5. **Font fallback test:**
   - In AppText or AffirmationSection, add `style={{ fontFamily: "CormorantGaramondItalic" }}` (or equivalent) and see if appearance improves.

---

## 7. FILES MODIFIED (this session vs HERO)

| File                                    | Change                                   |
| --------------------------------------- | ---------------------------------------- |
| `components/ParallaxScrollView.tsx`     | Spacer removed                           |
| `components/chakras/HeaderSection.tsx`  | `textLine3` optional                     |
| `components/chakras/ChakraTemplate.tsx` | `navigateBack` logic only                |
| `app/(chakras)/HeadToHeart.tsx`         | Refactored (does not affect main course) |

---

## 8. SUMMARY

- **ParallaxScrollView:** Spacer removal aligns with initial layout; if layout is still wrong, the cause is elsewhere.
- **Babel / NativeWind:** Switch from `nativewind/babel` to `react-native-css-interop/babel` is the most likely global cause of styling/design breakage.
- **Components at risk:** AppText, CollapsibleText, FormattedText, and any use of `className`.
- **Next step:** Decide reference state (initial vs HERO), then either restore initial Babel or debug Babel/css-interop and font application.
