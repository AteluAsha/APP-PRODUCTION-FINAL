/**
 * Root Layout - App Entry
 *
 * OPENING SEQUENCE: Splash → Wellness gate (once) → ChakraHub.
 */
import "react-native-reanimated"
import "./splash-prevent"
import "../globals.css"
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack, usePathname, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { useColorScheme } from "@/hooks/useColorScheme"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { usePreloadAssets } from "@/hooks/usePreloadAssets"
import {
  View,
  Platform,
  LogBox,
  BackHandler,
  AppState,
  type AppStateStatus,
} from "react-native"
import { handleAndroidHardwareBack } from "@/utils/navigationHelpers"
import { isAppErrorRecoveryActive } from "@/utils/appErrorRecovery"
import { isAppCrashOverlayVisible } from "@/hooks/useAppCrashStore"
import { useChakraWeekTransition } from "@/hooks/useChakraWeekTransition"
import {
  SOMATIC_SCREEN_TRANSITION_MS,
  SOMATIC_SCREEN_TRANSITION_MS_IOS,
  SPLASH_MIN_DISPLAY_MS,
} from "@/constants/layout"
import { AppCrashRecoveryOverlay } from "@/components/AppCrashRecoveryOverlay"
import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen"
import { PermanentMenuBar } from "@/components/navigation/PermanentMenuBar"
import { FloatingNotesButton } from "@/components/navigation/FloatingNotesButton"
import { MusicRoomAudioManager } from "@/components/audio/MusicRoomAudioManager"
import { OtherOriginAudioManager } from "@/components/audio/OtherOriginAudioManager"
import { GlobalAnuaChat } from "@/components/navigation/GlobalAnuaChat"
import { ChakraHubHeader } from "@/components/navigation/ChakraHubHeader"
import { ProfileSheet } from "@/components/profile/ProfileSheet"
import { HealingToastHost } from "@/components/HealingToastHost"
import { StoreUpdateNoticeHost } from "@/components/store/StoreUpdateNoticeHost"
import { Week1JourneyNoticeHost } from "@/components/store/Week1JourneyNoticeHost"
import { NotificationPermissionHost } from "@/components/store/NotificationPermissionHost"
import { CrownReminderNoticeHost } from "@/components/store/CrownReminderNoticeHost"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import * as Linking from "expo-linking"
import "@/src/services/firebase"
import { initializeSentry } from "@/src/services/sentry"
import { initializeRevenueCat, syncAccessFromStoreReceipts } from "@/src/services/revenuecat"
import { getUserId } from "@/src/services/userId"
import {
  syncWeeklyHeartReminders,
} from "@/src/services/journeyNotifications"
import {
  getStoreRehydrationReady,
  useStoreRehydration,
} from "@/hooks/useStoreRehydration"
import { useSplashOverlayStore } from "@/hooks/useSplashOverlayStore"
import { subscribeSanctuaryVaultSync } from "@/src/services/sanctuaryVaultDownloader"
import { VaultSyncKeepAwake } from "@/components/audio/VaultSyncKeepAwake"
import { silenceAllAudio, configureHealingAudioMode } from "@/src/utils/singleActiveSound"

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
  const pathname = usePathname()
  const router = useRouter()

  // Defer Reanimated/BottomSheet until native module is initialized (fixes iOS crash).
  // Android: one frame only so JS splash mounts quickly while native "7" still holds (see ./splash-prevent).
  // iOS: one frame + short delay so Reanimated worklets are ready before main app.
  // Safety: if nativeReady never fires, force after 3s so we never block forever.
  useEffect(() => {
    const delayMs = Platform.OS === "ios" ? 80 : 0
    let cancelled = false
    const id = requestAnimationFrame(() => {
      if (cancelled) return
      if (delayMs > 0) {
        setTimeout(() => {
          if (!cancelled) setNativeReady(true)
        }, delayMs)
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

  useEffect(() => {
    if (!useSplashOverlayStore.getState().splashOverlayActive) return
    if (!pathname) return
    if (
      pathname.includes("AudioPlayer") ||
      pathname.includes("AudioLibrary")
    ) {
      router.replace("/(chakras)/")
    }
  }, [pathname, router])

  useEffect(() => {
    const t = setTimeout(() => setMinSplashElapsed(true), SPLASH_MIN_DISPLAY_MS)
    return () => clearTimeout(t)
  }, [])

  // Safety: never leave splashOverlayActive true after hub/home is active (avoids menu lockout).
  useEffect(() => {
    const p = pathname ?? ""
    if (
      p.includes("ChakraHub") ||
      p.includes("WellnessGate")
    ) {
      useSplashOverlayStore.getState().setSplashOverlayActive(false)
    }
  }, [pathname])

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await configureHealingAudioMode({ background: true })
      } catch (e) {
        if (__DEV__) {
          console.warn("[RootLayout] Audio setup skipped:", e)
        }
      }
    }
    setupAudio()
    // Crash-reopen and stacked players can leave native MediaPlayers running.
    // Mute them once at launch so Day 1 cannot auto-play by itself.
    void silenceAllAudio()
  }, [])

  // Permanent sanctuary vault: Day 1 → Day 7, resume on every open / foreground.
  useEffect(() => subscribeSanctuaryVaultSync(), [])

  useEffect(() => {
    const checkExpiry = () => {
      useChakraJourneyStore.getState().checkScholarshipExpiry()
    }
    checkExpiry()
    const interval = setInterval(checkExpiry, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Soul Journey Nudges: wait for persist, then heartbeat + rolling refresh.
  useEffect(() => {
    let cancelled = false
    const syncWhenReady = () => {
      if (cancelled) return
      if (!getStoreRehydrationReady()) return
      void syncWeeklyHeartReminders()
    }

    const unsub = useStoreRehydration.subscribe(syncWhenReady)
    syncWhenReady()
    const safety = setTimeout(syncWhenReady, 2600)

    const onChange = (next: AppStateStatus) => {
      if (next === "active") {
        useChakraJourneyStore.getState().touchLastAppActive()
        useChakraJourneyStore.getState().checkScholarshipExpiry()
        syncWhenReady()
        void syncAccessFromStoreReceipts()
      }
    }
    const sub = AppState.addEventListener("change", onChange)
    useChakraJourneyStore.getState().touchLastAppActive()
    return () => {
      cancelled = true
      unsub()
      clearTimeout(safety)
      sub.remove()
    }
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

  // RevenueCat after first paint. Static import so production AAB eager-bundle
  // does not depend on Metro async-require (stale EAS temp paths).
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
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

  // Android: pop when there is history, otherwise land on ChakraHub. Never exit the app.
  useEffect(() => {
    if (Platform.OS !== "android") return
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isAppCrashOverlayVisible()) {
        return false
      }
      if (isAppErrorRecoveryActive()) {
        return true
      }
      return handleAndroidHardwareBack(pathname)
    })
    return () => sub.remove()
  }, [pathname])

  // Screenshot capture: run "EXPO_PUBLIC_CAPTURE_SCREENS=1 npm run web" to capture all screens.
  // Saves PNGs to Downloads. See SCREEN_INVENTORY_REFERENCE.md for details.
  if (
    Platform.OS === "web" &&
    __DEV__ &&
    process.env.EXPO_PUBLIC_CAPTURE_SCREENS === "1"
  ) {
    queueMicrotask(() => {
      useSplashOverlayStore.getState().setJsSplashFadeComplete(true)
    })
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
              <VaultSyncKeepAwake />
              <PermanentMenuBar />
              <FloatingNotesButton />
              <GlobalAnuaChat />
              <StatusBar
                style="light"
                translucent={Platform.OS === "android"}
                {...(Platform.OS === "android" && {
                  backgroundColor: "transparent",
                })}
              />
              <ProfileSheet />
              <HealingToastHost />
              <StoreUpdateNoticeHost />
              <Week1JourneyNoticeHost />
              <NotificationPermissionHost />
              <CrownReminderNoticeHost />
              <ChakraHubHeader />
            </View>
            {showSplashOverlay && (
              <AnimatedSplashScreen
                loadingComplete={splashLoadingComplete}
                onFadeOutComplete={() => {
                  setShowSplashOverlay(false)
                  useSplashOverlayStore.getState().setSplashOverlayActive(false)
                }}
              />
            )}
            <AppCrashRecoveryOverlay />
          </View>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  )
}
