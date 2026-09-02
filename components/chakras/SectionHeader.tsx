import React from "react"
import { View } from "react-native"
import { AppText } from "../AppText"

interface SectionHeaderProps {
  subtitle: string
  title: string
  description?: string
  /** Softer Cormorant typography for course healing sections */
  variant?: 'default' | 'healing'
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  subtitle,
  title,
  description,
  variant = 'default',
}) => {
  const isHealing = variant === 'healing'

  return (
    <View style={{ marginBottom: description ? 32 : 24 }}>
      <AppText
        font={isHealing ? 'cormorant-italic' : 'koh-santepheap'}
        size="sm"
        style={{
          textAlign: 'center',
          marginBottom: 12,
          letterSpacing: isHealing ? 3.2 : 4,
          color: isHealing
            ? 'rgba(232, 201, 140, 0.78)'
            : '#ffffff',
          fontSize: isHealing ? 14 : undefined,
          textTransform: isHealing ? 'uppercase' : undefined,
        }}
      >
        {subtitle}
      </AppText>
      <AppText
        font={isHealing ? 'cormorant-regular' : 'instrument-regular'}
        size="xl"
        style={{
          textAlign: 'center',
          letterSpacing: isHealing ? 1.2 : 4,
          color: isHealing ? 'rgba(255, 248, 236, 0.96)' : '#ffffff',
          fontSize: isHealing ? 28 : undefined,
          lineHeight: isHealing ? 34 : undefined,
        }}
      >
        {title}
      </AppText>
      {description ? (
        <AppText
          font={isHealing ? 'cormorant-italic' : 'koh-santepheap'}
          size="base"
          style={{
            textAlign: 'center',
            marginTop: 16,
            marginHorizontal: isHealing ? 24 : 64,
            color: isHealing
              ? 'rgba(255, 248, 236, 0.82)'
              : '#ffffff',
            fontSize: isHealing ? 16 : undefined,
            lineHeight: isHealing ? 24 : undefined,
          }}
        >
          {description}
        </AppText>
      ) : null}
    </View>
  )
}

export default SectionHeader
