# Notes Along the Way - Screen Context Chakra Plan

## Goal

**Store notes to the chakra/screen the user is viewing** — not the calendar date.

- If it's Friday and the user navigates to the Root (Monday) chakra screen and writes a note → **store to Root/Monday**.
- If they're on the Throat (Friday) screen and write a note → **store to Throat/Friday**.
- On the day of, opening Notes defaults to that day's chakra.
- Notes are always tied to the **7 chakra sections** (Monday–Sunday) and their chakra icons.

---

## Current vs Desired Behavior

| Scenario | Current | Desired |
|----------|---------|---------|
| User on Root page, adds note | Uses `selectedChakraDay` or `currentDay` | Use **screen context** = Root (day 0) |
| User on Throat page (Fri), adds note | Same | Use **screen context** = Throat (day 4) |
| User on ChakraHome, adds note | Uses `currentDay` (calendar) | Use `currentDay` (home = today's chakra) |
| User selects "Monday" in Notes chakra bar | Stores to day 0 | Same ✓ |
| User selects "All", adds note | Stores to `currentDay` | Store to **screen context** (or keep currentDay if on home) |

---

## Implementation Plan

### Phase 1: Derive Context Chakra Day from Route

**New utility:** `getContextChakraDayFromRoute(pathname: string, segments: string[]): number | null`

- **Chakra detail page** `/(chakras)/root`, `/(chakras)/throat`, etc.  
  - Last segment is chakra slug (`root`, `sacral`, `throat`, …)  
  - If `isValidChakra(segment)` → return `CHAKRA_TO_DAY[segment]`
- **SoundBath / HeadToHeart** (if they use `?chakra=throat`)  
  - Parse query params and map to day
- **ChakraHome, ChakraHub, etc.**  
  - Return `null` → caller uses `getCurrentDayOfWeek()`

**File:** `utils/notesContextChakra.ts` (new)

---

### Phase 2: Pass Context to Notes When Opening

**FloatingNavButtons & PermanentMenuBar:**

- Use `usePathname()` and `useSegments()` (already used)
- When opening Notes:
  - `contextChakraDay = getContextChakraDayFromRoute(pathname, segments) ?? getCurrentDayOfWeek()`
  - Pass `contextChakraDay` to `JourneyNotesView`

**Props change:**

- Replace `sheetOpenKey` with a single object:  
  `sheetOpenPayload?: { key: number; contextChakraDay: number }`
- Or add `contextChakraDay` alongside `sheetOpenKey`.

---

### Phase 3: JourneyNotesView Uses Context

**On sheet open (when `sheetOpenKey` changes):**

- Set `selectedChakraDay` to `contextChakraDay` (not `currentDay`).

**When adding a note:**

- If `selectedChakraDay === 'all'`: use `contextChakraDay` (screen context) instead of `currentDay`.
- If `selectedChakraDay` is a number: use that (user explicitly chose a chakra).

**Default selection:**

- `selectedChakraDay` initializes from `contextChakraDay` when the sheet opens.
- Chakra selector bar stays as the source of truth when the user changes it.

---

### Phase 4: Full-Page Notes Along the Way

**`app/(chakras)/NotesAlongTheWay.tsx`:**

- Get `contextChakraDay` from the route (same utility).
- If opened via `router.push`, pathname is `/(chakras)/NotesAlongTheWay` → no chakra in URL.
- Options:
  - Use `getCurrentDayOfWeek()` when opened from full route, or
  - Pass context via route params: `router.push('/(chakras)/NotesAlongTheWay?contextDay=4')`
- Prefer route params for full-page so it stays consistent with where the user came from.

---

## Data Model (No Change)

Notes already use `chakraDay: number` (0–6):

- 0 = Monday / Root  
- 1 = Tuesday / Sacral  
- …  
- 6 = Sunday / Crown  

Chakra selector maps to these same indices. No schema changes.

---

## Files to Modify

| File | Changes |
|------|---------|
| `utils/notesContextChakra.ts` | **New** – `getContextChakraDayFromRoute()` |
| `components/chakras/JourneyNotesView.tsx` | Add `contextChakraDay` prop; use for default selection and add-note when "All" |
| `components/navigation/FloatingNavButtons.tsx` | Compute `contextChakraDay`, pass to JourneyNotesView |
| `components/navigation/PermanentMenuBar.tsx` | Same |
| `app/(chakras)/NotesAlongTheWay.tsx` | Use route/params for context (optional) |

---

## Edge Cases

1. **SoundBath / HeadToHeart**  
   - Check if they receive `chakra` in URL/params; if yes, include in `getContextChakraDayFromRoute`.
2. **Gallery, Chakras101, etc.**  
   - No chakra in route → use `getCurrentDayOfWeek()`.
3. **Notes opened from ChakraHome**  
   - Home = today’s journey → use `getCurrentDayOfWeek()`.
4. **User changes chakra in Notes UI**  
   - `selectedChakraDay` overrides context; new notes use the selected chakra.

---

## Summary

1. Add `getContextChakraDayFromRoute(pathname, segments)`.
2. Callers pass `contextChakraDay` when opening Notes.
3. JourneyNotesView: default selection and add-note target use `contextChakraDay` instead of calendar `currentDay`.
4. Notes always map to the 7 chakra sections; storage is by screen context, not date.
