/**
 * Audio Preload Manifest
 *
 * Central list of all app audio for head (first ~3 min) and full-file preload.
 * Waiting room: heads preload first (fast), then full files in background so
 * once past waiting room all course audio can be fully cached for bulletproof playback.
 * Must stay in sync with useCrystalBowlAudio, useTuningForkAudio, useEmbodimentAudio, useAncestralWisdomAudio.
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
import { FIREBASE_ANCESTRAL_WISDOM_FOLDER } from "@/constants/firebaseStoragePaths"

const CRYSTAL_BOWL_FOLDER = "crystal_Bowl_Meditation_Audio"
// Must match CHAKRA_TO_CRYSTAL_BOWL_FILE in hooks/useCrystalBowlAudio.ts (only these 7 hero files).
const CRYSTAL_BOWL_FILES: Record<Chakra, string> = {
  [Chakra.ROOT]: "Day1_396hz_CrystalBowlSoundBath_Hero2.mov",
  [Chakra.SACRAL]: "Day2_417hz_1Hour_CrystalBowl_SoundBath.aac",
  [Chakra.SOLAR_PLEXUS]: "Day3_528hz_CrystalBowlMeditation_FrequencyHealing.aac",
  [Chakra.HEART]: "Day4_639hz_CrystalBowl_Meditation_FrequencyHealing.aac",
  [Chakra.THROAT]: "Day5_741Hz_CrystalBowlMeditation.aac",
  [Chakra.THIRD_EYE]: "Day6_852hz_ChakraBowl_Medittion_Audio.aac",
  [Chakra.CROWN]: "Day7_963_Hertz_CrystalBowlMeditation.aac",
}

const TUNING_FORK_FOLDER = "TuningForkAudio"
// Must match CHAKRA_TO_TUNING_FORK_FILE in hooks/useTuningForkAudio.ts to avoid drift.
const TUNING_FORK_FILES: Record<Chakra, string> = {
  [Chakra.ROOT]: "Day1_396hz_plus256_TuningFork.aac",
  [Chakra.SACRAL]: "Day2_417hz_tuningfork.aac",
  [Chakra.SOLAR_PLEXUS]: "Day3_528hz_tuningfork.aac",
  [Chakra.HEART]: "Day4_639Hz_tuningfork.aac",
  [Chakra.THROAT]: "Day5_741hz_tuningfork.aac",
  [Chakra.THIRD_EYE]: "Day6_852hz_tuningFork.aac",
  [Chakra.CROWN]: "Day7_963hz_tuningfork.aac",
}

const EMBODIMENT_FOLDER =
  "Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days"
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
    entries.push({
      audioId: `crystal_bowl_${chakra}_${CRYSTAL_BOWL_FILES[chakra]}`,
      storagePath: `${CRYSTAL_BOWL_FOLDER}/${CRYSTAL_BOWL_FILES[chakra]}`,
    })
    entries.push({
      audioId: `tuning_fork_${chakra}_${TUNING_FORK_FILES[chakra]}`,
      storagePath: `${TUNING_FORK_FOLDER}/${TUNING_FORK_FILES[chakra]}`,
    })
  }

  for (const chakra of chakras) {
    const file = EMBODIMENT_FILES[chakra]
    if (Array.isArray(file)) {
      entries.push(
        {
          audioId: `embodiment_${chakra}_part1`,
          storagePath: `${EMBODIMENT_FOLDER}/${file[0]}`,
        },
        {
          audioId: `embodiment_${chakra}_part2`,
          storagePath: `${EMBODIMENT_FOLDER}/${file[1]}`,
        },
      )
    } else {
      entries.push({
        audioId: `embodiment_${chakra}`,
        storagePath: `${EMBODIMENT_FOLDER}/${file}`,
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
      const url = await getDownloadURL(ref(storage, storagePath))
      await downloadAndCacheAudioResumable(url, audioId)
      done += 1
    } catch (err) {
      if (__DEV__) {
        console.warn(`[audioPreload] Chakra ${chakra} full failed for ${audioId}:`, err)
      }
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

      const url = await getDownloadURL(ref(storage, storagePath))
      await downloadAudioHead(url, audioId)
      done += 1
    } catch (err) {
      if (__DEV__) {
        console.warn(`[audioPreload] Head failed for ${audioId}:`, err)
      }
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

      const url = await getDownloadURL(ref(storage, storagePath))
      await downloadAndCacheAudioResumable(url, audioId)
      done += 1
    } catch (err) {
      if (__DEV__) {
        console.warn(`[audioPreload] Full failed for ${audioId}:`, err)
      }
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
