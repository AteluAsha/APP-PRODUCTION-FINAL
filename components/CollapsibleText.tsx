import React, { useState } from "react"
import {
  View,
  TouchableHighlight,
  Pressable,
  ViewStyle,
  TextStyle,
} from "react-native"
import { AppText } from "./AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"

export const CollapsibleText = ({
  text,
  linesToTruncate,
  containerClassName,
  textClassName,
  containerStyle,
  textStyle,
}: {
  text: string
  linesToTruncate: number
  containerClassName?: string
  textClassName?: string
  containerStyle?: ViewStyle
  textStyle?: TextStyle
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)

  const toggleExpand = () => {
    addHapticFeedback(HapticStrength.Light)
    setIsExpanded(!isExpanded)
  }
  return (
    <View className={containerClassName} style={containerStyle}>
      {/* Text is NOT tappable – only "See more" expands. Prevents accidental pre-open. */}
      <AppText
        font="instrument-regular"
        className={textClassName}
        style={[{ marginHorizontal: 16 }, textStyle]}
        numberOfLines={isExpanded ? undefined : linesToTruncate}
        ellipsizeMode="tail"
      >
        {text}
      </AppText>

      {/* Hacky, measures full text invisibly to compare */}
      <AppText
        font="instrument-regular"
        className={textClassName}
        style={[
          {
            position: "absolute",
            opacity: 0,
            zIndex: -1,
            marginHorizontal: 16,
          },
          textStyle,
        ]}
        onTextLayout={(e) => {
          const totalLines = e.nativeEvent.lines.length
          setIsTruncated(totalLines > linesToTruncate)
        }}
      >
        {text}
      </AppText>

      {isTruncated && (
        <TouchableHighlight
          onPress={toggleExpand}
          style={{ marginHorizontal: 16, marginTop: 6 }}
        >
          <AppText font="instrument-semibold" style={textStyle}>
            {isExpanded ? "See less" : "See more"}
          </AppText>
        </TouchableHighlight>
      )}
    </View>
  )
}
