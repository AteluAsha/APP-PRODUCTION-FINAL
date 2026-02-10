import { ScrollView } from "react-native"
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingVertical: 28,
        gap: 12,
      }}
      style={{ width: "100%", alignSelf: "center" }}
    >
      <Pill
        content={content.pills.frequency.pillTitle}
        onPress={() => onPressWithHapticFeedback(PillType.FREQUENCY)}
        className="flex-shrink-0"
      />
      <Pill
        content={content.pills.seedMantra.pillTitle}
        onPress={() => onPressWithHapticFeedback(PillType.SEED_MANTRA)}
        className="flex-shrink-0"
      />
      <Pill
        content={content.pills.identityStatement.pillTitle}
        onPress={() => onPressWithHapticFeedback(PillType.IDENTITY_STATEMENT)}
        className="flex-shrink-0"
      />
      <Pill
        content="Chakras"
        onPress={() => onPressWithHapticFeedback(PillType.CHAKRAS)}
        className="flex-shrink-0"
      />
    </ScrollView>
  )
}
