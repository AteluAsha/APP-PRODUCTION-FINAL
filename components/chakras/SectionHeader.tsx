import React from "react"
import { View } from "react-native"
import { AppText } from "../AppText"

interface SectionHeaderProps {
  subtitle: string
  title: string
  description?: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  subtitle,
  title,
  description,
}) => {
  return (
    <View style={{ marginBottom: description ? 32 : 24 }}>
      <AppText
        font="koh-santepheap"
        size="sm"
        style={{ textAlign: "center", marginBottom: 12, letterSpacing: 4, color: "#ffffff" }}
      >
        {subtitle}
      </AppText>
      <AppText
        font="instrument-regular"
        size="xl"
        style={{ textAlign: "center", letterSpacing: 4, color: "#ffffff" }}
      >
        {title}
      </AppText>
      {description && (
        <AppText
          font="koh-santepheap"
          size="base"
          style={{ textAlign: "center", marginTop: 16, marginHorizontal: 64, color: "#ffffff" }}
        >
          {description}
        </AppText>
      )}
    </View>
  )
}

export default SectionHeader
