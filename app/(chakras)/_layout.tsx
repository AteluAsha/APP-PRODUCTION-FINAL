import React from "react"
import { View } from "react-native"
import { Stack } from "expo-router"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { SOMATIC_SCREEN_TRANSITION_MS } from "@/constants/layout"

const ChakrasLayout = () => {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              animationDuration: SOMATIC_SCREEN_TRANSITION_MS,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="WelcomeScreen" />
            <Stack.Screen name="ChakraHome" />
            <Stack.Screen
              name="TribeChat"
              options={{
                presentation: "card",
                animation: "slide_from_right",
                animationDuration: SOMATIC_SCREEN_TRANSITION_MS,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="AnuaChat"
              options={{
                presentation: "card",
                animation: "slide_from_right",
                animationDuration: SOMATIC_SCREEN_TRANSITION_MS,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen name="DevPaywall" />
            <Stack.Screen name="Paywall" />
            <Stack.Screen name="DateSelection" />
            <Stack.Screen name="ChakraHub" />
            <Stack.Screen name="CoursePreview" />
            <Stack.Screen name="[chakra]" />
            <Stack.Screen name="SoundBath" />
            <Stack.Screen name="AudioLibrary" />
            <Stack.Screen name="HeadToHeart" />
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
    </SafeAreaProvider>
  )
}

export default ChakrasLayout
