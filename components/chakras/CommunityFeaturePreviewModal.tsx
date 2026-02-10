/**
 * Community Feature Preview Modal
 *
 * Shows a preview of community features (Share with Community / Social Sanctuary)
 * with explanation that these will open once the course starts.
 * Only shown on waiting room screen.
 */

import React from "react"
import { View, Modal, Pressable, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { LinearGradient } from "expo-linear-gradient"
import { TreeOfLifeIcon } from "@/components/social/TreeOfLifeIcon"
import { Image } from "react-native"

interface CommunityFeaturePreviewModalProps {
  visible: boolean
  onClose: () => void
  featureType: "share" | "halls"
}

export const CommunityFeaturePreviewModal: React.FC<
  CommunityFeaturePreviewModalProps
> = ({ visible, onClose, featureType }) => {
  const isShare = featureType === "share"
  const isHalls = featureType === "halls"

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView className="flex-1 bg-black/95" edges={["top", "bottom"]}>
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
            <AppText font="instrument-bold" size="xl" className="text-white">
              {isShare ? "Share with Community" : "Social Sanctuary"}
            </AppText>
            <Pressable
              onPress={() => {
                addHapticFeedback(HapticStrength.Light)
                onClose()
              }}
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="close"
                size={24}
                color="rgba(255, 255, 255, 0.9)"
              />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Feature Icon */}
            <View className="items-center mb-8">
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: isShare
                    ? "rgba(135, 174, 115, 0.2)"
                    : "#000000",
                  borderWidth: 1.5,
                  borderColor: isShare
                    ? "rgba(135, 174, 115, 0.4)"
                    : "rgba(255, 255, 255, 0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: isHalls ? "hidden" : "visible",
                }}
              >
                {isShare ? (
                  <TreeOfLifeIcon size={48} color="#A8C99A" />
                ) : (
                  <Image
                    source={require("@/assets/images/Hero_tulip_LOGO_MASTER.png")}
                    style={{
                      width: 60,
                      height: 60,
                      resizeMode: "contain",
                    }}
                  />
                )}
              </View>
            </View>

            {/* Teaching Content */}
            <View className="mb-8">
              {/* Main Description */}
              <AppText
                font="instrument-regular"
                size="base"
                className="text-white/90 leading-6 mb-6 text-center"
              >
                {isShare
                  ? "Share your reflections and insights with the community as you journey through each chakra. Your words can inspire and support others on their path."
                  : "Explore Social Sanctuary: all community reflections organized by chakra day. You can reply to others in the halls; post new reflections by using Share with Community."}
              </AppText>

              {/* Teaching Section */}
              <View
                className="rounded-xl py-5 px-6 mb-6"
                style={{
                  backgroundColor: "rgba(135, 174, 115, 0.08)",
                  borderWidth: 1,
                  borderColor: "rgba(135, 174, 115, 0.2)",
                }}
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="school-outline"
                    size={20}
                    color="rgba(168, 201, 154, 0.9)"
                  />
                  <AppText
                    font="instrument-medium"
                    size="base"
                    className="text-white/95 ml-2"
                  >
                    What You'll Learn
                  </AppText>
                </View>
                <AppText
                  font="instrument-regular"
                  size="sm"
                  className="text-white/80 leading-6"
                >
                  {isShare
                    ? "As you progress through each chakra day, you'll discover how sharing your experiences deepens your own understanding. The act of articulating your journey helps integrate the teachings into your daily life. You'll learn to express your inner transformation and witness how your words create connection and healing for others."
                    : "Through exploring community reflections, you'll see how others have experienced each chakra. This collective wisdom teaches you that every journey is unique, yet we all share common themes of growth, healing, and awakening. You'll learn patterns, insights, and perspectives that enrich your own practice."}
                </AppText>
              </View>

              {/* Coming Soon Notice */}
              <View
                className="rounded-xl py-4 px-5"
                style={{
                  backgroundColor: "rgba(135, 174, 115, 0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(135, 174, 115, 0.3)",
                }}
              >
                <View className="flex-row items-center mb-2">
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color="rgba(168, 201, 154, 0.9)"
                  />
                  <AppText
                    font="instrument-medium"
                    size="sm"
                    className="text-white/90 ml-2"
                  >
                    Available Once Your Journey Begins
                  </AppText>
                </View>
                <AppText
                  font="instrument-regular"
                  size="xs"
                  className="text-white/70 leading-5"
                >
                  These features open when your course begins. Connect with the
                  community as you progress through each day.
                </AppText>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  )
}
