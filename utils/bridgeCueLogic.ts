import { Chakra } from '@/types/chakras/Chakra'
import { isValidChakra } from '@/utils/validation'
import { getDayFromChakra } from '@/utils/chakraMapping'
import {
    BRIDGE_CUE_MIN_COMPLETION,
    BRIDGE_CUE_TEACHING_DAY_INDEXES,
} from '@/constants/chakras/ancestralBridgeContent'

export function chakraFromEmbodimentAudioId(
    audioId: string | null | undefined,
): Chakra | null {
    if (!audioId?.startsWith('embodiment_')) return null
    const slug = audioId.slice('embodiment_'.length)
    return isValidChakra(slug) ? slug : null
}

export function shouldQueueBridgeCue(input: {
    isIntroAudio: boolean
    audioId: string | null
    positionMs: number
    durationMs: number
    alreadyOpenedAsha: boolean
    alreadyOffered: boolean
    returnPath?: string | null
}): boolean {
    if (!input.isIntroAudio) return false
    const returnPath = input.returnPath ?? ''
    if (
        returnPath.includes('AudioLibrary') ||
        returnPath.includes('HeadToHeart') ||
        returnPath.includes('SoundBath')
    ) {
        return false
    }
    const chakra = chakraFromEmbodimentAudioId(input.audioId)
    if (!chakra) return false
    const day = getDayFromChakra(chakra)
    if (
        !(BRIDGE_CUE_TEACHING_DAY_INDEXES as readonly number[]).includes(day)
    ) {
        return false
    }
    if (input.alreadyOpenedAsha || input.alreadyOffered) return false
    if (input.durationMs <= 0) return false
    return input.positionMs / input.durationMs >= BRIDGE_CUE_MIN_COMPLETION
}
