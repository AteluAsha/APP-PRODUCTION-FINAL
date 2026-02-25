/**
 * Tracks when persisted stores have rehydrated from AsyncStorage.
 * Prevents showing ChakraHome main content before we know real courseStartDate/isFirstLaunch,
 * so the opening sequence (welcome + date selection) is not skipped by stale first paint.
 * Safety: after REHYDRATION_MAX_WAIT_MS we treat as ready so we never block forever.
 */
import { create } from "zustand"

const REHYDRATION_MAX_WAIT_MS = 2500

interface StoreRehydrationState {
  journeyRehydrated: boolean
  firstLaunchRehydrated: boolean
  safetyPassed: boolean
  setJourneyRehydrated: () => void
  setFirstLaunchRehydrated: () => void
}

export const useStoreRehydration = create<StoreRehydrationState>((set) => {
  const t = setTimeout(
    () => set({ safetyPassed: true }),
    REHYDRATION_MAX_WAIT_MS,
  )
  return {
    journeyRehydrated: false,
    firstLaunchRehydrated: false,
    safetyPassed: false,
    setJourneyRehydrated: () => set({ journeyRehydrated: true }),
    setFirstLaunchRehydrated: () => set({ firstLaunchRehydrated: true }),
  }
})

export const getStoreRehydrationReady = (): boolean => {
  const state = useStoreRehydration.getState()
  return (
    state.safetyPassed ||
    (state.journeyRehydrated && state.firstLaunchRehydrated)
  )
}
