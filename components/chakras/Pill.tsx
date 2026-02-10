import { AppText } from "@/components/AppText"
import { TouchableHighlight } from "react-native"

export const Pill = ({
  content,
  onPress,
  className,
}: {
  content: string
  onPress: () => void
  className?: string
}) => {
  return (
    <TouchableHighlight
      style={{
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: "#ffffff",
        flexShrink: 0,
      }}
      onPress={onPress}
    >
      <AppText font="instrument-regular" style={{ color: "#ffffff" }}>
        {content}
      </AppText>
    </TouchableHighlight>
  )
}
