import "../globals.css"
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import "react-native-reanimated"
import { useColorScheme } from "@/hooks/useColorScheme"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { usePreloadAssets } from "@/hooks/usePreloadAssets"
import { View, Platform } from "react-native"
import { useChakraWeekTransition } from "@/hooks/useChakraWeekTransition"
import { SplashScreenReveal } from "@/components/SplashScreenReveal"
import { useState } from "react"
import Animated, { FadeIn, Easing } from "react-native-reanimated"
import { ErrorBoundary } from "@/components/ErrorBoundary"
// Initialize Firebase when app starts
import "@/src/services/firebase"
// Initialize RevenueCat when app starts
import { initializeRevenueCat } from "@/src/services/revenuecat"
// Initialize Sentry error tracking (optional - only if configured)
import { initializeSentry } from "@/src/services/sentry"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [showHeroLogo, setShowHeroLogo] = useState(true)
  const [fontsLoaded, fontsError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    KohSantepheap: require("../assets/fonts/KohSantepheap-Regular.ttf"),
    InstrumentSansRegular: require("../assets/fonts/InstrumentSans-Regular.ttf"),
    InstrumentSansMedium: require("../assets/fonts/InstrumentSans-Medium.ttf"),
    InstrumentSansSemiBold: require("../assets/fonts/InstrumentSans-SemiBold.ttf"),
    InstrumentSansBold: require("../assets/fonts/InstrumentSans-Bold.ttf"),
    InstrumentSansSemiBoldItalic: require("../assets/fonts/InstrumentSans-SemiBoldItalic.ttf"),
    InstrumentSansItalic: require("../assets/fonts/InstrumentSans-Italic.ttf"),
    FiraCode: require("../assets/fonts/FiraCode-Regular.ttf"),
    CormorantGaramond: require("../assets/fonts/CormorantGaramond-Regular.ttf"),
    CormorantGaramondItalic: require("../assets/fonts/CormorantGaramond-Italic.ttf"),
  })

  const imagesLoaded = usePreloadAssets([
    /* Home Screen Chakra Assets */
    require("../assets/images/root.png"),
    require("../assets/images/sacral.png"),
    require("../assets/images/solar.png"),
    require("../assets/images/heart.png"),
    require("../assets/images/throat.png"),
    require("../assets/images/thirdeye.png"),
    require("../assets/images/crown.png"),
    /* Header Chakra Screen Assets */
    require("../assets/images/muladhara.png"),
    require("../assets/images/svadhisthana.png"),
    require("../assets/images/manipura.png"),
    require("../assets/images/anahata.png"),
    require("../assets/images/vishuddha.png"),
    require("../assets/images/ajna.png"),
    require("../assets/images/sahasrara.png"),
    /* Location in Body Assets */
    require("../assets/images/rootlocation.png"),
    require("../assets/images/sacrallocation.png"),
    require("../assets/images/solarlocation.png"),
    require("../assets/images/heartlocation.png"),
    require("../assets/images/throatlocation.png"),
    require("../assets/images/thirdeyelocation.png"),
    require("../assets/images/crownlocation.png"),
    /* Header Assets */
    require("../assets/images/1header.png"),
    require("../assets/images/2header.png"),
    require("../assets/images/3header.png"),
    require("../assets/images/4header.png"),
    require("../assets/images/5header.jpeg"),
    require("../assets/images/6header.png"),
    require("../assets/images/7header.png"),
    /* Elements Assets */
    require("../assets/images/elementsroot.png"),
    require("../assets/images/elementssacral.png"),
    require("../assets/images/elementssolar.png"),
    require("../assets/images/elementsheart.png"),
    require("../assets/images/elementsthroat.png"),
    require("../assets/images/elementsthirdeye.png"),
    require("../assets/images/elementscrown.png"),
    /* Shared Assets */
    require("../assets/images/7chakras.png"),
    require("../assets/images/yoga-logo.png"),
    require("../assets/images/rootyogapose.png"),
    require("../assets/images/part2bg.png"),
    require("../assets/images/soundhealingbg.png"),
    require("../assets/images/chakraman.png"),
    require("../assets/images/colorbar.png"),
    require("../assets/images/meditationlogotemp.png"),
    require("@/assets/images/ibelong.png"),
    require("@/assets/images/heartoutline.png"),
  ])
  const audiosLoaded = usePreloadAssets([
    require("../assets/audio/root-erin-1.mp3"),
    require("../assets/audio/root-ethan-1.mp3"),
    require("../assets/audio/day1singingbowl.mp3"),
    require("../assets/audio/day1tuningfork.mp3"),
  ])

  useChakraWeekTransition()

  // Initialize RevenueCat on app start
  useEffect(() => {
    initializeRevenueCat().catch((error) => {
      if (__DEV__) {
        console.error('RootLayout: Failed to initialize RevenueCat:', error)
      }
    })
  }, [])

  // Initialize Sentry error tracking on app start (optional)
  useEffect(() => {
    initializeSentry().catch((error) => {
      // Don't log Sentry init errors - they're expected if not configured
      // Sentry service handles this gracefully
    })
  }, [])

  // Populate community halls with placeholder content (one-time setup)
  // This runs in both dev and production to ensure the community feels alive from the start
  useEffect(() => {
    import('@/src/services/communityPlaceholders')
      .then(({ populatePlaceholders }) => {
        // Delay to ensure Firebase is initialized
        setTimeout(() => {
          populatePlaceholders().catch((error) => {
            // Silent fail - placeholders are non-critical
            if (__DEV__) {
              console.log('[RootLayout] Placeholder population skipped or failed (this is okay)')
            }
          })
        }, 3000) // Longer delay to ensure Firebase is fully initialized
      })
      .catch(() => {
        // Silent fail if module doesn't load
      })
  }, [])

  // Populate Anua's cache from community questions on app launch
  // This auto-populates her offline responses with common user questions
  useEffect(() => {
    import('@/src/services/anuaCommunityCache')
      .then(({ populateCacheFromCommunity }) => {
        // Delay to ensure Firebase is initialized
        setTimeout(() => {
          populateCacheFromCommunity().catch((error) => {
            // Silent fail - cache population is non-critical
            if (__DEV__) {
              console.log('[RootLayout] Anua community cache population skipped or failed (this is okay)')
            }
          })
        }, 4000) // Slightly longer delay to ensure Firebase is fully ready
      })
      .catch(() => {
        // Silent fail if module doesn't load
      })
  }, [])

  const handleHeroLogoComplete = () => {
    // After hero logo animation completes, smoothly transition to app
    setShowHeroLogo(false)
  }

  // Hide native splash IMMEDIATELY on mount to show our hero logo
  // This must happen before any other rendering
  useEffect(() => {
    // Hide native splash as soon as component mounts
    // This ensures our hero logo is the primary opening screen
    SplashScreen.hideAsync().catch(() => {
      // If hideAsync fails, continue anyway
    })
  }, [])

  // Assets loading is handled by the hero logo splash screen
  // No additional action needed here - the splash screen will complete naturally

  // Show hero logo splash IMMEDIATELY - this is the PRIMARY opening screen
  // No other screens should show before this
  // Render this FIRST, before any asset loading checks
  if (showHeroLogo) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <SplashScreenReveal onAnimationComplete={handleHeroLogoComplete} />
      </View>
    )
  }

  // After hero logo, show the app with smooth fade
  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <Animated.View 
              style={{ flex: 1 }}
              entering={FadeIn.duration(1000).easing(Easing.out(Easing.ease))}
            >
              <Stack>
                <Stack.Screen name="(chakras)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="AudioPlayer"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="CommunityHalls"
                  options={{ headerShown: false, animation: "slide" }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="light" translucent={Platform.OS === 'android'} />
            </Animated.View>
          </View>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
