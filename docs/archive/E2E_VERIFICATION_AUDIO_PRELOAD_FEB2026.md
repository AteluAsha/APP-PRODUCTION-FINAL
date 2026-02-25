# End-to-end verification: Audio preload & playback (post-updates)

**Date:** Feb 2026  
**Scope:** All changes from path-selection preload, auto-trigger, cleanup, and related audio flows.

---

## 1. Flow verification

### 1.1 Trial onboarding → preload (auto-trigger)

| Step                   | Location                            | Verified                                                                                                                             |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Path selection         | WelcomeScreen: tap "Enter Path"     | Navigates to DateSelection only (no modal).                                                                                          |
| Date selection         | DateSelection: pick Monday, confirm | Sets courseStartDate, scheduleJourneyReminders, router.replace ChakraHome.                                                           |
| Waiting room           | ChakraHome renders WaitingScreen    | When showWaitingScreen is true.                                                                                                      |
| Preload start          | WaitingScreen useEffect             | getAudioPreloadStarted() → if !started, setAudioPreloadStarted(), then preloadAllAudioHeads(storage). Guard in audioPreloadGuard.ts. |
| No first-paint preload | app/\_layout.tsx                    | No effect that runs preload on assetsReady. Comment only.                                                                            |

**Result:** Preload runs only when the user reaches the waiting room, once per device. No popup, no preference.

### 1.2 Lifetime

| Step                                                               | Verified                                                                   |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| WelcomeScreen "Enter Path"                                         | router.replace("/(chakras)/ChakraHub"). No DateSelection, no preload step. |
| Timegate (ChakraHub → Somatic Alignment → DateSelection → confirm) | DateSelection confirm goes straight to ChakraHome; no preload modal.       |

---

## 2. Audio playback paths

### 2.1 Music Room (AudioLibrary)

| Track type                   | Preparation                                           | Source                 |
| ---------------------------- | ----------------------------------------------------- | ---------------------- |
| Tuning Fork                  | prepareLongAudioForPlay (full → head → download head) | crystalBowlPlayback.ts |
| Crystal Bowl                 | prepareCrystalBowlForPlay (= prepareLongAudioForPlay) | crystalBowlPlayback.ts |
| Embodiment (single)          | prepareLongAudioForPlay                               | crystalBowlPlayback.ts |
| Embodiment (Third Eye parts) | prepareLongAudioForPlay for part1 and part2           | crystalBowlPlayback.ts |

All use: local full → local head → download head → stream fallback. **Verified.**

### 2.2 SoundBath (per-chakra)

| Track        | Preparation                                                     |
| ------------ | --------------------------------------------------------------- |
| Crystal Bowl | prepareCrystalBowlForPlay with url, localUri, audioId, fallback |

**Verified.** SoundBath does not play tuning fork or embodiment in the same screen flow; embodiment is on ChakraTemplate.

### 2.3 Chakra day screen (ChakraTemplate)

| Content                   | Source passed to AudioRow          |
| ------------------------- | ---------------------------------- |
| Third Eye part one        | localUriPartOne \|\| partOne (URL) |
| Third Eye part two        | localUriPartTwo \|\| partTwo (URL) |
| Single-file (Days 1–5, 7) | localUri \|\| single (URL)         |

**Fix applied:** ChakraTemplate now prefers local URIs when present (useEmbodimentAudio returns localUri / localUriPartOne / localUriPartTwo when cache exists). Condition for showing the row uses (localUri || single) and (localUriPartOne || partOne) etc., so cached embodiment is used and the row is not hidden when only localUri is set.

---

## 3. Shared utilities (no dead code)

| File                              | Purpose                                                                                                                                         | Used by                                                                                                                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| src/utils/audioDownload.ts        | getLocalAudioUri, getLocalAudioHeadUri, getLocalAudioUriOrHead, downloadAndCacheAudio, downloadAudioHead, clearCachedAudio, clearAllCachedAudio | crystalBowlPlayback, useEmbodimentAudio, useCrystalBowlAudio (getLocalAudioUri), AudioLibrary (downloadAndCacheAudio), audioPreloadManifest (getLocalAudioHeadUri, downloadAudioHead) |
| src/utils/crystalBowlPlayback.ts  | prepareLongAudioForPlay, prepareCrystalBowlForPlay                                                                                              | AudioLibrary, SoundBath                                                                                                                                                               |
| src/utils/audioPreloadGuard.ts    | getAudioPreloadStarted, setAudioPreloadStarted                                                                                                  | WaitingScreen only                                                                                                                                                                    |
| src/utils/audioPreloadManifest.ts | preloadAllAudioHeads, MANIFEST                                                                                                                  | WaitingScreen (dynamic import)                                                                                                                                                        |

**Removed / consolidated:** PreloadCourseMaterialsModal (deleted). audioPreloadPreference.ts removed; only guard logic lives in audioPreloadGuard.ts.

---

## 4. Manifest vs hooks (IDs and paths)

Preload manifest audioIds and storage paths are aligned with:

- **Crystal Bowl:** `crystal_bowl_${chakra}_${filename}` — matches useCrystalBowlAudio and SoundBath/AudioLibrary.
- **Tuning Fork:** `tuning_fork_${chakra}_${filename}` — matches useTuningForkAudio and AudioLibrary.
- **Embodiment:** `embodiment_${chakra}` or `embodiment_${chakra}_part1` / `_part2` — matches getEmbodimentAudioId and useEmbodimentAudio.

File names and folders match the hooks (CRYSTAL_BOWL_FILES, TUNING_FORK_FILES, EMBODIMENT_FILES and STORAGE_FOLDER in manifest vs hooks). **Verified.**

---

## 5. Lint and references

- **Lint:** No errors on WelcomeScreen, DateSelection, ChakraHome, WaitingScreen, AudioLibrary, SoundBath, ChakraTemplate, audioDownload, crystalBowlPlayback, audioPreloadGuard, audioPreloadManifest, \_layout.
- **Stale references:** No remaining imports or references to PreloadCourseMaterialsModal, audioPreloadPreference, getUserWantsAudioPreload, or setUserWantsAudioPreload (except the plan doc describing past cleanup).

---

## 6. Summary

| Area                                                | Status                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| Trial path → DateSelection → Waiting room → preload | OK; auto-trigger, guard in place.                                         |
| Lifetime path                                       | OK; no preload step.                                                      |
| Music Room playback (tf, crystal bowl, embodiment)  | OK; all use prepareLongAudioForPlay.                                      |
| SoundBath crystal bowl                              | OK; prepareCrystalBowlForPlay.                                            |
| ChakraTemplate embodiment                           | Fixed; uses localUri when cached and shows row when localUri \|\| single. |
| No first-paint preload                              | OK.                                                                       |
| No unused modal or preference code                  | OK; guard-only module and manifest in use.                                |

**One code fix:** ChakraTemplate now uses embodiment local URIs when available and shows the embodiment row when only localUri is set (no single), so preload/cache is used on the chakra day screen.
