/**
 * Course-day sounds invited before the close.
 * Required: Master Meditation + Asha Speaks. Sound Bath / fork stay optional.
 * Counted when they open that player, not when they finish the whole track.
 */

import { Chakra } from '@/types/chakras/Chakra'
import { DAY_AUDIO_KIND_LABELS } from '@/constants/dayEmbodimentCopy'
import { getCurrentWeekStartDateISO } from '@/utils/date'
import { chakraFromEmbodimentAudioId } from '@/utils/bridgeCueLogic'
import { isValidChakra } from '@/utils/validation'

export type DayAudioKind = 'meditation' | 'sound-bath' | 'bridge'

export function requiredDayAudioKinds(_chakra?: Chakra): DayAudioKind[] {
    return ['meditation', 'bridge']
}

export function dayAudioSlotKey(
    chakra: Chakra,
    kind: DayAudioKind,
    weekStart = getCurrentWeekStartDateISO(),
): string {
    return `${weekStart}:${chakra}:${kind}`
}

export function dayCeremonySlotKey(
    chakra: Chakra,
    weekStart = getCurrentWeekStartDateISO(),
): string {
    return `${weekStart}:${chakra}:ceremony`
}

export function labelForDayAudioKind(kind: DayAudioKind): string {
    return DAY_AUDIO_KIND_LABELS[kind]
}

function chakraSlugAfterPrefix(audioId: string, prefix: string): Chakra | null {
    if (!audioId.startsWith(prefix)) return null
    const slug = audioId.slice(prefix.length).split('_')[0]
    return isValidChakra(slug) ? slug : null
}

/** Credit the matching course-day sound when that vault id is opened. */
export function dayAudioCreditFromAudioId(
    audioId?: string | null,
): { chakra: Chakra; kind: DayAudioKind } | null {
    if (!audioId) return null
    const embodiment = chakraFromEmbodimentAudioId(audioId)
    if (embodiment) return { chakra: embodiment, kind: 'meditation' }
    const asha = chakraSlugAfterPrefix(audioId, 'head_to_heart_')
    if (asha) return { chakra: asha, kind: 'bridge' }
    const bath = chakraSlugAfterPrefix(audioId, 'crystal_bowl_')
    if (bath) return { chakra: bath, kind: 'sound-bath' }
    return null
}
