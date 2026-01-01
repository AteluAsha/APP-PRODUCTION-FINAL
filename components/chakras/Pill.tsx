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
      className={`px-4 py-1.5 rounded-full border border-white ${className}`}
      onPress={onPress}
    >
      <AppText font="instrument-regular">{content}</AppText>
    </TouchableHighlight>
  )
}
