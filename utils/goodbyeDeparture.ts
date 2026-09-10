import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import { useTomorrowAwakeningStore } from '@/hooks/useTomorrowAwakeningStore'

/**
 * After goodbye Home or Gallery, queue the hub blessing.
 * Crown's Profile reminder waits until tomorrow's card is dismissed.
 */
export function markDayCompleteDeparture(completedDayIndex: number): void {
    useTomorrowAwakeningStore
        .getState()
        .queueTomorrowAwakening(completedDayIndex)
    if (
        completedDayIndex === 6 &&
        !useFirstLaunchStore.getState().hasSeenCrownReminderNotice
    ) {
        useFirstLaunchStore.getState().setPendingCrownReminderNotice(true)
    }
}
