/**
 * Audio Preload Manifest
 *
 * Central list of all app audio for head (first ~3 min) and full-file preload.
 * Waiting room: heads preload first (fast), then full files in background so
 * once past waiting room all course audio can be fully cached for bulletproof playback.
 *
 * Crystal/tuning paths: single source of truth via getCrystalBowlFileName /
 * getTuningForkFileName and FIREBASE_* folders (same as useCrystalBowlAudio,
 * useTuningForkAudio). Embodiment uses FIREBASE_EMBODIMENT_FOLDER; filenames
 * must match useEmbodimentAudio.
 */

import { ref, getDownloadURL } from "firebase/storage"
import type { FirebaseStorage } from "firebase/storage"
import { Chakra } from "@/types/chakras/Chakra"
import {
  getLocalAudioHeadUri,
  downloadAudioHead,
  getLocalAudioUri,
  downloadAndCacheAudioResumable,
} from "./audioDownload"
import { checkRateLimit, waitForRateLimit } from "./rateLimiter"
import { retryWithBackoff } from "./audioRetry"
import {
  FIREBASE_ANCESTRAL_WISDOM_FOLDER,
  FIREBASE_CRYSTAL_BOWL_FOLDER,
  FIREBASE_EMBODIMENT_FOLDER,
  FIREBASE_TUNING_FORK_FOLDER,
} from "@/constants/firebaseStoragePaths"
import { getCrystalBowlFileName } from "@/hooks/useCrystalBowlAudio"
import { getTuningForkFileName } from "@/hooks/useTuningForkAudio"

/** Match useCrystalBowlAudio getDownloadURL retry */
const PRELOAD_RETRY = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
} as const

function logPreloadFailure(
  phase: string,
  audioId: string,
  storagePath: string,
  err: unknown,
) {
  const msg = err instanceof Error ? err.message : String(err)
  console.warn(`[audioPreload] ${phase} failed`, {
    audioId,
    storagePath,
    error: msg,
  })
}

async function getDownloadUrlWithRetry(
  storage: FirebaseStorage,
  storagePath: string,
): Promise<string> {
  return retryWithBackoff(
    () => getDownloadURL(ref(storage, storagePath)),
    PRELOAD_RETRY,
  )
}

async function downloadAudioHeadWithRetry(
  url: string,
  audioId: string,
): Promise<void> {
  await retryWithBackoff(
    () => downloadAudioHead(url, audioId),
    PRELOAD_RETRY,
  )
}

async function downloadFullWithRetry(url: string, audioId: string): Promise<void> {
  await retryWithBackoff(
    () => downloadAndCacheAudioResumable(url, audioId),
    PRELOAD_RETRY,
  )
}

// Filenames must match hooks/useEmbodimentAudio CHAKRA_TO_AUDIO_FILE
const EMBODIMENT_FILES: Record<Chakra, string | string[]> = {
  [Chakra.ROOT]: "Day1_ROOT_DAY_MASTER_EMBODIMENT_SoulSchool_MotherJJ.aac",
  [Chakra.SACRAL]: "Day2_SacralChakraEmbodiment_SoulSchool.aac",
  [Chakra.SOLAR_PLEXUS]: "Day3_SolarChakraEmbodiment_SoulSchool.aac",
  [Chakra.HEART]: "Day4_HeartChakraEmbodiment_SoulSchool.aac",
  [Chakra.THROAT]: "Day5_ThroatChakraEmbodiment_SoulSchool.aac",
  [Chakra.THIRD_EYE]: [
    "Day6_PARTONE_AjnaEmbodiment_SoulSchool.aac",
    "Day6_PARTTWO_AjnaEmbodiment_SoulSchool.aac",
  ],
  [Chakra.CROWN]: "Day7_CrownChakra_MasterEmbodiment_Meditation_SoulSchool.aac",
}

const ANCESTRAL_FOLDER = FIREBASE_ANCESTRAL_WISDOM_FOLDER
// Head to Heart (Ancestral Wisdom); must match useAncestralWisdomAudio / getHeadToHeartAudioId
const ANCESTRAL_FILES: Partial<Record<Chakra, string>> = {
  [Chakra.ROOT]: "Day1_7th_DivineLaw_With_Asha.aac",
  [Chakra.SACRAL]: "day2_theauthenticself_6th_DivineLaw_POLARITY_With_Asha.aac",
  [Chakra.SOLAR_PLEXUS]:
    "day3_egoheartrailroad_5thdivinelaw_causeandeffect_With_Asha_Length_12minutes.aac",
  [Chakra.HEART]: "Day4_AWAKENINGTHEHEART_4thDivinelaw_Rhythm_With_Asha.aac",
  [Chakra.THROAT]:
    "Day5_ThePOWEROfVibration_Vishuddha_3rd_DivineLaw_With_Asha.aac",
  [Chakra.THIRD_EYE]:
    "Day6_LISTENINGTOTHECOSMOS_2nd_DivineLaw_Correspodence_With_Asha.aac",
  [Chakra.CROWN]:
    "Day7_THEMEADOWOFTHESOUL_1stDivineLaw_Mentalism_With_Asha.aac",
}

export interface AudioHeadEntry {
  audioId: string
  storagePath: string
}

function buildManifest(): AudioHeadEntry[] {
  const entries: AudioHeadEntry[] = []

  const chakras = Object.values(Chakra) as Chakra[]
  for (const chakra of chakras) {
    const crystalFile = getCrystalBowlFileName(chakra)
    entries.push({
      audioId: `crystal_bowl_${chakra}_${crystalFile}`,
      storagePath: `${FIREBASE_CRYSTAL_BOWL_FOLDER}/${crystalFile}`,
    })
    const tuningFile = getTuningForkFileName(chakra)
    entries.push({
      audioId: `tuning_fork_${chakra}_${tuningFile}`,
      storagePath: `${FIREBASE_TUNING_FORK_FOLDER}/${tuningFile}`,
    })
  }

  for (const chakra of chakras) {
    const file = EMBODIMENT_FILES[chakra]
    if (Array.isArray(file)) {
      entries.push(
        {
          audioId: `embodiment_${chakra}_part1`,
          storagePath: `${FIREBASE_EMBODIMENT_FOLDER}/${file[0]}`,
        },
        {
          audioId: `embodiment_${chakra}_part2`,
          storagePath: `${FIREBASE_EMBODIMENT_FOLDER}/${file[1]}`,
        },
      )
    } else {
      entries.push({
        audioId: `embodiment_${chakra}`,
        storagePath: `${FIREBASE_EMBODIMENT_FOLDER}/${file}`,
      })
    }
  }

  for (const chakra of chakras) {
    const audioFile = ANCESTRAL_FILES[chakra]
    if (audioFile) {
      entries.push({
        audioId: `head_to_heart_${chakra}_${audioFile}`,
        storagePath: `${ANCESTRAL_FOLDER}/${audioFile}`,
      })
    }
  }

  return entries
}

const MANIFEST = buildManifest()

/**
 * Returns manifest entries for a single chakra (one day's audio).
 * Used for backup cache: when a day opens or user presses any audio, trigger full-file download of all that day's audio one at a time.
 */
export function getManifestEntriesForChakra(chakra: Chakra): AudioHeadEntry[] {
  const c = chakra as string
  return MANIFEST.filter(
    (e) =>
      e.audioId.startsWith(`crystal_bowl_${c}_`) ||
      e.audioId.startsWith(`tuning_fork_${c}_`) ||
      e.audioId === `embodiment_${c}` ||
      e.audioId.startsWith(`embodiment_${c}_`) ||
      e.audioId.startsWith(`head_to_heart_${c}_`),
  )
}

/**
 * Preload full files for a single day (chakra) in the background, one at a time.
 * Backup trigger: when a day opens or when user presses any audio on that day, run this so all that day's audio is cached even if waiting room was skipped.
 * Skips entries already cached; uses same rate limit and resumable download as preloadAllAudioFullFiles.
 */
export async function preloadFullFilesForChakra(
  storage: FirebaseStorage | null,
  chakra: Chakra,
): Promise<{ done: number; skipped: number; failed: number }> {
  if (!storage) return { done: 0, skipped: 0, failed: 0 }
  const entries = getManifestEntriesForChakra(chakra)
  let done = 0
  let skipped = 0
  let failed = 0
  for (const { audioId, storagePath } of entries) {
    try {
      const existing = await getLocalAudioUri(audioId)
      if (existing) {
        skipped += 1
        continue
      }
      if (!checkRateLimit("firebase")) {
        await waitForRateLimit("firebase")
      }
      const url = await getDownloadUrlWithRetry(storage, storagePath)
      await downloadFullWithRetry(url, audioId)
      done += 1
    } catch (err) {
      logPreloadFailure(`Chakra ${chakra} full`, audioId, storagePath, err)
      failed += 1
    }
  }
  if (__DEV__ && (done > 0 || failed > 0)) {
    console.log(
      `[audioPreload] Chakra ${chakra} full: ${done} downloaded, ${skipped} skipped, ${failed} failed`,
    )
  }
  return { done, skipped, failed }
}

/**
 * Preload the first ~3 min (head) of all app audio in the background.
 * Call after first paint; skips entries that already have head cached.
 * Respects rate limit; one at a time to avoid Firebase throttling.
 */
export async function preloadAllAudioHeads(
  storage: FirebaseStorage | null,
): Promise<{ done: number; skipped: number; failed: number }> {
  if (!storage) return { done: 0, skipped: 0, failed: MANIFEST.length }

  let done = 0
  let skipped = 0
  let failed = 0

  for (const { audioId, storagePath } of MANIFEST) {
    try {
      const existing = await getLocalAudioHeadUri(audioId)
      if (existing) {
        skipped += 1
        continue
      }

      if (!checkRateLimit("firebase")) {
        await waitForRateLimit("firebase")
      }

      const url = await getDownloadUrlWithRetry(storage, storagePath)
      await downloadAudioHeadWithRetry(url, audioId)
      done += 1
    } catch (err) {
      logPreloadFailure("Head", audioId, storagePath, err)
      failed += 1
    }
  }

  if (__DEV__ && (done > 0 || failed > 0)) {
    console.log(
      `[audioPreload] Heads: ${done} downloaded, ${skipped} skipped, ${failed} failed`,
    )
  }

  return { done, skipped, failed }
}

/**
 * Preload full files for all course audio in the background.
 * Call after heads (e.g. from waiting room): heads give instant playback start;
 * full files complete in background so once past waiting room everything can be
 * fully cached for bulletproof, glitch-free playback.
 * Android + iOS: Same flow on both; no platform-specific logic. Cache and preload
 * are shared for maximum seamless somatic experience on all devices.
 * Skips entries that already have full file cached. Uses resumable download for
 * large files; one at a time with rate limit to avoid Firebase throttling.
 */
export async function preloadAllAudioFullFiles(
  storage: FirebaseStorage | null,
): Promise<{ done: number; skipped: number; failed: number }> {
  if (!storage) return { done: 0, skipped: 0, failed: MANIFEST.length }

  let done = 0
  let skipped = 0
  let failed = 0

  for (const { audioId, storagePath } of MANIFEST) {
    try {
      const existing = await getLocalAudioUri(audioId)
      if (existing) {
        skipped += 1
        continue
      }

      if (!checkRateLimit("firebase")) {
        await waitForRateLimit("firebase")
      }

      const url = await getDownloadUrlWithRetry(storage, storagePath)
      await downloadFullWithRetry(url, audioId)
      done += 1
    } catch (err) {
      logPreloadFailure("Full", audioId, storagePath, err)
      failed += 1
    }
  }

  if (__DEV__ && (done > 0 || failed > 0)) {
    console.log(
      `[audioPreload] Full: ${done} downloaded, ${skipped} skipped, ${failed} failed`,
    )
  }

  return { done, skipped, failed }
}
