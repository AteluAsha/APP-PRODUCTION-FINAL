# Audio Player Visual Redesign Plan

## Current State

- **Visual component:** `RadialGradientAnimation` in `components/chakras/RadialGradientAnimation.tsx`
- **Current look:** 5 concentric circles with hardcoded color `#8e2e2e` (dark reddish-brown), pulsing with scale/opacity
- **Problem:** Same red color for every track; feels cheesy and outdated
- **Metadata available:** `metadata.author` typically contains Hz (e.g. `"417 Hz"`, `"Sacral Chakra - 417 Hz"`)

---

## Option A: Chakra-Color Matching (Recommended – Easiest & Safest)

**Effort:** Low  
**Risk:** Low  
**Scope:** Single component + small AudioPlayer change

### Approach

1. **Parse Hz from metadata** – Use regex on `metadata.author` and `metadata.title` to extract frequency (e.g. 396, 417, 528).
2. **Map Hz → chakra color** – Use existing `getChakraColor(dayIndex)` logic with a Hz→dayIndex map:
   - 396 Hz → Root (red) `#DC2626`
   - 417 Hz → Sacral (orange) `#EA580C`
   - 528 Hz → Solar Plexus (yellow) `#FCD34D`
   - 639 Hz → Heart (green) `#10B981`
   - 741 Hz → Throat (blue) `#3B82F6`
   - 852 Hz → Third Eye (indigo) `#6366F1`
   - 963 Hz → Crown (purple) `#9333EA`
3. **Pass color to `RadialGradientAnimation`** – Add a `primaryColor` prop; fallback to a neutral dark purple/indigo when Hz can’t be parsed.
4. **Keep same animation** – Same concentric circles and timing; only color changes per track.

### Code Changes

| File                                             | Change                                                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `components/chakras/RadialGradientAnimation.tsx` | Add `primaryColor?: string` prop; replace hardcoded `#8e2e2e` with prop or fallback                        |
| `app/AudioPlayer.tsx`                            | Add `parseHzFromMetadata(metadata)` helper; pass `primaryColor={chakraColor}` to `RadialGradientAnimation` |

### Fallback

When Hz cannot be parsed (e.g. “Pure tone”, “Sound Bowl”): use `#6366F1` (Third Eye / indigo) as a neutral healing color.

---

## Option B: Geometric Healing Energy Screens

**Effort:** Medium  
**Risk:** Low–Medium  
**Scope:** New visual component(s)

### Approach

Replace `RadialGradientAnimation` with a simpler, more geometric pattern:

1. **Concentric rings** – Same idea, but cleaner:
   - 3–5 rings with chakra color
   - Lower opacity, softer animation
   - Black background with subtle gradient fade at edges

2. **Mandala-style dots** – Optional enhancement:
   - Small dots in a circle around the center
   - Very subtle pulse tied to playback (or static)

3. **Implementation**
   - Same `primaryColor` prop as Option A
   - Slightly refined animation (e.g. slower, smoother)
   - No new assets; pure React Native + Reanimated

---

## Option C: Per-Track Custom Screens

**Effort:** High  
**Risk:** Medium  
**Scope:** Multiple designs, more maintenance

### Approach

- Different layouts per audio type (Crystal Bowl vs Tuning Fork vs Sound Bowl)
- Per-chakra artwork or gradients
- Would require more design work and testing

**Recommendation:** Defer unless Option A/B are insufficient.

---

## Recommended Path

**Phase 1 (Implement now):** Option A – chakra-color matching

- Minimal code change
- Immediate improvement
- No UX or performance risk

**Phase 2 (Optional):** Refine geometry (Option B) if you want a more “healing energy” look

- Same color logic
- Slightly different ring/dot design

---

## Implementation Checklist (Option A)

1. [x] Add `HERTZ_TO_CHAKRA_COLOR` map (or use existing chakra constants)
2. [x] Add `parseHzFromMetadata(metadata)` in `AudioPlayer.tsx`
3. [x] Add `primaryColor` prop to `RadialGradientAnimation` with fallback `#6366F1`
4. [x] Replace hardcoded `#8e2e2e` and `#8e2e2e40` with dynamic color
5. [ ] Test with Crystal Bowl (417 Hz), Tuning Fork (528 Hz), Sound Bowl (396 Hz)

---

**Status:** Executed ✅
