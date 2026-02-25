# Head to Heart Audio Library Implementation Plan

## Summary

Add all 7 Head to Heart hero audios to the Audio Library (App 2 / Lifetime only), below Master Meditations for each chakra section. Master Embodiment and Head to Heart audios open the full AudioPlayer screen (not mini player); Tuning Fork and Crystal Bowl keep current behavior (toggle mini player in Music Room).

---

## Current State

### Head to Heart Audios (All 7 Configured)

| Day | Chakra       | Title                    | Author | Duration | Firebase File                                                                    |
| --- | ------------ | ------------------------ | ------ | -------- | -------------------------------------------------------------------------------- |
| 1   | Root         | THE POWER OF CREATION    | Asha   | 9:09     | Day1_THEPOWEROFCREATION_7th_DivineLaw_GENERATION_With_Asha.aac                   |
| 2   | Sacral       | THE AUTHENTIC SELF       | Asha   | 7:57     | day2_theauthenticself_6th_DivineLaw_POLARITY_With_Asha.aac                       |
| 3   | Solar Plexus | THE EGO HEART RAILROAD   | Asha   | 12:00    | day3_egoheartrailroad_5thdivinelaw_causeandeffect_With_Asha_Length_12minutes.aac |
| 4   | Heart        | Awakening The Heart Mind | Asha   | 11:00    | Day4_AWAKENINGTHEHEART_4thDivinelaw_Rhythm_With_Asha.aac                         |
| 5   | Throat       | THE POWER OF VIBRATION   | Asha   | 12:00    | Day5_ThePOWEROfVibration_Vishuddha_3rd_DivineLaw_With_Asha.aac                   |
| 6   | Third Eye    | LISTENING TO THE COSMOS  | Asha   | 11:00    | Day6_LISTENINGTOTHECOSMOS_2nd_DivineLaw_Correspodence_With_Asha.aac              |
| 7   | Crown        | THE MEADOW OF THE SOUL   | Asha   | 7:00     | Day7_THEMEADOWOFTHESOUL_1stDivineLaw_Mentalism_With_Asha.aac                     |

- **Source:** `hooks/useAncestralWisdomAudio.ts` (fetches from Firebase `AncestralWisdomAudioFiles_Days_1_7`)
- **App 1 (Trial):** Head to Heart is only on the HeadToHeart screen for the current day. Tap already opens full AudioPlayer via `AudioRowWithBackground`.
- **App 2 (Lifetime):** Audio Library exists; Head to Heart not yet added.

### Audio Library Behavior

| Audio Type        | Current behavior                            | Desired behavior              |
| ----------------- | ------------------------------------------- | ----------------------------- |
| Tuning Fork       | `playWithPlaylist` → Music Room mini player | Keep (toggle mini player)     |
| Crystal Bowl      | `playWithPlaylist` → Music Room mini player | Keep (toggle mini player)     |
| Master Embodiment | `playWithPlaylist` → Music Room mini player | Change: open full AudioPlayer |
| Head to Heart     | Not in Audio Library                        | Add: open full AudioPlayer    |

---

## Implementation Phases

### Phase 1: Add Head to Heart Section to Audio Library

**File:** `app/(chakras)/AudioLibrary.tsx`

1. Add `useAncestralWisdomAudio` hook calls for each chakra (same pattern as other hooks).
2. For each chakra section, after the Master Embodiment row(s), add:
   - A subtle secondary header: **"Head to Heart"**
   - An `AudioTrackRow` for the Head to Heart audio (when `source` is available).
3. Render only when `source` (from `useAncestralWisdomAudio`) is available.

**Header styling:** Subtle, muted text (e.g. `rgba(255,255,255,0.6)`, smaller font, slightly smaller than the chakra name).

---

### Phase 2: Full Player for Master Embodiment and Head to Heart

**File:** `app/(chakras)/AudioLibrary.tsx`

1. **Master Embodiment rows:** Change `onPlay` from `handleRowPress` (playWithPlaylist) to a new handler that:
   - Resets store
   - Calls `setSource(source, "other")`
   - Calls `setMetadata({ durationMs, title, author })`
   - Calls `setPrefs({ shouldLoop: false, isIntroAudio: true })`
   - Calls `setChakraColor(CHAKRA_COLORS[chakra])` if needed
   - `router.replace("/AudioPlayer")`
   - Requires `prepareLongAudioForPlay` for source (same as current playlist preparation)

2. **Head to Heart rows:** Same handler as above. Use `useAncestralWisdomAudio(chakra).source` when available.

3. **Tuning Fork and Crystal Bowl:** Keep `handleRowPress` → `playWithPlaylist` (no change).

**Note:** Master Embodiment and Head to Heart will need `prepareLongAudioForPlay` to resolve URLs before playback. The Head to Heart source is already `{ uri: string }` from Firebase; we may need to ensure it’s cached for smooth playback (optional).

---

### Phase 3: Hide Mini Player for Embodiment and Head to Heart

**File:** `components/navigation/MenuBarMiniPlayer.tsx`

- Add check: when `prefs?.isIntroAudio === true`, do not show the mini player.
- This ensures that when the user leaves the full AudioPlayer after playing Master Embodiment or Head to Heart, no mini player appears (focused listening experience).

---

### Phase 4: Layout Structure (Per Chakra Section)

```
[Chakra Name] Chakra  [Hz]
├── Tuning Fork
├── Crystal Bowl SOUND BATH
├── Master Embodiment (audioIntro) — or Part One / Part Two for Third Eye
├── [Head to Heart]  ← subtle secondary header
└── Head to Heart track (e.g. "THE POWER OF CREATION" with Asha)
```

---

## Verification Checklist

- [ ] Audio Library: Head to Heart section appears for each chakra (when source is available)
- [ ] Head to Heart: tap opens full AudioPlayer, not mini player
- [ ] Master Embodiment: tap opens full AudioPlayer, not mini player
- [ ] Tuning Fork, Crystal Bowl: tap toggles play/pause in Music Room (mini player when leaving)
- [ ] Head to Heart header: subtle, secondary styling
- [ ] App 1 (Trial): Head to Heart unchanged (only on HeadToHeart screen for current day)
- [ ] App 2 (Lifetime): Audio Library visible when `hasLifetimeAccess`; trial users redirected

---

## Files to Modify

| File                                          | Changes                                                                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `app/(chakras)/AudioLibrary.tsx`              | Add useAncestralWisdomAudio; add Head to Heart section; change Master Embodiment/Head to Heart onPlay to full player |
| `components/navigation/MenuBarMiniPlayer.tsx` | Hide when `prefs?.isIntroAudio === true`                                                                             |

---

## Dependencies

- `useAncestralWisdomAudio` already returns `{ source, isLoading, error }` from Firebase
- `chakraContent[chakra].headtoheart.audio` has title, author, duration
- `prepareLongAudioForPlay` for remote URLs (optional for Head to Heart if streaming is acceptable)
