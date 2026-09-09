import { router, type Router } from 'expo-router'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import { chakraDayRoute, nextChakraOpenPath } from '@/utils/chakraDayRoute'

/** Same door for all 7 hub balls. Presence first, then the matching day. */
export function openChakraDay(day: number, nav: Router = router): void {
    const grounded = useFirstLaunchStore.getState().hasGroundedChakra(day)
    nav.push(nextChakraOpenPath(day, grounded) as never)
}

/**
 * Gallery commit broke this: InteractionManager.replace plus an
 * `opened` latch fired during presence teardown, so the course push
 * never landed — every ball, whichever was first. Push the same
 * string route that already worked (`/(chakras)/heart`).
 */
export function enterChakraDayAfterPresence(
    day: number,
    _nav: Router = router,
): void {
    useFirstLaunchStore.getState().markChakraGrounded(day)
    router.push(chakraDayRoute(day) as never)
}
