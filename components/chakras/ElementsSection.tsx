import React from "react"
import { useWindowDimensions } from "react-native"
import { type Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"
import ResponsiveImage from "../ResponsiveImage"

const ElementsSection = ({ chakra }: { chakra: Chakra }) => {
  const { width } = useWindowDimensions()

  const content = chakraContent[chakra] // Get the full content object
  const elements = content.elements // Get the elements sub-object

  return (
    <ResponsiveImage
      source={elements.background}
      width={width}
      // Remove mx-4 for full width, remove height style
      className="flex w-full mt-6"
    />
  )
}

export default ElementsSection
