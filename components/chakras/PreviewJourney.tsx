/**
 * Preview Journey Screen
 *
 * Integrates the original Root Chakra course preview hero
 * with the full 7-day course preview image. Scrollable layout.
 * Softer visuals, Cormorant for affirmations, generous spacing.
 */

import React from "react"
import {
  View,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  StyleSheet,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { chakraContent } from "@/constants/chakras/content"
import { Chakra } from "@/types/chakras/Chakra"

const STILLNESS_BG = "#0f1210"

interface PreviewJourneyProps {
  onBackPress: () => void
}

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export const PreviewJourney: React.FC<PreviewJourneyProps> = ({
  onBackPress,
}) => {
  const insets = useSafeAreaInsets()
  const root = chakraContent[Chakra.ROOT]

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Edge-to-edge black header: top of screen down through chakra ball + padding */}
        <View style={styles.blackHeader}>
          <View style={styles.chakraImageWrap}>
            <Image
              source={root.goodbye.chakraImage}
              style={styles.chakraImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Course preview content on grey background */}
        <View style={styles.heroSection}>
          <AppText
            font="instrument-semibold"
            size="3xl"
            style={styles.heroTitle}
          >
            Root Chakra
          </AppText>
          <AppText
            font="instrument-regular"
            size="lg"
            style={styles.heroSubtitle}
          >
            The Seed of Self
          </AppText>
          <AppText
            font="cormorant-italic"
            size="lg"
            style={styles.heroIAm}
          >
            &quot;I Am&quot;
          </AppText>
          <AppText
            font="instrument-regular"
            size="sm"
            style={styles.heroLocation}
          >
            Located at the base of your spine
          </AppText>

          <View style={styles.paragraphSection}>
            <AppText
              font="instrument-regular"
              size="base"
              style={styles.bodyText}
            >
              Your journey begins with the Root Chakra — Muladhara — your
              foundation and connection to the Earth.
            </AppText>
          </View>

          {/* Affirmation-style quote: Cormorant, centered, generous spacing */}
          <View style={styles.affirmationWrap}>
            <View style={styles.affirmationDivider} />
            <AppText
              font="cormorant-italic"
              style={styles.affirmationText}
            >
              In the stillness of the Earth, find your grounding, your
              sanctuary, your belonging. Remember, you are home.
            </AppText>
            <View style={[styles.affirmationDivider, styles.affirmationDividerBottom]} />
          </View>

          <View style={styles.previewSection}>
            <AppText
              font="instrument-regular"
              size="base"
              style={styles.bodyText}
            >
              This is a preview of what awaits on your 7-day chakra journey.
              Each day of the week, a new chakra will unlock, guiding you from
              your roots to your highest self.
            </AppText>
          </View>
          <AppText
            font="instrument-regular"
            size="base"
            style={[styles.bodyText, styles.returnMondayText]}
          >
            Return on Monday to begin your full journey through all seven
            chakras, one day at a time.
          </AppText>
        </View>

        {/* Full course preview image in its own space */}
        <View style={styles.imageSection}>
          <Image
            source={require("@/assets/images/7Chakras_CoursePreview.png")}
            style={styles.coursePreviewImage}
            resizeMode="contain"
          />
        </View>

        {/* Footer: wide pill button with gradient and depth - Return to trial waiting room */}
        <View style={styles.footerSection}>
          <Pressable
            onPress={() => {
              addHapticFeedback(HapticStrength.Light)
              onBackPress()
            }}
            style={({ pressed }) => [
              styles.returnButtonWrap,
              pressed && styles.returnButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Return to Waiting Space"
          >
            <LinearGradient
              colors={[
                "rgba(80, 80, 88, 0.9)",
                "rgba(65, 65, 72, 0.9)",
                "rgba(6, 182, 212, 0.15)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.returnButtonBox}
            >
              <AppText
                font="instrument-medium"
                size="base"
                style={styles.returnButtonText}
              >
                Return to Waiting Space
              </AppText>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>

      {/* Back arrow - absolute */}
      <Pressable
        onPress={() => {
          addHapticFeedback(HapticStrength.Light)
          onBackPress()
        }}
        style={[styles.backButton, { top: Math.max(insets.top, 16) + 8 }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="rgba(255, 255, 255, 0.85)"
        />
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: STILLNESS_BG,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  blackHeader: {
    width: "100%",
    backgroundColor: "#000000",
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
  },
  heroSection: {
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  chakraImageWrap: {
    alignSelf: "center",
    width: 128,
    height: 128,
  },
  chakraImage: {
    width: "100%",
    height: "100%",
    opacity: 0.88,
  },
  heroTitle: {
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    marginTop: 16,
  },
  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.82)",
    textAlign: "center",
    marginTop: 6,
  },
  heroIAm: {
    color: "rgba(255, 255, 255, 0.88)",
    textAlign: "center",
    marginTop: 8,
    fontFamily: "CormorantGaramondItalic",
  },
  heroLocation: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 8,
  },
  bodyText: {
    color: "rgba(255, 255, 255, 0.88)",
    lineHeight: 26,
  },
  paragraphSection: {
    marginTop: 24,
    paddingHorizontal: 0,
  },
  affirmationWrap: {
    marginTop: 28,
    marginBottom: 28,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  affirmationDivider: {
    height: 1,
    width: 48,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    marginBottom: 20,
  },
  affirmationDividerBottom: {
    marginBottom: 0,
    marginTop: 20,
  },
  affirmationText: {
    fontFamily: "CormorantGaramondItalic",
    fontSize: 22,
    lineHeight: 34,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  returnMondayText: {
    color: "rgba(255, 255, 255, 0.82)",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 26,
  },
  previewSection: {
    marginTop: 24,
    paddingHorizontal: 0,
  },
  imageSection: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  coursePreviewImage: {
    width: SCREEN_WIDTH - 32,
    alignSelf: "center",
    height: (SCREEN_WIDTH - 32) * 1.4,
    opacity: 0.92,
  },
  footerSection: {
    marginTop: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  returnButtonWrap: {
    alignSelf: "stretch",
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.25)",
    shadowColor: "rgba(6, 182, 212, 0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  returnButtonBox: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  returnButtonText: {
    color: "rgba(255, 255, 255, 0.92)",
  },
  returnButtonPressed: {
    opacity: 0.85,
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 100,
    padding: 8,
  },
})
