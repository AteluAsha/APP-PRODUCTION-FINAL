import { View } from "react-native"
import { Pill } from "./Pill"
import { PillType } from "../../types/chakras/PillType"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"

export const PillSection = ({
  chakra,
  onPress,
}: {
  chakra: Chakra
  onPress: (pill: PillType) => void
}) => {
  const content = chakraContent[chakra]
  const onPressWithHapticFeedback = (pill: PillType) => {
    onPress(pill)
    addHapticFeedback(HapticStrength.Light)
  }
  return (
    <View className="flex-row flex-wrap mx-4 my-7 justify-center">
      <Pill
        content={content.pills.frequency.pillTitle}
        onPress={() => {
          onPressWithHapticFeedback(PillType.FREQUENCY)
        }}
        className="mr-3"
      />
      <Pill
        content={content.pills.seedMantra.pillTitle}
        onPress={() => {
          onPressWithHapticFeedback(PillType.SEED_MANTRA)
        }}
        className="mr-3"
      />
      <Pill
        content={content.pills.identityStatement.pillTitle}
        onPress={() => {
          onPressWithHapticFeedback(PillType.IDENTITY_STATEMENT)
        }}
        className="mr-3"
      />
      <Pill
        content={"Chakras"}
        onPress={() => {
          onPressWithHapticFeedback(PillType.CHAKRAS)
        }}
        className="mr-3"
      />
    </View>
  )
}
