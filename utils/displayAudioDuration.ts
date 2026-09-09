import { getMinutesString } from '@/utils/format'

/**
 * Button labels: player-measured length once known, else catalog.
 * Whole minutes only — never mm:ss.
 */
export function preferPlayerDurationMs(
    playerMs: number | undefined,
    catalogMs: number,
): number {
    if (playerMs != null && Number.isFinite(playerMs) && playerMs > 0) {
        if (catalogMs > 30_000 && playerMs < catalogMs * 0.75) {
            return catalogMs
        }
        return playerMs
    }
    if (Number.isFinite(catalogMs) && catalogMs > 0) return catalogMs
    return 0
}

export function getAudioButtonDurationLabel(durationMs: number): string {
    return getMinutesString(durationMs)
}
