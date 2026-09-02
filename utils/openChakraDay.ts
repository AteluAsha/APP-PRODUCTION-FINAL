import { router, type Router } from 'expo-router'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import { chakraDayRoute, nextChakraOpenPath } from '@/utils/chakraDayRoute'

/** Opens the presence screen unless this chakra was already grounded this session. */
export function openChakraDay(day: number, nav: Router = router): void {
    const grounded = useFirstLaunchStore.getState().hasGroundedChakra(day)
    nav.push(nextChakraOpenPath(day, grounded) as never)
}

export function enterChakraDayAfterPresence(day: number, nav: Router = router): void {
    useFirstLaunchStore.getState().markChakraGrounded(day)
    nav.replace(chakraDayRoute(day) as never)
}
