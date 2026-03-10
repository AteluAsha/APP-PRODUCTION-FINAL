/**
 * Root Layout - App Entry
 *
 * OPENING SEQUENCE (always first): Splash → Path Selection (WelcomeScreen) → 7 Chakras in 7 Days.
 * After Enter Path: DateSelection | Waiting Room | Trial Home | Lifetime Home (ChakraHub).
 */
import "@/src/utils/splash-keeper"
import "../globals.css"
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import "react-native-reanimated"
import { useColorScheme } from "@/hooks/useColorScheme"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { usePreloadAssets } from "@/hooks/usePreloadAssets"
import { View, Platform, LogBox, BackHandler } from "react-native"
import { useRouter, usePathname } from "expo-router"
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av"
import * as SplashScreen from "expo-splash-screen"
import { useChakraWeekTransition } from "@/hooks/useChakraWeekTransition"
import { SplashScreenReveal } from "@/components/SplashScreenReveal"
import { useState } from "react"
import Animated, { FadeIn, Easing } from "react-native-reanimated"
import { SOMATIC_FADE_IN_MS } from "@/constants/layout"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { PermanentMenuBar } from "@/components/navigation/PermanentMenuBar"
import { MusicRoomAudioManager } from "@/components/audio/MusicRoomAudioManager"
import { OtherOriginAudioManager } from "@/components/audio/OtherOriginAudioManager"
import { FloatingNavButtons } from "@/components/navigation/FloatingNavButtons"
import { GlobalHomeButton } from "@/components/navigation/GlobalHomeButton"
import { GlobalAnuaChat } from "@/components/navigation/GlobalAnuaChat"
import { GlobalTribeChat } from "@/components/navigation/GlobalTribeChat"
import { FloatingUIRevealStrip } from "@/components/navigation/FloatingUIRevealStrip"
import { PathSelectionGate } from "@/components/navigation/PathSelectionGate"
import { ProfileSheet } from "@/components/profile/ProfileSheet"
import { InviteRefApplier } from "@/components/invite/InviteRefApplier"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import * as Linking from "expo-linking"
import "@/src/services/firebase"
import { initializeRevenueCat } from "@/src/services/revenuecat"
import { initializeSentry } from "@/src/services/sentry"
import "@/src/services/journeyNotifications"

LogBox.ignoreLogs([
  "Error fetching tuning fork audio",
  "Error fetching crystal bowl audio",
  "object-not-found",
  "Missing or insufficient permissions",
  "Error updating cache",
  "FirebaseError",
  "@firebase/fi",
  "@firebase/firestore",
])

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [showHeroLogo, setShowHeroLogo] = useState(true)
  const [assetsReady, setAssetsReady] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Keep native splash until we explicitly hide it (backup to splash-keeper).
  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {})
  }, [])
  // Hide native splash when we paint our custom hero so user sees SplashScreenReveal.
  useEffect(() => {
    if (!showHeroLogo) return
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {})
    }, 80)
    return () => clearTimeout(t)
  }, [showHeroLogo])
  // Safety: if still on hero splash after 8s (e.g. animation callback never fired), force transition so app never freezes
  useEffect(() => {
    const t = setTimeout(() => {
      setShowHeroLogo((prev) => {
        if (prev) {
          if (__DEV__) console.warn("[RootLayout] Splash safety timeout: forcing transition")
          SplashScreen.hideAsync().catch(() => {})
          return false
        }
        return prev
      })
    }, 8000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          ...(Platform.OS === "android" && {
            playThroughEarpieceAndroid: false,
          }),
        })
      } catch (e) {
        if (__DEV__) {
          console.warn("[RootLayout] Audio setup skipped:", e)
        }
      }
    }
    setupAudio()
    // Emulator/simulator audio is often poor; real device is source of truth. In __DEV__ on
    // emulator we apply lighter progress-update intervals and a short pre-play delay (see
    // constants/emulator.ts and AudioPlayer / *AudioManager). Production builds are unchanged.
  }, [])

  useEffect(() => {
    const checkExpiry = () => {
      try {
        const store = useChakraJourneyStore.getState()
        if (
          store.paymentStatus === "scholarship" &&
          store.scholarshipExpiryDate
        ) {
          const expiryDate = new Date(store.scholarshipExpiryDate)
          if (new Date() > expiryDate) {
            useChakraJourneyStore.setState({
              hasLifetimeAccess: false,
              paymentStatus: "pending",
              scholarshipExpiryDate: null,
            })
          }
        }
      } catch (error) {
        if (__DEV__) console.error("Error checking scholarship expiry:", error)
      }
    }
    checkExpiry()
    const interval = setInterval(checkExpiry, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

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
    require("../assets/images/root.png"),
    require("../assets/images/sacral.png"),
    require("../assets/images/solar.png"),
    require("../assets/images/heart.png"),
    require("../assets/images/throat.png"),
    require("../assets/images/thirdeye.png"),
    require("../assets/images/crown.png"),
    require("../assets/images/muladhara.png"),
    require("../assets/images/svadhisthana.png"),
    require("../assets/images/manipura.png"),
    require("../assets/images/anahata.png"),
    require("../assets/images/vishuddha.png"),
    require("../assets/images/ajna.png"),
    require("../assets/images/sahasrara.png"),
    require("../assets/images/rootlocation.png"),
    require("../assets/images/sacrallocation.png"),
    require("../assets/images/solarlocation.png"),
    require("../assets/images/heartlocation.png"),
    require("../assets/images/throatlocation.png"),
    require("../assets/images/thirdeyelocation.png"),
    require("../assets/images/crownlocation.png"),
    require("../assets/images/1header.png"),
    require("../assets/images/2header.png"),
    require("../assets/images/3header.png"),
    require("../assets/images/4header.png"),
    require("../assets/images/5header.jpeg"),
    require("../assets/images/6header.png"),
    require("../assets/images/7header.png"),
    require("../assets/images/elementsroot.png"),
    require("../assets/images/elementssacral.png"),
    require("../assets/images/elementssolar.png"),
    require("../assets/images/elementsheart.png"),
    require("../assets/images/elementsthroat.png"),
    require("../assets/images/elementsthirdeye.png"),
    require("../assets/images/elementscrown.png"),
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
    require("../assets/images/SoulSchool_HERO_Logo.png"),
    require("../assets/images/Welcomeheader.png"),
    require("../assets/images/WelcomeMain.png"),
    require("../assets/images/Hero_tulip_LOGO_MASTER.png"),
    require("../assets/images/Anua_Hero_Icon_Image.png"),
  ])
  const audiosLoaded = usePreloadAssets([
    require("../assets/audio/root-erin-1.mp3"),
    require("../assets/audio/root-ethan-1.mp3"),
    require("../assets/audio/day1singingbowl.mp3"),
    require("../assets/audio/day1tuningfork.mp3"),
  ])

  useChakraWeekTransition()

  // RevenueCat: initialized at startup from src/core/config/revenueCatConfig.ts when env keys are not set
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        const { getUserId } = await import("@/src/services/userId")
        const userId = await getUserId()
        await initializeRevenueCat(userId)
      } catch (error) {
        if (__DEV__)
          console.error("[RootLayout] Failed to initialize RevenueCat:", error)
      }
    }
    initRevenueCat()
  }, [])

  useEffect(() => {
    try {
      initializeSentry().catch(() => {})
    } catch {}
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      Promise.resolve().then(async () => {
        try {
          const { populatePlaceholders } =
            await import("@/src/services/communityPlaceholders")
          setTimeout(() => populatePlaceholders().catch(() => {}), 3000)
        } catch {}
      })
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      Promise.resolve().then(async () => {
        try {
          const { populateCacheFromCommunity } =
            await import("@/src/services/anuaCommunityCache")
          setTimeout(() => populateCacheFromCommunity().catch(() => {}), 4000)
        } catch {}
      })
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      try {
        const parsed = Linking.parse(url)
        const path = parsed.path === "/invite" || parsed.path === "invite"
        if (path) {
          const { setPendingInviteRef, setPendingInviteStartDate } = await import(
            "@/src/services/inviteRefStorage"
          )
          const start = parsed.queryParams?.start as string | undefined
          if (start && /^\d{4}-\d{2}-\d{2}$/.test(start)) {
            await setPendingInviteStartDate(start)
          }
          if (parsed.queryParams?.ref) {
            const ref = parsed.queryParams.ref as string
            await setPendingInviteRef(ref)
          }
        }
        if (
          parsed.path === "/payment-success" &&
          parsed.queryParams?.session_id
        ) {
          const sessionId = parsed.queryParams.session_id as string
          const { verifyPayment } = await import("@/src/services/stripe")
          const { useChakraJourneyStore } =
            await import("@/hooks/useChakraJourneyStore")
          const isPaid = await verifyPayment(sessionId)
          if (isPaid)
            useChakraJourneyStore.getState().grantLifetimeAccess("paid")
        }
      } catch (error) {
        if (__DEV__)
          console.error("[RootLayout] Error handling deep link:", error)
      }
    }
    const subscription = Linking.addEventListener("url", ({ url }) =>
      handleDeepLink(url),
    )
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url)
    })
    return () => subscription.remove()
  }, [])

  // Android: hardware back always goes to previous screen when there is history (never exits app from CoursePreview, etc.)
  useEffect(() => {
    if (Platform.OS !== "android") return
    const onBack = () => {
      if (router.canGoBack()) {
        router.back()
        return true
      }
      return false
    }
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack)
    return () => sub.remove()
  }, [router])

  useEffect(() => {
    if ((fontsLoaded || fontsError) && imagesLoaded && audiosLoaded) {
      setAssetsReady(true)
    }
  }, [fontsLoaded, fontsError, imagesLoaded, audiosLoaded])

  // Native splash is hidden only when transitioning from hero splash to main app (in handleHeroLogoComplete).
  // Do NOT hide it here — that caused the splash to disappear too early or never be seen.

  const handleHeroLogoComplete = () => {
    SplashScreen.hideAsync().catch(() => {})
    setShowHeroLogo(false)
  }

  // Screenshot capture: run "EXPO_PUBLIC_CAPTURE_SCREENS=1 npm run web" to capture all screens.
  // Saves PNGs to Downloads. See SCREEN_INVENTORY_REFERENCE.md for details.
  if (
    Platform.OS === "web" &&
    __DEV__ &&
    process.env.EXPO_PUBLIC_CAPTURE_SCREENS === "1"
  ) {
    const { CaptureAll } = require("@/components/dev/CaptureAll")
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <CaptureAll onComplete={() => console.log("✅ Capture complete!")} />
      </View>
    )
  }

  if (showHeroLogo) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <SplashScreenReveal
          onAnimationComplete={handleHeroLogoComplete}
          assetsReady={assetsReady}
        />
      </View>
    )
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <View style={{ flex: 1, backgroundColor: "#000000" }}>
              <Animated.View
                style={{ flex: 1 }}
                entering={FadeIn.duration(SOMATIC_FADE_IN_MS).easing(Easing.out(Easing.ease))}
              >
                <Stack>
                  <Stack.Screen
                    name="(chakras)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="AudioPlayer"
                    options={{ headerShown: false, animation: "fade" }}
                  />
                  <Stack.Screen
                    name="CommunityHalls"
                    options={{ headerShown: false, animation: "fade" }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <MusicRoomAudioManager />
                <OtherOriginAudioManager />
                <FloatingUIRevealStrip />
                <PermanentMenuBar />
                <FloatingNavButtons />
                <GlobalHomeButton />
                <GlobalAnuaChat />
                <GlobalTribeChat />
                <PathSelectionGate />
                <InviteRefApplier />
                <StatusBar
                  style="light"
                  translucent={Platform.OS === "android"}
                  {...(Platform.OS === "android" && {
                    backgroundColor: "transparent",
                  })}
                />
              </Animated.View>
              <ProfileSheet />
              {/* TribeChatModal not in codebase; add when component exists: import from "@/components/tribe/TribeChatModal" and render <TribeChatModal /> */}
            </View>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
