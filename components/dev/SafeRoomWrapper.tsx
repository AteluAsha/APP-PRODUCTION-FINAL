/**
 * Safe Room Wrapper - Navigation Context Provider for Storybook
 *
 * Provides navigation context for expo-router components that need
 * useNavigation and setOptions hooks. Uses NavigationContainer from
 * @react-navigation/native (which expo-router uses under the hood)
 * to provide the navigation context.
 *
 * To Remove:
 * 1. Delete this file
 * 2. Remove import from StorybookShell.tsx
 * 3. Done - zero impact on production code
 */

import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { SafeAreaProvider } from "react-native-safe-area-context"

const Stack = createNativeStackNavigator()

interface SafeRoomWrapperProps {
  children: React.ReactNode
}

// Dummy screen component that just renders children
const DummyScreen: React.FC = () => {
  // Children will be passed through the component prop
  return null
}

export const SafeRoomWrapper: React.FC<SafeRoomWrapperProps> = ({
  children,
}) => {
  // EMERGENCY HALT: DISABLED - Navigation mock logic disabled
  // System restored to original state
  return <>{children}</>

  // DISABLED CODE BELOW - DO NOT USE
  /*
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="storybook-preview">
                {() => <>{children}</>}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
  */
}
