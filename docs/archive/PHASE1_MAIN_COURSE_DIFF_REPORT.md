# Phase 1: Main Course Diff Report (ea10bb5 vs Current)

**Purpose:** Categorize every change so we can restore layout/structure while keeping features.

---

## Summary Table

| File               | Layout/Structure | Feature                       | Ambiguous | Action                                                           |
| ------------------ | ---------------- | ----------------------------- | --------- | ---------------------------------------------------------------- |
| ParallaxScrollView | ✓                |                               |           | Restore initial (remove width/height, restore flex:1 on content) |
| HeaderSection      | ✓                | ✓ rightContent                |           | Restore initial layout; keep rightContent slot                   |
| HeaderBackground   | ✓                |                               |           | Restore initial (aspect-square) OR keep inline + explicit height |
| ChakraTemplate     | ✓                | ✓ many                        | ✓         | Restore layout wrappers; keep features                           |
| TextSection        | ✓                |                               |           | Restore initial (className)                                      |
| AffirmationSection | ✓                |                               |           | Restore initial (className)                                      |
| PillSection        | ✓                |                               |           | Restore initial (View + className) OR keep ScrollView            |
| Divider            | ✓                |                               |           | Restore initial (className)                                      |
| Part2Section       | ✓                |                               |           | Restore initial (className)                                      |
| Part3Section       | ✓                | ✓                             |           | Restore initial (className)                                      |
| ElementsSection    | ✓                |                               |           | Restore initial (className)                                      |
| AudioRow           | ✓                | ✓ chakraColor, router.replace |           | Restore initial layout; keep chakraColor, replace                |
| AppText            |                  |                               | ✓         | Keep DEFAULT_TEXT_COLOR fallback                                 |
| babel.config.js    | ✓                |                               |           | Already restored                                                 |

---

## 1. ParallaxScrollView

| Change                                     | Category | Restore? | Notes                               |
| ------------------------------------------ | -------- | -------- | ----------------------------------- |
| Added width/height on header Animated.View | Layout   | **Yes**  | Initial had none; may affect layout |
| Added pointerEvents="none" on header       | Layout   | No       | Harmless, keep                      |
| Content View: flex:1 → no flex             | Layout   | **Yes**  | Initial had flex:1; restore         |
| Comment changes                            | —        | No       | Ignore                              |

**Action:** Restore content to `<View style={{ flex: 1 }}>{children}</View>`. Optionally remove width/height from header to match initial exactly.

---

## 2. HeaderSection

| Change                                                  | Category | Restore? | Notes                           |
| ------------------------------------------------------- | -------- | -------- | ------------------------------- |
| className → inline style (flex-col, flex-1, ml-6, mb-3) | Layout   | **Yes**  | Initial used className          |
| textLine1: size 2xl → xl, added heroShadow              | Layout   | **Yes**  | Initial: size 2xl, no shadow    |
| textLine2: size 4xl → 2xl, added heroShadow             | Layout   | **Yes**  | Initial: size 4xl               |
| textLine3: no size → size sm, optional render           | Layout   | **Yes**  | Initial: no size, always render |
| rightContent prop + Drop In slot                        | Feature  | **Keep** | Add back after restore          |
| marginLeft: 24 vs ml-6 (24px)                           | Layout   | Same     | ml-6 = 24px                     |
| marginBottom: 12 vs mb-3 (12px)                         | Layout   | Same     | mb-3 = 12px                     |

**Action:** Restore initial structure and className. Re-add rightContent support after.

---

## 3. HeaderBackground

| Change                                                    | Category | Restore? | Notes                                     |
| --------------------------------------------------------- | -------- | -------- | ----------------------------------------- |
| className (w-full aspect-square) → inline (width, height) | Layout   | **Yes**  | Initial: aspect-square = square header    |
| height prop (optional, default 400)                       | Layout   | **Yes**  | Initial had no height; used aspect-square |
| Dark overlay View (HERO_OVERLAY_OPACITY)                  | Layout   | Keep?    | Improves consistency; not in initial      |
| onError handlers                                          | Feature  | Keep     | Good practice                             |
| marginTop: 64 on chakra Image                             | Layout   | Same     | mt-16 = 64px                              |

**Action:** Restore initial (aspect-square, no height prop). ChakraTemplate must NOT pass height. If aspect-square fails with current Babel, fall back to inline style with height={screenWidth}.

---

## 4. ChakraTemplate

| Change                                                                 | Category | Restore?   | Notes                              |
| ---------------------------------------------------------------------- | -------- | ---------- | ---------------------------------- |
| View className="pb-20" → style paddingBottom: 80                       | Layout   | **Yes**    | Same value; initial used className |
| View className="bg-black" → style backgroundColor                      | Layout   | **Yes**    | Same; initial used className       |
| HeaderBackground height={screenWidth}                                  | Layout   | **Revert** | Initial didn't pass height         |
| rightContent on HeaderSection                                          | Feature  | **Keep**   | DropInButton for Lifetime          |
| PillSection wrapper View                                               | Layout   | **Yes**    | Initial had no wrapper             |
| Divider className → style                                              | Layout   | **Yes**    | Initial: className="mx-8 mb-4"     |
| ResponsiveImage className → style                                      | Layout   | **Yes**    | Initial: className mt-10           |
| All loading/error/audio Views: className → style                       | Layout   | **Yes**    | Initial used className             |
| Mirror Of Embodiment Quiz button                                       | Feature  | **Keep**   | New feature                        |
| Completion Ceremony: purple gradient → earth tones, separate from quiz | Feature  | **Keep**   | Current design                     |
| Social Sanctuary / Anua / MiniAudioPlayer removed                      | Feature  | **Keep**   | Now global                         |
| navigateBack: router.back → router.replace logic                       | Feature  | **Keep**   | Correct home routing               |
| Mark completion on mount removed                                       | Feature  | **Keep**   | Bug fix                            |
| Pill press: FREQUENCY → SoundBath in initial; now opens bottom sheet   | Feature  | **Keep**   | Current behavior                   |
| useTuningForkAudio, DropInButton, PillBottomSheet                      | Feature  | **Keep**   | New features                       |

**Action:** Restore layout wrappers (className where initial had it). Keep all feature changes. Remove height from HeaderBackground.

---

## 5. TextSection

| Change                                           | Category | Restore? | Notes                                                            |
| ------------------------------------------------ | -------- | -------- | ---------------------------------------------------------------- |
| View className="my-4" → style marginVertical: 16 | Layout   | **Yes**  | my-4 = 16px; same                                                |
| AppText className mx-8 mb-1 text-[13px] → style  | Layout   | **Yes**  | mx-8=32, mb-1=4; current has marginHorizontal:32, marginBottom:4 |
| CollapsibleText                                  | —        | Same     | Both use it                                                      |

**Action:** Restore initial className. Values are equivalent; initial may have relied on Tailwind.

---

## 6. AffirmationSection

| Change                           | Category | Restore? | Notes                           |
| -------------------------------- | -------- | -------- | ------------------------------- |
| Divider Views: className → style | Layout   | **Yes**  | Same values                     |
| Container: className → style     | Layout   | **Yes**  | py-6=24, mx-2=8, rounded-3xl=24 |
| AppText: className → style       | Layout   | **Yes**  | Same values                     |

**Action:** Restore initial className.

---

## 7. PillSection

| Change                                          | Category | Restore?      | Notes                                                                                                     |
| ----------------------------------------------- | -------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| View flex-row flex-wrap → ScrollView horizontal | Layout   | **Ambiguous** | Initial: View with flex-wrap. Current: horizontal ScrollView. ScrollView may be intentional for overflow. |
| className mr-3 → className flex-shrink-0        | Layout   | **Yes**       | Different approach                                                                                        |
| mx-4 my-7 → contentContainerStyle               | Layout   | **Yes**       | Initial: mx-4 (16), my-7 (28)                                                                             |

**Action:** Restore initial View + className. If pills overflow on small screens, consider keeping ScrollView but with initial spacing.

---

## 8. Divider

| Change                 | Category | Restore? | Notes                                                   |
| ---------------------- | -------- | -------- | ------------------------------------------------------- |
| className → style prop | Layout   | **Yes**  | Initial used className; ChakraTemplate passes className |
| style prop added       | Feature  | Keep     | Allows override                                         |

**Action:** Restore initial (className). ChakraTemplate passes Divider className="mx-8 mb-4" in initial.

---

## 9. Part2Section

| Change                            | Category | Restore? | Notes                               |
| --------------------------------- | -------- | -------- | ----------------------------------- |
| ImageBackground className → style | Layout   | **Yes**  | flex, rounded-3xl, pb-8, pt-8, mt-4 |
| View className → style            | Layout   | **Yes**  | flex-1, px-10, mt-6, mb-2           |

**Action:** Restore initial className.

---

## 10. Part3Section

| Change                                   | Category | Restore? | Notes         |
| ---------------------------------------- | -------- | -------- | ------------- |
| View className mt-8 → style marginTop 32 | Layout   | **Yes**  | mt-8 = 32px   |
| Divider View className → style           | Layout   | **Yes**  | h-[1px], etc. |

**Action:** Restore initial className.

---

## 11. ElementsSection

| Change                            | Category | Restore? | Notes              |
| --------------------------------- | -------- | -------- | ------------------ |
| ResponsiveImage className → style | Layout   | **Yes**  | flex, w-full, mt-6 |

**Action:** Restore initial className.

---

## 12. AudioRow

| Change                                   | Category | Restore? | Notes                       |
| ---------------------------------------- | -------- | -------- | --------------------------- |
| Pressable className → style              | Layout   | **Yes**  | w-10/12, mt-6, border, etc. |
| chakraColor prop                         | Feature  | **Keep** | For gradient                |
| router.push → router.replace             | Feature  | **Keep** | Prevents double AudioPlayer |
| Inner View/play button className → style | Layout   | **Yes**  | Same values                 |

**Action:** Restore initial layout (className). Keep chakraColor, router.replace.

---

## 13. AppText

| Change                               | Category  | Restore? | Notes                                   |
| ------------------------------------ | --------- | -------- | --------------------------------------- |
| DEFAULT_TEXT_COLOR fallback in style | Ambiguous | **Keep** | Ensures text visible if className fails |

**Action:** Keep current. Fallback is safe.

---

## 14. babel.config.js

| Change                                    | Category | Restore? | Notes            |
| ----------------------------------------- | -------- | -------- | ---------------- |
| Restored to nativewind/babel + reanimated | Layout   | **Done** | Already restored |

**Action:** None. Already correct.

---

## Execution Order (Phase 2–3)

1. **ParallaxScrollView** – Restore content View flex:1; optionally remove header width/height
2. **HeaderBackground** – Restore initial (no height prop, aspect-square). If ChakraTemplate passes height, remove it.
3. **HeaderSection** – Restore initial (className). Re-add rightContent.
4. **ChakraTemplate** – Restore className on wrappers; remove HeaderBackground height; keep features
5. **TextSection, AffirmationSection, Divider, Part2Section, Part3Section, ElementsSection** – Restore className
6. **PillSection** – Restore initial View + className (or keep ScrollView with initial spacing)
7. **AudioRow** – Restore className; keep chakraColor, router.replace

---

## Risk: className Dependency

The initial used `className` throughout. We restored Babel to `nativewind/babel`. If `className` still doesn't compile correctly, restoring className-based components may not fix layout. In that case, we'd need to keep inline styles but ensure values match initial (e.g. ml-6 = 24, mt-10 = 40).
