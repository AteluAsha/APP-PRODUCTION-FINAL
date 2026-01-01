import { Chakra } from "@/types/chakras/Chakra"
import { create } from "zustand"

interface CompletedChakraStore {
  completedChakra: Chakra | null
  setCompletedChakra: (chakra: Chakra | null) => void
  clearCompletedChakra: () => void
}

export const useCompletedChakraStore = create<CompletedChakraStore>((set) => ({
  completedChakra: null,
  setCompletedChakra: (chakra) => set({ completedChakra: chakra }),
  clearCompletedChakra: () => set({ completedChakra: null }),
}))
