/**
 * Store-update notice: only after Play/App Store has a newer binary that is
 * still not on the device (auto-update did not land), and only after a grace
 * window so silent store updates get first chance.
 */
export const STORE_UPDATE_GRACE_MS = 24 * 60 * 60 * 1000
export const STORE_UPDATE_REOFFER_MS = 3 * 24 * 60 * 60 * 1000

export interface StoreUpdateOfferState {
    updateAvailable: boolean
    storeVersion: string
    dismissedVersion: string | null
    firstSeenVersion: string | null
    firstSeenAt: number | null
    lastOfferedAt: number | null
    now: number
    graceMs?: number
    reofferMs?: number
}

export function shouldOfferStoreUpdate(state: StoreUpdateOfferState): boolean {
    if (!state.updateAvailable) return false
    const storeVersion = state.storeVersion.trim()
    if (!storeVersion) return false
    if (state.dismissedVersion === storeVersion) return false

    const graceMs = state.graceMs ?? STORE_UPDATE_GRACE_MS
    const reofferMs = state.reofferMs ?? STORE_UPDATE_REOFFER_MS
    const firstSeenAt =
        state.firstSeenVersion === storeVersion ? state.firstSeenAt : null
    if (firstSeenAt == null || !Number.isFinite(firstSeenAt)) return false
    if (state.now - firstSeenAt < graceMs) return false

    if (
        state.lastOfferedAt != null &&
        Number.isFinite(state.lastOfferedAt) &&
        state.now - state.lastOfferedAt < reofferMs
    ) {
        return false
    }
    return true
}
