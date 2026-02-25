# Daily Activity UX Updates – Plan

## Overview

Three updates for the Daily Activity section on the HeadToHeart (Path 1 Ancestral Knowledge) screen, across all 7 days, for both APP1 and APP2.

---

## Phase 1: Remove "LAW" Reference from Daily Activity Card

### Current State

Inside the activity card, the first line is:

```
LAW: MENTALISM • Activity: Sky Gazing (The Picnic of Presence)
```

The law is already shown in the hero section above (e.g., THE FIRST LAW "MENTALISM").

### Change

**Remove the LAW prefix.** Show only the activity title and description.

**Before:** `LAW: MENTALISM • Activity: Sky Gazing (The Picnic of Presence)`  
**After:** `Activity: Sky Gazing (The Picnic of Presence)`  
or simply: `Sky Gazing (The Picnic of Presence)`

### Implementation

| File                            | Change                                                                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constants/chakras/content.tsx` | Update the first segment of each `headtoheart.dailyActivity` array for all 7 chakras. Replace `"LAW: X • Activity: Y"` with `"Activity: Y"` or `"Y"` only. |

**Content updates (7 places):**

- Day 1: `Activity: Walking Meditation (The Earth Cord)`
- Day 2: `Activity: The "I Love You" Crystal`
- Day 3: `Activity: Conscious Repair (Karma Yoga)`
- Day 4: `Activity: Coherent Breathing (Sama Vritti)`
- Day 5: `Activity: Humming Bee Breath (Bhramari)`
- Day 6: `Activity: The Mirror of Nature (Saucha)`
- Day 7: `Activity: Sky Gazing (The Picnic of Presence)`

---

## Phase 2: Activity Completed Checkbox + Progress Meter Integration

### Goal

- Add an "Activity completed" checkbox to each day’s Daily Activity section.
- Persist completion state.
- Feed this into the user’s progress meter (Accountability of Awakening).

### Architecture

**Storage:** Extend `useChakraJourneyStore` or create `useDailyActivityStore` to track completed daily activities per chakra day.

**Options:**

- **A) Extend useChakraJourneyStore:** Add `dailyActivitiesCompleted: number[]` (day indices 0–6) to the existing journey store. Fits with `completedChakras`, `participatedDays`.
- **B) Separate store:** `useDailyActivityStore` with `completedByDay: Record<number, boolean>` persisted in MMKV/AsyncStorage.

**Recommendation:** Option A – extend `useChakraJourneyStore` so progress metrics stay in one place.

### New Store Fields (Option A)

```
dailyActivitiesCompleted: number[]  // Day indices (0–6) where user checked "Activity completed"
markDailyActivityCompleted: (dayIndex: number) => void
hasCompletedDailyActivity: (dayIndex: number) => boolean
```

### Progress Meter Integration

`AccountabilityOfAwakening` uses `hasEverCompletedChakra` and `getAccountabilityStats()`. Options:

1. **Option A – Separate metric:** Add "Daily Activities Completed" (e.g., X/7) alongside chakras completed. Keep both metrics.
2. **Option B – Combined:** Treat daily activity completion as part of the same chakra/day completion (may change semantics).
3. **Option C – Heart meter:** Use daily activity completion to influence the heart meter (e.g., partial fill per activity).

**Recommendation:** Option A – show a separate "Daily Activities Completed: X/7" line (or icon) in Accountability of Awakening so both chakra completion and daily activity completion are visible.

### UI: Checkbox on HeadToHeart

- Place below the Daily Activity card content, before the closing of the card, or at the bottom of the card.
- Label: "I completed this activity" or "Activity completed".
- Use `Pressable` or `TouchableOpacity` with a checkmark icon (unchecked/checked).
- On tap: call `markDailyActivityCompleted(chakraDayIndex)`, persist, update UI.

### Implementation

| File                                               | Change                                                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `hooks/useChakraJourneyStore.ts`                   | Add `dailyActivitiesCompleted`, `markDailyActivityCompleted`, `hasCompletedDailyActivity`; persist.       |
| `app/(chakras)/HeadToHeart.tsx`                    | Add checkbox UI; map `chakra` param to day index; call store actions.                                     |
| `components/chakras/AccountabilityOfAwakening.tsx` | Add display for daily activities completed (e.g., "Daily Activities: X/7" or integrate into heart meter). |

### Chakra → Day Index Mapping

Use existing `CHAKRA_TO_DAY` or `getChakraIndex` from `@/utils/chakraMapping` so the checkbox knows which day (0–6) to mark.

---

## Phase 3: Floating Leaf (Notes Along the Way) on HeadToHeart

### Current State

- **APP1:** `FloatingNavButtons` shows the leaf (Notes) on most screens; HeadToHeart is not in the hide list.
- **APP2:** `PermanentMenuBar` shows a vertical menu with Notes on HeadToHeart (via `useVerticalLayout`).

So Notes should already be reachable on HeadToHeart.

### Possible Issue

- On APP2, the vertical menu may not feel like a "floating leaf."
- User might want a more obvious, leaf-style button on the Daily Activity screen.

### Change

**Ensure the Notes/leaf is clearly available on HeadToHeart:**

1. **Verify behavior:** Confirm that FloatingNavButtons (APP1) and PermanentMenuBar (APP2) both show Notes on HeadToHeart and that the leaf/menu is visible.
2. **Optional enhancement:** Add a dedicated floating leaf button inside HeadToHeart (similar to ChakraTemplate) that opens JourneyNotesView. This would give a consistent "floating leaf" experience regardless of global nav.

### Implementation

| File                                           | Change                                                                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/(chakras)/HeadToHeart.tsx`                | Option A: Rely on global nav (verify only). Option B: Add a floating leaf `Pressable` that opens JourneyNotesView via `usePillBottomSheetStore` or a local `BottomSheetModal` ref. |
| `components/navigation/FloatingNavButtons.tsx` | Ensure HeadToHeart is not in `shouldHide` (already the case).                                                                                                                      |
| `components/navigation/PermanentMenuBar.tsx`   | Ensure HeadToHeart uses vertical layout with Notes visible (already the case).                                                                                                     |

**Option B – Dedicated floating leaf on HeadToHeart:**

- Add a leaf icon button (same asset/style as FloatingNavButtons).
- Position: bottom-left or bottom-right, above safe area.
- On press: open JourneyNotesView.
- Reuse `JourneyNotesView` and pass `contextChakraDay` from the route’s `chakra` param.

This may duplicate the leaf if FloatingNavButtons/PermanentMenuBar already show it. Consider:

- APP1: FloatingNavButtons already has leaf → no extra button unless we want one inside the scroll area.
- APP2: PermanentMenuBar has Notes in the vertical menu → add floating leaf only if we want a more prominent entry point.

**Recommendation:** First verify global nav; add a dedicated floating leaf on HeadToHeart only if Notes are hard to discover or if product wants a stronger "take notes here" affordance.

---

## Summary

| Phase | Task                                           | Effort       | Dependencies                                      |
| ----- | ---------------------------------------------- | ------------ | ------------------------------------------------- |
| 1     | Remove LAW reference from daily activity text  | Small        | None                                              |
| 2a    | Add checkbox for "Activity completed"          | Medium       | None                                              |
| 2b    | Store completion in useChakraJourneyStore      | Medium       | Phase 2a                                          |
| 2c    | Show completion in Accountability of Awakening | Small        | Phase 2b                                          |
| 3     | Floating leaf for Notes on HeadToHeart         | Small–Medium | Verify nav first; optionally add dedicated button |

---

## Files to Modify

| File                                               | Phases             |
| -------------------------------------------------- | ------------------ |
| `constants/chakras/content.tsx`                    | 1                  |
| `hooks/useChakraJourneyStore.ts`                   | 2                  |
| `app/(chakras)/HeadToHeart.tsx`                    | 1, 2, 3            |
| `components/chakras/AccountabilityOfAwakening.tsx` | 2                  |
| `utils/chakraMapping.ts`                           | 2 (reference only) |
