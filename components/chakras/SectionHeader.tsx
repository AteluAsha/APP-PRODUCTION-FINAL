import React from "react"
import { View } from "react-native"
import { tv } from "tailwind-variants"
import { AppText } from "../AppText"

interface SectionHeaderProps {
  subtitle: string
  title: string
  description?: string
}

const containerVariants = tv({
  base: "",
  variants: {
    hasDescription: {
      true: "mb-8",
      false: "mb-6",
    },
  },
})

const SectionHeader: React.FC<SectionHeaderProps> = ({
  subtitle,
  title,
  description,
}) => {
  return (
    <View className={containerVariants({ hasDescription: !!description })}>
      <AppText
        font="koh-santepheap"
        size="sm"
        className="text-center mb-3 tracking-widest"
      >
        {subtitle}
      </AppText>
      <AppText
        font="instrument-regular"
        size="xl"
        className="text-center"
        style={{ letterSpacing: 4 }}
      >
        {title}
      </AppText>
      {description && (
        <AppText font="koh-santepheap" className="text-center mt-4 mx-16">
          {description}
        </AppText>
      )}
    </View>
  )
}

export default SectionHeader
