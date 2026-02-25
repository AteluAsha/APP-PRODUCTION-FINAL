import { TouchableHighlight, StyleProp, ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"

const PILL_GRADIENT_COLORS = [
  "rgba(139, 90, 43, 0.12)",
  "rgba(101, 67, 33, 0.08)",
  "rgba(107, 142, 90, 0.06)",
] as const

export const Pill = ({
  content,
  onPress,
  className,
  style,
}: {
  content: string
  onPress: () => void
  className?: string
  style?: StyleProp<ViewStyle>
}) => {
  return (
    <TouchableHighlight
      style={[
        {
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.9)",
          flexShrink: 1,
          minWidth: 0,
          overflow: "hidden",
        },
        style,
      ]}
      onPress={onPress}
    >
      <LinearGradient
        colors={[...PILL_GRADIENT_COLORS]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 9998,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AppText
          font="instrument-regular"
          size="sm"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ color: "#ffffff" }}
        >
          {content}
        </AppText>
      </LinearGradient>
    </TouchableHighlight>
  )
}
