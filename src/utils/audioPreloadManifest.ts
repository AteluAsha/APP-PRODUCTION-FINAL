/**
 * Audio Preload Manifest
 *
 * Central list of all app audio for "first 3 min" head preload.
 * Ensures every track has its start cached so playback never stutters.
 * Must stay in sync with useCrystalBowlAudio, useTuningForkAudio, useEmbodimentAudio.
 */

import { ref, getDownloadURL } from "firebase/storage"
import type { FirebaseStorage } from "firebase/storage"
import { Chakra } from "@/types/chakras/Chakra"
import { getLocalAudioHeadUri, downloadAudioHead } from "./audioDownload"
import { checkRateLimit, waitForRateLimit } from "./rateLimiter"

const CRYSTAL_BOWL_FOLDER = "crystal_Bowl_Meditation_Audio"
// Must match CHAKRA_TO_CRYSTAL_BOWL_FILE in hooks/useCrystalBowlAudio.ts (only these 7 hero files).
const CRYSTAL_BOWL_FILES: Record<Chakra, string> = {
  [Chakra.ROOT]: "Day1_396hz_CrystalBowlSoundBath_Hero2.mov",
  [Chakra.SACRAL]: "Day2_417hz_1Hour_CrystalBowl_SoundBath.aac",
  [Chakra.SOLAR_PLEXUS]: "Day3_528hz_CrystalBowl_1Hour_SoundBath.aac",
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
  [Chakra.ROOT]: "Day1_RootChakraEmbodiment_SoulSchool.aac",
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

  return entries
}

const MANIFEST = buildManifest()

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
