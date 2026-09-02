/**
 * On-device Master Embodiment playback from the permanent vault.
 * Peek only — do not jump the Day 1 → Day 7 download queue.
 */

import { Chakra } from "@/types/chakras/Chakra"
import { getEmbodimentAssetFilenames } from "@/constants/meditationAssetPack"
import {
  loadEmbodimentDropUriOrNull,
  usesBundledSanctuaryAudio,
} from "@/src/utils/bundledSanctuaryAudio"
import type { EmbodimentAudioUrls } from "@/hooks/useEmbodimentAudio"

export const usesBundledEmbodimentAudio = usesBundledSanctuaryAudio

export async function loadBundledEmbodimentAudio(
  chakra: Chakra,
): Promise<EmbodimentAudioUrls> {
  const [filename] = getEmbodimentAssetFilenames(chakra)
  const localUri = await loadEmbodimentDropUriOrNull(filename)
  return {
    single: localUri ?? undefined,
    localUri,
    isLoading: false,
    error: null,
  }
}

export async function loadBundledEmbodimentAudioOrNull(
  chakra: Chakra,
): Promise<EmbodimentAudioUrls | null> {
  return loadBundledEmbodimentAudio(chakra)
}
