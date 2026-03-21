/**
 * Root Layout - App Entry
 *
 * OPENING SEQUENCE (always first): Splash → Path Selection (WelcomeScreen) → 7 Chakras: The Map from Self to Soul.
 * After Enter Path: DateSelection | Waiting Room | Trial Home | Lifetime Home (ChakraHub).
 */
import "react-native-reanimated"
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
import { useColorScheme } from "@/hooks/useColorScheme"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { usePreloadAssets } from "@/hooks/usePreloadAssets"
import { View, Platform, LogBox, BackHandler } from "react-native"
import { useRouter, usePathname } from "expo-router"
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av"
import * as SplashScreen from "expo-splash-screen"
import { useChakraWeekTransition } from "@/hooks/useChakraWeekTransition"
import {
  SOMATIC_SCREEN_TRANSITION_MS,
  SOMATIC_SCREEN_TRANSITION_MS_IOS,
  SPLASH_MIN_DISPLAY_MS,
} from "@/constants/layout"
import { useState } from "react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen"
import { PermanentMenuBar } from "@/components/navigation/PermanentMenuBar"
import { MusicRoomAudioManager } from "@/components/audio/MusicRoomAudioManager"
import { OtherOriginAudioManager } from "@/components/audio/OtherOriginAudioManager"
import { GlobalHomeButton } from "@/components/navigation/GlobalHomeButton"
import { GlobalAnuaChat } from "@/components/navigation/GlobalAnuaChat"
import { GlobalTribeChat } from "@/components/navigation/GlobalTribeChat"
import { PathSelectionGate } from "@/components/navigation/PathSelectionGate"
import { ChakraHubHeader } from "@/components/navigation/ChakraHubHeader"
import { ProfileSheet } from "@/components/profile/ProfileSheet"
import { InviteRefApplier } from "@/components/invite/InviteRefApplier"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import * as Linking from "expo-linking"
import "@/src/services/firebase"
import { initializeSentry } from "@/src/services/sentry"
import "@/src/services/journeyNotifications"
import { useSplashOverlayStore } from "@/hooks/useSplashOverlayStore"

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
  const [nativeReady, setNativeReady] = useState(false)
  const [showSplashOverlay, setShowSplashOverlay] = useState(true)
  const [minSplashElapsed, setMinSplashElapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Defer Reanimated/BottomSheet until native module is initialized (fixes iOS crash).
  // One frame + short delay on both platforms so Reanimated worklets are ready before main app (Android .aab was throwing without delay).
  // Safety: if nativeReady never fires (e.g. simulator), force after 3s so we never block forever.
  useEffect(() => {
    const delay = Platform.OS === "ios" ? 80 : 80
    let cancelled = false
    const id = requestAnimationFrame(() => {
      if (cancelled) return
      if (delay > 0) {
        setTimeout(() => {
          if (!cancelled) setNativeReady(true)
        }, delay)
      } else {
        setNativeReady(true)
      }
    })
    const safety = setTimeout(() => {
      if (!cancelled) setNativeReady(true)
    }, 3000)
    return () => {
      cancelled = true
      cancelAnimationFrame(id)
      clearTimeout(safety)
    }
  }, [])

  // Native shield stays up until AnimatedSplashScreen hides it after hero image load + paint (see component).
  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setMinSplashElapsed(true), SPLASH_MIN_DISPLAY_MS)
    return () => clearTimeout(t)
  }, [])

  // Safety: never leave splashOverlayActive true after hub/home is active (avoids menu lockout).
  useEffect(() => {
    const p = pathname ?? ""
    if (
      (p.includes("ChakraHub") || p.includes("ChakraHome")) &&
      !p.includes("WelcomeScreen") &&
      !p.includes("DateSelection")
    ) {
      useSplashOverlayStore.getState().setSplashOverlayActive(false)
    }
  }, [pathname])

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

  const splashLoadingComplete =
    (fontsLoaded || Boolean(fontsError)) &&
    imagesLoaded &&
    audiosLoaded &&
    minSplashElapsed

  useChakraWeekTransition()

  // RevenueCat: load after first paint so react-native-purchases native module is not required at bundle load (prevents simulator crash).
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        const { initializeRevenueCat } = await import(
          "@/src/services/revenuecat"
        )
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

  // iOS crash fix: never mount GestureHandler/BottomSheet until native is ready. JS splash mounts after this.
  // Black void — avoids gray/white flash behind native splash before Reanimated is ready.
  if (!nativeReady) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, backgroundColor: "#000000" }} />
      </ThemeProvider>
    )
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <View style={{ flex: 1, backgroundColor: "#000000" }}>
              <View style={{ flex: 1 }}>
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
                  <Stack.Screen name="(chakras)" />
                  <Stack.Screen name="AudioPlayer" />
                  <Stack.Screen name="CommunityHalls" />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <MusicRoomAudioManager />
                <OtherOriginAudioManager />
                <PermanentMenuBar />
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
                <ProfileSheet />
                <ChakraHubHeader />
              </View>
              {showSplashOverlay && (
                <AnimatedSplashScreen
                  loadingComplete={splashLoadingComplete}
                  onFadeOutComplete={() => {
                    setShowSplashOverlay(false)
                    // Explicit clear so PermanentMenuBar is not stuck behind splashOverlayActive
                    useSplashOverlayStore.getState().setSplashOverlayActive(false)
                  }}
                />
              )}
              {/* TribeChatModal not in codebase; add when component exists: import from "@/components/tribe/TribeChatModal" and render <TribeChatModal /> */}
            </View>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
