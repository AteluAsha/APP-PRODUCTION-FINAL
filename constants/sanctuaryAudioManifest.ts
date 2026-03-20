/**
 * Sanctuary (Frequency of Gnosis) – 29-track Firebase manifest
 *
 * Single source of truth for Storage filenames and download-all ordering.
 * Hooks import these maps; AudioLibrary builds the batch from buildSanctuaryDownloadManifest().
 * Paths are case-sensitive; must match the bucket exactly.
 */

import { Chakra } from "@/types/chakras/Chakra"
import {
  FIREBASE_ANCESTRAL_WISDOM_FOLDER,
  FIREBASE_CRYSTAL_BOWL_FOLDER,
  FIREBASE_EMBODIMENT_FOLDER,
  FIREBASE_TUNING_FORK_FOLDER,
} from "@/constants/firebaseStoragePaths"

/** Chakra iteration order for Sanctuary sections and download-all (29 slots). */
export const SANCTUARY_CHAKRA_ORDER: Chakra[] = [
  Chakra.ROOT,
  Chakra.SACRAL,
  Chakra.SOLAR_PLEXUS,
  Chakra.HEART,
  Chakra.THROAT,
  Chakra.THIRD_EYE,
  Chakra.CROWN,
]

/** Total tracks: 7 tuning + 7 crystal + 8 embodiment + 7 head-to-heart */
export const SANCTUARY_TRACK_COUNT = 29

/** Category A: Crystal bowl sound bath – folder crystal_Bowl_Meditation_Audio */
export const SANCTUARY_CRYSTAL_BOWL_FILE: Record<Chakra, string> = {
  [Chakra.ROOT]: "Day1_396hz_CrystalBowlSoundBath_Hero3.aac",
  [Chakra.SACRAL]: "Day2_417hz_1Hour_CrystalBowl_SoundBath.aac",
  [Chakra.SOLAR_PLEXUS]: "Day3_528hz_CrystalBowl_1Hour_SoundBAth.aac",
  [Chakra.HEART]: "Day4_639hz_CrystalBowl_Meditation_FrequencyHealing.aac",
  [Chakra.THROAT]: "Day5_741Hz_CrystalBowlMeditation.aac",
  [Chakra.THIRD_EYE]: "Day6_852hz_ChakraBowl_Medittion_Audio.aac",
  [Chakra.CROWN]: "Day7_963_Hertz_CrystalBowlMeditation.aac",
}

/** Category C: Tuning forks – folder TuningForkAudio */
export const SANCTUARY_TUNING_FORK_FILE: Record<Chakra, string> = {
  [Chakra.ROOT]: "Day1_396hz_plus256_TuningFork.aac",
  [Chakra.SACRAL]: "Day2_417hz_tuningfork.aac",
  [Chakra.SOLAR_PLEXUS]: "Day3_528hz_tuningfork.aac",
  [Chakra.HEART]: "Day4_639Hz_tuningfork.aac",
  [Chakra.THROAT]: "Day5_741hz_tuningfork.aac",
  [Chakra.THIRD_EYE]: "Day6_852hz_tuningFork.aac",
  [Chakra.CROWN]: "Day7_963hz_tuningfork.aac",
}

/** Category B: Master embodiment – folder Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days */
export const SANCTUARY_EMBODIMENT_FILES: Record<Chakra, string | string[]> = {
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

/** Category D: Head to heart – folder AncestralWisdomAudioFiles_Days_1_7 (exact casing per Storage) */
export const SANCTUARY_ANCESTRAL_FILE: Record<Chakra, string> = {
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

export type SanctuaryManifestRowKind =
  | "tuning_fork"
  | "crystal_bowl"
  | "embodiment_single"
  | "embodiment_part1"
  | "embodiment_part2"
  | "head_to_heart"

export type SanctuaryDownloadRow = {
  chakra: Chakra
  rowKind: SanctuaryManifestRowKind
  audioId: string
  storagePath: string
  isCrystalBowl: boolean
}

function sanctuaryEmbodimentAudioId(
  chakra: Chakra,
  part?: "part1" | "part2",
): string {
  if (chakra === Chakra.THIRD_EYE) {
    return part === "part2"
      ? `embodiment_${chakra}_part2`
      : `embodiment_${chakra}_part1`
  }
  return `embodiment_${chakra}`
}

/**
 * Ordered list of 29 download slots (tuning → crystal → embodiment(s) → head-to-heart per chakra).
 */
export function buildSanctuaryDownloadManifest(): SanctuaryDownloadRow[] {
  const rows: SanctuaryDownloadRow[] = []
  for (const chakra of SANCTUARY_CHAKRA_ORDER) {
    const tf = SANCTUARY_TUNING_FORK_FILE[chakra]
    rows.push({
      chakra,
      rowKind: "tuning_fork",
      audioId: `tuning_fork_${chakra}_${tf}`,
      storagePath: `${FIREBASE_TUNING_FORK_FOLDER}/${tf}`,
      isCrystalBowl: false,
    })
    const cb = SANCTUARY_CRYSTAL_BOWL_FILE[chakra]
    rows.push({
      chakra,
      rowKind: "crystal_bowl",
      audioId: `crystal_bowl_${chakra}_${cb}`,
      storagePath: `${FIREBASE_CRYSTAL_BOWL_FOLDER}/${cb}`,
      isCrystalBowl: true,
    })
    const emb = SANCTUARY_EMBODIMENT_FILES[chakra]
    if (Array.isArray(emb)) {
      const [f1, f2] = emb
      rows.push({
        chakra,
        rowKind: "embodiment_part1",
        audioId: sanctuaryEmbodimentAudioId(chakra, "part1"),
        storagePath: `${FIREBASE_EMBODIMENT_FOLDER}/${f1}`,
        isCrystalBowl: false,
      })
      rows.push({
        chakra,
        rowKind: "embodiment_part2",
        audioId: sanctuaryEmbodimentAudioId(chakra, "part2"),
        storagePath: `${FIREBASE_EMBODIMENT_FOLDER}/${f2}`,
        isCrystalBowl: false,
      })
    } else {
      rows.push({
        chakra,
        rowKind: "embodiment_single",
        audioId: sanctuaryEmbodimentAudioId(chakra),
        storagePath: `${FIREBASE_EMBODIMENT_FOLDER}/${emb}`,
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
