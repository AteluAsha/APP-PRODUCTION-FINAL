/**
 * Periodic Energy Exchange — Chakra Hub only.
 *
 * Never auto-opens during Audio Player / meditation. The timer is cleared
 * when Hub loses focus. The timeout re-checks path and audio origin before
 * navigating, so a meditation that opened while Hub stayed mounted cannot
 * be interrupted.
 */

import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter, usePathname } from 'expo-router'
import { useIsFocused } from '@react-navigation/native'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import { useCurrentAudioStore } from '@/hooks/useCurrentAudioStore'
import {
    canShowAutomatedPaywall,
    delayUntilPeriodicPaywallMs,
} from '@/src/utils/periodicPaywallTiming'

const LAST_SHOWN_KEY = 'periodic_energy_exchange_paywall_last_shown_v1'
const FIRST_OPEN_KEY = 'periodic_energy_exchange_paywall_first_open_v1'

export function usePeriodicPaywall(enabled: boolean) {
    const router = useRouter()
    const pathname = usePathname()
    const isHubFocused = useIsFocused()
    const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)
    const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
    const gateRef = useRef({ pathname, audioOrigin, isHubFocused })
    gateRef.current = { pathname, audioOrigin, isHubFocused }

    const allowed =
        enabled &&
        !hasLifetimeAccess &&
        canShowAutomatedPaywall({
            pathname,
            audioOrigin,
            isHubFocused,
        })

    useEffect(() => {
        if (!allowed) return

        let cancelled = false
        let timeout: ReturnType<typeof setTimeout> | null = null

        const clearTimer = () => {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }
        }

        const showIfStillSafe = () => {
            if (cancelled) return
            const gate = gateRef.current
            if (
                useChakraJourneyStore.getState().hasLifetimeAccess ||
                !canShowAutomatedPaywall({
                    pathname: gate.pathname,
                    audioOrigin: useCurrentAudioStore.getState().audioOrigin,
                    isHubFocused: gate.isHubFocused,
                })
            ) {
                return
            }
            void AsyncStorage.setItem(LAST_SHOWN_KEY, String(Date.now()))
            router.push('/(chakras)/Paywall')
        }

        const schedule = async () => {
            try {
                const now = Date.now()
                let firstOpenRaw = await AsyncStorage.getItem(FIRST_OPEN_KEY)
                if (!firstOpenRaw) {
                    firstOpenRaw = String(now)
                    await AsyncStorage.setItem(FIRST_OPEN_KEY, firstOpenRaw)
                }
                const lastShownRaw = await AsyncStorage.getItem(LAST_SHOWN_KEY)
                const firstOpenAt = Number(firstOpenRaw)
                const lastShownAt = Number(lastShownRaw)
                const delay = delayUntilPeriodicPaywallMs(
                    now,
                    firstOpenAt,
                    lastShownAt,
                )
                if (delay == null || cancelled) return
                timeout = setTimeout(showIfStillSafe, delay)
            } catch {
                // Storage failure: skip this cycle rather than interrupt a meditation.
            }
        }

        void schedule()
        const appSub = AppState.addEventListener('change', (next) => {
            if (next === 'active') void schedule()
        })

        return () => {
            cancelled = true
            clearTimer()
            appSub.remove()
        }
    }, [allowed, router])
}
