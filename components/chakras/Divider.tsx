import { View, ViewStyle } from "react-native"

export const Divider = ({
  className,
  style,
}: {
  className?: string
  style?: ViewStyle
}) => {
  return (
    <View
      className={className}
      style={[{ height: 1, backgroundColor: "#8E8E8E" }, style]}
    />
  )
}
