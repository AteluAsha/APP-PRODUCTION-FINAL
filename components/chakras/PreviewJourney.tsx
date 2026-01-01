import React from "react"
import { View, ScrollView, Image, Pressable } from "react-native"
import { AppText } from "@/components/AppText"
import { SafeAreaView } from "react-native-safe-area-context"

interface PreviewJourneyProps {
  onBackPress: () => void
}

export const PreviewJourney: React.FC<PreviewJourneyProps> = ({
  onBackPress,
}) => {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-black">
      {/* Preview header with back button */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-white/10">
        <Pressable onPress={onBackPress} className="p-2">
          <AppText font="koh-santepheap" size="lg">
            ← Back
          </AppText>
        </Pressable>

        <View className="bg-amber-600/20 rounded-full px-4 py-1">
          <AppText font="koh-santepheap" size="sm" className="text-amber-400">
            Preview Mode
          </AppText>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Root chakra preview content */}
        <View className="items-center mb-4">
          <Image
            source={require("@/assets/images/root.png")}
            className="w-24 h-24 mb-4"
            resizeMode="contain"
          />
          <AppText
            font="koh-santepheap"
            size="3xl"
            className="text-center mb-2"
          >
            Root Chakra
          </AppText>
          <AppText font="koh-santepheap" size="xl" className="text-center mb-4">
            The Seed of Self
          </AppText>
          <AppText
            font="instrument-italic"
            className="text-center text-white/70"
          >
            "I Am"
          </AppText>
        </View>

        <View className="bg-white/5 rounded-xl p-6 mb-8">
          <AppText font="koh-santepheap" size="lg" className="mb-4">
            Your journey begins with the Root Chakra - Muladhara - your
            foundation and connection to the Earth.
          </AppText>

          <AppText font="koh-santepheap" className="mb-6 text-white/80">
            This is a preview of what awaits on your 7-day chakra journey. Each
            day of the week, a new chakra will unlock, guiding you from your
            roots to your highest self.
          </AppText>

          <AppText font="koh-santepheap" className="mb-6 text-white/80">
            Return on Monday to begin your full journey through all seven
            chakras, one day at a time.
          </AppText>
        </View>

        <View className="items-center mb-10">
          <Image
            source={require("@/assets/images/rootlocation.png")}
            className="w-full h-40 mb-4"
            resizeMode="contain"
          />
          <AppText
            font="instrument-regular"
            className="text-center text-white/70"
          >
            Located at the base of your spine
          </AppText>
        </View>

        <Pressable
          onPress={onBackPress}
          className="bg-white/10 rounded-full py-4 px-6 mb-12"
        >
          <AppText font="koh-santepheap" size="lg" className="text-center">
            Return to Waiting Screen
          </AppText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
