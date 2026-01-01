import React, { useState } from "react"
import { View, TouchableHighlight, Pressable } from "react-native"
import { AppText } from "./AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

export const CollapsibleText = ({
  text,
  linesToTruncate,
  containerClassName,
  textClassName,
}: {
  text: string
  linesToTruncate: number
  containerClassName?: string
  textClassName?: string
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)

  const toggleExpand = () => {
    addHapticFeedback(HapticStrength.Light)
    setIsExpanded(!isExpanded)
  }
  return (
    <View className={containerClassName}>
      <Pressable onPress={toggleExpand}>
        <AppText
          font="instrument-regular"
          className={`mx-4 ${textClassName}`}
          numberOfLines={isExpanded ? undefined : linesToTruncate}
          ellipsizeMode="tail"
        >
          {text}
        </AppText>
      </Pressable>

      {/* Hacky, measures full text invisibly to compare */}
      <AppText
        font="instrument-regular"
        className={`text-transparent absolute mx-4 ${textClassName}`}
        style={{ position: "absolute", opacity: 0, zIndex: -1 }}
        onTextLayout={(e) => {
          const totalLines = e.nativeEvent.lines.length
          setIsTruncated(totalLines > linesToTruncate)
        }}
      >
        {text}
      </AppText>

      {isTruncated && (
        <TouchableHighlight onPress={toggleExpand} className="mx-4 mt-1.5">
          <AppText font="instrument-semibold" className={`${textClassName}`}>
            {isExpanded ? "See less" : "See more"}
          </AppText>
        </TouchableHighlight>
      )}
    </View>
  )
}
