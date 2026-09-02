/**
 * Human-readable sanctuary vault download progress.
 * Day 1 embodiment is ~117 MB — the UI must show percent and megabytes.
 */

export const FIRST_LOAD_NOTICE_COPY =
    'Your course audio saves to this device while Awakening Soul stays open. Leave the app in the foreground (screen on) to download the full library overnight — or return anytime and downloads resume where they left off.'

export const FIRST_TRACK_WAIT_COPY =
    'Opening the player as soon as enough is saved — the rest downloads while you listen.'

export function formatMegabytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) return '0 MB'
    const mb = bytes / (1024 * 1024)
    if (mb === 0) return '0 MB'
    if (mb < 10) return `${mb.toFixed(1)} MB`
    return `${Math.round(mb)} MB`
}

export function vaultDownloadPercent(
    bytesWritten: number,
    bytesTotal: number,
): number | null {
    if (!(bytesTotal > 0) || !Number.isFinite(bytesWritten)) return null
    return Math.min(100, Math.max(0, Math.round((bytesWritten / bytesTotal) * 100)))
}

const stablePercentByAudioId = new Map<string, number>()

/** Percent that never jumps backward while a track is downloading (avoids 100→15 flicker). */
export function stableVaultDownloadPercent(
    audioId: string,
    bytesWritten: number,
    bytesTotal: number,
): number | null {
    const raw = vaultDownloadPercent(bytesWritten, bytesTotal)
    if (raw == null) return null
    const prev = stablePercentByAudioId.get(audioId) ?? 0
    const fullyWritten =
        bytesTotal > 0 &&
        bytesWritten >=
            Math.max(bytesTotal - 8192, Math.floor(bytesTotal * 0.995))
    // Cap at 99 until bytes are on disk — 97% used to display as 100% while still
    // downloading, leaving the row stuck without the green ready frame.
    const next = fullyWritten ? 100 : Math.min(99, Math.max(prev, raw))
    stablePercentByAudioId.set(audioId, next)
    return next
}

export function resetStableVaultDownloadPercent(audioId?: string): void {
    if (audioId) stablePercentByAudioId.delete(audioId)
    else stablePercentByAudioId.clear()
}

/** Stable per-track total — never borrow another track's byte count. */
export function mergeVaultTrackTotal(
    audioId: string,
    incomingTotal: number,
    progressByAudioId: Record<string, { bytesWritten: number; bytesTotal: number }>,
): number {
    if (!(incomingTotal > 0)) {
        return progressByAudioId[audioId]?.bytesTotal ?? 0
    }
    const prevTotal = progressByAudioId[audioId]?.bytesTotal ?? 0
    if (!(prevTotal > 0)) return incomingTotal
    return Math.min(prevTotal, incomingTotal)
}

export function buildVaultTrackProgress(
    audioId: string,
    bytesWritten: number,
    bytesTotal: number,
    progressByAudioId: Record<string, { bytesWritten: number; bytesTotal: number }>,
): { bytesWritten: number; bytesTotal: number } {
    const prev = progressByAudioId[audioId]
    const stableTotal = mergeVaultTrackTotal(
        audioId,
        bytesTotal > 0 ? bytesTotal : (prev?.bytesTotal ?? 0),
        progressByAudioId,
    )
    return {
        bytesWritten: Math.max(prev?.bytesWritten ?? 0, bytesWritten),
        bytesTotal: stableTotal,
    }
}

export function formatDownloadingHeadline(
    bytesWritten: number,
    bytesTotal: number,
    audioId?: string,
): string {
    const percent =
        audioId != null
            ? stableVaultDownloadPercent(audioId, bytesWritten, bytesTotal)
            : vaultDownloadPercent(bytesWritten, bytesTotal)
    if (percent != null) return `Downloading… ${percent}%`
    if (bytesWritten > 0) return 'Downloading…'
    return 'Downloading…'
}

export function formatVaultDownloadLine(
    bytesWritten: number,
    bytesTotal: number,
    audioId?: string,
): string {
    const written = formatMegabytes(bytesWritten)
    if (bytesTotal > 0) {
        const percent =
            audioId != null
                ? stableVaultDownloadPercent(audioId, bytesWritten, bytesTotal)
                : vaultDownloadPercent(bytesWritten, bytesTotal)
        return `${percent}% · ${written} of ${formatMegabytes(bytesTotal)}`
    }
    if (bytesWritten > 0) {
        return `${written} downloaded`
    }
    return 'Starting download…'
}

/** Short cue for a play button that just rushed a vault track. */
export function formatVaultCueLabel(opts: {
    isThisTrack: boolean
    status?: string | null
    bytesWritten: number
    bytesTotal: number
    idle: string
    audioId?: string
}): string {
    if (!opts.isThisTrack) return opts.idle
    if (opts.status === 'paused') return 'Paused — resuming…'
    const percent =
        opts.audioId != null
            ? stableVaultDownloadPercent(
                  opts.audioId,
                  opts.bytesWritten,
                  opts.bytesTotal,
              )
            : vaultDownloadPercent(opts.bytesWritten, opts.bytesTotal)
    if (percent != null) return `Queuing… ${percent}%`
    if (opts.bytesWritten > 0) return 'Queuing…'
    return 'Queuing…'
}
