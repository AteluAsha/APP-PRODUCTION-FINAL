import { router, type Router } from 'expo-router'
import { InteractionManager } from 'react-native'
import { useFirstLaunchStore } from '@/hooks/useFirstLaunchStore'
import { chakraDayRoute, nextChakraOpenPath } from '@/utils/chakraDayRoute'

const PRESENCE_ENTER_FALLBACK_MS = 1600

/** Opens the presence screen unless this chakra was already grounded this session. */
export function openChakraDay(day: number, nav: Router = router): void {
    const grounded = useFirstLaunchStore.getState().hasGroundedChakra(day)
    nav.push(nextChakraOpenPath(day, grounded) as never)
}

export function enterChakraDayAfterPresence(day: number, nav: Router = router): void {
    useFirstLaunchStore.getState().markChakraGrounded(day)
    const path = chakraDayRoute(day)
    let opened = false
    const go = () => {
        if (opened) return
        opened = true
        nav.replace(path as never)
    }
    InteractionManager.runAfterInteractions(go)
    setTimeout(go, PRESENCE_ENTER_FALLBACK_MS)
}
