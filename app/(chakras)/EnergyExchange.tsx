import React, { useState } from "react"
import {
  View,
  Pressable,
  ScrollView,
  Linking,
  StyleSheet,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { ActionBar } from "@/components/ActionBar"
import { useRouter } from "expo-router"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { VideoRecorderModal } from "@/components/chakras/VideoRecorderModal"
import { WriteToUsModal } from "@/components/chakras/WriteToUsModal"
import { REVIEW_URL } from "@/constants/sharing"
import { SCROLL_BREATHING_BOTTOM_PADDING } from "@/constants/layout"

/**
 * Energy Exchange Screen
 *
 * Connection path for scholarship recipients.
 * Offers ways to stay connected with the community - NOT a barter or exchange.
 * Lifetime access is already granted - these are optional connection opportunities.
 */
export default function EnergyExchange() {
  const router = useRouter()
  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const [showWriteToUs, setShowWriteToUs] = useState(false)
  const hasLifetimeAccess = useChakraJourneyStore(
    useShallow((s) => s.hasLifetimeAccess),
  )
  // Note: Lifetime access is already granted before reaching this screen
  // This screen is for connection, not barter

  const handleBack = () => {
    addHapticFeedback(HapticStrength.Light)
    if (hasLifetimeAccess) {
      router.replace("/(chakras)/ChakraHub")
    } else {
      router.replace("/(chakras)/ChakraHome")
    }
  }

  const handleShare = async () => {
    addHapticFeedback(HapticStrength.Light)
    // Open video recorder modal
    setShowVideoRecorder(true)
  }

  const handleReview = async () => {
    addHapticFeedback(HapticStrength.Light)
    await Linking.openURL(REVIEW_URL)
    // User completed an exchange—navigate to path
    router.replace("/(chakras)/ChakraHub")
  }

  const handleWriteToUs = () => {
    addHapticFeedback(HapticStrength.Light)
    setShowWriteToUs(true)
  }

  const handleSkip = () => {
    addHapticFeedback(HapticStrength.Light)
    handleBack()
  }

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[
          "rgba(18, 24, 26, 0.99)",
          "rgba(14, 22, 26, 0.99)",
          "rgba(12, 20, 24, 0.99)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
          <ActionBar onBackPress={handleBack} />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Header - after approval message */}
              <AppText
                font="instrument-bold"
                size="xl"
                style={styles.headerTitle}
              >
                Energy Exchange
              </AppText>

              <AppText
                font="instrument-regular"
                size="base"
                style={styles.headerSubtitle}
              >
                You're in—your path awaits. This is a gift, not a barter.
              </AppText>
              <AppText
                font="instrument-regular"
                size="sm"
                style={styles.headerHint}
              >
                Choose how you'd like to stay connected, or enter your path now.
              </AppText>

              {/* Primary CTA - Enter Path */}
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.enterPathButton,
                  pressed && styles.enterPathButtonPressed,
                ]}
              >
                <LinearGradient
                  colors={[
                    "rgba(168, 201, 154, 0.5)",
                    "rgba(107, 142, 90, 0.45)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.enterPathGradient}
                >
                  <AppText
                    font="instrument-bold"
                    size="base"
                    style={styles.enterPathText}
                  >
                    Enter Path
                  </AppText>
                </LinearGradient>
              </Pressable>

              {/* Exchange Options */}
              <View style={styles.optionsContainer}>
                {/* Share Video Option */}
                <Pressable onPress={handleShare} style={styles.optionCard}>
                  <View>
                    <AppText
                      font="instrument-bold"
                      size="xl"
                      style={{ color: "#ffffff", marginBottom: 8 }}
                    >
                      This is the Energy Exchange of your own value.
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        marginBottom: 8,
                      }}
                    >
                      Send a love balm out to the world and express your
                      experience on this master path. A practice in
                      transparency.
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="xs"
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontStyle: "italic",
                      }}
                    >
                      We do not store or keep any of your expressions. They only
                      exist in this now moment.
                    </AppText>
                  </View>
                </Pressable>

                {/* Review Option */}
                <Pressable onPress={handleReview} style={styles.optionCard}>
                  <View>
                    <AppText
                      font="instrument-bold"
                      size="xl"
                      style={{ color: "#ffffff", marginBottom: 8 }}
                    >
                      Leave a Review
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      Share your experience and help others find their path
                    </AppText>
                  </View>
                </Pressable>

                {/* Write to Us Option */}
                <Pressable onPress={handleWriteToUs} style={styles.optionCard}>
                  <View>
                    <AppText
                      font="instrument-bold"
                      size="xl"
                      style={{ color: "#ffffff", marginBottom: 8 }}
                    >
                      Write to Us
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      Share your story, feedback, or connect with our community
                    </AppText>
                  </View>
                </Pressable>
              </View>

              {/* Info Text */}
              <AppText
                font="instrument-regular"
                size="sm"
                style={styles.infoText}
              >
                These are optional ways to connect—your lifetime access is
                already active.
              </AppText>

              {/* 501(c)(3) Tax-Exempt Organization Disclosure */}
              <View style={styles.disclosure}>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  style={styles.disclosureText}
                >
                  Soul School is operated by Project Starseed, an IRS-recognized
                  501(c)(3) tax-exempt organization committed to making
                  spiritual growth accessible to all.
                </AppText>
              </View>

              {/* Skip Option */}
              <Pressable onPress={handleSkip} style={styles.skipWrap}>
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={styles.skipText}
                >
                  Continue to App
                </AppText>
              </Pressable>
            </View>
          </ScrollView>

          {/* Video Recorder Modal */}
          <VideoRecorderModal
            visible={showVideoRecorder}
            onClose={() => setShowVideoRecorder(false)}
            onVideoRecorded={(videoUri) => {
              if (__DEV__) {
                console.log("Video recorded:", videoUri)
              }
            }}
            onComplete={() => {
              setShowVideoRecorder(false)
              router.replace("/(chakras)/ChakraHub")
            }}
          />

          {/* Write to Us Modal */}
          <WriteToUsModal
            visible={showWriteToUs}
            onClose={() => setShowWriteToUs(false)}
            onComplete={() => {
              setShowWriteToUs(false)
              router.replace("/(chakras)/ChakraHub")
            }}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 32,
    paddingBottom: 48 + SCROLL_BREATHING_BOTTOM_PADDING,
  },
  content: {
    alignItems: "center",
    maxWidth: 512,
    alignSelf: "center",
    width: "100%",
  },
  headerTitle: {
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 8,
  },
  headerHint: {
    color: "rgba(168, 201, 154, 0.85)",
    textAlign: "center",
    marginBottom: 24,
  },
  enterPathButton: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.35)",
  },
  enterPathButtonPressed: {
    opacity: 0.9,
  },
  enterPathGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  enterPathText: {
    color: "rgba(255,255,255,0.95)",
  },
  optionsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  optionCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.2)",
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: "rgba(168, 201, 154, 0.04)",
    marginBottom: 16,
  },
  infoText: {
    color: "rgba(168, 201, 154, 0.75)",
    textAlign: "center",
    marginBottom: 24,
  },
  disclosure: {
    backgroundColor: "rgba(168, 201, 154, 0.06)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.12)",
  },
  disclosureText: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  skipWrap: {
    marginTop: 8,
  },
  skipText: {
    color: "rgba(168, 201, 154, 0.6)",
    textDecorationLine: "underline",
  },
})
