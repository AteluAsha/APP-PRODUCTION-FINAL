# Timegate and Formatting Restoration

## Standard Formatting (Restored Site-Wide)

All critical layout and visibility use **explicit `style`** so displays are correct when Tailwind/className do not apply. No design changes—restoration only.

### Spacing Conventions

- **Section spacing:** 16, 24, 32, 40 (marginBottom, marginTop, padding)
- **Inline spacing:** 4, 8, 12, 16 (gap, marginLeft/Right, paddingHorizontal)
- **Content width:** 83.33% for centered blocks; 100% for full-width; maxWidth where needed

### Text and Color

- **Primary text:** `color: "#ffffff"` or `rgba(255,255,255,0.9)` for emphasis
- **Secondary:** `rgba(255,255,255,0.7)`–`0.8`; muted `0.4`–`0.5`
- **Accent (amber/gold):** `rgba(251,191,36,0.9)` for labels
- **Centered copy:** `textAlign: "center"` in style

### Components Restored (7-Day Course + Flows)

- **ChakraHome:** Error state and "Trial 2 of 2" block use explicit style
- **IntegratedProgressStack:** Root and stack containers, chakra row, title row (current + teaser), chakra container—all explicit flex/align/margin/color
- **WaitingScreen:** Root container (flex, backgroundColor), Exit course mode button and text, For Deepest Embodiment block (width, borderRadius, padding, inner rows)
- **TrialTestFlow:** Removed className from dev buttons; layout already in StyleSheet
- **ChakraTemplate, AudioRow, Pill, Divider, Part2/Part3, YogaSection, SectionHeader, TextButtonSection, TextSection, AffirmationSection, HeadToHeart, SoundBath, SoundBathButton, CrystalBowlButton:** Previously updated with explicit styles

---

## Timegate UX Flow (Verified)

### Service: `src/services/timegate.ts`

- **isDevelopmentOverrideActive():** `__DEV__ === true` → all timegates bypassed
- **isChakraDayAccessible(dayIndex, hasLifetimeAccess, hasParticipatedDay, currentDay, allChakrasCompleted, inCourseMode?):**
  - Dev: returns `true` for all days
  - Lifetime + inCourseMode: trial logic (current day + participated)
  - Lifetime: always `true`
  - Trial: current day + participated days + completed; no future/missed access
- **shouldShowWaitingScreen(hasLifetimeAccess, hasReachedStartDate, isMonday, journeyStarted, isFirstLaunch, courseStartDate, lifetimeChosenTimegateJourney?):**
  - Lifetime in somatic journey: trial waiting logic (until Monday/start date)
  - Lifetime normal: never show
  - Trial: show when !hasReachedStartDate || !isMonday || !journeyStarted
  - Dev: show only when !journeyStarted && (courseStartDate || isFirstLaunch)

### ChakraHome Effect (Seamless Flow)

1. **devOpenPaywall:** If set, open paywall and clear; no blocking
2. **shouldShowCommitmentGate:** After 2 trials (Sunday) → show CommitmentGate
3. **Lifetime redirect:** If hasLifetimeAccess && !lifetimeChosenTimegateJourney → replace to ChakraHub
4. **Waiting screen:** `showWaiting = shouldShowWaitingScreenCheck(...)`; `setShowWaitingScreen(showWaiting)`
5. **Auto-start:** On Monday when hasReachedStartDate && !journeyStarted && canAutoStart && !showWaiting → `startJourney(currentWeekStartDate)`

### DateSelection

- **handleConfirmDate:** Sets `setInitialOpenDate(todayISO)` and `setCourseStartDate(selectedDateISO)` (chosen Monday). Reminders scheduled.

### IntegratedProgressStack & ChakraHub

- **IntegratedProgressStack:** Calls `isChakraDayAccessible(chakraDay, hasLifetimeAccess, hasParticipatedDay, currentDay, allChakrasCompleted, inCourseMode)` for each chakra
- **ChakraHub getChakraBallProps:** When inCourseMode, calls `isChakraDayAccessible(..., true, ..., true)` so lifetime somatic journey uses trial timegates

---

## Dev Tools (Restored, Not Impeding)

- **TrialTestFlow** (only in `__DEV__`):
  - Red: Open DevPaywall
  - Green: Bypass waiting room → set course start, start journey, mark day 0 participated, replace to ChakraHome
  - Purple: Grant lifetime, replace to ChakraHub
  - Yellow: Unlock next day (markDayParticipated(currentDay + 1))
  - Gift: Grant scholarship (when on paywall after 2 trials)
- **Timegate in dev:** All days accessible; waiting screen only when !journeyStarted && (courseStartDate || isFirstLaunch). Green button starts journey and hides waiting.
- No production impact: TrialTestFlow returns `null` when `!__DEV__`.

---

## Visual Harmony Checklist (7 Days)

- Chakras 0–6: HeaderSection, embodiment/outro audio, pills, overview, affirmation, location image, Part 2 (Head to Heart, Sound Bath), Part 3 (Yoga), Mirror button, Completion block—all use explicit layout/color
- APP1 home: IntegratedProgressStack (flex, justify-end, paddingBottom 90), Trial label, Continue Your Journey block—explicit
- APP2 ChakraHub: ScrollView and hero/grid use explicit style
- WaitingScreen: Root, back button, Exit course mode, For Deepest Embodiment container—explicit

When something looks off-center or inconsistent, compare to these and restore with explicit `style` only; do not change the intended design.
