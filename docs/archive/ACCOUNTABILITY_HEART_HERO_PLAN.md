# Accountability Enhancements – Heart Meter, Stats, Hero Quotes

## Overview

Three enhancements to the Accountability of Awakening screen:

1. Heart meter: emerald, filling animation, completion burst, engagement-based energy decay
2. Stat wording: heart-minded copy
3. Hero Quotes: user's best quotes from Notes Along the Way

---

## 1. Heart Meter Enhancements

### 1a. Emerald Green

- Change from `#10B981` (teal-emerald) to a richer emerald: `#059669` (Tailwind emerald-600) or `#047857` (emerald-700)
- Glow and fill use the same emerald palette

### 1b. Filling Up

- **Visual:** The heart "fills" as they progress 0→7 chakras
- **Implementation:**
  - Option A: Mask/clip the heart icon – a gradient or overlay that rises from bottom as % increases
  - Option B: Second heart (outline) as container; filled heart (solid) scales height or uses `overflow: hidden` with a fill bar behind it
  - Option C: Ring or arc around the heart that fills (0–360°) – simpler and clear
- **Recommendation:** Option C – circular progress ring around the heart, emerald when filled. Or a subtle "fill line" inside/behind the heart using a `LinearGradient` with `locations` driven by percent.

### 1c. All 7 Complete: Heart Kingdom Burst

- When `filledCount === 7`: trigger celebration state
- **Animation:**
  - Heart briefly scales up (e.g. 1 → 1.2)
  - Radial burst of light (expanding circle or rays)
  - Stronger glow, maybe pulse
- **Copy:** "Heart Kingdom" or similar
- **Implementation:** `react-native-reanimated` for scale + opacity. Burst as expanding `View` with `LinearGradient` or radial blur (or simple white/emerald gradient circle that scales out).

### 1d. Engagement-Based Energy (Over Time)

- **Concept:** Energy "charges" with engagement, "drains" when not engaged
- **Track:** `lastEngagementDate` (ISO) – updated when:
  - User completes a chakra
  - User adds a note
  - User opens Accountability screen (optional, lighter weight)
- **Store:** Add to `useChakraJourneyStore` (persisted) or new `useEngagementStore`
- **Decay:**
  - Engagement multiplier: 1.0 when active today, decays over days
  - Example: linear decay over 14 days → 0.3, or exponential
  - `effectiveFill = baseFill * engagementMultiplier`
- **Visual:** Heart fill/glow reflects `effectiveFill`, not just chakra count. When neglected, it appears more "dim" or "empty" even if 7/7 structurally complete.

---

## 2. Stat Wording (Heart-Minded)

| Current           | New                |
| ----------------- | ------------------ |
| Days Participated | Days of Engagement |
| Chakras Completed | Chakras Em-bodied  |
| Completed Trials  | Completed Courses  |
| Current Trial     | In the Now         |

Simple copy change in `AccountabilityOfAwakening.tsx`.

---

## 3. Hero Quotes

### 3a. Data Source

- Notes from `useJourneyNotesStore` – `getAllNotes('journey')`
- Each note: `{ id, chakraDay, content, createdAt }`

### 3b. Hero Quotes Store (New)

- **File:** `hooks/useHeroQuotesStore.ts`
- **State:** `heroQuotes: string[]` (max 5, ordered by "best" first)
- **Actions:**
  - `refreshFromNotes(notes: JourneyNote[])` – recompute best 3–5 from notes
  - `getDisplayQuote()` – returns top quote for Hero section (or null)
- **Selection logic (MVP):**
  - Take all journey notes, sort by `createdAt` desc (newest first)
  - For "powerful": prefer longer notes (e.g. > 20 chars), recent
  - Keep best 5, store in `heroQuotes`
  - Display: `heroQuotes[0]` as the main Hero Quote

### 3c. Placeholders

- When `heroQuotes.length === 0`, show rotating placeholders, e.g.:
  - "Your reflections will appear here as you journey."
  - "From head to heart – one breath at a time."
  - "The path reveals itself in the quiet moments."
  - "Listen. Your soul is speaking."

### 3d. UI Placement

- **Location:** Right above the stats section (below heart meter, above the thin divider)
- **Design:** Minimal – italic, smaller font, soft color. Single quote. No card, on black.
- **Future:** Could add subtle carousel or "View more" to see all 5.

### 3e. Refresh

- Call `refreshFromNotes(notes)` when:
  - Accountability screen mounts
  - Or when notes change (subscribe to notes in store)
- Simple heuristic: last 5 notes by date, or last 5 "substantial" notes (length > 30 chars)

---

## Implementation Phases

### Phase 1: Quick Wins (No New Stores)

- Stat wording changes
- Emerald green for heart
- Placeholder Hero Quotes section (static placeholders only)

### Phase 2: Heart Fill & Burst

- Fill visualization (ring or gradient)
- All-7 completion burst animation
- "Heart Kingdom" copy when complete

### Phase 3: Hero Quotes Store & Logic

- Create `useHeroQuotesStore`
- `refreshFromNotes` with simple heuristic
- Wire to `useJourneyNotesStore`, show real quote or placeholder

### Phase 4: Engagement Energy (Optional, More Complex)

- Add `lastEngagementDate` to store
- Update on chakra completion, note add
- Decay formula and `effectiveFill` for heart
- Heart appearance reflects engagement level

---

## File Summary

| File                                               | Changes                                               |
| -------------------------------------------------- | ----------------------------------------------------- |
| `components/chakras/AccountabilityOfAwakening.tsx` | Emerald, fill, burst, stats copy, Hero Quotes section |
| `hooks/useHeroQuotesStore.ts`                      | **New** – hero quotes state and selection             |
| `hooks/useChakraJourneyStore.ts`                   | Optional: `lastEngagementDate`, update on completion  |
| `hooks/useJourneyNotesStore.ts`                    | No change – consumed by Hero Quotes                   |

---

## Technical Notes

- **Reanimated:** Already in project for heart burst
- **Emerald palette:** `#059669`, `#047857`, `rgba(5, 150, 105, 0.x)` for glows
- **Hero quote length:** Truncate display to ~120 chars with "…" if longer
