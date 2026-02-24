import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { View } from "react-native"

export const HeaderSection = ({
  headerHeight,
  textLine1,
  textLine2,
  textLine3,
}: {
  headerHeight: number
  textLine1: string
  textLine2: string
  textLine3: string
}) => {
  return (
    <View className="flex-col" style={{ height: headerHeight }}>
      <LinearGradient
        colors={["transparent", "#000000"]}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: 100,
        }}
      />
      <View className="flex-1 justify-end ml-6 mb-3">
        <AppText font="koh-santepheap" size="2xl">
          {textLine1}
        </AppText>
        <AppText font="koh-santepheap" size="4xl" className="mt-1">
          {textLine2}
        </AppText>
        <AppText font="koh-santepheap" className="mt-0.5">
          {textLine3}
        </AppText>
      </View>
    </View>
  )
}
