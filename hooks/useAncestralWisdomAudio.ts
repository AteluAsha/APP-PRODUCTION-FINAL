/**
 * Ancestral Wisdom / Head to Heart Audio Hook
 *
 * Permanent documentDirectory vault. Peek only.
 */

import { useState, useEffect } from "react"
import { Chakra } from "@/types/chakras/Chakra"
import { AVPlaybackSource } from "expo-av"
import { SANCTUARY_ANCESTRAL_FILE } from "@/constants/sanctuaryAudioManifest"
import { getHeadToHeartAssetFilename } from "@/constants/meditationAssetPack"
import { loadHeadToHeartDropUriOrNull } from "@/src/utils/bundledSanctuaryAudio"
import { useSanctuaryVaultStore } from "@/src/services/sanctuaryVaultDownloader"

const CHAKRA_TO_ANCESTRAL_FILE = SANCTUARY_ANCESTRAL_FILE

export interface AncestralWisdomAudioState {
  source: AVPlaybackSource | null
  url: string | null
  localUri: string | null
  isLoading: boolean
  error: Error | null
}

export function getHeadToHeartAudioId(chakra: Chakra): string {
  const audioFile = SANCTUARY_ANCESTRAL_FILE[chakra]
  return `head_to_heart_${chakra}_${audioFile}`
}

export const useAncestralWisdomAudio = (chakra: Chakra) => {
  const generation = useSanctuaryVaultStore((s) => s.generation)
  const [state, setState] = useState<AncestralWisdomAudioState>({
    source: null,
    url: null,
    localUri: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true
    const audioFile = CHAKRA_TO_ANCESTRAL_FILE[chakra]
    if (!audioFile) {
      setState({
        source: null,
        url: null,
        localUri: null,
        isLoading: false,
        error: null,
      })
      return
    }

    const load = async () => {
      const localUri = await loadHeadToHeartDropUriOrNull(
        getHeadToHeartAssetFilename(chakra),
      )
      if (!isMounted) return
      setState({
        source: localUri ? { uri: localUri } : null,
        url: localUri,
        localUri,
        isLoading: false,
        error: null,
      })
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [chakra, generation])

  return state
}
