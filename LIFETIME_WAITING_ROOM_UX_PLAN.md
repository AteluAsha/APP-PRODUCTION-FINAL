# Lifetime Access Waiting Room – UX Fix Plan

**Created:** February 2, 2026  
**Scope:** Lifetime-only changes. App1 (trial) waiting room stays unchanged.

---

## Summary

1. **Hide Anua button** on the lifetime waiting room (resolves overlap with PermanentMenuBar).
2. **Replace bottom buttons** (Preview Course + Learn About Chakras) with a single “Exit course mode” button for lifetime users.
3. **Adjust layout and spacing** for the lifetime waiting room only.

---

## Phase 1: Hide Anua Button for Lifetime

**File:** `components/chakras/WaitingScreen.tsx`

**Current:** Anua button is always rendered (lines 205–236).

**Change:** Render the Anua button only when `!hasLifetimeAccess`.

```tsx
{/* Anua Button - Hidden for lifetime (PermanentMenuBar provides Anua access) */}
{!hasLifetimeAccess && (
  <View style={{ position: "absolute", ... }}>
    ...
  </View>
)}
```

**Reason:** For lifetime users, PermanentMenuBar already exposes Anua; the floating button overlaps and clutters the layout.

---

## Phase 2: Replace Bottom Buttons for Lifetime

**File:** `components/chakras/WaitingScreen.tsx`

**Current:** Two buttons (Preview Course, Learn About Chakras) shown when handlers are passed (lines 564–683).

**Change:** When `hasLifetimeAccess`:
- Do not render the two existing buttons.
- Render a single “Exit course mode” button instead.
- Use earth-tone styling (e.g. sand) with subtle depth/shadow.

**New prop:** `onExitCourseMode?: () => void`

**Button behavior:** When pressed:
- `setLifetimeChosenTimegateJourney(false)`
- `router.replace("/(chakras)/ChakraHub")`

**ChakraHome wiring:** Pass `onExitCourseMode` when `hasLifetimeAccess`:

```tsx
onExitCourseMode={hasLifetimeAccess ? () => {
  useChakraJourneyStore.getState().setLifetimeChosenTimegateJourney(false)
  router.replace("/(chakras)/ChakraHub")
} : undefined}
```

**Button styling (sand/earth tone):**
- Background: sand / warm neutral (e.g. `rgba(194, 178, 128, 0.25)` or `#C2B280`)
- Border: `rgba(194, 178, 128, 0.4)`
- Text: light/white
- Shadow: subtle depth
- Single full-width or centered button, no side‑by‑side layout

---

## Phase 3: Redo Spacing for Lifetime

**File:** `components/chakras/WaitingScreen.tsx`

**Scope:** Only when `hasLifetimeAccess` is true.

**Current issues:**
- Bottom padding may be too large with only one button.
- CosmicMomentCompact, countdown, “For Deepest Embodiment”, “Invite a Friend”, and bottom text may feel cramped or uneven.

**Proposed adjustments:**
1. **Reduce `paddingBottom`** when lifetime (one button instead of two).
2. **Tighten vertical spacing** between sections (e.g. countdown → For Deepest Embodiment → Invite a Friend).
3. **Optional:** Slightly reduce margins between main blocks (`mb-6` → `mb-4`).
4. **Optional:** Add more space between the countdown and “For Deepest Embodiment” for clearer hierarchy.

**Implementation:** Wrap the ScrollView `contentContainerStyle` and main sections in logic that uses different spacing values when `hasLifetimeAccess` is true.

---

## Implementation Checklist

| Task | File | Change |
|------|------|--------|
| 1. Hide Anua when lifetime | `WaitingScreen.tsx` | Wrap Anua button in `{!hasLifetimeAccess && (...)}` |
| 2. Add `onExitCourseMode` prop | `WaitingScreen.tsx` | Extend interface and prop destructuring |
| 3. Lifetime bottom button | `WaitingScreen.tsx` | When `hasLifetimeAccess`, render single “Exit course mode” button instead of Preview/Learn |
| 4. Pass `onExitCourseMode` | `ChakraHome.tsx` | Pass callback when `hasLifetimeAccess` |
| 5. Lifetime spacing | `WaitingScreen.tsx` | Use alternative spacing when `hasLifetimeAccess` |

---

## Conditional Structure (Pseudocode)

```tsx
// Bottom buttons section
{hasLifetimeAccess ? (
  // LIFETIME: Single "Exit course mode" button
  onExitCourseMode && (
    <View className="w-full max-w-sm mb-12 px-4">
      <Pressable onPress={onExitCourseMode} ...>
        <AppText>Exit course mode</AppText>
      </Pressable>
    </View>
  )
) : (
  // APP1: Original Preview Course + Learn About Chakras
  <View className="w-full max-w-sm mb-12 px-4">
    <View className="w-full flex-row gap-3">
      {onPreviewPress && <Pressable>Preview Course</Pressable>}
      {onLearnAboutChakrasPress && <Pressable>Learn About Chakras</Pressable>}
    </View>
  </View>
)}
```

---

## Verification

- [ ] App1: Anua button still visible on waiting room.
- [ ] App1: Preview Course and Learn About Chakras still work.
- [ ] Lifetime: Anua button hidden.
- [ ] Lifetime: No overlap with PermanentMenuBar.
- [ ] Lifetime: “Exit course mode” navigates to ChakraHub.
- [ ] Lifetime: Spacing looks balanced and clean.
