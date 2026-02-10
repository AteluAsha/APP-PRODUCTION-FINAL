import { View } from "react-native"
import { AppText } from "../AppText"

export const AffirmationSection = ({
  affirmationText,
}: {
  affirmationText: string
}) => {
  return (
    <View>
      <View
        style={{
          height: 1,
          backgroundColor: "#8E8E8E",
          width: 64,
          alignSelf: "center",
          marginBottom: 16,
        }}
      />
      <View
        style={{
          justifyContent: "center",
          paddingVertical: 24,
          marginHorizontal: 8,
          borderRadius: 24,
        }}
      >
        <AppText
          font="cormorant-regular"
          size="xl"
          style={{ paddingHorizontal: 16, textAlign: "center", marginBottom: 12, fontSize: 22, color: "#ffffff" }}
        >
          {"Affirmation"}
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <AppText
            font="cormorant-italic"
            size="3xl"
            style={{ paddingHorizontal: 8, textAlign: "center", fontSize: 26, letterSpacing: -0.8, color: "#ffffff" }}
          >
            {affirmationText}
          </AppText>
        </View>
      </View>
      <View
        style={{
          height: 1,
          backgroundColor: "#8E8E8E",
          width: 24,
          alignSelf: "center",
          marginTop: 16,
        }}
      />
    </View>
  )
}
