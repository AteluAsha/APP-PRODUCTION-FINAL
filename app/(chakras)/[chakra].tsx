import ChakraTemplate from "@/components/chakras/ChakraTemplate"
import { Chakra } from "@/types/chakras/Chakra"
import { useEffect } from "react"
import { isValidChakra } from "@/utils/validation"
import { useLocalSearchParams, useRouter } from "expo-router"

const ChakraScreen = () => {
  const params = useLocalSearchParams<{ chakra?: string | string[] }>()
  const raw = params.chakra
  const chakraParam = Array.isArray(raw) ? raw[0] : raw
  const router = useRouter()

  // If the chakra value is invalid, return to the hub
  useEffect(() => {
    if (!isValidChakra(chakraParam)) {
      router.replace("/(chakras)/ChakraHub")
    }
  }, [chakraParam, router])

  // Only render the component if we have a valid chakra value
  if (!isValidChakra(chakraParam)) return null

  return <ChakraTemplate chakra={chakraParam as Chakra} />
}

export default ChakraScreen
