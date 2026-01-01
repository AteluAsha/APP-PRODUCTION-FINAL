import { View } from "react-native"
import SectionHeader from "./SectionHeader"
import YogaSection from "./YogaSection"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"

const Part3Section = ({ chakra }: { chakra: Chakra }) => {
  return (
    <View className="mt-8">
      <SectionHeader
        subtitle="— PART III —"
        title="INTEGRATION"
        description={chakraContent[chakra].integration}
      />
      <View className="h-[1px] bg-[#8E8E8E] w-16 self-center mb-8"></View>
      <YogaSection chakra={chakra} />
    </View>
  )
}

export default Part3Section
