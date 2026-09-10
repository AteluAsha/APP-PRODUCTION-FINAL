import { router, type Router } from 'expo-router'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import { chakraDayRoute, nextChakraOpenPath } from '@/utils/chakraDayRoute'

/** Same door for all 7 hub balls. Presence first, then the matching day. */
export function openChakraDay(day: number, nav: Router = router): void {
    const grounded = useFirstLaunchStore.getState().hasGroundedChakra(day)
    nav.push(nextChakraOpenPath(day, grounded) as never)
}

/**
 * Replace DayPresence so it does not sit faded-to-black under the day.
 * Back from the course then lands on Hub, not a blank screen.
 */
export function enterChakraDayAfterPresence(
    day: number,
    _nav: Router = router,
): void {
    useFirstLaunchStore.getState().markChakraGrounded(day)
    router.replace(chakraDayRoute(day) as never)
}
