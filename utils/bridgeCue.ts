import { getDayFromChakra } from '@/utils/chakraMapping'
import { useAncestralBridgeStore } from '@/hooks/useAncestralBridgeStore'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import {
    chakraFromEmbodimentAudioId,
    shouldQueueBridgeCue,
} from '@/utils/bridgeCueLogic'

export {
    chakraFromEmbodimentAudioId,
    shouldQueueBridgeCue,
} from '@/utils/bridgeCueLogic'

/** After Master Meditation close on days 1–3, offer The Bridge once. */
export function queueBridgeCueIfNeeded(input: {
    isIntroAudio: boolean
    audioId: string | null
    positionMs: number
    durationMs: number
    returnPath?: string | null
}): void {
    const chakra = chakraFromEmbodimentAudioId(input.audioId)
    if (!chakra) return
    const day = getDayFromChakra(chakra)
    const offer = shouldQueueBridgeCue({
        ...input,
        alreadyOpenedAsha: useAncestralBridgeStore
            .getState()
            .hasOpenedAshaPlayer(chakra),
        alreadyOffered: useFirstLaunchStore.getState().hasOfferedBridgeCue(day),
    })
    if (!offer) return
    useAncestralBridgeStore.getState().setPendingBridgeCue(chakra)
}
