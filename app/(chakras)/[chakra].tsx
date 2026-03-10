import ChakraTemplate from "@/components/chakras/ChakraTemplate"
import { Chakra } from "@/types/chakras/Chakra"
import { useEffect } from "react"
import { isValidChakra } from "@/utils/validation"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"

const ChakraScreen = () => {
  const params = useLocalSearchParams<{ chakra?: string | string[] }>()
  const raw = params.chakra
  const chakraParam = Array.isArray(raw) ? raw[0] : raw
  const router = useRouter()
  const hasLifetimeAccess = useChakraJourneyStore((s) => s.hasLifetimeAccess)

  // If the chakra value is invalid, redirect to appropriate home (APP1: ChakraHome, APP2: ChakraHub)
  useEffect(() => {
    if (!isValidChakra(chakraParam)) {
      router.replace(
        hasLifetimeAccess ? "/(chakras)/ChakraHub" : "/(chakras)/ChakraHome",
      )
    }
  }, [chakraParam, router, hasLifetimeAccess])

  // Only render the component if we have a valid chakra value
  if (!isValidChakra(chakraParam)) return null

  return <ChakraTemplate chakra={chakraParam as Chakra} />
}

export default ChakraScreen
