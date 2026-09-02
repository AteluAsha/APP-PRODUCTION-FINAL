/**
 * Monday 00:00 local: uncheck end-of-day boxes and gold circles.
 * Gallery cards (everCompletedChakras) are never cleared.
 */

import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useChakraJourneyStore } from '@/hooks/useChakraJourneyStore'
import { msUntilNextMondayMidnight } from '@/utils/weeklyVisualReset'

export const useChakraWeekTransition = () => {
    useEffect(() => {
        const apply = () => {
            useChakraJourneyStore.getState().applyWeeklyVisualReset()
        }
        apply()

        const appSub = AppState.addEventListener('change', (next) => {
            if (next === 'active') apply()
        })

        let timer: ReturnType<typeof setTimeout> | null = null
        const scheduleMonday = () => {
            timer = setTimeout(() => {
                apply()
                scheduleMonday()
            }, msUntilNextMondayMidnight())
        }
        scheduleMonday()

        return () => {
            appSub.remove()
            if (timer) clearTimeout(timer)
        }
    }, [])
}
