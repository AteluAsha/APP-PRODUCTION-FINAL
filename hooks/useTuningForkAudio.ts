/**
 * Tuning Fork Audio Hook
 *
 * Permanent documentDirectory vault. Peek only — the silent queue
 * downloads Day 1 → Day 7 in order.
 *
 * Day Mapping (Monday = Day 0):
 * - Monday (Day 0) - ROOT: Day1 (396 Hz)
 * - Tuesday (Day 1) - SACRAL: Day2 (417 Hz)
 * - Wednesday (Day 2) - SOLAR_PLEXUS: Day3 (528 Hz)
 * - Thursday (Day 3) - HEART: Day4 (639 Hz)
 * - Friday (Day 4) - THROAT: Day5 (741 Hz)
 * - Saturday (Day 5) - THIRD_EYE: Day6 (852 Hz)
 * - Sunday (Day 6) - CROWN: Day7 (963 Hz)
 */

import { useState, useEffect } from "react"
import { Chakra } from "@/types/chakras/Chakra"
import { SANCTUARY_TUNING_FORK_FILE } from "@/constants/sanctuaryAudioManifest"
import { getTuningForkAssetFilename } from "@/constants/meditationAssetPack"
import { loadTuningForkDropUriOrNull } from "@/src/utils/bundledSanctuaryAudio"
import { useSanctuaryVaultStore } from "@/src/services/sanctuaryVaultDownloader"

const CHAKRA_TO_TUNING_FORK_FILE = SANCTUARY_TUNING_FORK_FILE

export interface TuningForkAudioState {
  url: string | null
  localUri: string | null
  durationMs: number | null
  isLoading: boolean
  error: Error | null
}

export const useTuningForkAudio = (chakra: Chakra) => {
  const generation = useSanctuaryVaultStore((s) => s.generation)
  const [state, setState] = useState<TuningForkAudioState>({
    url: null,
    localUri: null,
    durationMs: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      const filename = getTuningForkAssetFilename(chakra)
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
      const localUri = await loadTuningForkDropUriOrNull(filename)
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

export const getTuningForkHertz = (chakra: Chakra): string => {
  const hertzMap: Record<Chakra, string> = {
    [Chakra.ROOT]: "396",
    [Chakra.SACRAL]: "417",
    [Chakra.SOLAR_PLEXUS]: "528",
    [Chakra.HEART]: "639",
    [Chakra.THROAT]: "741",
    [Chakra.THIRD_EYE]: "852",
    [Chakra.CROWN]: "963",
  }
  return hertzMap[chakra] || "396"
}

export const getTuningForkFileName = (chakra: Chakra): string | null => {
  return CHAKRA_TO_TUNING_FORK_FILE[chakra]
}

export const formatAudioDuration = (durationMs: number | null): string => {
  if (!durationMs) return ""
  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
