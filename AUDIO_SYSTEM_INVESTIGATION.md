# Audio System – Investigation & Fixes

**Date:** 2026-02-02  
**Status:** Fixes applied

---

## Summary

Investigation into reported issues: no music plays, glitches, crystal bowl 1-hour audio won't start. Root causes identified and fixes applied.

---

## Findings

### 1. Placeholder & Bundled Audio

| Location | Current State |
|----------|---------------|
| **Local assets** | Only 4 files: `day1singingbowl.mp3`, `day1tuningfork.mp3`, `root-erin-1.mp3`, `root-ethan-1.mp3` |
| **Crystal bowl 1-hour** | Expected from Firebase: `crystal_Bowl_Meditation_Audio/Day1_CrystalBowlMeditation.aac` through `Day7_*.aac` |
| **Bundled fallback** | All 7 chakras use `day1singingbowl.mp3` (~3 min) when Firebase 404s – same short file for every chakra |

**Action required:** The 1-hour crystal bowl files (`Day1_CrystalBowlMeditation.aac` … `Day7_CrystalBowlMeditation.aac`) must be uploaded to Firebase Storage under `crystal_Bowl_Meditation_Audio/`. Until then, the app falls back to the short singing bowl track.

### 2. AudioPlayer Re-Init Bug (Fixed)

**Problem:** When switching tracks, the player did not reliably re-initialize when `source` changed because:
- Effect only called `initializeTrack()` when `track` was null
- After changing `source`, the old track was unloaded in cleanup, but the new track was not initialized until the next effect run, causing a race

**Fix:** Use a `lastSourceRef` to detect source changes and always re-initialize when `source` or `prefs` change.

### 3. Audio Mode Configuration (Fixed)

**Problem:** Default audio session might block playback (e.g. on iOS with ringer muted).

**Fix:** Configure `setAudioModeAsync` with:
- `playsInSilentModeIOS: true`
- `staysActiveInBackground: true`
- `interruptionModeIOS: InterruptionModeIOS.DuckOthers`
- `interruptionModeAndroid: InterruptionModeAndroid.DuckOthers`

---

## Audio Flow (Verified)

1. **SoundBath** (frequency page) – Crystal bowl button  
   - Uses `useCrystalBowlAudio(chakra)` → Firebase or local cache  
   - Fallback: `content.crystalBowlAudio` = `day1singingbowl.mp3`

2. **AudioLibrary** (Music room) – Crystal bowl rows  
   - Same `useCrystalBowlAudio` per chakra  
   - Same fallback

3. **AudioPlayer**  
   - Reads `source`, `metadata`, `prefs` from `useCurrentAudioStore`  
   - Loads via `Audio.Sound.createAsync(source)`  
   - Plays immediately after load

---

## Firebase Storage Paths

| Collection/Folder | Files |
|-------------------|-------|
| `crystal_Bowl_Meditation_Audio/` | Day1_CrystalBowlMeditation.aac … Day7_CrystalBowlMeditation.aac (1 hour each) |
| `TuningForkAudio/` | Day1.aac … Day7.aac |

**Note:** If these files are missing, the app uses bundled fallbacks. Tuning fork uses `day1tuningfork.mp3`; crystal bowl uses `day1singingbowl.mp3`.

---

## Files Modified

- `app/AudioPlayer.tsx` – Source change re-init, audio mode
- `AUDIO_SYSTEM_INVESTIGATION.md` – This document

---

## Next Steps (Optional)

1. **Upload 1-hour crystal bowl files** to Firebase `crystal_Bowl_Meditation_Audio/`
2. **Per-chakra bundled fallbacks** – Replace single `day1singingbowl.mp3` with chakra-specific tracks if desired
3. **Error feedback** – Show a toast when Firebase fails and the fallback is used
