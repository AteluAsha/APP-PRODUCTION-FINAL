# Path 2 (Sound Bath) – Crystal Bowl Button & Playback UX Plan

## Overview

Updates for the Crystal Bowl (1-hour meditation) button on Path 2 / Sound Bath for all days 1–7. Scope differs by app mode: APP2 gets the full changes; APP1 keeps current behavior with minimal or no changes.

---

## Phase 1: Title + Layered Button Design (APP2 Only)

### 1a. Add Section Title Above Crystal Bowl Button

**New title above the bottom button:**
> 1 Hour Sound Healing (Background Music - pure tones)

**Location:** `app/(chakras)/SoundBath.tsx` – above the Crystal Bowl section (around line 176).

**Implementation:** Add an `AppText` block before the Crystal Bowl button:

```tsx
<AppText font="instrument-semibold" size="sm" className="text-center text-white/90 mt-6">
  1 Hour Sound Healing (Background Music - pure tones)
</AppText>
```

Show only when `hasLifetimeAccess` is true (APP2).

---

### 1b. Layered Button Styling for Crystal Bowl (APP2 Only)

**Reference:** User image – pill-shaped button with:
- Outer soft shadow (inset/recessed feel)
- Light inner border (bevel)
- Dark grey base
- Horizontal glossy highlight in top third

**Current:** CrystalBowlButton uses `border border-[#ffffff60] rounded-2xl bg-[#00000020]` (same as Tuning Fork and Sound Bath).

**Change:** Give the Crystal Bowl button a different, “layered” style only in APP2.

**Options:**
- **A) New props on CrystalBowlButton:** e.g. `variant="layered"` for APP2
- **B) Separate component:** e.g. `LayeredCrystalBowlButton` used only in APP2
- **C) Conditional styling in SoundBath:** render different button markup for APP2

**Recommendation:** A – add `variant?: 'default' | 'layered'` to CrystalBowlButton.

**Layered style (React Native):**
- `borderRadius: 24` (pill)
- `backgroundColor: 'rgba(40, 40, 45, 0.95)'` (dark grey)
- `borderWidth: 1`, `borderColor: 'rgba(255, 255, 255, 0.15)'`
- `shadowColor: '#000'`, `shadowOffset: { width: 0, height: 2 }`, `shadowOpacity: 0.4`, `shadowRadius: 4`, `elevation: 4`
- Optional: `LinearGradient` overlay for highlight (light grey top → transparent bottom) to mimic glossy strip

---

## Phase 2: Playback UX by App Mode

### APP1 (Trial)

**Behavior:**
- Keep current flow: tap Crystal Bowl → push full-screen AudioPlayer
- No mini player, no special logic
- Audio stops when leaving AudioPlayer (back)
- No changes for APP1 except optionally keeping the existing button design

**Clarification:**  
“When they leave that page in app one, the music will auto play” can mean:
- (a) Music continues after leaving the page
- (b) Music starts automatically when they tap play

For “easiest solutions” and “standard practices,” keep (b): auto-play on tap.  
Continuing playback after navigation would need a global mini player and background audio handling.

---

### APP2 (Lifetime)

**Behavior choices:**
- **A) Full-screen AudioPlayer (current):** Tap → navigate to AudioPlayer. Simple, no new logic.
- **B) Floating mini player:** Tap → set source, show mini player, no navigation. User can browse; tap mini player to open full AudioPlayer.
- **C) Menu bar only:** Crystal Bowl on Path 2 does not play; user must use Music menu → AudioLibrary to play.

**Recommendation: A – keep full-screen AudioPlayer**

- Same as Tuning Fork and Sound Bath
- No new mini player integration or layout work
- Music menu already goes to AudioLibrary; both Path 2 and AudioLibrary can start the same tracks

**If floating mini player is preferred later:**
- Render `MiniAudioPlayer` from root layout (like FloatingNavButtons) when `source && !prefs?.isIntroAudio`
- For Crystal Bowl: set source, do not push to AudioPlayer
- Mini player visible globally; tap to open full AudioPlayer

---

## Phase 3: Conditional Rendering (APP2 vs APP1)

**SoundBath.tsx structure:**

```tsx
// Crystal Bowl section – APP2 gets title + layered button
{hasLifetimeAccess ? (
  <>
    <AppText>1 Hour Sound Healing (Background Music - pure tones)</AppText>
    <CrystalBowlButton variant="layered" ... />
  </>
) : (
  <CrystalBowlButton ... />  // existing, no title
)}
```

Or keep one Crystal Bowl block and conditionally pass `variant` and render the title.

---

## Phase 4: Implementation Checklist

| Task | File(s) | APP | Effort |
|------|---------|-----|--------|
| Add "1 Hour Sound Healing" title above Crystal Bowl | SoundBath.tsx | APP2 only | Small |
| Add `variant="layered"` to CrystalBowlButton | CrystalBowlButton.tsx | APP2 only | Medium |
| Implement layered styles (shadows, gradient highlight) | CrystalBowlButton.tsx | – | Medium |
| Conditional render: title + layered for APP2 | SoundBath.tsx | – | Small |
| Keep current playback flow (push to AudioPlayer) | – | Both | None |

---

## Phase 5: Layered Button Style Spec

**Target look:** Pill, dark grey, soft inset shadow, light border, glossy top highlight.

**React Native / NativeWind:**

```tsx
// Container
style={{
  borderRadius: 24,
  backgroundColor: 'rgba(50, 50, 55, 0.95)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.5,
  shadowRadius: 6,
  elevation: 6,
}}

// Optional: LinearGradient for glossy strip (top 30%)
<LinearGradient
  colors={['rgba(255,255,255,0.12)', 'transparent']}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%' }}
/>
```

---

## Summary

| Item | APP1 | APP2 |
|------|------|------|
| Title "1 Hour Sound Healing..." | No | Yes |
| Layered button style | No (keep current) | Yes |
| Playback flow | Current (push AudioPlayer) | Current (push AudioPlayer) |
| Floating mini player | No | No (per recommendation) |

**Scope:** SoundBath.tsx, CrystalBowlButton.tsx.  
**Risk:** Low; no playback architecture changes, only UI and conditional rendering.
