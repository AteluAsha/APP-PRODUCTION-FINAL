import { View } from "react-native"
import SectionHeader from "./SectionHeader"
import YogaSection from "./YogaSection"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"

const Part3Section = ({ chakra }: { chakra: Chakra }) => {
  return (
    <View style={{ marginTop: 32 }}>
      <SectionHeader
        subtitle="— PART III —"
        title="INTEGRATION"
        description={chakraContent[chakra].integration}
      />
      <View
        style={{
          height: 1,
          backgroundColor: "#8E8E8E",
          width: 64,
          alignSelf: "center",
          marginBottom: 32,
        }}
      />
      <YogaSection chakra={chakra} />
    </View>
  )
}

export default Part3Section
