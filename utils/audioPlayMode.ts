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

/** Start the longer `.part` before the locked snapshot ends so listening does not stop. */
export const GROWING_PART_RELOAD_LEAD_MS = 20_000
/** New native duration must clear the listen position by this much before we switch. */
export const GROWING_PART_HANDOFF_RUNWAY_MS = 8_000
/** ~15–30s of extra AAC so the next snapshot is actually longer. */
export const GROWING_PART_MIN_RELOAD_BYTES = 512_000

export function growingPartHandoffMinDurationMs(positionMs: number): number {
    return Math.max(0, positionMs) + GROWING_PART_HANDOFF_RUNWAY_MS
}

export function isGrowingVaultPartUri(uri?: string | null): boolean {
    return typeof uri === 'string' && uri.includes('.part')
}

export function growingPartHasEnoughNewBytes(
    currentBytes: number,
    lastLoadedBytes: number,
): boolean {
    if (!(currentBytes > 0)) return false
    if (!(lastLoadedBytes > 0)) return currentBytes >= GROWING_PART_MIN_RELOAD_BYTES
    return currentBytes >= lastLoadedBytes + GROWING_PART_MIN_RELOAD_BYTES
}

export function shouldReloadGrowingVaultPart(opts: {
    vaultReady: boolean
    sourceUri?: string | null
    didJustFinish?: boolean
    isPlaying?: boolean
    positionMs?: number
    nativeDurationMs?: number
}): boolean {
    if (opts.vaultReady) return false
    if (!isGrowingVaultPartUri(opts.sourceUri)) return false
    if (opts.didJustFinish) return true
    const native = opts.nativeDurationMs ?? 0
    const position = opts.positionMs ?? 0
    if (opts.isPlaying && native > 0 && position >= native - GROWING_PART_RELOAD_LEAD_MS) {
        return true
    }
    return false
}
