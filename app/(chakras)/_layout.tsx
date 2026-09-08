import React, { useEffect, useRef } from "react"
import { View, Platform } from "react-native"
import { Stack, usePathname, useRouter } from "expo-router"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ScreenCrashBoundary } from "@/components/ScreenCrashBoundary"
import {
  SOMATIC_HOME_STACK_FADE_MS,
  SOMATIC_SCREEN_TRANSITION_MS,
  SOMATIC_SCREEN_TRANSITION_MS_IOS,
} from "@/constants/layout"

/** Calm stack fade for entry / home routes only; ChakraHub needs transparent card so the field shows. */
const homeSomaticStackOptions = {
  animation: "fade" as const,
  animationDuration: SOMATIC_HOME_STACK_FADE_MS,
  contentStyle: { backgroundColor: "#000000" },
}

const chakraHubStackOptions = {
  animation: "fade" as const,
  animationDuration: SOMATIC_HOME_STACK_FADE_MS,
  contentStyle: { backgroundColor: "transparent" },
}

const somaticFadeOptions = {
  animation: "fade" as const,
  animationDuration:
    Platform.OS === "ios"
      ? SOMATIC_SCREEN_TRANSITION_MS_IOS
      : SOMATIC_SCREEN_TRANSITION_MS,
}

const ChakrasLayout = () => {
  const pathname = usePathname()
  const router = useRouter()
  const coldStartCheckDone = useRef(false)

  // If the app reopens with a restored route of Audio Library (stale bundle risk), send user to index so index.tsx runs and replaces to ChakraHub/home.
  useEffect(() => {
    if (coldStartCheckDone.current) return
    if (pathname == null || pathname === "") return
    coldStartCheckDone.current = true
    if (pathname.includes("AudioLibrary")) {
      router.replace("/(chakras)/")
    }
  }, [pathname, router])

  return (
    <SafeAreaProvider>
      <ScreenCrashBoundary>
        <View style={{ flex: 1, backgroundColor: "#000000" }} pointerEvents="box-none">
          <BottomSheetModalProvider>
            <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              animationDuration:
                Platform.OS === "ios"
                  ? SOMATIC_SCREEN_TRANSITION_MS_IOS
                  : SOMATIC_SCREEN_TRANSITION_MS,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="WellnessGate" options={homeSomaticStackOptions} />
            <Stack.Screen name="DayPresence" options={homeSomaticStackOptions} />
            <Stack.Screen name="WelcomeScreen" />
            <Stack.Screen name="ChakraHome" />
            <Stack.Screen
              name="TribeChat"
              options={{
                presentation: "card",
                animation: "fade",
                animationDuration:
                  Platform.OS === "ios"
                    ? SOMATIC_SCREEN_TRANSITION_MS_IOS
                    : SOMATIC_SCREEN_TRANSITION_MS,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="AnuaChat"
              options={{
                presentation: "card",
                animation: "fade",
                animationDuration:
                  Platform.OS === "ios"
                    ? SOMATIC_SCREEN_TRANSITION_MS_IOS
                    : SOMATIC_SCREEN_TRANSITION_MS,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="ProfileMenu"
              options={{
                presentation: "card",
                animation: "fade",
                animationDuration:
                  Platform.OS === "ios"
                    ? SOMATIC_SCREEN_TRANSITION_MS_IOS
                    : SOMATIC_SCREEN_TRANSITION_MS,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="Profile"
              options={{
                presentation: "card",
                animation: "fade",
                animationDuration:
                  Platform.OS === "ios"
                    ? SOMATIC_SCREEN_TRANSITION_MS_IOS
                    : SOMATIC_SCREEN_TRANSITION_MS,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen name="Paywall" />
            <Stack.Screen name="DateSelection" />
            <Stack.Screen
              name="SimpleGraceTransition"
              options={somaticFadeOptions}
            />
            <Stack.Screen name="QuizScreen" options={somaticFadeOptions} />
            <Stack.Screen name="ChakraHub" options={chakraHubStackOptions} />
            <Stack.Screen name="CoursePreview" />
            <Stack.Screen name="Preview" />
            <Stack.Screen name="[chakra]" />
            <Stack.Screen name="SoundBath" />
            <Stack.Screen name="IntegrationPractice" />
            <Stack.Screen name="AudioLibrary" />
            <Stack.Screen name="HeadToHeart" options={homeSomaticStackOptions} />
            <Stack.Screen name="Chakras101" />
            <Stack.Screen name="EnergyExchange" />
            <Stack.Screen name="AccountabilityOfAwakening" />
            <Stack.Screen name="GalleryOfGnosis" />
            <Stack.Screen name="GiftChakra" />
            <Stack.Screen name="NotesAlongTheWay" />
            <Stack.Screen name="Contribute" />
          </Stack>
        </BottomSheetModalProvider>
      </View>
      </ScreenCrashBoundary>
    </SafeAreaProvider>
  )
}

export default ChakrasLayout
