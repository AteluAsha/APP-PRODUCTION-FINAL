# Days 1–7 Hero Layout Verification Checklist

**Build status:** iOS build succeeded (0 errors, 5 warnings)  
**Date:** Feb 20, 2026  
**Restoration:** ParallaxScrollView, HeaderSection, HeaderBackground, AudioRow, PillSection, ChakraTemplate loading/error Views

---

## Routes for Days 1–7

| Day | Chakra       | Route                 | Content                                         |
| --- | ------------ | --------------------- | ----------------------------------------------- |
| 1   | Root         | `/(chakras)/root`     | Day 1, Root Chakra, Muladhara - "I am"          |
| 2   | Sacral       | `/(chakras)/sacral`   | Day 2, Sacral Chakra, Svadhisthana - "I feel"   |
| 3   | Solar Plexus | `/(chakras)/solar`    | Day 3, Solar Plexus Chakra, Manipura - "I do"   |
| 4   | Heart        | `/(chakras)/heart`    | Day 4, Heart Chakra, Anahata - "I love"         |
| 5   | Throat       | `/(chakras)/throat`   | Day 5, Throat Chakra, Vishuddha - "I speak"     |
| 6   | Third Eye    | `/(chakras)/thirdeye` | Day 6, Third Eye Chakra, Ajna - "I see"         |
| 7   | Crown        | `/(chakras)/crown`    | Day 7, Crown Chakra, Sahasrara - "I understand" |

---

## Verification Steps (Manual)

### For each day (1–7), verify:

1. **Hero header**
   - [ ] Hero text overlays header image (no black gap above)
   - [ ] "Day N" in smaller size (2xl)
   - [ ] Chakra name in larger size (4xl), e.g. "Heart Chakra"
   - [ ] Sanskrit line, e.g. "Anahata - \"I love\""
   - [ ] Gradient fade from transparent to black at bottom of hero

2. **Master embodiment button**
   - [ ] "Good Morning [Chakra]!" button visible (or Part One/Part Two for Day 6)
   - [ ] White border, rounded corners, play icon
   - [ ] Author "with Mother JJ" and duration
   - [ ] Tap opens AudioPlayer

3. **Pill section**
   - [ ] Four pills visible: Frequency (e.g. 639 Hz), Seed Mantra (e.g. Yam), Identity ("I love"), Chakras
   - [ ] Pills wrap or display in a row
   - [ ] Tap opens bottom sheet or navigates as expected

4. **Content sections**
   - [ ] OVERVIEW section with "See more" expand
   - [ ] SANSKRIT section with "See more" expand
   - [ ] Affirmation section
   - [ ] Location image
   - [ ] Part 2, Elements, Part 3 sections
   - [ ] Outro audio row
   - [ ] Mirror Of Embodiment quiz button
   - [ ] Completion Ceremony (chakra ball + "I have completed today's journey")

5. **Layout**
   - [ ] No content cut off or overflowing
   - [ ] Scroll works smoothly
   - [ ] Back arrow visible and functional

---

## Day 6 (Third Eye) Special Case

- [ ] Two embodiment buttons: "Part One: Ajna Embodiment" and "Part Two: Somatic Healing"
- [ ] Both load and play correctly

---

## Day 7 (Crown) Special Case

- [ ] Single embodiment with longer duration (~45 min)
- [ ] All standard layout elements present

---

## Build Verification (Completed)

- [x] Kill all Expo/Metro processes
- [x] Clear node_modules/.cache, .expo, watchman
- [x] `npx expo run:ios` – Build succeeded
- [x] App launches on iPhone 17 Pro simulator
- [x] Metro bundles (2047 modules)
- [x] ChakraTemplate renders (throat verified in logs)
- [x] useEmbodimentAudio fetches successfully (hasSingle: true)

---

## Troubleshooting

If layout is still wrong:

1. **Reload:** Shake device → Reload, or press `r` in Metro terminal
2. **Full restart:** Kill Metro, `npx expo start --clear --ios`
3. **className not applied:** If Tailwind classes fail, components use inline fallbacks where added; AudioRow has `style={{ borderRadius: 18, paddingVertical: 18 }}` on Pressable
4. **Buttons missing:** Check console for `[ChakraTemplate] Embodiment audio state` – if hasSingle/hasPartOne/hasPartTwo is false, Firebase URLs may not be loading
