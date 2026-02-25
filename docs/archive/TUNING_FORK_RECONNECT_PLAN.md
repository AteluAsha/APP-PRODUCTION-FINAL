# Tuning Fork Audio Reconnect Plan

## Root Cause

The `useTuningForkAudio` hook uses **wrong filenames**. Firebase has the hero files; the app expects generic names.

| Chakra       | Hook expects (wrong) | Firebase actual                     |
| ------------ | -------------------- | ----------------------------------- |
| ROOT         | `Day1.aac`           | `Day1_396hz_plus256_TuningFork.aac` |
| SACRAL       | `Day2.aac`           | `Day2_417hz_tuningfork.aac`         |
| SOLAR_PLEXUS | `Day3.aac`           | `Day3_528hz_tuningfork.aac`         |
| HEART        | `Day4.aac`           | `Day4_639Hz_tuningfork.aac`         |
| THROAT       | `Day5.aac`           | `Day5_741hz_tuningfork.aac`         |
| THIRD_EYE    | `Day6.aac`           | `Day6_852hz_tuningFork.aac`         |
| CROWN        | `Day7.aac`           | `Day7_963hz_tuningfork.aac`         |

**Result:** Firebase returns 404 → `url` stays null → Music Room shows RED (isConnected = false). Same in Sound Healing.

---

## Fix

Update `CHAKRA_TO_TUNING_FORK_FILE` in `hooks/useTuningForkAudio.ts` to match the Firebase filenames exactly.

### File Change

**`hooks/useTuningForkAudio.ts`**

```typescript
const CHAKRA_TO_TUNING_FORK_FILE: Record<Chakra, string> = {
  [Chakra.ROOT]: "Day1_396hz_plus256_TuningFork.aac",
  [Chakra.SACRAL]: "Day2_417hz_tuningfork.aac",
  [Chakra.SOLAR_PLEXUS]: "Day3_528hz_tuningfork.aac",
  [Chakra.HEART]: "Day4_639Hz_tuningfork.aac",
  [Chakra.THROAT]: "Day5_741hz_tuningfork.aac",
  [Chakra.THIRD_EYE]: "Day6_852hz_tuningFork.aac",
  [Chakra.CROWN]: "Day7_963hz_tuningfork.aac",
}
```

### Impact

- **Sound Healing (SoundBath.tsx):** Already uses `useTuningForkAudio(chakra)` → will fetch correct files.
- **Music Room (AudioLibrary.tsx):** Already uses `useTuningForkAudio(chakra)` → will fetch correct files. Green indicators when `url` or `localUri` is set.
- **Storage folder:** `TuningForkAudio` (unchanged).
- **Cache:** Old cache keys (`tuning_fork_ROOT_Day1.aac`) will be unused; new lookups use new keys.

---

## Verification

1. Open Sound Healing for any chakra → Tuning Fork button loads and plays.
2. Open Music Room → Tuning Fork rows show green (in **DEV**) when connected.

---

**Status:** Executed ✅
