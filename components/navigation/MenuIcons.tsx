/**
 * Menu Icons
 *
 * Sacred geometry and energetic icons for the permanent menu bar
 * Each icon represents the energy and essence of its navigation item
 */

import React from "react"
import { View, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface IconProps {
  size?: number
  isActive?: boolean
  /** Theme color for inactive state - adds depth and matches app earth tones */
  themeColor?: string
}

const getColor = (
  activeColor: string,
  isActive: boolean,
  themeColor?: string,
) => {
  if (isActive) return "#F4EDE0"
  if (themeColor) return "rgba(244, 237, 224, 0.88)"
  return "rgba(244, 237, 224, 0.88)"
}

/**
 * Tree Icon - Home (Sacred Tree of Life)
 * Represents grounding, growth, and connection to all life
 */
export const TreeIcon: React.FC<IconProps> = ({
  size = 20,
  isActive = false,
  themeColor,
}) => {
  return (
    <Ionicons
      name="leaf"
      size={size}
      color={getColor("#9333EA", isActive, themeColor)}
    />
  )
}

/**
 * Chakra Card Icon - Gallery (Sacred Geometric Card)
 * Represents wisdom, knowledge, and collected insights
 */
export const ChakraCardIcon: React.FC<IconProps> = ({
  size = 20,
  isActive = false,
  themeColor,
}) => {
  return (
    <Ionicons
      name="albums"
      size={size}
      color={getColor("#FCD34D", isActive, themeColor)}
    />
  )
}

/**
 * Feather Icon - Community (Writing/Connection)
 * Represents gentle expression, reflection, and community
 */
export const FeatherIcon: React.FC<IconProps> = ({
  size = 20,
  isActive = false,
  themeColor,
}) => {
  return (
    <Ionicons
      name="book"
      size={size}
      color={getColor("#10B981", isActive, themeColor)}
    />
  )
}

/**
 * Leaf Icon - Notes (Growth/Reflection)
 * Represents growth, notes, and personal journey
 */
export const LeafIcon: React.FC<IconProps> = ({
  size = 20,
  isActive = false,
  themeColor,
}) => {
  return (
    <Ionicons
      name="leaf"
      size={size}
      color={getColor("#87AE73", isActive, themeColor)}
    />
  )
}

/**
 * Audio Icon - Music (Sound Healing)
 * Represents vibration, frequency, and sound healing
 */
export const AudioIcon: React.FC<IconProps> = ({
  size = 20,
  isActive = false,
  themeColor,
}) => {
  return (
    <Ionicons
      name="musical-notes"
      size={size}
      color={getColor("#9D4EDD", isActive, themeColor)}
    />
  )
}
