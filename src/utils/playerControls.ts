/**
 * AudioPlayer seek / duration helpers.
 *
 * Catalog duration is used when native AAC duration is 0 or a stub, so the
 * soldier can jump. A remaster longer than catalog always wins once native
 * (or a cached native) length lands. Never shrink a known-good bar back to
 * a short catalog on the same track.
 */

export function isStubNativeDuration(
    fileDurationMs: number,
    catalogDurationMs: number,
): boolean {
    if (!(fileDurationMs > 0)) return true
    if (!(catalogDurationMs > 30_000)) return false
    return fileDurationMs < catalogDurationMs * 0.25
}

export function sliderDurationMs(
    fileDurationMs: number,
    catalogDurationMs: number,
): number {
    const fileOk = Number.isFinite(fileDurationMs) && fileDurationMs > 0
    const catalogOk =
        Number.isFinite(catalogDurationMs) && catalogDurationMs > 0
    // AAC on Android often reports 0 or a stub few seconds. Prefer catalog
    // so the soldier can jump; native seek still clamps if the file is short.
    if (fileOk && catalogOk && isStubNativeDuration(fileDurationMs, catalogDurationMs)) {
        return catalogDurationMs
    }
    // Credible native length wins — remaster longer than catalog, or
    // catalog overstated vs the real file. Do not pick max(catalog, file)
    // here: that would stretch the bar past a shorter real file.
    if (fileOk) return fileDurationMs
    if (catalogOk) return catalogDurationMs
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
 * Credible native length replaces the bar (remaster or shorter real file).
 * Stub / unknown native never shrinks a known-good or cached length.
 */
export function commitPlaybackDurationMs(opts: {
    currentMs: number
    nextMs: number
    fileDurationMs: number
    catalogDurationMs: number
}): number {
    if (
        opts.fileDurationMs > 0 &&
        !isStubNativeDuration(opts.fileDurationMs, opts.catalogDurationMs)
    ) {
        return opts.nextMs > 0 ? opts.nextMs : opts.fileDurationMs
    }
    return preferLongerDurationMs(opts.currentMs, opts.nextMs)
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
    const observed = Math.max(opts.bookmarkMs ?? 0, opts.positionMs ?? 0)
    if (observed > fromSlider + 1000) {
        return observed + 5000
    }
    return fromSlider
}

/**
 * Restore a bookmark only when it is a real in-progress place.
 * Treat as finished only within the last ~2.5s (or 98%), never a 90% wipe —
 * that was erasing real mid-track places when catalog duration was short.
 */
export function resumePositionMs(
    bookmarkMs: number | undefined,
    durationMs: number,
): number {
    if (bookmarkMs == null || !Number.isFinite(bookmarkMs) || bookmarkMs <= 0) {
        return 0
    }
    const effectiveDuration = resolvePlaybackDurationMs({
        catalogDurationMs: durationMs,
        bookmarkMs,
    })
    if (!(effectiveDuration > 0)) {
        return bookmarkMs
    }
    const nearEnd = Math.max(effectiveDuration - 2500, effectiveDuration * 0.98)
    if (bookmarkMs >= nearEnd) {
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
