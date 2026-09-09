/**
 * Playback mode for the shared Audio Player.
 *
 * Audio Library is single-track only. A future continuous playlist can
 * set playMode to 'queue'. Course day uses full-player origin and never
 * inherits library queue/swipe behavior.
 */
export type AudioPlayMode = 'single' | 'queue'

export function allowsTrackQueue(
    playMode: AudioPlayMode | null | undefined,
): boolean {
    return playMode === 'queue'
}

export function isLibrarySingleTrack(
    origin: string | null | undefined,
    playMode: AudioPlayMode | null | undefined,
): boolean {
    return origin === 'music-room' && !allowsTrackQueue(playMode)
}

/** A .part / incomplete vault file can fire native ended. That is not a real finish. */
export function shouldTreatAsTrackEnd(opts: {
    didJustFinish: boolean
    vaultReady: boolean
}): boolean {
    return opts.didJustFinish === true && opts.vaultReady === true
}
