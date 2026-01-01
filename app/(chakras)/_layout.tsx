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
            <Stack.Screen name="ChakraHub" />
            <Stack.Screen name="[chakra]" />
            <Stack.Screen name="SoundBath" />
            <Stack.Screen name="HeadToHeart" />
            <Stack.Screen name="Chakras101" />
            <Stack.Screen name="EnergyExchange" />
            <Stack.Screen name="AccountabilityOfAwakening" />
            <Stack.Screen name="GalleryOfGnosis" />
          </Stack>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

export default ChakrasLayout
