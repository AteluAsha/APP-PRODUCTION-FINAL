/**
 * AudioPlayer seek / duration helpers.
 *
 * Catalog is the total until a complete file reports a trusted length.
 * Growing .part downloads report a short native duration that keeps
 * increasing as bytes land — that is not the track length.
 * A remaster longer than catalog wins only once native is trusted.
 */

export function isStubNativeDuration(
    fileDurationMs: number,
    catalogDurationMs: number,
): boolean {
    if (!(fileDurationMs > 0)) return true
    if (!(catalogDurationMs > 30_000)) return false
    return fileDurationMs < catalogDurationMs * 0.25
}

/** Partial vault files report a short native length that grows while playing. */
export function isIncompleteNativeDuration(
    fileDurationMs: number,
    catalogDurationMs: number,
): boolean {
    if (!(catalogDurationMs > 30_000)) return false
    if (!(fileDurationMs > 0)) return false
    return fileDurationMs < catalogDurationMs * 0.75
}

export function shouldTrustNativeDuration(
    fileDurationMs: number,
    catalogDurationMs: number,
): boolean {
    if (!(fileDurationMs > 0)) return false
    if (isStubNativeDuration(fileDurationMs, catalogDurationMs)) return false
    if (isIncompleteNativeDuration(fileDurationMs, catalogDurationMs)) {
        return false
    }
    return true
}

export function sliderDurationMs(
    fileDurationMs: number,
    catalogDurationMs: number,
): number {
    const fileOk = Number.isFinite(fileDurationMs) && fileDurationMs > 0
    const catalogOk =
        Number.isFinite(catalogDurationMs) && catalogDurationMs > 0
    if (
        catalogOk &&
        (!fileOk ||
            !shouldTrustNativeDuration(fileDurationMs, catalogDurationMs))
    ) {
        return catalogDurationMs
    }
    if (fileOk) return fileDurationMs
    return 0
}

/**
 * Same-track slider: once we know a longer real length, do not snap back
 * to a short catalog or a stub native report.
 */
export function preferLongerDurationMs(
    currentMs: number,
    nextMs: number,
): number {
    const currentOk = Number.isFinite(currentMs) && currentMs > 0
    const nextOk = Number.isFinite(nextMs) && nextMs > 0
    if (currentOk && nextOk) return Math.max(currentMs, nextMs)
    if (nextOk) return nextMs
    if (currentOk) return currentMs
    return 0
}

/**
 * Commit a duration update for the open track.
 * Trusted native (complete remaster) may replace the bar.
 * Partial / stub native never becomes the total, and never grows it.
 */
export function commitPlaybackDurationMs(opts: {
    currentMs: number
    nextMs: number
    fileDurationMs: number
    catalogDurationMs: number
}): number {
    if (
        shouldTrustNativeDuration(
            opts.fileDurationMs,
            opts.catalogDurationMs,
        )
    ) {
        return opts.nextMs > 0 ? opts.nextMs : opts.fileDurationMs
    }
    return preferLongerDurationMs(
        opts.currentMs,
        opts.catalogDurationMs,
    )
}

export function clampSeekMs(requestedMs: number, durationMs: number): number {
    if (!Number.isFinite(requestedMs) || requestedMs <= 0) return 0
    if (!Number.isFinite(durationMs) || durationMs <= 0) return requestedMs
    const max = Math.max(0, durationMs - 250)
    return Math.min(Math.max(0, requestedMs), max)
}

/**
 * Best duration for seek/resume when catalog metadata is shorter than the file
 * (remastered MP3s) or native reports a stub length on Android.
 */
export function resolvePlaybackDurationMs(opts: {
    fileDurationMs?: number
    catalogDurationMs?: number
    bookmarkMs?: number
    positionMs?: number
}): number {
    const file = opts.fileDurationMs ?? 0
    const catalog = opts.catalogDurationMs ?? 0
    const fromSlider = sliderDurationMs(file, catalog)
    // Resume only: a remaster bookmark past catalog. Never grow the
    // displayed total from live position — that added minutes while playing.
    const bookmark = opts.bookmarkMs ?? 0
    if (bookmark > fromSlider + 1000) {
        return bookmark + 5000
    }
    return fromSlider
}

/**
 * True when this listen reached the real end of a known length.
 * Do not use a bookmark-inflated duration here — that made finished
 * remasters look mid-track. Position far past a short catalog is
 * remaster progress, not completion.
 */
export function isPlaybackComplete(
    positionMs: number,
    durationMs: number,
): boolean {
    if (!(positionMs > 0) || !(durationMs > 0)) return false
    const nearEnd = Math.max(durationMs - 2500, durationMs * 0.98)
    if (positionMs < nearEnd) return false
    return positionMs <= durationMs + 8000
}

/**
 * Restore a bookmark only when it is a real in-progress place.
 * Treat as finished only within the last ~2.5s (or 98%) of the known
 * file or catalog length — never a 90% wipe, and never by stretching
 * duration from the bookmark itself.
 */
export function resumePositionMs(
    bookmarkMs: number | undefined,
    durationMs: number,
    fileDurationMs?: number,
): number {
    if (bookmarkMs == null || !Number.isFinite(bookmarkMs) || bookmarkMs <= 0) {
        return 0
    }
    const file = fileDurationMs ?? 0
    const known = sliderDurationMs(file, durationMs)
    if (known > 0 && isPlaybackComplete(bookmarkMs, known)) {
        return 0
    }
    const effectiveDuration = resolvePlaybackDurationMs({
        catalogDurationMs: durationMs,
        fileDurationMs: file,
        bookmarkMs,
    })
    if (!(effectiveDuration > 0)) {
        return bookmarkMs
    }
    if (isPlaybackComplete(bookmarkMs, effectiveDuration)) {
        return 0
    }
    return clampSeekMs(bookmarkMs, effectiveDuration)
}

/**
 * Native status often reports 0–200ms on reopen. Do not let that replace
 * a real saved place (or a seek target) unless the track actually ended.
 */
export function isPlaybackPositionRegression(
    incomingMs: number,
    knownGoodMs: number,
    didJustFinish: boolean,
): boolean {
    if (didJustFinish) return false
    if (!(knownGoodMs > 3000)) return false
    if (!Number.isFinite(incomingMs) || incomingMs < 0) return true
    return incomingMs < knownGoodMs - 2500 && incomingMs < knownGoodMs * 0.5
}

/** True when native currentTime is close enough to the requested seek. */
export function nativeSeekLanded(
    nativePositionMs: number,
    targetMs: number,
    toleranceMs = 2500,
): boolean {
    if (!Number.isFinite(nativePositionMs) || !Number.isFinite(targetMs)) {
        return false
    }
    if (targetMs <= 0) return nativePositionMs < 1500
    return Math.abs(nativePositionMs - targetMs) <= toleranceMs
}

/**
 * Keep the slider on the soldier's jump until native currentTime actually
 * lands there. Raw AAC often reports 0 after seek; snapping the UI to 0
 * makes it look like the track restarted even while we retry the jump.
 */
export function shouldHoldSeekTarget(opts: {
    seekingUntil: number
    now?: number
    statusPositionMs: number
    seekTargetMs: number
}): boolean {
    if (!(opts.seekTargetMs > 0)) return false
    if (nativeSeekLanded(opts.statusPositionMs, opts.seekTargetMs)) {
        return false
    }
    const now = opts.now ?? Date.now()
    if (now < opts.seekingUntil) return true
    return opts.statusPositionMs < 1500 && opts.seekTargetMs > 3000
}

/**
 * Place to persist on close/pause. Never prefer a native 0 blip over the
 * last known good place or an in-flight seek.
 */
export function bookmarkPositionToPersist(opts: {
    lastPlaybackMs: number
    storeMs: number
    seekTargetMs?: number
}): number {
    return Math.max(
        0,
        opts.lastPlaybackMs || 0,
        opts.storeMs || 0,
        opts.seekTargetMs || 0,
    )
}

/**
 * Resume candidate when store may hold a native 0–2s blip while AsyncStorage
 * still has the real mid-track place.
 */
export function bestResumeCandidateMs(opts: {
    storeMs?: number
    bookmarkMs?: number
    lastPlaybackMs?: number
}): number {
    return Math.max(
        0,
        opts.storeMs ?? 0,
        opts.bookmarkMs ?? 0,
        opts.lastPlaybackMs ?? 0,
    )
}
