# Music Room – Audio Status & Sacred Space Plan

**Status:** Executed ✅  
**Created:** 2026-02-02  
**Guide:** Music Room = source of truth for audio done vs needed

---

## Summary

Use the Music Room (AudioLibrary) as the central guide for audio status. Add dev-only green/red indicators, improve Hertz and duration visibility, give it a SoundBath-style background, and ensure Crystal Bowl 1-hour tracks from Firebase link in both SoundBath and Music Room.

---

## Phase 1: Dev-Only Audio Status Indicators (Green / Red)

### 1a. Status Logic

**Green button** = audio is linked and functioning:

- Crystal Bowl: `crystalBowl.url` or `crystalBowl.localUri` exists (Firebase or cached)
- Tuning Fork: `tuningFork.url` or `tuningFork.localUri` exists
- Singing Bowl: uses bundled `content.soundBowlAudio` (always available) → green

**Red button** = placeholder, missing, or not correctly linked:

- Crystal Bowl: `!url && !localUri` → using fallback `day1singingbowl.mp3` → red
- Tuning Fork: `!url && !localUri` → no playable source → red

**Implementation:**

- Add `isConnected: boolean` and `isPlaceholder: boolean` to `AudioTrackRow` (or derive from `url || localUri`)
- In `__DEV__` only: apply green border/background when connected, red when placeholder
- Use `constants/appMode.ts` or `__DEV__` so production never shows these indicators

### 1b. Files to Modify

| File                             | Changes                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `app/(chakras)/AudioLibrary.tsx` | Add `isConnected` prop to AudioTrackRow; when `__DEV__`, style buttons green or red |

---

## Phase 2: Hertz & Duration Prominence

### 2a. Hertz Visibility

- Make Hz the main identifier for each track
- Chakra header: large, bold `{hertz} Hz` (e.g. 396 Hz, 417 Hz)
- Each track row: show Hz prominently (e.g. "396 Hz" as subtitle or badge)
- Consider a Hertz badge or pill next to each track

### 2b. Track Duration

- Crystal Bowl: "~1 hour" (or "60 min")
- Tuning Fork: "Pure tone" or actual duration if available
- Singing Bowl: "~3 min"
- Ensure duration is easy to scan (e.g. top-right of each row, or under title)

### 2c. Layout

- Chakra section: `{chakraName} · {hertz} Hz` as hero
- Track row: Title | Duration | Hz badge
- Increase font size for Hz where it appears

---

## Phase 3: Sacred Space Background (Mimic SoundBath)

### 3a. Reference: SoundBath

- Uses `ResponsiveImageBackground` with `soundhealingbg.png`
- `BackgroundOpacity` for gradient overlays
- Dark, atmospheric, healing aesthetic

### 3b. Music Room Background

- Wrap content in `ResponsiveImageBackground` with `soundhealingbg.png`
- Add `BackgroundOpacity` (same pattern as SoundBath)
- Optional: subtle parallax or opacity variations for "Sacred space of sound" feel
- Title: "— MUSIC ROOM —" or "— SACRED SPACE OF SOUND —" with similar styling

### 3c. Files to Modify

| File                             | Changes                                                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `app/(chakras)/AudioLibrary.tsx` | Import ResponsiveImageBackground, BackgroundOpacity; wrap ScrollView; use soundhealingbg; add useWindowDimensions for width |

---

## Phase 4: Crystal Bowl 1-Hour – Firebase Path

### 4a. Confirmed Path

```
gs://soul-school-367ee.firebasestorage.app/crystal_Bowl_Meditation_Audio
```

Files (per chakra):

- Day1_CrystalBowlMeditation.aac (Root – 396 Hz)
- Day2_CrystalBowlMeditation.aac (Sacral – 417 Hz)
- Day3_CrystalBowlMeditation.aac (Solar Plexus – 528 Hz)
- Day4_CrystalBowlMeditation.aac (Heart – 639 Hz)
- Day5_CrystalBowlMeditation.aac (Throat – 741 Hz)
- Day6_CrystalBowlMeditation.aac (Third Eye – 852 Hz)
- Day7_CrystalBowlMeditation.aac (Crown – 963 Hz)

### 4b. Current Hook

`useCrystalBowlAudio` already uses:

- `STORAGE_FOLDER = 'crystal_Bowl_Meditation_Audio'`
- Path: `crystal_Bowl_Meditation_Audio/DayX_CrystalBowlMeditation.aac`

This matches the Firebase path. No change needed to the hook if filenames are correct.

### 4c. Dual Linking

**Place 1 – SoundBath (frequency page):**

- Per-chakra SoundBath (e.g. `?chakra=root`) uses `useCrystalBowlAudio(chakra)`
- Crystal Bowl button: `remoteSource || content.crystalBowlAudio` (Firebase or fallback)
- Already wired; verify it uses the same source as Music Room

**Place 2 – Music Room:**

- Uses same `useCrystalBowlAudio(chakra)` per chakra
- Same source: `crystalBowl.localUri || crystalBowl.url || content.crystalBowlAudio`
- Already wired; same logic as SoundBath

Both screens share the same hook and Firebase path. No additional wiring needed once files exist in Storage.

---

## Phase 5: Verification Checklist

- [ ] Crystal Bowl: All 7 files uploaded to `crystal_Bowl_Meditation_Audio/`
- [ ] Tuning Fork: All 7 files in `TuningForkAudio/` (Day1.aac … Day7.aac)
- [ ] Singing Bowl: Bundled `day1singingbowl.mp3` (and per-chakra if desired) – currently shared
- [ ] Green/red indicators only in `__DEV__`
- [ ] Hertz prominent on Music Room
- [ ] Duration visible on each track
- [ ] Music Room uses soundhealingbg + BackgroundOpacity
- [ ] SoundBath and Music Room use identical Crystal Bowl sources

---

## Implementation Order

1. **Phase 3** – Add background (fast, high impact)
2. **Phase 2** – Hertz and duration prominence
3. **Phase 1** – Green/red dev indicators
4. **Phase 4** – Confirm Firebase upload (manual step; code already correct)

---

## Files Summary

| File                             | Phase   | Changes                                            |
| -------------------------------- | ------- | -------------------------------------------------- |
| `app/(chakras)/AudioLibrary.tsx` | 1, 2, 3 | Background, Hertz/duration, green/red in **DEV**   |
| `hooks/useCrystalBowlAudio.ts`   | 4       | Verify path (likely no change)                     |
| Firebase Storage                 | 4       | Upload 7× crystal bowl + 7× tuning fork if missing |
