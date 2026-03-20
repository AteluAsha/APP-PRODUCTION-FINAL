/**
 * Firebase Storage Paths – Single Source of Truth (Production)
 *
 * All audio and asset paths for Firebase Cloud Storage. Hooks (useTuningForkAudio,
 * useCrystalBowlAudio, useEmbodimentAudio, useAncestralWisdomAudio) and services
 * must use these folder names; filenames are documented here and implemented in
 * each hook. Case-sensitive; must match Storage bucket exactly.
 *
 * Fail-safes: Firebase init is graceful (null config = no crash). URL fetch uses
 * rate limiting (rateLimiter), retry with backoff (audioRetry), and URL cache
 * (audioCache). Playback always prefers local file when available (see
 * crystalBowlPlayback.ts, audioDownload.ts) so audio never cuts off once downloaded.
 */

/** Tuning Fork Audio – folder in Storage. Files: Day1_396hz_plus256_TuningFork.aac … Day7_963hz_tuningfork.aac */
export const FIREBASE_TUNING_FORK_FOLDER = "TuningForkAudio"

/** Crystal Bowl 1hr – folder in Storage. Filenames: see SANCTUARY_CRYSTAL_BOWL_FILE in sanctuaryAudioManifest.ts (Day1 Hero3.aac, Day3 …SoundBAth…, etc.). */
export const FIREBASE_CRYSTAL_BOWL_FOLDER = "crystal_Bowl_Meditation_Audio"

/** Master Embodiment – folder in Storage. Day 1: Day1_ROOT_DAY_MASTER_EMBODIMENT_SoulSchool_MotherJJ.aac (44:44); Day2…Day7 as in useEmbodimentAudio. */
export const FIREBASE_EMBODIMENT_FOLDER =
  "Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days"

/** Ancestral Wisdom / Head to Heart – folder in Storage. */
export const FIREBASE_ANCESTRAL_WISDOM_FOLDER =
  "AncestralWisdomAudioFiles_Days_1_7"

/** Wisdom Engine manuals path (if used). */
export const FIREBASE_WISDOM_MANUALS_PATH = "wisdom-manuals"
