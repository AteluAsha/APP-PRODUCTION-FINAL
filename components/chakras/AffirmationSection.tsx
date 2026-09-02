import { View } from "react-native"
import { AppText } from "../AppText"
import {
  formatHeroAffirmationText,
  HERO_AFFIRMATION_FONT_SIZE,
  HERO_AFFIRMATION_LINE_HEIGHT,
  HERO_AFFIRMATION_MAX_LINES,
} from "@/constants/heroAffirmation"

/**
 * Hero affirmation design – elegant, thin, gentle.
 * CRITICAL: Do NOT revert to system fonts. Cormorant Garamond is required.
 * Fixed Day 1 size (36px); longer affirmations wrap to a second line — never shrink or clip.
 */
export const AffirmationSection = ({
  affirmationText,
}: {
  affirmationText: string
}) => {
  const displayText = formatHeroAffirmationText(affirmationText)

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
          marginHorizontal: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
        <AppText
          font="cormorant-italic"
          numberOfLines={HERO_AFFIRMATION_MAX_LINES}
          style={{
            fontFamily: "CormorantGaramondItalic",
            fontWeight: "400",
            fontSize: HERO_AFFIRMATION_FONT_SIZE,
            lineHeight: HERO_AFFIRMATION_LINE_HEIGHT,
            color: "rgba(255,255,255,0.92)",
            textAlign: "center",
            width: "100%",
            paddingHorizontal: 4,
          }}
        >
          {displayText}
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
