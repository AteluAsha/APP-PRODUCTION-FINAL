import ChakraTemplate from "@/components/chakras/ChakraTemplate"
import { useEffect } from "react"
import { isValidChakra } from "@/utils/validation"
import { useLocalSearchParams, useRouter } from "expo-router"

const ChakraScreen = () => {
  const { chakra } = useLocalSearchParams<{ chakra: string }>()
  const router = useRouter()

  // If the chakra value is invalid, redirect to the home page
  useEffect(() => {
    if (!isValidChakra(chakra)) {
      router.replace("/")
    }
  }, [chakra, router])

  // Only render the component if we have a valid chakra value
  if (!isValidChakra(chakra)) return null

  return <ChakraTemplate chakra={chakra} />
}

export default ChakraScreen
