import { useState, useEffect } from "react"
import { Chakra } from "@/types/chakras/Chakra"
import { loadBundledEmbodimentAudio } from "@/src/utils/embodimentLocalAudio"
import { useSanctuaryVaultStore } from "@/src/services/sanctuaryVaultDownloader"

export interface EmbodimentAudioUrls {
  partOne?: string
  partTwo?: string
  single?: string
  localUri?: string | null
  localUriPartOne?: string | null
  localUriPartTwo?: string | null
  isLoading: boolean
  error: Error | null
}

export function getEmbodimentAudioId(
  chakra: Chakra,
  _part?: "part1" | "part2",
): string {
  return `embodiment_${chakra}`
}

/**
 * Master Embodiment audio from the permanent documentDirectory vault.
 */
export const useEmbodimentAudio = (chakra: Chakra) => {
  const generation = useSanctuaryVaultStore((s) => s.generation)
  const [urls, setUrls] = useState<EmbodimentAudioUrls>({
    localUri: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      const bundled = await loadBundledEmbodimentAudio(chakra)
      if (!isMounted) return
      setUrls(bundled)
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [chakra, generation])

  return urls
}
