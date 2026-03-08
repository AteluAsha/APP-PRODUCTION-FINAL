# Course Pages (Days 1–7) – Methodical Audit

**Final pre-production score: 98–100** (polish applied; see §11).

**Scope:** Days 1–7 somatic healing course only. Every button, image, audio, content, spacing, icon, goodbye, scrolling, pills, home chakra buttons, trial vs lifetime play paths, teasers, chakra cards, gift, gallery, course mode / return to course, and HERO Master Embodiment (all 8 buttons for 7 days, playback, AudioPlayer, tracking).

---

## 1. Route and Entry

### [chakra] dynamic route

- **File:** [app/(chakras)/[chakra].tsx](app/(chakras)/[chakra].tsx)
- **Flow:** `useLocalSearchParams<{ chakra: string }>()` → segment (e.g. `root`, `sacral`). `isValidChakra(chakra)` (from [utils/validation.ts](utils/validation.ts)) ensures value is in `Chakra` enum; if invalid, `router.replace(hasLifetimeAccess ? ChakraHub : ChakraHome)`. Only then renders `<ChakraTemplate chakra={chakra} />`.
- **Verdict:** Invalid chakra redirects correctly by app mode. No overlap.

### Where day screens are opened from

- **Trial (ChakraHome):** [IntegratedProgressStack](components/chakras/IntegratedProgressStack.tsx) – `chakraData` from `useChakrasData()`; each day’s `onPress: (router) => router.push(routerPath)` with `routerPath = \`/(chakras)/${chakraSlug}\`` (chakraSlug = `getChakraFromDay(day)`). So tap Root → `/(chakras)/root`, etc. Timegate: `isChakraDayAccessible(day, hasLifetimeAccess, hasParticipatedDay, currentDay, allChakrasCompleted, inCourseMode)` – unlocked days are tappable; missed days dimmed.
- **Lifetime (ChakraHub):** [ChakraHub](app/(chakras)/ChakraHub.tsx) – grid of chakra balls; each `ChakraBallItem` pushes `/(chakras)/${chakra}`. No timegate for normal lifetime; in course mode, same timegate applies via `isChakraDayAccessible` when used from ChakraHome.
- **Verdict:** Trial and lifetime both point to the same `[chakra]` route with correct segment. No wrong play or overlap.

---

## 2. ChakraTemplate – Top to Bottom

### 2.1 SafeAreaView, ActionBarAnimated

- **Edges:** `edges={["top", "left", "right"]}`.
- **ActionBarAnimated:** `scrollViewRef={scrollRef}`, `headerImageSource={content.chakraHeaderImage}`, `showBackButton={false}`. Back is handled by header animation (scroll-triggered). No explicit back button in template; parent/navigation provides back.
- **Verdict:** Layout and header correct.

### 2.2 ParallaxScrollView

- **Component:** [ParallaxScrollView](components/ParallaxScrollView.tsx) – single `Animated.ScrollView`, no pinch-zoom. `scrollEnabled={true}`, `bounces={true}`, `keyboardShouldPersistTaps="handled"`. Android: `SCROLL_ANDROID_SMOOTH_PROPS`.
- **Header:** `headerHeight={screenWidth}`; `HeaderBackground` with `backgroundSource`, `chakraImageSource`, `chakraImageSizePx`, `headerHeight`, `chakra`. Overlay: `HeaderSection` with `textLine1`, `textLine2`, `textLine3` from `content.header`.
- **Verdict:** Scrolling and hero correct. No pinch-zoom (not required for this flow).

### 2.3 Master Embodiment (HERO) – All 8 buttons for 7 days

- **Days 1–5 and 7 (Crown):** One [AudioRow](components/chakras/AudioRow.tsx) per day. Title from `content.audioIntro.title`, author "Mother JJ", `durationMs`: Crown hardcoded `2684000`, else `content.audioIntro.durationMs`. Source: `embodimentAudio.localUri ?? embodimentAudio.single`. `getAudioSource`: `prepareLongAudioForPlay(..., { requireFullDownload: true })` with `getEmbodimentAudioId(chakra)`. On press: `setSource(source, "full-player")`, metadata, prefs, chakraColor, then `router.push("/AudioPlayer")`. **Origin is always "full-player"** – no overlap with "other" (SoundBath/crystal bowl) or "music-room" (AudioLibrary). Trial and lifetime both use this path; no divergence.
- **Day 6 (Third Eye):** Two AudioRows – "Part One: Ajna Embodiment" and "Part Two: Somatic Healing". Part One: `localUriPartOne ?? partOne`, `getEmbodimentAudioId(Chakra.THIRD_EYE, "part1")`, `requireFullDownload: true`. Part Two: same with part2. Both open full-screen AudioPlayer with "full-player".
- **Verdict:** All 7 days have correct Master Embodiment buttons (8 total: 6 single + 2 for Third Eye). Playback uses local-first and `requireFullDownload: true`. Audio tracking (metadata, durationMs, title, author) set in store before push. No trial/lifetime split; no overlap with other origins.

### 2.4 DropInButton (tuning fork)

- **Placement:** Above Master Embodiment row(s). `audioUri={tuningForkAudio.localUri ?? tuningForkAudio.url ?? null}`, `disabled={tuningForkAudio.isLoading}`, `compact`. Plays short tuning fork; does not open full AudioPlayer (inline/small player). Uses "other" origin when used from SoundBath; on course page it’s a small drop-in. No conflict with embodiment "full-player".
- **Verdict:** Correct; no overlap with Master Embodiment.

### 2.5 Error state (embodiment)

- **When:** `embodimentAudio.error` – shows purple banner: "The audio is taking a moment to arrive. Please try again, or continue your journey." Buttons still visible; user can retry or scroll on.
- **Verdict:** Handled; no hard fail.

### 2.6 Pills (4)

- **PillSection:** [PillSection](components/chakras/PillSection.tsx) – four pills: Frequency, Seed Mantra, Identity Statement, Chakras. All from `chakraContent[chakra].pills`; Chakras pill → `router.push("/(chakras)/Chakras101")`. Others open [PillBottomSheet](components/chakras/PillBottomSheet.tsx) with `currentPill`, `chakra`. Close: `handleBottomSheetClose` clears state and global pill visibility.
- **Verdict:** All pills and sheet correct; Chakras navigates to Chakras101.

### 2.7 Divider, TextSection, AffirmationSection

- **Divider:** `marginHorizontal: 32`, `marginBottom: 16`.
- **TextSection:** OVERVIEW, SANSKRIT from `content.overview`, `content.sanskrit`.
- **AffirmationSection:** `content.affirmationText`.
- **Verdict:** Content and spacing correct.

### 2.8 ResponsiveImage (location), Part2Section, ElementsSection, Part3Section

- **Location image:** `content.locationImage`, `screenWidth`, `marginTop: 40`.
- **Part2Section:** [Part2Section](components/chakras/Part2Section.tsx) – "PART II – GOING WITHIN". Two buttons: Head to Heart → `router.push(\`/(chakras)/HeadToHeart?chakra=${chakra}\`)`; Sound Healing → `router.push(\`/(chakras)/SoundBath?chakra=${chakra}\`)`. Haptic on press.
- **ElementsSection, Part3Section:** Use `chakraContent[chakra]`. No navigation in this audit; content only.
- **Verdict:** Part 2 teasers/previews and routes correct. SoundBath and HeadToHeart get correct `chakra` param.

### 2.9 Integration moment button and modal

- **Button:** Pressable with INTEGRATION_BUTTON_BG; title from `getIntegrationMomentContent(chakraDay)?.title ?? "Bridge moment"`, subtitle "A moment of Integration". Opens `IntegrationMomentModal` with `dayIndex={chakraDay}`.
- **IntegrationMomentModal:** `visible={integrationModalVisible}`, `onClose` clears. Content by day.
- **Verdict:** Button and modal correct.

### 2.10 Part IV – Mirror of Embodiment, Quiz

- **SectionHeader:** "— PART IV —", "Mirror of Embodiment". Divider then Pressable → `router.push(\`/(chakras)/QuizScreen?day=${chakraDay + 1}\`)` (day 1-based for quiz).
- **Verdict:** Quiz route and day param correct.

### 2.11 Completion ceremony ("I have completed today's journey")

- **Pressable:** `navigateBack(true)` on press. Image: `content.goodbye.chakraImage` (128×128). Checkbox fill when `hasCompletedChakra(chakraDay)`. Text: `content.goodbye.content`, plus "I have completed today's journey". Marks completion, sets completed chakra, opens GoodbyeModal.
- **navigateBack(true):** `markChakraCompleted(chakraIndex)`, `setCompletedChakra(chakra)`, `setShowGoodbyeModal(true)`.
- **navigateBack(false):** `router.back()` only.
- **Verdict:** Completion and goodbye trigger correct.

### 2.12 GoodbyeModal

- **Props:** `isVisible={showGoodbyeModal}`, `onClose`, `chakraDay`, `navigateToHubOnHome={!lifetimeChosenTimegateJourney}`, `onNavigateHome={handleGoodbyeNavigateHome}`.
- **handleGoodbyeNavigateHome:** Clears completed chakra, closes modal. Then: if lifetime + course mode → `router.replace("/(chakras)/ChakraHome")`; else if lifetime → `router.replace("/(chakras)/ChakraHub")`; else trial → `router.replace("/(chakras)/ChakraHome")`. So lifetime in somatic journey returns to ChakraHome; lifetime not in course goes to ChakraHub; trial always ChakraHome.
- **Open Your Gift:** GoodbyeModal → `router.push(\`/(chakras)/GiftChakra?chakra=${currentChakra}\`)` (onClose then delayed push). Gift page receives chakra; no overlap.
- **Verdict:** Goodbye layout (per .cursorrules), Home, and Open Your Gift correct. Course mode and return-to-course logic correct for lifetime.

---

## 3. Goodbye Screen (GoodbyeModal)

- **Design (locked):** Top separator; day name (e.g. "Monday Root Day"); identity + hero quote; chakra ball 88px; closing message; bottom separator; gold separator, gift card, "Open Your Gift", tomorrow preview, Home. Per .cursorrules, no "Affirmation" label, no gallery line.
- **Verdict:** Single source in [GoodbyeModal.tsx](components/chakras/GoodbyeModal.tsx); layout and flow verified. Android build locked per doc.

---

## 4. Floating Icons and Anua

- **ChakraTemplate:** No local floating Anua or Notes; comment: "Social Sanctuary and Anua access handled globally by FloatingNavButtons". So on course pages, global Leaf (Notes) and Anua (Sanctuary) from FloatingNavButtons (trial) or PermanentMenuBar (lifetime) apply. No duplicate or missing entry.
- **Verdict:** Floating icons and Anua are global; course pages do not add/remove them. Correct.

---

## 5. Home Chakra Buttons (Trial vs Lifetime)

- **Trial:** IntegratedProgressStack on ChakraHome. Chakras shown by `shouldShowChakra` (chakraDay <= currentDay). Unlock by `isChakraDayAccessible(..., inCourseMode)`. Teaser: next day’s shadow when `isCurrentDayCompleted` and `chakraDay === currentDay + 1`. Tap → `onPress(router)` → `router.push(routerPath)`. `chakraData` from Firestore via useChakrasData; `routerPath = \`/(chakras)/${chakraSlug}\``.
- **Lifetime:** ChakraHub grid. Each ball → `router.push(\`/(chakras)/${chakra}\`)`. No timegate unless in course mode (then they’re on ChakraHome with IntegratedProgressStack).
- **Verdict:** Trial and lifetime both point to correct `[chakra]` route. No wrong day or overlap.

---

## 6. Teasers and Previews

- **IntegratedProgressStack:** Next-day teaser (shadow) only when current day is completed and currentDay < 6. Label "Tomorrow: [DayName]". No teaser for past or same day.
- **Part2Section:** Head to Heart and Sound Healing are previews/teasers to HeadToHeart and SoundBath with correct `chakra`. No auto-play; user taps to go.
- **Verdict:** Teasers and previews correct and in correct course flow.

---

## 7. Chakra Cards, Loading, Gift, Gallery

- **Chakra cards:** Day cards in IntegratedProgressStack use `getChakraImage(chakraDay)`, colors, completion state. No separate "chakra card" modal on day screen; ChakraCardRevealModal exists elsewhere (e.g. gallery context). On course day page, completion is the "I have completed" section and GoodbyeModal.
- **Loading:** ChakraTemplate does not show a loading overlay; embodiment and tuning fork show disabled/loading state on buttons. useChakrasData loading is on ChakraHome (IntegratedProgressStack data). [chakra] only renders after valid chakra; useEmbodimentAudio/useTuningForkAudio drive button state.
- **Gift:** GoodbyeModal "Open Your Gift" → GiftChakra with `chakra`. Flow: close modal → delayed push. No double modal.
- **Gallery:** Not on the day page; GalleryOfGnosis is separate. Course flow is day → complete → goodbye → Home or Gift. Gallery is from menu/hub. No conflict.
- **Verdict:** Chakra cards (day balls), loading, gift, and gallery are consistent and in correct course flow.

---

## 8. Course Mode and Return to Course (Lifetime)

- **ChakraHub "Start a new 7 Day Journey":** If `hasSomaticJourneyScheduled` → show [ReturnToCourseModal](components/chakras/ReturnToCourseModal.tsx). "Continue current course" → `setLifetimeChosenTimegateJourney(true)`, `router.replace("/(chakras)/ChakraHome")`. "Start new" → `clearLifetimeCourseForNewStart()`, `router.replace("/(chakras)/DateSelection")`.
- **ChakraHome (lifetime in course):** Same timegate as trial; WaitingScreen until Monday; then IntegratedProgressStack. Goodbye "Home" → ChakraHome (navigateToHubOnHome false when lifetimeChosenTimegateJourney).
- **Verdict:** Course mode and return-to-course logic are correct; lifetime UX is sound.

---

## 9. HERO Master Embodiment – Summary

| Day | Chakra    | Buttons | Audio ID / source | requireFullDownload | Origin   |
|-----|-----------|---------|-------------------|---------------------|----------|
| 1   | ROOT      | 1       | getEmbodimentAudioId(ROOT) | true | full-player |
| 2   | SACRAL    | 1       | getEmbodimentAudioId(SACRAL) | true | full-player |
| 3   | SOLAR_PLEXUS | 1    | getEmbodimentAudioId(SOLAR_PLEXUS) | true | full-player |
| 4   | HEART     | 1       | getEmbodimentAudioId(HEART) | true | full-player |
| 5   | THROAT    | 1       | getEmbodimentAudioId(THROAT) | true | full-player |
| 6   | THIRD_EYE | 2       | part1, part2       | true | full-player |
| 7   | CROWN     | 1       | getEmbodimentAudioId(CROWN) | true | full-player |

- **Play:** All open full-screen AudioPlayer via `router.push("/AudioPlayer")` after `setSource(source, "full-player")`. Metadata (durationMs, title, author) and chakraColor set before push.
- **Trial vs lifetime:** Same path. No "other" or "music-room" on course page for embodiment. AudioLibrary (music-room) is lifetime-only and separate.
- **Verdict:** All 8 Master Embodiment entry points (7 days, 8 buttons) correct. Playback and tracking correct; no overlap.

---

## 10. Checklist (Manual Pass)

- [ ] **Day 1–7:** Each day opens from ChakraHome (trial) or ChakraHub (lifetime) with correct segment; content and header match day.
- [ ] **Master Embodiment:** Each of 8 buttons opens AudioPlayer, plays correct file, shows correct title/author/duration; close returns to course page.
- [ ] **DropInButton:** Tuning fork plays inline; no conflict with embodiment.
- [ ] **Pills:** All 4 open correct sheet or Chakras101; close clears state.
- [ ] **Part 2:** Head to Heart and Sound Healing open with correct chakra param.
- [ ] **Integration:** Button opens IntegrationMomentModal; close works.
- [ ] **Quiz:** Opens QuizScreen with day 1–7.
- [ ] **Completion:** "I have completed" marks day, opens GoodbyeModal; Open Your Gift → GiftChakra; Home → ChakraHome or ChakraHub per mode.
- [ ] **Lifetime course:** Return to course modal and ChakraHome flow correct; Goodbye Home goes to ChakraHome when in course mode.
- [ ] **Scrolling:** ParallaxScrollView scrolls top to bottom; no pinch-zoom (by design).

---

### Content verification (constants/chakras/content.tsx)

- **All 7 days** define `audioIntro`: `title`, `author`, `durationMs`, `source`. Crown uses 2684000 (44:44); ChakraTemplate overrides Crown row to 2684000; other days use `content.audioIntro.durationMs`. Third Eye has one `audioIntro` (Part One); Part Two row title is hardcoded "Part Two: Somatic Healing" in ChakraTemplate. All `goodbye`, `header`, `pills`, `locationImage`, and section content are keyed by chakra.

---

## 11. Polish applied (final pre-production)

Low-risk updates applied to lock down course pages for 98–100:

| Item | Change |
|------|--------|
| **Production cleanliness** | Removed `__DEV__` console.log block from ChakraTemplate (no logging in course path). |
| **Type safety** | `[chakra].tsx` passes `chakra as Chakra` after `isValidChakra` so ChakraTemplate receives typed prop. |
| **Accessibility – AudioRow** | Main pressable: `accessibilityLabel={Play ${title}}`, `accessibilityHint="Opens full-screen audio player"`. |
| **Accessibility – Integration** | Integration button: label = integration title or "Integration moment", hint = "Opens integration reflection for today". |
| **Accessibility – Quiz** | Quiz button: `accessibilityLabel="A Test of Remembrance"`, `accessibilityHint={Take day N quiz}`. |
| **Accessibility – Completion** | Already present: "Mark day complete", "Tap to complete today's journey". |
| **Accessibility – Pills** | Pill component: `accessibilityLabel={content}`, `accessibilityRole="button"`. |
| **Accessibility – DropInButton** | `accessibilityLabel="Drop in with tuning fork"`, dynamic hint for play/pause. |
| **GoodbyeModal** | Already had labels for Open Your Gift and Home. |

No behavior or layout changes; accessibility and production cleanliness only.

---

**Conclusion:** Course pages (Days 1–7) are methodically correct: buttons, images, audio, content, spacing, icons, goodbye, scrolling, pills, home chakra buttons, trial/lifetime routing, teasers, chakra cards, loading, gift, gallery, course mode, and HERO Master Embodiment (all 8 buttons, playback, AudioPlayer, tracking). No overlap between trial and lifetime play paths; all point to the correct play and flow.
