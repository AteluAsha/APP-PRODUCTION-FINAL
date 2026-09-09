import React, { useState } from "react"
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { ActionBar } from "@/components/ActionBar"
import { useRouter } from "expo-router"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useEnergyExchangeStore } from "@/hooks/useEnergyExchangeStore"
import { VideoRecorderModal } from "@/components/chakras/VideoRecorderModal"
import { WriteToUsModal } from "@/components/chakras/WriteToUsModal"
import { LeaveReviewModal } from "@/components/chakras/LeaveReviewModal"
import { SCROLL_ANDROID_SMOOTH_PROPS, safeOverlayTop } from "@/constants/layout"
import { requestChakraHubRevealBreath } from "@/utils/homeSessionEntrance"

/**
 * Energy Exchange Screen
 *
 * Connection path for scholarship recipients.
 * Offers ways to stay connected with the community - NOT a barter or exchange.
 * Lifetime access is already granted - these are optional connection opportunities.
 */
export default function EnergyExchange() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const [showWriteToUs, setShowWriteToUs] = useState(false)
  const [showLeaveReview, setShowLeaveReview] = useState(false)
  const {
    videoComplete,
    reviewComplete,
    writeToUsComplete,
    markVideoComplete,
    markReviewComplete,
    markWriteToUsComplete,
  } = useEnergyExchangeStore()

  const handleBack = () => {
    addHapticFeedback(HapticStrength.Light)
    requestChakraHubRevealBreath()
    router.replace("/(chakras)/ChakraHub")
  }

  const handleShare = () => {
    addHapticFeedback(HapticStrength.Light)
    setShowVideoRecorder(true)
  }

  const handleReview = () => {
    addHapticFeedback(HapticStrength.Light)
    setShowLeaveReview(true)
  }

  const handleWriteToUs = () => {
    addHapticFeedback(HapticStrength.Light)
    setShowWriteToUs(true)
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
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <ActionBar onBackPress={handleBack} />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: safeOverlayTop(insets.top),
                paddingBottom: Math.max(insets.bottom, 16) + 12,
              },
            ]}
            showsVerticalScrollIndicator={false}
            {...(Platform.OS === "android" ? SCROLL_ANDROID_SMOOTH_PROPS : {})}
          >
            <View style={styles.content}>
              {/* Header */}
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
                Choose how you would like to express your vibration or enter your path below.
              </AppText>

              {/* Hero quote - global energy exchange line */}
              <AppText
                font="instrument-bold"
                size="lg"
                style={styles.heroQuote}
              >
                This is the energy exchange of your own value.
              </AppText>

              {/* Exchange Options */}
              <View style={styles.optionsContainer}>
                {/* Share Video Option */}
                <Pressable
                  onPress={handleShare}
                  style={[
                    styles.optionCard,
                    styles.optionCardVideo,
                    videoComplete && styles.optionCardComplete,
                  ]}
                >
                  <View>
                    {videoComplete && (
                      <View style={styles.completeBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="rgba(168, 201, 154, 0.9)"
                        />
                      </View>
                    )}
                    <AppText
                      font="instrument-bold"
                      size="lg"
                      style={styles.optionCardTitle}
                    >
                      Post A Video To Social.
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={styles.optionCardSubtitle}
                    >
                      Tell the world why you are here, awakening the energy body.
                    </AppText>
                  </View>
                </Pressable>

                {/* Review Option */}
                <Pressable
                  onPress={handleReview}
                  style={[
                    styles.optionCard,
                    styles.optionCardReview,
                    reviewComplete && styles.optionCardComplete,
                  ]}
                >
                  <View>
                    {reviewComplete && (
                      <View style={styles.completeBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="rgba(168, 201, 154, 0.9)"
                        />
                      </View>
                    )}
                    <AppText
                      font="instrument-bold"
                      size="lg"
                      style={styles.optionCardTitle}
                    >
                      Leave a Review
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={styles.optionCardSubtitle}
                    >
                      Share your experience and help others find their path
                    </AppText>
                  </View>
                </Pressable>

                {/* Write to Us Option */}
                <Pressable
                  onPress={handleWriteToUs}
                  style={[
                    styles.optionCard,
                    styles.optionCardWriteToUs,
                    writeToUsComplete && styles.optionCardComplete,
                  ]}
                >
                  <View>
                    {writeToUsComplete && (
                      <View style={styles.completeBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="rgba(168, 201, 154, 0.9)"
                        />
                      </View>
                    )}
                    <AppText
                      font="instrument-bold"
                      size="lg"
                      style={styles.optionCardTitle}
                    >
                      Write to Us
                    </AppText>
                    <AppText
                      font="instrument-regular"
                      size="sm"
                      style={styles.optionCardSubtitle}
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
                  Awakening Soul is operated by Project Starseed, an IRS-recognized
                  501(c)(3) tax-exempt organization committed to making
                  spiritual growth accessible to all.
                </AppText>
              </View>

              {/* Primary CTA - Enter Path (at bottom) */}
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
              markVideoComplete()
            }}
          />

          {/* Leave a Review Modal */}
          <LeaveReviewModal
            visible={showLeaveReview}
            onClose={() => setShowLeaveReview(false)}
            onComplete={() => {
              markReviewComplete()
              setShowLeaveReview(false)
            }}
          />

          {/* Write to Us Modal */}
          <WriteToUsModal
            visible={showWriteToUs}
            onClose={() => setShowWriteToUs(false)}
            onComplete={() => {
              markWriteToUsComplete()
              setShowWriteToUs(false)
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
    paddingHorizontal: 32,
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
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 6,
  },
  headerHint: {
    color: "rgba(168, 201, 154, 0.85)",
    textAlign: "center",
    marginBottom: 12,
  },
  heroQuote: {
    color: "rgba(168, 201, 154, 0.95)",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  optionCardTitle: {
    color: "#ffffff",
    marginBottom: 6,
  },
  optionCardSubtitle: {
    color: "rgba(255,255,255,0.8)",
  },
  enterPathButton: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
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
    marginBottom: 14,
  },
  optionCard: {
    width: "100%",
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 12,
  },
  optionCardVideo: {
    borderColor: "rgba(168, 201, 154, 0.35)",
    borderLeftWidth: 5,
    borderLeftColor: "#A8C99A",
    backgroundColor: "rgba(168, 201, 154, 0.08)",
  },
  optionCardReview: {
    borderColor: "rgba(139, 115, 85, 0.35)",
    borderLeftWidth: 5,
    borderLeftColor: "rgba(180, 150, 100, 0.9)",
    backgroundColor: "rgba(139, 115, 85, 0.06)",
  },
  optionCardWriteToUs: {
    borderColor: "rgba(107, 142, 90, 0.35)",
    borderLeftWidth: 5,
    borderLeftColor: "rgba(107, 142, 90, 0.85)",
    backgroundColor: "rgba(107, 142, 90, 0.06)",
  },
  optionCardComplete: {
    borderColor: "rgba(168, 201, 154, 0.5)",
    backgroundColor: "rgba(168, 201, 154, 0.12)",
  },
  completeBadge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  infoText: {
    color: "rgba(168, 201, 154, 0.75)",
    textAlign: "center",
    marginBottom: 12,
  },
  disclosure: {
    backgroundColor: "rgba(168, 201, 154, 0.06)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.12)",
  },
  disclosureText: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
})
