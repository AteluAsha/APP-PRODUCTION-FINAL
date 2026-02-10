# App2 Course Mode – Native Implementation Plan

**Goal:** Recreate the 7-day somatic journey experience entirely within App2, without switching back to App1 (ChakraHome). Same structure as trial: Monday start, Root illuminated, next day at midnight, complete → goodbye → wait. One-button toggle: "Exit course" / "Return to course".

---

## Current State (What We're Replacing)

- **Lifetime somatic flow:** ChakraHub → "Access course" → ChakraHome (App1 trial screen)
- **Problems:** Context switch, different layout (ChakraHome vs ChakraHub), FloatingNavButtons vs PermanentMenuBar, two different "homes"

## Proposed State

- **Lifetime somatic flow:** ChakraHub → "Access course" → ChakraHub in **course mode**
- **Benefits:**
  - Single home (ChakraHub), two modes: browse vs course
  - PermanentMenuBar always visible (Music, Community, Notes, Anua)
  - Same timegate logic, same UX (IntegratedProgressStack, waiting screen, goodbye)
  - Simple toggle: "Exit course" (top right) ↔ "Return to course" (button)

---

## Architecture Overview

```
ChakraHub (App2)
├── BROWSE MODE (default)
│   ├── Hero: Day title + chakra grid (all 7, no timegates)
│   ├── Sanctuary menu (Gallery, Community, etc.)
│   └── "Start a new 7 Day Somatic Journey" / "Access course" / "Return to course"
│
└── COURSE MODE (when active)
    ├── [Exit course] button (top right)
    ├── WaitingScreen (until Monday/start date) OR IntegratedProgressStack (timegated chakras)
    └── Same logic as trial: Root at bottom, progressive reveal, complete → goodbye → wait
```

---

## Phase 1: State and Timegate Support

### 1a. Add Course Mode Flag (persisted)

**File:** `hooks/useChakraJourneyStore.ts`

- Add `courseModeActive: boolean` (default `false`) – persisted
- When `true`, ChakraHub renders course view instead of browse view
- "Exit course" → `setCourseModeActive(false)`
- "Access course" / "Return to course" → `setCourseModeActive(true)`
- Reuse existing: `courseStartDate`, `journeyStarted`, `participatedDays`, `completedChakras`, `journeyWeekStartDate` for course-mode progress
- **Alternative:** Keep `lifetimeChosenTimegateJourney` (session) but treat it as "in course view". Persist `courseStartDate` so "Return to course" works. When they tap "Return to course", set `lifetimeChosenTimegateJourney(true)` and render course view. "Exit course" sets it false. No new persisted field if we're okay with session-only "active course" – but then reopening the app would lose "in course" state. For "Return to course" to work across app restarts, we need persisted `courseModeActive` or equivalent.

**Recommendation:** Add `courseModeActive: boolean` (persisted). When `hasLifetimeAccess && courseModeActive && courseStartDate`, we're in an active course. "Exit" clears `courseModeActive`. "Start new" goes to DateSelection; "Return to course" sets `courseModeActive(true)`.

### 1b. Timegate: Apply Trial Logic for Course Mode

**File:** `src/services/timegate.ts`

- Add optional param: `applyTrialTimegates?: boolean` to `isChakraDayAccessible`
- When `applyTrialTimegates === true` (lifetime user in course mode), use trial logic regardless of `hasLifetimeAccess`
- When `hasLifetimeAccess && !applyTrialTimegates`, return `true` (all accessible)
- Same for `shouldShowWaitingScreen`: add `applyTrialTimegates`; when true, use trial waiting logic for lifetime

**File:** `components/chakras/IntegratedProgressStack.tsx`

- Add prop: `applyTrialTimegates?: boolean` (default `false`)
- Pass through to `isChakraDayAccessible(..., applyTrialTimegates)`
- When in course mode, pass `applyTrialTimegates={true}`

---

## Phase 2: ChakraHub Dual-Mode UI

### 2a. ChakraHub Layout Modes

**File:** `app/(chakras)/ChakraHub.tsx`

**Logic:**
```
const isInCourseMode = hasLifetimeAccess && courseModeActive && courseStartDate
```

- **Browse mode** (`!isInCourseMode`): Current UI (hero, chakra grid, Sanctuary, somatic button)
- **Course mode** (`isInCourseMode`): Replace main content with:
  - [Exit course] button (top right)
  - Either WaitingScreen OR IntegratedProgressStack (same as ChakraHome)

### 2b. Course Mode Content

- **WaitingScreen** when: `shouldShowWaitingScreen(hasLifetimeAccess, hasReachedStartDate, isMonday, journeyStarted, ..., applyTrialTimegates: true)`
- **IntegratedProgressStack** when: not waiting
- Reuse `IntegratedProgressStack` with `hasLifetimeAccess={false}` or new `applyTrialTimegates={true}` for timegate behavior
- Use `getCurrentDayOfWeek()` for `currentDay` (calendar day, not journey day)
- Use store: `hasCompletedChakra`, `hasParticipatedDay`, `allChakrasCompleted`, `journeyStarted`, `courseStartDate`

### 2c. Chakra Data for IntegratedProgressStack

- ChakraHub already has `hubChakraData`; adapt to `chakraData` format expected by IntegratedProgressStack (day, affirmation, description, source, onPress)
- Or import/use same chakra data shape as ChakraHome

---

## Phase 3: Button Behavior and Navigation

### 3a. Somatic Journey Button (bottom of ChakraHub)

| State | Button Label | Action |
|-------|--------------|--------|
| No date set | "Select a start date" | `router.push('/(chakras)/DateSelection')` |
| Date set, not in course mode | "Access course" | `setCourseModeActive(true)` – stay on ChakraHub, re-render course view |
| In course mode | (Button hidden or shows "Return to course" when exited?) | N/A – in course mode the button section is below the stack; could hide or show "Return to course" only when they've exited |

**Clarification:** In course mode, the main content is IntegratedProgressStack. The "Start a new 7 Day Somatic Journey" section could be hidden. When they tap "Exit course", we go back to browse mode. The button then shows "Return to course" (since course is active: `courseStartDate` set, they've started). So:
- Browse + no date: "Select a start date"
- Browse + date set: "Access course" or "Return to course"
- Course: Section hidden; [Exit course] top right

### 3b. Exit Course Button

- Position: Top right (similar to hamburger on ChakraHome)
- Label: "Exit course"
- Action: `setCourseModeActive(false)` – stay on ChakraHub, re-render browse view
- Haptic feedback

### 3c. DateSelection for Lifetime

**File:** `app/(chakras)/DateSelection.tsx`

- On confirm: set `courseStartDate`, `startJourney(startDate)`, `setCourseModeActive(true)`
- Navigate: `router.replace('/(chakras)/ChakraHub')` (already does ChakraHome; change to ChakraHub)
- ChakraHub will render course mode (waiting or stack)

---

## Phase 4: ChakraHome Cleanup

### 4a. Lifetime Users Never See ChakraHome

**File:** `app/(chakras)/ChakraHome.tsx` (route wrapper)

- Current: `hasLifetimeAccess && !lifetimeChosenTimegateJourney` → redirect to ChakraHub
- New: **All** lifetime users redirect to ChakraHub. Remove `lifetimeChosenTimegateJourney` check.
- ChakraHome becomes **trial-only** (plus dev/testing).

### 4b. Remove lifetimeChosenTimegateJourney from Somatic Flow

- DateSelection: On confirm, set `setCourseModeActive(true)` instead of (or in addition to) `setLifetimeChosenTimegateJourney(true)`
- ChakraHub button: set `setCourseModeActive(true)` instead of `setLifetimeChosenTimegateJourney(true)`
- Can deprecate `lifetimeChosenTimegateJourney` if no longer needed, or keep for backwards compatibility during migration

---

## Phase 5: Goodbye and Chakra Day Flow

### 5a. GoodbyeModal Home Button

- Current: navigates to ChakraHub or ChakraHome based on `hasLifetimeAccess`
- New: Lifetime always → ChakraHub. In course mode, ChakraHub shows course view, so "Home" returns to course stack. Correct.

### 5b. ChakraTemplate Back/Home

- Current: `hasLifetimeAccess` → `router.replace('/(chakras)/ChakraHub')`
- Unchanged – still goes to ChakraHub. ChakraHub will show course mode if `courseModeActive`, so they land in the right place.

---

## Phase 6: Start New Course

- When they've completed a course (all 7 days) or want to restart:
- "Start a new 7 Day Somatic Journey" → DateSelection
- DateSelection confirm: set new `courseStartDate`, call `startJourney(newStartDate)` (which resets weekly state for new course), `setCourseModeActive(true)`
- Need to ensure `startJourney` resets `participatedDays`, `completedChakras` for the new week
- Check `startJourney` in store – it should set `journeyWeekStartDate`, and optionally reset participation for the new week

---

## File Change Summary

| File | Changes |
|------|---------|
| `hooks/useChakraJourneyStore.ts` | Add `courseModeActive`, `setCourseModeActive`; ensure `startJourney` resets weekly state for new course |
| `src/services/timegate.ts` | Add `applyTrialTimegates` to `isChakraDayAccessible`, `shouldShowWaitingScreen` |
| `components/chakras/IntegratedProgressStack.tsx` | Add `applyTrialTimegates` prop, pass to timegate |
| `app/(chakras)/ChakraHub.tsx` | Dual-mode: browse vs course; [Exit course] button; render WaitingScreen or IntegratedProgressStack in course mode; adapt chakra data |
| `app/(chakras)/DateSelection.tsx` | On confirm: `setCourseModeActive(true)`, navigate to ChakraHub (not ChakraHome) |
| `app/(chakras)/ChakraHome.tsx` (route) | Simplify: all lifetime → ChakraHub (remove lifetimeChosenTimegateJourney check) |
| `components/chakras/ChakraHome.tsx` | No longer used by lifetime; trial-only |

---

## UX Summary

1. **Browse mode:** Full chakra grid, Sanctuary, "Access course" / "Return to course"
2. **Tap "Access course":** Enter course mode – waiting screen or chakra stack
3. **In course:** Root at bottom, progressive reveal, complete → goodbye, next day at midnight
4. **"Exit course":** Back to browse mode
5. **"Return to course":** Back to course mode (same course, same progress)

Same structure as trial, all inside App2.
