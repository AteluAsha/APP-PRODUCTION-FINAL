# Audio Naming & Master Meditations Plan

## Overview

1. Rename all 1-hour crystal bowl tracks to **"Crystal Bowl SOUND BATH"**
2. Add **Master Meditations** row in Music Room (embodiment meditation per chakra/day)
3. Fix tuning fork filenames so they connect (green) instead of 404 (red)
4. Ensure green/red status reflects actual connection state
5. Update all files for consistent naming across APP1 and APP2

---

## Phase 1: Title Change – "Crystal Bowl SOUND BATH"

| File | Current | New |
|------|---------|-----|
| `AudioLibrary.tsx` | `title="Sound Bath"` | `title="Crystal Bowl SOUND BATH"` |
| `AudioLibrary.tsx` | `Sound Bath: ${content.title}` | `Crystal Bowl SOUND BATH: ${content.title}` |
| `SoundBath.tsx` | `Sound Bath: ${soundBathContent.title}` | `Crystal Bowl SOUND BATH: ${soundBathContent.title}` |
| `CrystalBowlButton.tsx` | `SOUND BATH` (button label) | `CRYSTAL BOWL SOUND BATH` |

---

## Phase 2: Tuning Fork Filename Fix (from TUNING_FORK_RECONNECT_PLAN)

**File:** `hooks/useTuningForkAudio.ts`

Update `CHAKRA_TO_TUNING_FORK_FILE` to match Firebase:

```
Day1_396hz_plus256_TuningFork.aac
Day2_417hz_tuningfork.aac
Day3_528hz_tuningfork.aac
Day4_639Hz_tuningfork.aac
Day5_741hz_tuningfork.aac
Day6_852hz_tuningFork.aac
Day7_963hz_tuningfork.aac
```

---

## Phase 3: Master Meditations in Music Room

**Add** a third row per chakra: **Master Meditations** – plays the opening embodiment meditation for that day.

### Data source

- Hook: `useEmbodimentAudio(chakra)` (already used in ChakraTemplate)
- Returns: `single` (Days 1–5, 7), or `partOne` + `partTwo` (Day 6 Third Eye)
- For Third Eye: use `partOne` as the “opening” Master Meditation

### Music Room layout (per chakra)

1. **Crystal Bowl SOUND BATH** (~60 min) – `useCrystalBowlAudio`
2. **Tuning Fork** (pure tone) – `useTuningForkAudio`
3. **Master Meditations** (~30–48 min) – `useEmbodimentAudio`

### Implementation

- Add `useEmbodimentAudio` for all 7 chakras in `AudioLibrary.tsx`
- Add `embodimentByChakra` map
- Add `AudioTrackRow` for Master Meditations:
  - Title: "Master Meditations"
  - Subtitle: `content.audioIntro.title` (e.g. "Good Morning Root!")
  - Duration: `content.audioIntro.durationMs`
  - `isConnected`: `!!(embodiment.single || embodiment.partOne)`
  - On play: use `embodiment.single` or `embodiment.partOne` for Third Eye
- Use `content.audioIntro.title` and `content.audioIntro.durationMs` for metadata
- `isIntroAudio: true` so the mini player does not show for embodiment meditations

### Note on `isIntroAudio`

The mini player hides when `prefs.isIntroAudio` is true. For Music Room playback of Master Meditations, we want the full player, not the mini bar. When the user finishes and goes back, the mini player would normally show. Setting `isIntroAudio: true` will hide the mini player for embodiment meditations – that may be desirable so it doesn’t show when they leave the player. Confirm: when playing embodiment from Music Room, should the mini player appear? Plan assumes **no** – we set `isIntroAudio: true` so behavior matches ChakraTemplate.

---

## Phase 4: Green/Red Button Colors

**Current behavior (__DEV__):**

- Green: `url` or `localUri` present
- Red: missing/placeholder

**Status by track type:**

| Track | isConnected logic |
|-------|-------------------|
| Crystal Bowl SOUND BATH | `!!(crystalBowl.url \|\| crystalBowl.localUri)` |
| Tuning Fork | `!!(tuningFork.url \|\| tuningFork.localUri)` – fix filenames so this is true |
| Master Meditations | `!!(embodiment.single \|\| embodiment.partOne)` |

No code change needed beyond fixing tuning fork filenames and adding embodiment `isConnected` for Master Meditations.

---

## Phase 5: Files to Update (Checklist)

| File | Changes |
|------|---------|
| `hooks/useTuningForkAudio.ts` | Update `CHAKRA_TO_TUNING_FORK_FILE` to Firebase filenames |
| `app/(chakras)/AudioLibrary.tsx` | Add Master Meditations row; rename to "Crystal Bowl SOUND BATH"; use `useEmbodimentAudio` |
| `app/(chakras)/SoundBath.tsx` | Update metadata title to "Crystal Bowl SOUND BATH" |
| `components/chakras/CrystalBowlButton.tsx` | Change button label to "CRYSTAL BOWL SOUND BATH" |
| `src/services/gemini.ts` | Update any audio references if needed |
| `src/services/anuaNavigation.ts` | References are generic; no change required |

---

## APP1 vs APP2

- **APP1 (Trial):** No Music Room (redirects to ChakraHome). Sound Healing (SoundBath) is used.
- **APP2 (Lifetime):** Music Room (AudioLibrary) + Sound Healing both available.
- Shared: SoundBath, useCrystalBowlAudio, useTuningForkAudio, useEmbodimentAudio.
- No conflicts: same hooks and content; APP2 simply has an extra screen (Music Room).

---

**Status:** Executed ✅
