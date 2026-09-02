/**
 * Sanctuary filename helpers (no Play Asset Delivery).
 * Pack names are obsolete; audio lives in the documentDirectory vault.
 */

import { Chakra } from "@/types/chakras/Chakra"
import {
  SANCTUARY_ANCESTRAL_FILE,
  SANCTUARY_CRYSTAL_BOWL_FILE,
  SANCTUARY_EMBODIMENT_FILES,
  SANCTUARY_TUNING_FORK_FILE,
} from "@/constants/sanctuaryAudioManifest"

export function getEmbodimentAssetFilenames(chakra: Chakra): string[] {
  return [SANCTUARY_EMBODIMENT_FILES[chakra]]
}

export function getCrystalBowlAssetFilename(chakra: Chakra): string | null {
  return SANCTUARY_CRYSTAL_BOWL_FILE[chakra]
}

export function getHeadToHeartAssetFilename(chakra: Chakra): string {
  return SANCTUARY_ANCESTRAL_FILE[chakra]
}

export function getTuningForkAssetFilename(chakra: Chakra): string | null {
  return SANCTUARY_TUNING_FORK_FILE[chakra]
}

export function isBundledSanctuaryAudioId(audioId: string): boolean {
  return (
    audioId.startsWith("embodiment_") ||
    audioId.startsWith("crystal_bowl_") ||
    audioId.startsWith("head_to_heart_") ||
    audioId.startsWith("tuning_fork_")
  )
}

/** @deprecated use isBundledSanctuaryAudioId */
export const isAndroidBundledSanctuaryAudioId = isBundledSanctuaryAudioId
