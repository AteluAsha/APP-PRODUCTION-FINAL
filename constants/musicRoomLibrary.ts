/**
 * Frequency of Gnosis (Music Room) — 28-track library order.
 * Per day: Master → Tuning Fork → Asha Speaks → Crystal Bowl.
 * UI titles from content.tsx only — never hosted filenames.
 */

import { Chakra } from '@/types/chakras/Chakra'
import { chakraContent } from '@/constants/chakras/content'
import {
    SANCTUARY_CHAKRA_ORDER,
    SANCTUARY_CRYSTAL_BOWL_FILE,
    SANCTUARY_TUNING_FORK_FILE,
    hasSanctuaryCrystalBowl,
    hasSanctuaryTuningFork,
} from '@/constants/sanctuaryAudioManifest'
import { getEmbodimentAudioId } from '@/hooks/useEmbodimentAudio'
import { getHeadToHeartAudioId } from '@/hooks/useAncestralWisdomAudio'
import { getTuningForkHertz } from '@/hooks/useTuningForkAudio'
import { getDayFromChakra } from '@/utils/chakraMapping'
import { getChakraColor } from '@/constants/chakras/chakraConstants'

export type MusicRoomTrackKind =
    | 'embodiment'
    | 'tuning_fork'
    | 'head_to_heart'
    | 'crystal_bowl'

export type MusicRoomTrackDef = {
    globalIndex: number
    trackKey: string
    audioId: string
    chakra: Chakra
    dayIndex: number
    trackKind: MusicRoomTrackKind
    title: string
    author: string
    durationMs: number
    isIntroAudio: boolean
    chakraColor: string
    isCrystalBowlDownload: boolean
}

function embodimentDef(chakra: Chakra, globalIndex: number): MusicRoomTrackDef {
    const content = chakraContent[chakra]
    const dayIndex = getDayFromChakra(chakra)
    const hertz = getTuningForkHertz(chakra)
    const audioId = getEmbodimentAudioId(chakra)
    return {
        globalIndex,
        trackKey: `library_${globalIndex}`,
        audioId,
        chakra,
        dayIndex,
        trackKind: 'embodiment',
        title: content.audioIntro.title,
        author: content.audioIntro.author,
        durationMs: content.audioIntro.durationMs,
        isIntroAudio: true,
        chakraColor: getChakraColor(dayIndex),
        isCrystalBowlDownload: false,
    }
}

function tuningForkDef(chakra: Chakra, globalIndex: number): MusicRoomTrackDef {
    const filename = SANCTUARY_TUNING_FORK_FILE[chakra]!
    const dayIndex = getDayFromChakra(chakra)
    const hertz = getTuningForkHertz(chakra)
    return {
        globalIndex,
        trackKey: `library_${globalIndex}`,
        audioId: `tuning_fork_${chakra}_${filename}`,
        chakra,
        dayIndex,
        trackKind: 'tuning_fork',
        title: `Tuning Fork ${hertz} Hz`,
        author: chakraContent[chakra].soundBath.title,
        durationMs: 0,
        isIntroAudio: false,
        chakraColor: getChakraColor(dayIndex),
        isCrystalBowlDownload: false,
    }
}

function ashaDef(chakra: Chakra, globalIndex: number): MusicRoomTrackDef {
    const content = chakraContent[chakra].headtoheart
    const dayIndex = getDayFromChakra(chakra)
    return {
        globalIndex,
        trackKey: `library_${globalIndex}`,
        audioId: getHeadToHeartAudioId(chakra),
        chakra,
        dayIndex,
        trackKind: 'head_to_heart',
        title: content.audio.title,
        author: content.audio.author,
        durationMs: content.audio.duration,
        isIntroAudio: false,
        chakraColor: getChakraColor(dayIndex),
        isCrystalBowlDownload: false,
    }
}

function crystalBowlDef(chakra: Chakra, globalIndex: number): MusicRoomTrackDef {
    const filename = SANCTUARY_CRYSTAL_BOWL_FILE[chakra]!
    const dayIndex = getDayFromChakra(chakra)
    return {
        globalIndex,
        trackKey: `library_${globalIndex}`,
        audioId: `crystal_bowl_${chakra}_${filename}`,
        chakra,
        dayIndex,
        trackKind: 'crystal_bowl',
        title: chakraContent[chakra].soundBath.title,
        author: 'Crystal Bowl Sound Bath',
        durationMs: chakraContent[chakra].soundBath.durationMs,
        isIntroAudio: false,
        chakraColor: getChakraColor(dayIndex),
        isCrystalBowlDownload: true,
    }
}

/** All 28 tracks in playback order (Day 1 → Day 7). */
export function buildMusicRoomTrackDefs(): MusicRoomTrackDef[] {
    const defs: MusicRoomTrackDef[] = []
    let idx = 0
    for (const chakra of SANCTUARY_CHAKRA_ORDER) {
        defs.push(embodimentDef(chakra, idx++))
        if (hasSanctuaryTuningFork(chakra)) {
            defs.push(tuningForkDef(chakra, idx++))
        }
        defs.push(ashaDef(chakra, idx++))
        if (hasSanctuaryCrystalBowl(chakra)) {
            defs.push(crystalBowlDef(chakra, idx++))
        }
    }
    return defs
}

export const MUSIC_ROOM_TRACK_DEFS = buildMusicRoomTrackDefs()

export function getMusicRoomTrackDef(globalIndex: number): MusicRoomTrackDef | null {
    return MUSIC_ROOM_TRACK_DEFS[globalIndex] ?? null
}

export function findMusicRoomIndexByAudioId(audioId: string): number {
    return MUSIC_ROOM_TRACK_DEFS.findIndex((d) => d.audioId === audioId)
}

/** Tuning fork + crystal bowl rows for Sound Healing (same defs as Audio Library). */
export function getSoundHealingTrackDefs(chakra: Chakra): MusicRoomTrackDef[] {
    return MUSIC_ROOM_TRACK_DEFS.filter(
        (d) =>
            d.chakra === chakra &&
            (d.trackKind === 'tuning_fork' || d.trackKind === 'crystal_bowl'),
    )
}
