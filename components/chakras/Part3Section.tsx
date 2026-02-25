import { View } from "react-native"
import SectionHeader from "./SectionHeader"
import YogaSection from "./YogaSection"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"

const Part3Section = ({ chakra }: { chakra: Chakra }) => {
  return (
    <View style={{ marginTop: 24 }}>
      <SectionHeader
        subtitle="— PART III —"
        title="INTEGRATION"
        description={chakraContent[chakra].integration}
      />
      <View
        style={{
          height: 1,
          width: 64,
          backgroundColor: "#8E8E8E",
          alignSelf: "center",
          marginBottom: 24,
        }}
      />
      <YogaSection chakra={chakra} />
    </View>
  )
}

export default Part3Section
