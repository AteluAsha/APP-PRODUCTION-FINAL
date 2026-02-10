import React from "react"
import { Stack } from "expo-router"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

const ChakrasLayout = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="WelcomeScreen" />
            <Stack.Screen name="ChakraHome" />
            <Stack.Screen
              name="TribeChat"
              options={{
                presentation: "card",
                animation: "slide_from_right",
                gestureEnabled: true,
              }}
            />
            <Stack.Screen name="DevPaywall" />
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
            <Stack.Screen name="NotesAlongTheWay" />
            <Stack.Screen name="Donate" />
          </Stack>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

export default ChakrasLayout
