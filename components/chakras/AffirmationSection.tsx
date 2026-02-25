import { View } from "react-native"
import { AppText } from "../AppText"

/**
 * Hero affirmation design – elegant, thin, gentle.
 * CRITICAL: Do NOT revert to system fonts. Cormorant Garamond is required.
 * - affirmation-title: Cormorant Garamond, weight 300, letter-spacing 0.05em
 * - affirmation-text: Cormorant Garamond italic, weight 400, line-height 1.6
 */
export const AffirmationSection = ({
  affirmationText,
}: {
  affirmationText: string
}) => {
  return (
    <View style={{ marginTop: 28, marginBottom: 28 }}>
      <View
        style={{
          height: 1,
          width: 48,
          backgroundColor: "rgba(255,255,255,0.35)",
          alignSelf: "center",
          marginBottom: 16,
        }}
      />
      <View
        style={{
          paddingVertical: 28,
          marginHorizontal: 24,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* affirmation-title: Cormorant Garamond, weight 300, letter-spacing 0.05em */}
        <AppText
          font="cormorant-regular"
          size="xs"
          style={{
            fontFamily: "CormorantGaramond",
            fontWeight: "300",
            letterSpacing: 1.4,
            color: "rgba(255,255,255,0.72)",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Affirmation
        </AppText>
        {/* affirmation-text: Cormorant Garamond italic, weight 400, line-height 1.6 */}
        <AppText
          font="cormorant-italic"
          style={{
            fontFamily: "CormorantGaramondItalic",
            fontWeight: "400",
            fontSize: 28,
            lineHeight: 44.8,
            color: "rgba(255,255,255,0.82)",
            textAlign: "center",
            paddingHorizontal: 16,
          }}
        >
          {affirmationText}
        </AppText>
      </View>
      <View
        style={{
          height: 1,
          width: 48,
          backgroundColor: "rgba(255,255,255,0.35)",
          alignSelf: "center",
          marginTop: 16,
        }}
      />
    </View>
  )
}
