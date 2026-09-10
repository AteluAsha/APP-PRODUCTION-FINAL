/**
 * Sanctuary audio ID list (course order). Playback is on-device only.
 * These preload entry points are no-ops — they must never fetch a remote URL.
 */

import type { FirebaseStorage } from "firebase/storage"
import { Chakra } from "@/types/chakras/Chakra"
import {
  FIREBASE_ANCESTRAL_WISDOM_FOLDER,
  FIREBASE_CRYSTAL_BOWL_FOLDER,
  FIREBASE_EMBODIMENT_FOLDER,
  FIREBASE_TUNING_FORK_FOLDER,
} from "@/constants/firebaseStoragePaths"
import { SANCTUARY_EMBODIMENT_FILES } from "@/constants/sanctuaryAudioManifest"
import { getCrystalBowlFileName } from "@/hooks/useCrystalBowlAudio"
import { getTuningForkFileName } from "@/hooks/useTuningForkAudio"

const EMBODIMENT_FILES = SANCTUARY_EMBODIMENT_FILES

const ANCESTRAL_FOLDER = FIREBASE_ANCESTRAL_WISDOM_FOLDER
// Head to Heart (Ancestral Wisdom); must match useAncestralWisdomAudio / getHeadToHeartAudioId
const ANCESTRAL_FILES: Partial<Record<Chakra, string>> = {
  [Chakra.ROOT]: "Day1_7thDivineLaw_AshaSpeaks.mp3",
  [Chakra.SACRAL]: "Day2_6thDivineLaw_AshaSpeaks.mp3",
  [Chakra.SOLAR_PLEXUS]: "Day3_5thDivineLaw_AshaSpeaks.mp3",
  [Chakra.HEART]: "Day4_4thDivineLaw_AshaSpeaks.mp3",
  [Chakra.THROAT]: "Day5_3rdDivineLaw_AshaSpeaks.mp3",
  [Chakra.THIRD_EYE]: "Day6_2ndDivineLaw_AshaSpeaks_v2.mp3",
  [Chakra.CROWN]: "Day7_1stDivineLaw_AshaSpeaks.mp3",
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
    if (crystalFile) {
      entries.push({
        audioId: `crystal_bowl_${chakra}_${crystalFile}`,
        storagePath: `${FIREBASE_CRYSTAL_BOWL_FOLDER}/${crystalFile}`,
      })
    }
    const tuningFile = getTuningForkFileName(chakra)
    if (tuningFile) {
      entries.push({
        audioId: `tuning_fork_${chakra}_${tuningFile}`,
        storagePath: `${FIREBASE_TUNING_FORK_FOLDER}/${tuningFile}`,
      })
    }
  }

  for (const chakra of chakras) {
    const file = EMBODIMENT_FILES[chakra]
    entries.push({
      audioId: `embodiment_${chakra}`,
      storagePath: `${FIREBASE_EMBODIMENT_FOLDER}/${file}`,
    })
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

/** Day 1 → day 7 course order (matches enum / journey). */
const COURSE_CHAKRA_ORDER: Chakra[] = [
  Chakra.ROOT,
  Chakra.SACRAL,
  Chakra.SOLAR_PLEXUS,
  Chakra.HEART,
  Chakra.THROAT,
  Chakra.THIRD_EYE,
  Chakra.CROWN,
]

/**
 * Returns manifest entries for a single chakra (one day's audio).
 * Order: Master Embodiment → tuning fork → Asha → crystal bowl.
 */
export function getManifestEntriesForChakra(chakra: Chakra): AudioHeadEntry[] {
  const c = chakra as string
  const all = MANIFEST.filter(
    (e) =>
      e.audioId.startsWith(`crystal_bowl_${c}_`) ||
      e.audioId.startsWith(`tuning_fork_${c}_`) ||
      e.audioId === `embodiment_${c}` ||
      e.audioId.startsWith(`embodiment_${c}_`) ||
      e.audioId.startsWith(`head_to_heart_${c}_`),
  )
  const embodiment = all.filter(
    (e) =>
      e.audioId === `embodiment_${c}` ||
      e.audioId.startsWith(`embodiment_${c}_`),
  )
  const tuning = all.filter((e) =>
    e.audioId.startsWith(`tuning_fork_${c}_`),
  )
  const h2h = all.filter((e) =>
    e.audioId.startsWith(`head_to_heart_${c}_`),
  )
  const crystal = all.filter((e) =>
    e.audioId.startsWith(`crystal_bowl_${c}_`),
  )
  return [...embodiment, ...tuning, ...h2h, ...crystal]
}

/** Full course: day 1–7 in order, hero-first within each day (background preload). */
function buildOrderedCourseManifest(): AudioHeadEntry[] {
  const out: AudioHeadEntry[] = []
  for (const chakra of COURSE_CHAKRA_ORDER) {
    out.push(...getManifestEntriesForChakra(chakra))
  }
  return out
}

const ORDERED_COURSE_MANIFEST = buildOrderedCourseManifest()

/** No remote download. Sanctuary AAC is already on device. */
export async function preloadFullFilesForChakra(
  _storage: FirebaseStorage | null,
  chakra: Chakra,
): Promise<{ done: number; skipped: number; failed: number }> {
  return {
    done: 0,
    skipped: getManifestEntriesForChakra(chakra).length,
    failed: 0,
  }
}

/** No remote download. Sanctuary AAC is already on device. */
export async function preloadAllAudioHeads(
  _storage: FirebaseStorage | null,
): Promise<{ done: number; skipped: number; failed: number }> {
  return { done: 0, skipped: ORDERED_COURSE_MANIFEST.length, failed: 0 }
}

/** No remote download. Sanctuary AAC is already on device. */
export async function preloadAllAudioFullFiles(
  _storage: FirebaseStorage | null,
): Promise<{ done: number; skipped: number; failed: number }> {
  return { done: 0, skipped: ORDERED_COURSE_MANIFEST.length, failed: 0 }
}
