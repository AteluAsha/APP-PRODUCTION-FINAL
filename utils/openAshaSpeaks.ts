import { router } from 'expo-router'
import { Chakra } from '@/types/chakras/Chakra'
import { chakraContent } from '@/constants/chakras/content'
import { getHeadToHeartAudioId } from '@/hooks/useAncestralWisdomAudio'
import { getChakraColor } from '@/constants/chakras/chakraConstants'
import { getDayFromChakra } from '@/utils/chakraMapping'
import { playSanctuaryTrack } from '@/utils/sanctuaryPlayback'
import { showHealingToast } from '@/utils/healingToast'

export function ancestralChamberPath(chakra: Chakra): string {
    return `/(chakras)/HeadToHeart?chakra=${chakra}`
}

export function playAshaTrack(
    chakra: Chakra,
    returnPath: string,
): Promise<void> {
    const audio = chakraContent[chakra].headtoheart.audio
    showHealingToast('gatheringPresence')
    return playSanctuaryTrack({
        audioId: getHeadToHeartAudioId(chakra),
        title: audio.title,
        author: audio.author,
        durationMs: audio.duration,
        chakraColor: getChakraColor(getDayFromChakra(chakra)),
        isIntroAudio: false,
        returnPath,
    })
}

/**
 * Always open the Ancestral Gnosis chamber. Audio lives on that page
 * as the master-meditation row; the Master Key stays on the page.
 */
export function openAshaSpeaks(chakra: Chakra, _coursePath: string): void {
    router.push(ancestralChamberPath(chakra) as never)
}
