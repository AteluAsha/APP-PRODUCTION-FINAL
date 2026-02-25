/**
 * Sound Healing – 14 direct audio pathways (Days 1–7).
 *
 * Names and identifiers only. No require(), no Asset.
 * Actual URLs/localUri come from useTuningForkAudio(chakra) and useCrystalBowlAudio(chakra).
 */

import { Chakra } from "@/types/chakras/Chakra"
import { getTuningForkFileName } from "@/hooks/useTuningForkAudio"
import { getCrystalBowlFileName } from "@/hooks/useCrystalBowlAudio"

/** Tuning fork pathway id for Sound Healing (Firebase + local cache). One per chakra. */
export function getSoundHealingTuningForkPathwayId(chakra: Chakra): string {
  return `tuning_fork_${chakra}_${getTuningForkFileName(chakra)}`
}

/** Crystal bowl pathway id for Sound Healing (Firebase + local cache). One per chakra. */
export function getSoundHealingCrystalBowlPathwayId(chakra: Chakra): string {
  return `crystal_bowl_${chakra}_${getCrystalBowlFileName(chakra)}`
}
