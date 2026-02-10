# Music Room – Sacred Space Design Plan

## Pre-requisite

User confirms: All audio is green, connected, playable, no glitching. If so, proceed.

---

## Phase 1: Remove Dev Color Coding

**File:** `app/(chakras)/AudioLibrary.tsx`

- Remove `devBorderStyle` (green/red borders in `__DEV__`)
- Remove conditional `backgroundColor` based on `isConnected`
- Use a single neutral style: `backgroundColor: 'rgba(255,255,255,0.06)'`, no status-colored borders
- Simplify `AudioTrackRow` props: `isConnected` can remain for logic (disabled state) but not for styling

---

## Phase 2: Holistic, Heart-Minded Typography

**Font choices:**

| Element | Current | New | Rationale |
|---------|---------|-----|-----------|
| Screen title | instrument-regular | cormorant-regular or cormorant-italic | Serif, calm, sacred |
| Subtitle / tagline | instrument-italic | cormorant-italic | Gentle, reflective |
| Chakra header | instrument-bold | cormorant-regular (larger) | Elegant, not harsh |
| Hertz badge | instrument-bold | cormorant-regular | Softer emphasis |
| Track title | instrument-regular | cormorant-regular or instrument-medium | Clear, warm |
| Duration / subtitle | instrument-italic | cormorant-italic | Soft, supportive |

Cormorant Garamond supports a more literary, healing tone. Instrument Sans stays for structure where needed.

---

## Phase 3: Sacred Wording

| Current | New |
|---------|-----|
| "Sound healing for every chakra. Download for offline listening." | "Frequencies for every chakra. Listen anytime, anywhere." or "Where sound meets soul. Download for your journey." |
| "Pure tone" | "Pure frequency" |
| "~60 min" | "~60 min" (keep – clear) |
| "~X min" (Master Meditations) | Keep – clear |

Keep copy minimal and aligned with a healing, sacred tone.

---

## Phase 4: Visual Harmony

- **Track rows:** Soft background `rgba(255,255,255,0.06)`, subtle border `rgba(255,255,255,0.08)`, rounded corners
- **Chakra headers:** Slightly softer gradient, refined border
- **Hertz badge:** Softer background, no harsh contrast
- **Download icon:** Keep sage green `#87AE73` – calm, growth-oriented
- **Spacing:** Ensure consistent padding and gaps

---

## File Changes Summary

| File | Changes |
|------|---------|
| `app/(chakras)/AudioLibrary.tsx` | Remove dev colors; update fonts to Cormorant where appropriate; refine wording; soften borders/spacing |

---

**Status:** Executed ✅
