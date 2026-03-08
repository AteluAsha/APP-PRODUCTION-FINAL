/**
 * Social Sanctuary Icon
 *
 * Floating icon that appears on the chakra day screen
 * Opens the Social Sanctuary modal when pressed
 * Features the luminous Anua logo - a symbol of safety, peace, and light
 * Shows onboarding hint on first visit with gentle pulse animation
 */

import React, { useEffect, useState } from "react"
import { Pressable, View, Image } from "react-native"
import { AppText } from "@/components/AppText"
import { useSocialSanctuaryHintStore } from "@/hooks/useSocialSanctuaryHintStore"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated"

interface SocialSanctuaryIconProps {
  onPress: () => void
}

export const SocialSanctuaryIcon: React.FC<SocialSanctuaryIconProps> = ({
  onPress,
}) => {
  const { hasSeenHint, setHintSeen } = useSocialSanctuaryHintStore()
  const [showHint, setShowHint] = useState(!hasSeenHint)

  // Pulse animation for first visit
  const pulseScale = useSharedValue(1)
  const pulseOpacity = useSharedValue(1)

  useEffect(() => {
    if (!hasSeenHint) {
      // Gentle pulse animation
      pulseScale.value = withRepeat(
        withTiming(1.1, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      )
      pulseOpacity.value = withRepeat(
        withTiming(0.8, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      )

      // Auto-hide hint after 8 seconds
      const timer = setTimeout(() => {
        setShowHint(false)
        setHintSeen()
      }, 8000)

      return () => clearTimeout(timer)
    } else {
      pulseScale.value = 1
      pulseOpacity.value = 1
    }
  }, [hasSeenHint, setHintSeen])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    }
  })

  const handlePress = () => {
    if (!hasSeenHint) {
      setShowHint(false)
      setHintSeen()
    }
    onPress()
  }

  return (
    <View
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        zIndex: 50,
        alignItems: "flex-end",
      }}
    >
      {/* Onboarding Hint */}
      {showHint && !hasSeenHint && (
        <View className="absolute -top-20 right-0 bg-purple-900/90 px-4 py-2 rounded-lg border border-purple-700/50 max-w-[200px] mb-2">
          <AppText
            font="instrument-regular"
            size="xs"
            className="text-white/90 text-center leading-4"
          >
            Tap the sanctuary icon to connect with others on this path
          </AppText>
          <View className="absolute -bottom-2 right-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-900/90" />
        </View>
      )}

      <Animated.View style={[animatedStyle, { alignItems: "flex-end" }]}>
        {/* Sanctuary label at top */}
        <AppText
          font="instrument-regular"
          size="xs"
          style={{
            textAlign: "right",
            color: "rgba(255,255,255,0.88)",
            marginBottom: 4,
            fontSize: 11,
            letterSpacing: 0.5,
          }}
        >
          sanctuary
        </AppText>

        <Pressable
          onPress={handlePress}
          className="active:scale-95 active:opacity-80"
          style={{
            shadowColor: "#9D4EDD",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Image
            source={require("@/assets/images/Anua_Hero_Icon_Image.png")}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
            }}
            resizeMode="cover"
          />
        </Pressable>
      </Animated.View>
    </View>
  )
}
