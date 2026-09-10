/**
 * Visual-only Asha player field.
 *
 * Course Asha (full-player / sanctuary) and Music Room Asha (playlist)
 * stay on separate playback systems. This maps an Asha audioId to the
 * same Music Room field imagery without changing origin or playlist.
 */
import { getSanctuaryVaultTrack } from '@/constants/sanctuaryVaultTracks'
import type { MusicRoomTrackKind } from '@/constants/musicRoomLibrary'
import { getDayFromChakra } from '@/utils/chakraMapping'
import { isValidChakra } from '@/utils/validation'

export type AshaPlayerField = {
    dayIndex: number
    trackKind: Extract<MusicRoomTrackKind, 'head_to_heart'>
}

export type SanctuarySoundField = {
    dayIndex: number
    trackKind: Extract<MusicRoomTrackKind, 'head_to_heart' | 'crystal_bowl'>
}

export function getAshaPlayerField(
    audioId: string | null | undefined,
): AshaPlayerField | null {
    if (!audioId?.startsWith('head_to_heart_')) return null
    const vault = getSanctuaryVaultTrack(audioId)
    if (vault?.kind === 'head_to_heart') {
        return {
            dayIndex: getDayFromChakra(vault.chakra),
            trackKind: 'head_to_heart',
        }
    }
    const slug = audioId.slice('head_to_heart_'.length).split('_')[0]
    if (!isValidChakra(slug)) return null
    return {
        dayIndex: getDayFromChakra(slug),
        trackKind: 'head_to_heart',
    }
}

/** Asha + crystal bowl from Sound Bath — same sanctuary field, not Music Room. */
export function getSanctuarySoundField(
    audioId: string | null | undefined,
): SanctuarySoundField | null {
    const asha = getAshaPlayerField(audioId)
    if (asha) return asha
    if (!audioId?.startsWith('crystal_bowl_')) return null
    const vault = getSanctuaryVaultTrack(audioId)
    if (vault?.kind === 'crystal_bowl') {
        return {
            dayIndex: getDayFromChakra(vault.chakra),
            trackKind: 'crystal_bowl',
        }
    }
    const slug = audioId.slice('crystal_bowl_'.length).split('_')[0]
    if (!isValidChakra(slug)) return null
    return {
        dayIndex: getDayFromChakra(slug),
        trackKind: 'crystal_bowl',
    }
}
