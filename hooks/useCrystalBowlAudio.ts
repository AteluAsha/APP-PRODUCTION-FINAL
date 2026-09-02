/**
 * Crystal Bowl Audio Hook
 *
 * Permanent documentDirectory vault. Missing files download in the
 * background Day 1 → Day 7 queue; this hook only peeks, it does not
 * jump the queue.
 */

import { useState, useEffect } from "react"
import { Chakra } from "@/types/chakras/Chakra"
import { SANCTUARY_CRYSTAL_BOWL_FILE } from "@/constants/sanctuaryAudioManifest"
import { getCrystalBowlAssetFilename } from "@/constants/meditationAssetPack"
import { loadCrystalBowlDropUriOrNull } from "@/src/utils/bundledSanctuaryAudio"
import { useSanctuaryVaultStore } from "@/src/services/sanctuaryVaultDownloader"

const CHAKRA_TO_CRYSTAL_BOWL_FILE = SANCTUARY_CRYSTAL_BOWL_FILE

export interface CrystalBowlAudioState {
  url: string | null
  localUri: string | null
  durationMs: number | null
  isLoading: boolean
  error: Error | null
}

export const useCrystalBowlAudio = (chakra: Chakra) => {
  const generation = useSanctuaryVaultStore((s) => s.generation)
  const [state, setState] = useState<CrystalBowlAudioState>({
    url: null,
    localUri: null,
    durationMs: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      const filename = getCrystalBowlAssetFilename(chakra)
      if (!filename) {
        if (!isMounted) return
        setState({
          url: null,
          localUri: null,
          durationMs: null,
          isLoading: false,
          error: null,
        })
        return
      }
      const localUri = await loadCrystalBowlDropUriOrNull(filename)
      if (!isMounted) return
      setState({
        url: localUri,
        localUri,
        durationMs: null,
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

export const getCrystalBowlFileName = (chakra: Chakra): string | null => {
  return CHAKRA_TO_CRYSTAL_BOWL_FILE[chakra]
}
