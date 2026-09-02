import { create } from 'zustand'
import { getSafeRecoveryRoute } from '@/utils/appErrorRecovery'

interface AppCrashStore {
    visible: boolean
    recoveryRoute: string
    boundaryResetKey: number
    show: (route?: string) => void
    hide: () => void
    bumpBoundaryResetKey: () => void
}

export const useAppCrashStore = create<AppCrashStore>((set) => ({
    visible: false,
    recoveryRoute: getSafeRecoveryRoute(),
    boundaryResetKey: 0,
    show: (route) =>
        set({
            visible: true,
            recoveryRoute: route ?? getSafeRecoveryRoute(),
        }),
    hide: () => set({ visible: false }),
    bumpBoundaryResetKey: () =>
        set((state) => ({ boundaryResetKey: state.boundaryResetKey + 1 })),
}))

export function isAppCrashOverlayVisible(): boolean {
    return useAppCrashStore.getState().visible
}
