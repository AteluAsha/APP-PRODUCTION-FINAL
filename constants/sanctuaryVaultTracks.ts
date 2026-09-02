/**
 * Silent Background Vault – 28 sanctuary tracks
 *
 * Production URLs live in SANCTUARY_HOSTED_URLS (Cloudflare R2).
 * Order is Day 1 → Day 7: embodiment, tuning fork, Head to Heart, crystal bowl.
 */

import { Chakra } from '@/types/chakras/Chakra'
import {
    SANCTUARY_ANCESTRAL_FILE,
    SANCTUARY_CRYSTAL_BOWL_FILE,
    SANCTUARY_EMBODIMENT_FILES,
    SANCTUARY_TRACK_COUNT,
    SANCTUARY_TUNING_FORK_FILE,
    type SanctuaryManifestRowKind,
} from '@/constants/sanctuaryAudioManifest'
import { SANCTUARY_HOSTED_URLS } from '@/constants/sanctuaryHostedUrls'

export type SanctuaryVaultKind =
    | 'embodiment'
    | 'crystal_bowl'
    | 'head_to_heart'
    | 'tuning_fork'

export type SanctuaryVaultTrack = {
    day: number
    chakra: Chakra
    kind: SanctuaryVaultKind
    rowKind: SanctuaryManifestRowKind
    audioId: string
    filename: string
    url: string
}

function hostedUrl(filename: string): string {
    const url = SANCTUARY_HOSTED_URLS[filename]
    if (!url) {
        throw new Error(`Missing hosted URL for ${filename}`)
    }
    return url
}

function embodimentAudioId(chakra: Chakra): string {
    return `embodiment_${chakra}`
}

const CHAKRA_DAYS: Array<{ day: number; chakra: Chakra }> = [
    { day: 1, chakra: Chakra.ROOT },
    { day: 2, chakra: Chakra.SACRAL },
    { day: 3, chakra: Chakra.SOLAR_PLEXUS },
    { day: 4, chakra: Chakra.HEART },
    { day: 5, chakra: Chakra.THROAT },
    { day: 6, chakra: Chakra.THIRD_EYE },
    { day: 7, chakra: Chakra.CROWN },
]

function buildVaultTracks(): SanctuaryVaultTrack[] {
    const tracks: SanctuaryVaultTrack[] = []
    for (const { day, chakra } of CHAKRA_DAYS) {
        const emb = SANCTUARY_EMBODIMENT_FILES[chakra]
        tracks.push({
            day,
            chakra,
            kind: 'embodiment',
            rowKind: 'embodiment_single',
            audioId: embodimentAudioId(chakra),
            filename: emb,
            url: hostedUrl(emb),
        })

        const fork = SANCTUARY_TUNING_FORK_FILE[chakra]
        if (fork) {
            tracks.push({
                day,
                chakra,
                kind: 'tuning_fork',
                rowKind: 'tuning_fork',
                audioId: `tuning_fork_${chakra}_${fork}`,
                filename: fork,
                url: hostedUrl(fork),
            })
        }

        const ancestral = SANCTUARY_ANCESTRAL_FILE[chakra]
        tracks.push({
            day,
            chakra,
            kind: 'head_to_heart',
            rowKind: 'head_to_heart',
            audioId: `head_to_heart_${chakra}_${ancestral}`,
            filename: ancestral,
            url: hostedUrl(ancestral),
        })

        const crystal = SANCTUARY_CRYSTAL_BOWL_FILE[chakra]
        if (crystal) {
            tracks.push({
                day,
                chakra,
                kind: 'crystal_bowl',
                rowKind: 'crystal_bowl',
                audioId: `crystal_bowl_${chakra}_${crystal}`,
                filename: crystal,
                url: hostedUrl(crystal),
            })
        }
    }
    return tracks
}

export const SANCTUARY_VAULT_TRACKS: SanctuaryVaultTrack[] = buildVaultTracks()

const TRACKS_BY_AUDIO_ID = new Map(
    SANCTUARY_VAULT_TRACKS.map((track) => [track.audioId, track]),
)

const TRACKS_BY_FILENAME = new Map(
    SANCTUARY_VAULT_TRACKS.map((track) => [track.filename, track]),
)

export function getSanctuaryVaultTrack(
    audioId: string,
): SanctuaryVaultTrack | undefined {
    return TRACKS_BY_AUDIO_ID.get(audioId)
}

export function getSanctuaryVaultTrackByFilename(
    filename: string,
): SanctuaryVaultTrack | undefined {
    return TRACKS_BY_FILENAME.get(filename)
}

export function isSanctuaryVaultAudioId(audioId: string): boolean {
    return (
        TRACKS_BY_AUDIO_ID.has(audioId) ||
        audioId.startsWith('embodiment_') ||
        audioId.startsWith('crystal_bowl_') ||
        audioId.startsWith('head_to_heart_') ||
        audioId.startsWith('tuning_fork_')
    )
}

if (__DEV__ && SANCTUARY_VAULT_TRACKS.length !== SANCTUARY_TRACK_COUNT) {
    console.warn(
        '[sanctuaryVaultTracks] expected',
        SANCTUARY_TRACK_COUNT,
        'tracks, got',
        SANCTUARY_VAULT_TRACKS.length,
    )
}
