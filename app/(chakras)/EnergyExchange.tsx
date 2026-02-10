import React, { useState } from "react"
import { View, Pressable, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import { ActionBar } from "@/components/ActionBar"
import { useRouter } from "expo-router"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { VideoRecorderModal } from "@/components/chakras/VideoRecorderModal"

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
    // TODO: Open app store review page
    handleBack()
  }

  const handleWriteToUs = async () => {
    addHapticFeedback(HapticStrength.Light)
    // TODO: Open email or contact form
    handleBack()
  }

  const handleSkip = () => {
    addHapticFeedback(HapticStrength.Light)
    handleBack()
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
      <ActionBar onBackPress={handleBack} />
      <ScrollView
        className="flex-1 bg-black"
        contentContainerClassName="p-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center max-w-lg mx-auto">
          {/* Header */}
          <AppText
            font="koh-santepheap"
            size="3xl"
            className="text-center mb-4"
          >
            Energy Exchange
          </AppText>

          <AppText
            font="instrument-regular"
            size="lg"
            className="text-center mb-4 text-white/80"
          >
            You already have lifetime access—this is a gift, not a barter.
          </AppText>
          <AppText
            font="instrument-regular"
            size="base"
            className="text-center mb-8 text-white/60"
          >
            Choose how you'd like to stay connected with our community.
          </AppText>

          {/* Exchange Options */}
          <View className="w-full gap-4 mb-8">
            {/* Share Video Option */}
            <Pressable
              onPress={handleShare}
              style={{
                width: "100%",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.5)",
                paddingVertical: 24,
                paddingHorizontal: 32,
                borderRadius: 16,
              }}
            >
              <View>
                <AppText
                  font="instrument-bold"
                  size="xl"
                  className="mb-2 text-white"
                >
                  Record & Share Your Journey
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="sm"
                  className="text-white/70"
                >
                  Record a video and share it on social media with a link to the
                  app
                </AppText>
              </View>
            </Pressable>

            {/* Review Option */}
            <Pressable
              onPress={handleReview}
              style={{
                width: "100%",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.5)",
                paddingVertical: 24,
                paddingHorizontal: 32,
                borderRadius: 16,
              }}
            >
              <View>
                <AppText
                  font="instrument-bold"
                  size="xl"
                  className="mb-2 text-white"
                >
                  Leave a Review
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="sm"
                  className="text-white/70"
                >
                  Share your experience and help others find their path
                </AppText>
              </View>
            </Pressable>

            {/* Write to Us Option */}
            <Pressable
              onPress={handleWriteToUs}
              style={{
                width: "100%",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.5)",
                paddingVertical: 24,
                paddingHorizontal: 32,
                borderRadius: 16,
              }}
            >
              <View>
                <AppText
                  font="instrument-bold"
                  size="xl"
                  className="mb-2 text-white"
                >
                  Write to Us
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="sm"
                  className="text-white/70"
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
            className="text-center text-white/60 mb-6"
          >
            These are optional ways to connect—your lifetime access is already
            active.
          </AppText>

          {/* Subtle Donation Option - Ready but not activated */}
          {false && ( // Feature flag - set to true when ready to activate
            <Pressable
              onPress={() => router.push("/(chakras)/Donate")}
              className="w-full border border-[#8B7355]/30 py-4 px-6 rounded-xl mb-6 active:opacity-80 active:scale-95"
            >
              <View className="flex-row items-center justify-center">
                <AppText
                  font="instrument-regular"
                  size="sm"
                  className="text-[#A8C99A]/70 text-center"
                >
                  Support our mission
                </AppText>
              </View>
            </Pressable>
          )}

          {/* 501(c)(3) Tax-Exempt Organization Disclosure */}
          <View className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 mb-6">
            <AppText
              font="instrument-regular"
              size="xs"
              className="text-center text-gray-400"
            >
              Soul School is operated by Project Starseed, an IRS-recognized
              501(c)(3) tax-exempt organization committed to making spiritual
              growth accessible to all.
            </AppText>
          </View>

          {/* Skip Option */}
          <Pressable onPress={handleSkip} className="mt-4">
            <AppText
              font="instrument-regular"
              size="sm"
              className="text-white/40 underline"
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
          // Video recorded - user can now share it
          if (__DEV__) {
            console.log("Video recorded:", videoUri)
          }
        }}
      />
    </SafeAreaView>
  )
}
