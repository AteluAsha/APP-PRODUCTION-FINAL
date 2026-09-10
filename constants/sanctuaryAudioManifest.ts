/**
 * Sanctuary (Frequency of Gnosis) – 28-track manifest
 *
 * Single source of truth for hosted filenames and download-all ordering.
 * UI display titles live in constants/chakras/content.tsx — never filenames.
 */

import { Chakra } from "@/types/chakras/Chakra"
import {
  FIREBASE_ANCESTRAL_WISDOM_FOLDER,
  FIREBASE_CRYSTAL_BOWL_FOLDER,
  FIREBASE_EMBODIMENT_FOLDER,
  FIREBASE_TUNING_FORK_FOLDER,
} from "@/constants/firebaseStoragePaths"

/** Chakra iteration order for Sanctuary sections and download-all. */
export const SANCTUARY_CHAKRA_ORDER: Chakra[] = [
  Chakra.ROOT,
  Chakra.SACRAL,
  Chakra.SOLAR_PLEXUS,
  Chakra.HEART,
  Chakra.THROAT,
  Chakra.THIRD_EYE,
  Chakra.CROWN,
]

/** 7 tuning + 7 crystal + 7 embodiment + 7 head-to-heart (4 tracks per day). */
export const SANCTUARY_TRACK_COUNT = 28

/** Crystal bowl sound bath – null when this day has no bowl track. */
export const SANCTUARY_CRYSTAL_BOWL_FILE: Record<Chakra, string | null> = {
  [Chakra.ROOT]: "Day1_CrystalBowlSoundBath_RootChakra_AwakeningSoul.mp3",
  [Chakra.SACRAL]: "Day2_CrystalBowlSoundBacth_AwakeningSoul.mp3",
  [Chakra.SOLAR_PLEXUS]: "Day3_CrystalBowlSoundBath_AwakeningSoul.mp3",
  [Chakra.HEART]: "Day4_CrystalBowl_AwakeningSoul_v2.mp3",
  [Chakra.THROAT]: "Day5_CrystalBowlSoundBath_AwakeningSoul.mp3",
  [Chakra.THIRD_EYE]: "Day6_CrystalBowlSoundBath_AwakeningSoul.mp3",
  [Chakra.CROWN]: "Day7_CrystalBowlSoundBath_AwakeningSoul.mp3",
}

/** Tuning forks – null when this day has no fork track. */
export const SANCTUARY_TUNING_FORK_FILE: Record<Chakra, string | null> = {
  [Chakra.ROOT]: "Day1_396hz_plus256_TuningFork.aac",
  [Chakra.SACRAL]: "Day2_417hz_tuningfork.aac",
  [Chakra.SOLAR_PLEXUS]: "Day3_528hz_tuningfork.aac",
  [Chakra.HEART]: "Day4_639Hz_tuningfork.aac",
  [Chakra.THROAT]: "Day5_741hz_tuningfork.aac",
  [Chakra.THIRD_EYE]: "Day6_852hz_tuningFork.aac",
  [Chakra.CROWN]: "Day7_963hz_tuningfork.aac",
}

/** Master embodiment – one file per chakra. */
export const SANCTUARY_EMBODIMENT_FILES: Record<Chakra, string> = {
  [Chakra.ROOT]: "Day1_RootDay_MasterEmbodiment_refined_AwkeningSoul.mp3",
  [Chakra.SACRAL]: "Day2_SacralChakraEmbodiment_SoulSchool.mp3",
  [Chakra.SOLAR_PLEXUS]: "DAY3_ManipuraEmbodiment_SoulSchool.mp3",
  [Chakra.HEART]: "Day4_HeartChakraEmbodiment_SoulSchool_Remastered.mp3",
  [Chakra.THROAT]: "Day5_ThroatChakra_SoulSchool_TAGGED.mp3",
  [Chakra.THIRD_EYE]: "Day6_Ajna_MasterEmbodiment_SoulSchool_TAGGED.mp3",
  [Chakra.CROWN]:
    "Day7_CrownChakra_MasterEmbodiment_Meditation_SoulSchool__TAGGED_.mp3",
}

/** Head to Heart (Ancestral Wisdom / Asha Speaks) – remastered MP3 on R2. */
export const SANCTUARY_ANCESTRAL_FILE: Record<Chakra, string> = {
  [Chakra.ROOT]: "Day1_7thDivineLaw_AshaSpeaks.mp3",
  [Chakra.SACRAL]: "Day2_6thDivineLaw_AshaSpeaks.mp3",
  [Chakra.SOLAR_PLEXUS]: "Day3_5thDivineLaw_AshaSpeaks.mp3",
  [Chakra.HEART]: "Day4_4thDivineLaw_AshaSpeaks.mp3",
  [Chakra.THROAT]: "Day5_3rdDivineLaw_AshaSpeaks.mp3",
  [Chakra.THIRD_EYE]: "Day6_2ndDivineLaw_AshaSpeaks_v2.mp3",
  [Chakra.CROWN]: "Day7_1stDivineLaw_AshaSpeaks.mp3",
}

export type SanctuaryManifestRowKind =
  | "tuning_fork"
  | "crystal_bowl"
  | "embodiment_single"
  | "head_to_heart"

export type SanctuaryDownloadRow = {
  chakra: Chakra
  rowKind: SanctuaryManifestRowKind
  audioId: string
  storagePath: string
  isCrystalBowl: boolean
}

function sanctuaryEmbodimentAudioId(chakra: Chakra): string {
  return `embodiment_${chakra}`
}

/**
 * Ordered download slots (Master → Tuning Fork → Asha → Crystal Bowl per chakra).
 * Skips tuning/crystal when a day has no file.
 */
export function buildSanctuaryDownloadManifest(): SanctuaryDownloadRow[] {
  const rows: SanctuaryDownloadRow[] = []
  for (const chakra of SANCTUARY_CHAKRA_ORDER) {
    const emb = SANCTUARY_EMBODIMENT_FILES[chakra]
    rows.push({
      chakra,
      rowKind: "embodiment_single",
      audioId: sanctuaryEmbodimentAudioId(chakra),
      storagePath: `${FIREBASE_EMBODIMENT_FOLDER}/${emb}`,
      isCrystalBowl: false,
    })
    const tf = SANCTUARY_TUNING_FORK_FILE[chakra]
    if (tf) {
      rows.push({
        chakra,
        rowKind: "tuning_fork",
        audioId: `tuning_fork_${chakra}_${tf}`,
        storagePath: `${FIREBASE_TUNING_FORK_FOLDER}/${tf}`,
        isCrystalBowl: false,
      })
    }
    const anc = SANCTUARY_ANCESTRAL_FILE[chakra]
    rows.push({
      chakra,
      rowKind: "head_to_heart",
      audioId: `head_to_heart_${chakra}_${anc}`,
      storagePath: `${FIREBASE_ANCESTRAL_WISDOM_FOLDER}/${anc}`,
      isCrystalBowl: false,
    })
    const cb = SANCTUARY_CRYSTAL_BOWL_FILE[chakra]
    if (cb) {
      rows.push({
        chakra,
        rowKind: "crystal_bowl",
        audioId: `crystal_bowl_${chakra}_${cb}`,
        storagePath: `${FIREBASE_CRYSTAL_BOWL_FOLDER}/${cb}`,
        isCrystalBowl: true,
      })
    }
  }
  if (__DEV__ && rows.length !== SANCTUARY_TRACK_COUNT) {
    console.warn(
      "[sanctuaryAudioManifest] Expected",
      SANCTUARY_TRACK_COUNT,
      "rows, got",
      rows.length,
    )
  }
  return rows
}

export function hasSanctuaryTuningFork(chakra: Chakra): boolean {
  return SANCTUARY_TUNING_FORK_FILE[chakra] != null
}

export function hasSanctuaryCrystalBowl(chakra: Chakra): boolean {
  return SANCTUARY_CRYSTAL_BOWL_FILE[chakra] != null
}
