import { getChakraFromDay } from "@/utils/chakraMapping"
import {
  getChakraColor,
  getChakraImage,
  getChakraName,
  getDayName,
} from "@/constants/chakras/chakraConstants"

export interface ChakraData {
  day: number
  affirmation: string
  description: string
  source: any
  onPress: (router: any) => void
  title?: string
  color?: string
  day_name?: string
  audiopath?: string
}

function buildChakraRoute(day: number) {
  const chakraSlug = getChakraFromDay(day) as string
  return `/(chakras)/${chakraSlug}` as const
}

/**
 * Bundled 7-ball stack. The course UI must never wait on network for this.
 * Firestore may later overlay titles; images and routes stay local.
 */
export function buildLocalChakraData(): ChakraData[] {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const name = getChakraName(day)
    const dayName = getDayName(day)
    const routerPath = buildChakraRoute(day)
    return {
      day,
      affirmation: `"${name}"`,
      description: dayName,
      source: getChakraImage(day),
      onPress: (router: any) => router.push(routerPath),
      title: name,
      color: getChakraColor(day),
      day_name: dayName,
    }
  })
}
