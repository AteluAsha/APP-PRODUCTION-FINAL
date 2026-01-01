import { Chakra } from "@/types/chakras/Chakra"

/**
 * Validates if a value is a valid Chakra enum value
 * @param value The value to validate
 * @returns A type predicate indicating if the value is a valid Chakra
 */
export const isValidChakra = (
  value: string | string[] | undefined,
): value is Chakra => {
  if (!value || Array.isArray(value)) return false
  return Object.values(Chakra).includes(value as Chakra)
}
