/**
 * Standalone opening sequence test screen.
 * Renders: Splash (hero logo) → Welcome/date selection → Begin.
 * Use to verify the sequence works in isolation before relying on it in the main app.
 * Navigate here in dev (e.g. add a dev-only link from ChakraHome or use deep link).
 */
import React, { useState, useCallback } from "react"
import { View, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { SplashScreenReveal } from "@/components/SplashScreenReveal"
import { WelcomeModal } from "@/components/chakras/WelcomeModal"
import { AppText } from "@/components/AppText"

export default function OpeningSequenceTest() {
  const router = useRouter()
  const [phase, setPhase] = useState<"splash" | "welcome" | "done">("splash")
  const [showWelcome, setShowWelcome] = useState(false)

  const onSplashComplete = useCallback(() => {
    setPhase("welcome")
    setShowWelcome(true)
  }, [])

  const onWelcomeClose = useCallback(() => {
    setShowWelcome(false)
  }, [])

  const onBeginJourney = useCallback(() => {
    setShowWelcome(false)
    setPhase("done")
  }, [])

  if (phase === "splash") {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <SplashScreenReveal
          onAnimationComplete={onSplashComplete}
          assetsReady={true}
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <AppText
          font="instrument-regular"
          size="lg"
          style={{ color: "#ffffff", textAlign: "center", marginBottom: 16 }}
        >
          {phase === "welcome"
            ? "Welcome modal should be visible above."
            : "Opening sequence complete."}
        </AppText>
        {phase === "done" && (
          <Pressable
            onPress={() => router.replace("/(chakras)")}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 24,
              backgroundColor: "rgba(135, 174, 115, 0.8)",
              borderRadius: 12,
            }}
          >
            <AppText font="instrument-semibold" size="base" style={{ color: "#000" }}>
              Go to Chakra Home
            </AppText>
          </Pressable>
        )}
      </View>
      <WelcomeModal
        isVisible={showWelcome}
        onClose={onWelcomeClose}
        onBeginJourney={onBeginJourney}
        currentDayOfWeek={0}
        initialOpenDate={new Date().toISOString().split("T")[0]}
      />
    </View>
  )
}
