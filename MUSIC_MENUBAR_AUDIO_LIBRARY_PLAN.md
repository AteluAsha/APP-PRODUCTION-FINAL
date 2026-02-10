# Music Menu Bar & Audio Library Plan

## Problem Summary

1. **Music button routes incorrectly**: The Music menu bar button navigates to `/(chakras)/SoundBath`, which defaults to Root chakra and shows only that day's audio. The user expects a full **Music Room / Audio Library** with all audio organized by chakra.

2. **SoundBath is chakra-specific**: SoundBath is designed to show one chakra's sound healing (Tuning Fork, Sound Bowl short, Crystal Bowl 1hr). It is correctly used from ChakraTemplate and Part2Section when the user taps a pill for a specific chakra. The Music menu should NOT lead here.

3. **AudioLibrary route referenced but missing**: `utils/navigationHelpers.ts` references `ROUTES.audioLibrary = '/(chakras)/AudioLibrary'` but **no AudioLibrary screen exists** in the app.

---

## Phase 1: Create Audio Library Screen

### 1a. New Screen: `app/(chakras)/AudioLibrary.tsx`

**Purpose**: Spotify-like audio library showing ALL sound healing content, organized by chakra.

**Content per chakra (all 7)**:

| Audio Type | Source | Duration | Hertz |
|------------|--------|----------|-------|
| Crystal Bowl Meditation | Firebase `crystal_Bowl_Meditation_Audio` | ~1 hour | Per chakra |
| Tuning Fork | Firebase `TuningForkAudio` | Varies | 396, 417, 528, 639, 741, 852, 963 Hz |
| Singing Bowl (short) | Local `content.tsx` soundBath.soundBowlAudio | ~3 min | Per chakra |

**Layout**:
- Scrollable list by chakra (Root → Crown)
- Each chakra as an expandable section or card
- Subtle hertz display (e.g., "396 Hz" in muted text)
- Download-for-offline toggle/button per track
- Reuse: `useCrystalBowlAudio`, `useTuningForkAudio`, `chakraContent[x].soundBath`, `downloadAndCacheAudio`, `getLocalAudioUri`

**Design**:
- App colors (purple, sage, earth tones)
- Heart-minded, healing aesthetic
- Card-based or list rows with play icon, title, duration, hertz

### 1b. Register Route

- Add `<Stack.Screen name="AudioLibrary" />` in `app/(chakras)/_layout.tsx`

### 1c. Offline Download UX

- Use existing `audioDownload.ts`: `downloadAndCacheAudio`, `getLocalAudioUri`
- Add "Download for offline" / cloud-download icon per track
- Show downloaded state (checkmark or "Saved offline")
- Hooks already check `getLocalAudioUri` first; ensure download flow is exposed in UI

---

## Phase 2: Fix Music Menu Bar Pathway

### 2a. Update PermanentMenuBar

**File**: `components/navigation/PermanentMenuBar.tsx`

**Change**:
```ts
// FROM:
route: '/(chakras)/SoundBath',

// TO:
route: '/(chakras)/AudioLibrary',
```

Also update `isActive`:
```ts
isActive: getIsActive('/(chakras)/AudioLibrary'),
```

### 2b. Update useVerticalLayout

Add AudioLibrary to screens that use vertical menu layout:
```ts
pathname?.startsWith('/(chakras)/AudioLibrary') ||
```

---

## Phase 3: Preserve SoundBath Entry Points

**Keep SoundBath as-is** for these entry points:
- `ChakraTemplate.tsx` pill → `router.push(\`/(chakras)/SoundBath?chakra=${chakra}\`)`
- `Part2Section.tsx` → `router.push(\`/(chakras)/SoundBath?chakra=${chakra}\`)`
- Anua voice navigation → `/(chakras)/SoundBath?chakra=[chakra]`

SoundBath = single-chakra deep dive. AudioLibrary = full catalog.

---

## Phase 4: Menu Bar Pathway Audit

### 4a. Current Menu Items (APP2 / Lifetime)

| Button | Current Route/Action | Correct? | Fix |
|--------|----------------------|----------|-----|
| **Music** | `/(chakras)/SoundBath` | ❌ | → `/(chakras)/AudioLibrary` |
| **Community** | `/CommunityHalls` | ✅ | None |
| **Gallery** | `/(chakras)/GalleryOfGnosis` | ✅ | None |
| **Notes** | Opens bottom sheet | ✅ | None |
| **Anua** | Opens SocialSanctuaryModal | ✅ | None |

### 4b. Verification Checklist

- [ ] Music → AudioLibrary (full catalog, not single chakra)
- [ ] Community → CommunityHalls
- [ ] Gallery → GalleryOfGnosis
- [ ] Notes → JourneyNotesView bottom sheet
- [ ] Anua → SocialSanctuaryModal (Talk to Anua, etc.)

### 4c. Logic Test – UX Pathways

1. From ChakraHub: Open menu → Music → AudioLibrary
2. From any chakra day: Open menu → Music → AudioLibrary
3. From Gallery: Open menu → Music → AudioLibrary
4. Back button from AudioLibrary → Returns to previous screen
5. From AudioLibrary: Play any track → AudioPlayer opens
6. Download button → Caches audio; offline icon/state updates

---

## Phase 5: Hertz Mapping (Reference)

| Chakra | Day | Hertz |
|--------|-----|-------|
| Root | Monday | 396 Hz |
| Sacral | Tuesday | 417 Hz |
| Solar Plexus | Wednesday | 528 Hz |
| Heart | Thursday | 639 Hz |
| Throat | Friday | 741 Hz |
| Third Eye | Saturday | 852 Hz |
| Crown | Sunday | 963 Hz |

Display subtly (e.g., small gray text under track title).

---

## Files to Create

| File | Action |
|------|--------|
| `app/(chakras)/AudioLibrary.tsx` | **Create** – New audio library screen |

## Files to Modify

| File | Changes |
|------|---------|
| `app/(chakras)/_layout.tsx` | Add `Stack.Screen name="AudioLibrary"` |
| `components/navigation/PermanentMenuBar.tsx` | Music route → AudioLibrary; add AudioLibrary to useVerticalLayout |

---

## Implementation Order

1. Create `AudioLibrary.tsx` (Phase 1)
2. Register route in `_layout.tsx` (Phase 1b)
3. Update PermanentMenuBar Music route (Phase 2)
4. Add AudioLibrary to vertical layout (Phase 2b)
5. Run pathway audit (Phase 4)

---

## Out of Scope (Not in This Plan)

- Changing SoundBath behavior
- Modifying ChakraTemplate or Part2Section navigation to SoundBath
- APP1 (Trial) – Music menu is APP2-only; FloatingNavButtons for Trial do not include Music
