/**
 * Which course-day audios were opened this week, and whether the
 * close ceremony already happened. Monday week-start keys expire naturally.
 * Sound Bath / tuning fork may be tracked; they are never required.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Chakra } from '@/types/chakras/Chakra'
import { safeAsyncStorage } from '@/src/utils/safeAsyncStorage'
import {
    type DayAudioKind,
    dayAudioCreditFromAudioId,
    dayAudioSlotKey,
    dayCeremonySlotKey,
    requiredDayAudioKinds,
} from '@/src/utils/dayAudioEmbodiment'

interface DayAudioOpenedState {
    opened: Record<string, true>
    ceremonyClosed: Record<string, true>
    markOpened: (chakra: Chakra, kind: DayAudioKind) => void
    markOpenedFromAudioId: (audioId?: string | null) => void
    hasOpened: (chakra: Chakra, kind: DayAudioKind) => boolean
    markCeremonyClosed: (chakra: Chakra) => void
    hasCeremonyClosed: (chakra: Chakra) => boolean
    missingKinds: (chakra: Chakra) => DayAudioKind[]
}

export const useDayAudioOpenedStore = create<DayAudioOpenedState>()(
    persist(
        (set, get) => ({
            opened: {},
            ceremonyClosed: {},
            markOpened: (chakra, kind) => {
                const key = dayAudioSlotKey(chakra, kind)
                const opened = get().opened ?? {}
                if (opened[key]) return
                set({ opened: { ...opened, [key]: true } })
            },
            markOpenedFromAudioId: (audioId) => {
                const credit = dayAudioCreditFromAudioId(audioId)
                if (!credit) return
                get().markOpened(credit.chakra, credit.kind)
            },
            hasOpened: (chakra, kind) => {
                return get().opened?.[dayAudioSlotKey(chakra, kind)] === true
            },
            markCeremonyClosed: (chakra) => {
                const key = dayCeremonySlotKey(chakra)
                const ceremonyClosed = get().ceremonyClosed ?? {}
                if (ceremonyClosed[key]) return
                set({ ceremonyClosed: { ...ceremonyClosed, [key]: true } })
            },
            hasCeremonyClosed: (chakra) => {
                return (
                    get().ceremonyClosed?.[dayCeremonySlotKey(chakra)] === true
                )
            },
            missingKinds: (chakra) => {
                const opened = get().opened ?? {}
                return requiredDayAudioKinds(chakra).filter(
                    (kind) => opened[dayAudioSlotKey(chakra, kind)] !== true,
                )
            },
        }),
        {
            name: 'day-audio-opened',
            storage: createJSONStorage(() => safeAsyncStorage),
            partialize: (state) => ({
                opened: state.opened ?? {},
                ceremonyClosed: state.ceremonyClosed ?? {},
            }),
            merge: (persisted, current) => {
                const fromDisk = (persisted ?? {}) as Partial<DayAudioOpenedState>
                return {
                    ...current,
                    ...fromDisk,
                    opened: {
                        ...(fromDisk.opened ?? {}),
                        ...(current.opened ?? {}),
                    },
                    ceremonyClosed: {
                        ...(fromDisk.ceremonyClosed ?? {}),
                        ...(current.ceremonyClosed ?? {}),
                    },
                }
            },
        },
    ),
)

const DAY_AUDIO_HYDRATE_WAIT_MS = 1500

/** Disk marks win over empty defaults; in-session marks still win the merge. */
export function waitForDayAudioOpenedHydration(): Promise<void> {
    const persistApi = useDayAudioOpenedStore.persist
    if (!persistApi || persistApi.hasHydrated()) return Promise.resolve()
    return new Promise((resolve) => {
        let settled = false
        const finish = () => {
            if (settled) return
            settled = true
            clearTimeout(timer)
            unsub?.()
            resolve()
        }
        const unsub = persistApi.onFinishHydration(() => finish())
        const timer = setTimeout(finish, DAY_AUDIO_HYDRATE_WAIT_MS)
        if (persistApi.hasHydrated()) finish()
    })
}
