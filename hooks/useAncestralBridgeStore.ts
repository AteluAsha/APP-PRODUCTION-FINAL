import { create } from 'zustand'
import { Chakra } from '@/types/chakras/Chakra'

/**
 * Session-only ancestral ceremony flags.
 * Law chamber → Asha player → Master Key on first close.
 * Re-taps skip the chamber only after the Master Key has been received.
 */
interface AncestralBridgeState {
    openedPlayer: Chakra[]
    receivedMasterKey: Chakra[]
    awaitingMasterKey: Chakra | null
    pendingBridgeCue: Chakra | null
    hasOpenedAshaPlayer: (chakra: Chakra) => boolean
    hasReceivedMasterKey: (chakra: Chakra) => boolean
    markAshaPlayerOpened: (chakra: Chakra) => void
    markAwaitingMasterKey: (chakra: Chakra) => void
    clearAwaitingMasterKey: () => void
    markMasterKeyReceived: (chakra: Chakra) => void
    setPendingBridgeCue: (chakra: Chakra | null) => void
    resetForTesting: () => void
}

function addUnique(list: Chakra[], chakra: Chakra): Chakra[] {
    if (list.includes(chakra)) return list
    return [...list, chakra]
}

export const useAncestralBridgeStore = create<AncestralBridgeState>()(
    (set, get) => ({
        openedPlayer: [],
        receivedMasterKey: [],
        awaitingMasterKey: null,
        pendingBridgeCue: null,
        hasOpenedAshaPlayer: (chakra) => get().openedPlayer.includes(chakra),
        hasReceivedMasterKey: (chakra) =>
            get().receivedMasterKey.includes(chakra),
        markAshaPlayerOpened: (chakra) =>
            set({ openedPlayer: addUnique(get().openedPlayer, chakra) }),
        markAwaitingMasterKey: (chakra) => set({ awaitingMasterKey: chakra }),
        clearAwaitingMasterKey: () => set({ awaitingMasterKey: null }),
        markMasterKeyReceived: (chakra) =>
            set({
                receivedMasterKey: addUnique(get().receivedMasterKey, chakra),
                awaitingMasterKey:
                    get().awaitingMasterKey === chakra
                        ? null
                        : get().awaitingMasterKey,
            }),
        setPendingBridgeCue: (chakra) => set({ pendingBridgeCue: chakra }),
        resetForTesting: () =>
            set({
                openedPlayer: [],
                receivedMasterKey: [],
                awaitingMasterKey: null,
                pendingBridgeCue: null,
            }),
    }),
)
