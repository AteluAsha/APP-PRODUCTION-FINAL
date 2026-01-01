import { View } from "react-native"
import { AppText } from "../AppText"

export const AffirmationSection = ({
  affirmationText,
}: {
  affirmationText: string
}) => {
  return (
    <View>
      <View className="h-[1px] bg-[#8E8E8E] w-16 self-center mb-4"></View>
      <View className="justify-center py-6 mx-2 rounded-3xl">
        <AppText
          font="cormorant-regular"
          className="px-4 text-center mb-3 text-[22px]"
        >
          {"Affirmation"}
        </AppText>
        <View className="flex-row items-center justify-center">
          <AppText
            font="cormorant-italic"
            size="3xl"
            className="px-2 text-center text-[26px]"
            style={{ letterSpacing: -0.8 }}
          >
            {affirmationText}
          </AppText>
        </View>
      </View>
      <View className="h-[1px] bg-[#8E8E8E] w-6 self-center mt-4"></View>
    </View>
  )
}
