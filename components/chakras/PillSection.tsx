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
  const rowStyle = {
    flexDirection: "row" as const,
    flexWrap: "nowrap" as const,
    marginHorizontal: 16,
    marginVertical: 28,
    gap: 8,
  }
  const pillStyle = { flex: 1, minWidth: 0 }
  return (
    <View style={rowStyle}>
      <Pill
        content={content.pills.frequency.pillTitle}
        onPress={() => {
          onPressWithHapticFeedback(PillType.FREQUENCY)
        }}
        style={pillStyle}
      />
      <Pill
        content={content.pills.seedMantra.pillTitle}
        onPress={() => {
          onPressWithHapticFeedback(PillType.SEED_MANTRA)
        }}
        style={pillStyle}
      />
      <Pill
        content={content.pills.identityStatement.pillTitle}
        onPress={() => {
          onPressWithHapticFeedback(PillType.IDENTITY_STATEMENT)
        }}
        style={pillStyle}
      />
      <Pill
        content={"Chakras"}
        onPress={() => {
          onPressWithHapticFeedback(PillType.CHAKRAS)
        }}
        style={pillStyle}
      />
    </View>
  )
}
