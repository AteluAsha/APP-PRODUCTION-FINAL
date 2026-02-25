# Notes Along the Way - Enhancement Plan

## Overview

Transform the Notes Along the Way experience into an organized diary that **always shows user words**, with chakra filtering, and optional full-page view. The goal is re-engagement and reflection—users must see their reflections, not just dates.

---

## Current State

| Component                     | Location                                  | Behavior                                                                                                               |
| ----------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **JourneyNotesView**          | `components/chakras/JourneyNotesView.tsx` | Bottom sheet; expandable notes (content hidden by default); uses `getCurrentDayOfWeek()` for add; groups by chakra day |
| **useJourneyNotesStore**      | `hooks/useJourneyNotesStore.ts`           | Notes stored by `chakraDay`, `content`, `type`; persists to AsyncStorage                                               |
| **Entry points**              | FloatingNavButtons, PermanentMenuBar      | Open via `notesSheetRef.current?.present()`                                                                            |
| **Chakra selector reference** | CommunityHallsScreen (lines 951–1018)     | Horizontal scroll of chakra ball icons; `getChakraImage(index)`, `CHAKRA_COLORS`                                       |

**Pain points:**

1. Notes show only date—user must tap to expand to see content
2. No chakra filter—cannot view notes for a specific day
3. Always defaults to adding for current day (correct) but can't browse other days
4. No full-page option—only bottom sheet

---

## Phase 1: Show Words First (Quick Win)

**Goal:** Display reflection content by default; date as secondary metadata.

### 1a. Flip Note Display

- **Change:** Notes show content as primary; date as small caption above/beside
- **Remove:** Expand/collapse; all notes always show their words
- **Layout:** Each note card = date (small) + content (prominent, readable)
- **File:** `JourneyNotesView.tsx` (note card rendering, lines 255–279)

### 1b. Improve Note Card UX

- Slightly larger text for content
- Truncate very long notes with "Read more" expand (optional; or show full if ≤3 lines)
- Keep the sage-green card styling; ensure good contrast

---

## Phase 2: Chakra Selection Scroll

**Goal:** Add horizontal chakra icon selector (like CommunityHallsScreen) so users can filter notes by day.

### 2a. Add Chakra Selector

- **Component:** Horizontal `ScrollView` of 7 chakra ball icons at top (below header)
- **Reference:** Reuse pattern from `CommunityHallsScreen.tsx` (lines 960–1018)
- **Imports:** `getChakraImage`, `CHAKRA_COLORS`, `DAY_NAMES`, `getChakraName` from `chakraConstants`
- **State:** `selectedChakraDay: number | 'all'` (default: `getCurrentDayOfWeek()` when opened)

### 2b. Default Selection Logic

- **When opened:** `selectedChakraDay = getCurrentDayOfWeek()` (today's chakra)
- **Optional:** Add "All" pill at start (like CommunityHalls "All") to show notes from all days

### 2c. Filter Notes by Selection

- When `selectedChakraDay === 'all'`: show all notes (grouped by day as today)
- When `selectedChakraDay` is 0–6: show only notes for that chakra day
- Update input placeholder: `Share your reflections for {getDayName(selectedChakraDay)}...`
- When adding note: save to `selectedChakraDay` (user explicitly chose which day)

### 2d. Add Note Targeting

- **Current:** `addNote` uses `currentDay` only
- **New:** `addNote` uses `selectedChakraDay` (or `currentDay` if "All" selected—then use `currentDay`)

---

## Phase 3: Full-Page Notes Route

**Goal:** Offer a dedicated screen for "running notepad" view—all notes, divided by chakra days, optimized for reading.

### 3a. New Route

- **File:** `app/(chakras)/NotesAlongTheWay.tsx` (or `JourneyNotes.tsx`)
- **Route:** `/(chakras)/NotesAlongTheWay`
- **Register:** Add `<Stack.Screen name="NotesAlongTheWay" />` in `_layout.tsx`

### 3b. Full-Page Design

- **Header:** "Notes Along the Way" with optional back button
- **Chakra selector:** Same horizontal scroll at top (reusable component)
- **Content:** ScrollView of all notes grouped by chakra day (e.g. "Monday - Root", "Tuesday - Sacral")
- **Layout:** Running diary—each note shows date + full content; no collapsing
- **Add note:** Sticky input at bottom or inline per section

### 3c. "Open as Full Page" CTA

- **In bottom sheet:** Add a text link or small button: "Open full diary →" or "View all in full page"
- **Action:** Close sheet, `router.push('/(chakras)/NotesAlongTheWay')`
- **Alternative:** Menu bar "Notes" could open full page directly (product decision)

---

## Phase 4: Shared Logic and Reuse

### 4a. Extract ChakraDaySelector

- **New component:** `components/chakras/ChakraDaySelector.tsx`
- **Props:** `selectedDay: number | 'all'`, `onSelect: (day: number | 'all') => void`, `compact?: boolean`
- **Usage:** JourneyNotesView (sheet), NotesAlongTheWay (full page), potentially elsewhere

### 4b. Shared Note List Component

- **New component:** `components/chakras/JourneyNotesList.tsx`
- **Props:** `notes`, `selectedChakraDay`, `onAddNote`, `showInput`, `variant: 'sheet' | 'full'`
- **Renders:** Grouped notes with words-first layout; optional input

### 4c. JourneyNotesView Refactor

- Use `ChakraDaySelector` + `JourneyNotesList` (or inline initially)
- Keep as `BottomSheetView` wrapper; add "Open full diary" link

---

## Implementation Order

| Step | Task                                                    | Effort | Dependencies    |
| ---- | ------------------------------------------------------- | ------ | --------------- |
| 1    | Show words first in note cards (remove expand/collapse) | Small  | None            |
| 2    | Add chakra selector scroll to JourneyNotesView          | Medium | chakraConstants |
| 3    | Filter notes by selected chakra; update add-note target | Small  | Step 2          |
| 4    | Create NotesAlongTheWay full-page route                 | Medium | Step 1, 2       |
| 5    | Add "Open full diary" link in sheet                     | Small  | Step 4          |
| 6    | (Optional) Extract ChakraDaySelector for reuse          | Small  | Step 2          |

---

## Files to Modify

| File                                      | Changes                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `components/chakras/JourneyNotesView.tsx` | Words-first cards; chakra selector; filter logic; "Open full page" link |
| `app/(chakras)/NotesAlongTheWay.tsx`      | **New** – full-page notes screen                                        |
| `app/(chakras)/_layout.tsx`               | Add Stack.Screen for NotesAlongTheWay                                   |
| `constants/chakras/chakraConstants.ts`    | No change (already has getChakraImage, etc.)                            |

---

## Design Decisions

1. **Words first:** Content visible by default—no tap to expand. Supports re-engagement.
2. **Default to today:** When opened, selected chakra = current day. User can switch to browse others.
3. **Add-note target:** New notes go to selected chakra day (or current day when "All" is selected).
4. **Full page:** Separate route for "running notepad" view; sheet remains quick-access.
5. **Chakra selector:** Reuse CommunityHalls pattern (chakra ball icons, horizontal scroll) for consistency.

---

## Edge Cases

- **Empty state:** "No reflections yet for [Chakra Name]. Share your first thought."
- **"All" view:** When selected, show all notes grouped by day (existing `notesByDay` logic).
- **Keyboard:** Ensure input stays visible in both sheet and full page (KeyboardAvoidingView).
- **Route context:** Full page can be opened from anywhere; no need to pass currentDay (use `getCurrentDayOfWeek()`).

---

## Effort Estimate

- **Phase 1 (Words first):** ~30 min
- **Phase 2 (Chakra selector):** ~45 min
- **Phase 3 (Full page):** ~45 min
- **Phase 4 (Extract/shared):** ~20 min (optional polish)

**Total:** ~2–2.5 hours for core implementation.
