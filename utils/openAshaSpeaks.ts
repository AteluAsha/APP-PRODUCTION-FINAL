import { router } from 'expo-router'
import { Chakra } from '@/types/chakras/Chakra'
import { chakraContent } from '@/constants/chakras/content'
import { getHeadToHeartAudioId } from '@/hooks/useAncestralWisdomAudio'
import { useAncestralBridgeStore } from '@/hooks/useAncestralBridgeStore'
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
 * First visit: law chamber. After the Master Key has been received,
 * later taps open Audio Player and return to the course.
 * If they heard Asha but have not received the Key yet, reopen the chamber.
 */
export function openAshaSpeaks(chakra: Chakra, coursePath: string): void {
    const store = useAncestralBridgeStore.getState()
    if (store.hasReceivedMasterKey(chakra)) {
        void playAshaTrack(chakra, coursePath)
        return
    }
    router.push(ancestralChamberPath(chakra) as never)
}
