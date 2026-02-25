# APP1 & APP2 Day-by-Day Verification

## Flow Overview

- **Day 0 = Root (Monday)** … **Day 6 = Crown (Sunday)**. Display labels use "Day 1" … "Day 7".
- **APP1 (trial):** Welcome → DateSelection → WaitingScreen → ChakraHome → [chakra] by day.
- **APP2 (lifetime):** ChakraHub → [chakra]. Same [chakra] course page (ChakraTemplate) for both.

---

## 7-Day Course Audit (Completed)

All **main course pages** ([chakra] route = ChakraTemplate) were audited so layout and visibility do **not** depend on `className`. Explicit `style` was added for:

### ChakraTemplate (all 7 days)

- **Loading/error states:** Text color and fontStyle in `style`.
- **Divider:** `style={{ marginHorizontal: 32, marginBottom: 16 }}` (Divider accepts `style`).
- **Location image:** ResponsiveImage with `style={{ alignSelf: "center", marginTop: 40 }}`.
- **Mirror Of Embodiment:** Wrapper View (marginTop, marginBottom, alignItems); inner row (flexDirection, alignItems, gap, zIndex); AppText (textAlign, color, marginTop).
- **Completion Ceremony:** Wrapper and Pressable (marginTop, marginBottom, alignItems); goodbye text and “I have completed” text (textAlign, color, margins).

### Sections used on every chakra day

- **PillSection / Pill:** Explicit padding, border, borderRadius, flexShrink, text color.
- **AudioRow:** Single merged `style` on Pressable; inner row (flexDirection, paddingLeft); play icon container (marginLeft); text block (marginLeft, marginBottom, fontSize, color).
- **Divider:** Height 1, backgroundColor; optional `style` prop.
- **TextSection:** Container marginVertical; title marginHorizontal, marginBottom, fontSize, color.
- **AffirmationSection:** Divider lines and center block with explicit dimensions, padding, textAlign, color.
- **Part2Section:** ImageBackground flex, borderRadius, padding, marginTop, alignItems; inner View paddingHorizontal, marginTop, marginBottom.
- **Part3Section:** View marginTop; divider line (height, backgroundColor, width, alignSelf, marginBottom).
- **YogaSection:** Container (justifyContent, alignItems, marginBottom); all AppText (margins, color, lineHeight); ResponsiveImage marginTop, borderRadius, opacity; bottom divider.
- **SectionHeader:** Container marginBottom; all AppText textAlign, margins, letterSpacing, color.
- **TextButtonSection:** Container marginBottom; heading/description margins and color; Pressable border, padding, backgroundColor; button text textAlign, color.
- **ElementsSection:** ResponsiveImage style marginTop only (width from props).

### Path 1 (Head to Heart) and Path 2 (Sound Bath)

- **HeadToHeart:** ScrollView contentContainerStyle (marginHorizontal, paddingBottom); title/subtitle/master key/daily activity blocks with explicit margins, padding, colors, textAlign.
- **SoundBath:** ResponsiveImageBackground `style` (marginTop, alignItems); all headings, “Helps with” / “Real-world effect” box, quote, track buttons wrapper, paragraph, footer with explicit style.
- **SoundBathButton / CrystalBowlButton:** Full layout in `style` (border, padding, width, row, icon size, text color) so they render correctly on all 7 days.

### Content and audio

- **constants/chakras/content.tsx:** All 7 chakras (ROOT … CROWN) have full content (header, audioIntro, audioOutro, elements, pills, yoga, soundBath, goodbye, headtoheart, locationImage, etc.).
- **useEmbodimentAudio:** Day 0 → Day1 file, … Day 5 → two-part, Day 6 → Day7 file (Firebase). Bundled fallbacks in content for offline.
- **Assets:** All required images (1header–7header, chakra images, location, elements, goodbye) and bundled audio (root-erin-1, root-ethan-1, day1tuningfork, day1singingbowl) exist; per-day embodiment from Firebase.

---

## APP1 (Trial) – Day-by-Day

| Day | Chakra         | Check                                                                                                                                                                                                                                         |
| --- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | Root           | WelcomeModal, DateSelection, WaitingScreen. ChakraHome hero + CTA. [root]: header, embodiment audio, pills, overview, affirmation, location image, Part 2 (Head to Heart, Sound Bath), Part 3 (Yoga), outro audio, Mirror button, Completion. |
| 1–6 | Sacral … Crown | Same structure; content and assets per chakra. Day 5 (Third Eye): two embodiment audio rows.                                                                                                                                                  |

---

## APP2 (Lifetime) – Day-by-Day

- **ChakraHub:** Hero, chakras grid (Root at bottom, Crown at top), sanctuary cards. Explicit styles on ScrollView and hero/grid.
- **Each [chakra]:** Same ChakraTemplate as APP1; layout and visuals restored via explicit `style` so all 7 days display correctly.

---

## Original Positions / Production State

- **HeaderSection:** Hero title container: flex 1, justifyContent flex-end, marginLeft 24, marginBottom 12, marginRight 56 or 16, maxWidth 100%.
- **ChakraTemplate:** Content wrapper paddingBottom 80; loading/error boxes 83.33% width, centered, marginTop 24, border, borderRadius 12, padding 16, alignItems center.
- **ChakraHome / ChakraHub:** SafeAreaView and ScrollView flex 1, backgroundColor; hero and grid containers with explicit alignItems, marginBottom, padding.
- **ResponsiveImage / ResponsiveImageBackground:** Accept optional `style` prop; ChakraTemplate and SoundBath pass alignSelf, marginTop, etc.

When something is off-center or spaced wrong, compare to these and restore with explicit layout (style).
