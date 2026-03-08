import ChakraTemplate from "@/components/chakras/ChakraTemplate"
import { Chakra } from "@/types/chakras/Chakra"
import { useEffect } from "react"
import { isValidChakra } from "@/utils/validation"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"

const ChakraScreen = () => {
  const { chakra } = useLocalSearchParams<{ chakra: string }>()
  const router = useRouter()
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)

  // If the chakra value is invalid, redirect to appropriate home (APP1: ChakraHome, APP2: ChakraHub)
  useEffect(() => {
    if (!isValidChakra(chakra)) {
      router.replace(
        hasLifetimeAccess ? "/(chakras)/ChakraHub" : "/(chakras)/ChakraHome",
      )
    }
  }, [chakra, router, hasLifetimeAccess])

  // Only render the component if we have a valid chakra value
  if (!isValidChakra(chakra)) return null

  return <ChakraTemplate chakra={chakra as Chakra} />
}

export default ChakraScreen
