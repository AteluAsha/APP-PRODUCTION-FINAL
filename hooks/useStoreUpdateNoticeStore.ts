import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeAsyncStorage } from '@/src/utils/safeAsyncStorage'

interface StoreUpdateNoticeState {
    dismissedVersion: string | null
    firstSeenVersion: string | null
    firstSeenAt: number | null
    lastOfferedAt: number | null
    noteFirstSeen: (storeVersion: string, now?: number) => void
    markDismissed: (storeVersion: string) => void
    markOffered: (now?: number) => void
}

export const useStoreUpdateNoticeStore = create<StoreUpdateNoticeState>()(
    persist(
        (set, get) => ({
            dismissedVersion: null,
            firstSeenVersion: null,
            firstSeenAt: null,
            lastOfferedAt: null,
            noteFirstSeen: (storeVersion, now = Date.now()) => {
                const version = storeVersion.trim()
                if (!version) return
                const current = get()
                if (
                    current.firstSeenVersion === version &&
                    current.firstSeenAt != null
                ) {
                    return
                }
                set({
                    firstSeenVersion: version,
                    firstSeenAt: now,
                    lastOfferedAt:
                        current.firstSeenVersion === version
                            ? current.lastOfferedAt
                            : null,
                })
            },
            markDismissed: (storeVersion) => {
                const version = storeVersion.trim()
                if (!version) return
                set({ dismissedVersion: version })
            },
            markOffered: (now = Date.now()) => {
                set({ lastOfferedAt: now })
            },
        }),
        {
            name: 'store-update-notice',
            storage: createJSONStorage(() => safeAsyncStorage),
            partialize: (state) => ({
                dismissedVersion: state.dismissedVersion,
                firstSeenVersion: state.firstSeenVersion,
                firstSeenAt: state.firstSeenAt,
                lastOfferedAt: state.lastOfferedAt,
            }),
        },
    ),
)
