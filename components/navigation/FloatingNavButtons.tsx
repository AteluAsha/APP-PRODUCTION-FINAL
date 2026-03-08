/**
 * Floating Navigation Buttons
 *
 * Trial Mode: Leaf (left), Anua (bottom-right)
 * Post-Paywall: Leaf (above menu bar, left), Anua (above menu bar, right)
 *
 * Leaf opens JourneyNotesView (Notes along the way)
 * Anua opens Sanctuary (Talk to Anua, Share, Community)
 */

import React, { useState, useEffect } from "react"
import {
  View,
  Pressable,
  StyleSheet,
  Image,
  Platform,
  BackHandler,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { usePathname, useSegments } from "expo-router"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { getCurrentDayOfWeek } from "@/utils/date"
import { getContextChakraDayFromRoute } from "@/utils/notesContextChakra"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { getChakraName } from "@/constants/chakras/chakraConstants"
import { SocialSanctuaryModal } from "@/components/social/SocialSanctuaryModal"
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { JourneyNotesView } from "@/components/chakras/JourneyNotesView"
import { usePillBottomSheetStore } from "@/hooks/usePillBottomSheetStore"
import { useMenuBarStore } from "@/hooks/useMenuBarStore"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { CommunityFeaturePreviewModal } from "@/components/chakras/CommunityFeaturePreviewModal"
import { ANDROID_PRESS_DELAY_MS } from "@/constants/layout"

export const FloatingNavButtons = () => {
  const router = useRouter()
  const pathname = usePathname()
  const segments = useSegments()
  const insets = useSafeAreaInsets()
  const [notesSheetRef] = useState<React.RefObject<BottomSheetModal>>(() =>
    React.createRef<BottomSheetModal>(),
  )
  const [notesSheetOpenKey, setNotesSheetOpenKey] = useState(0)
  const [isSanctuaryModalVisible, setIsSanctuaryModalVisible] = useState(false)
  const [showCommunityPreview, setShowCommunityPreview] = useState(false)
  const [showHallsPreview, setShowHallsPreview] = useState(false)
  const [previewFeatureType, setPreviewFeatureType] = useState<
    "share" | "halls"
  >("share")
  const [isNotesSheetOpen, setIsNotesSheetOpen] = useState(false)

  // Escape hatch: Android back button dismisses Notes sheet when open so user is never stuck.
  useEffect(() => {
    if (Platform.OS !== "android" || !isNotesSheetOpen) return
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      notesSheetRef.current?.dismiss()
      return true
    })
    return () => sub.remove()
  }, [isNotesSheetOpen])

  // Get lifetime access status - determines positioning and behavior
  const hasLifetimeAccess = useChakraJourneyStore(
    useShallow((state) => state.hasLifetimeAccess),
  )

  // Call all hooks unconditionally (before any return) to satisfy Rules of Hooks
  const isPillBottomSheetVisible = usePillBottomSheetStore(
    (state) => state.isVisible,
  )
  const isMenuOpen = useMenuBarStore((state) => state.isMenuOpen)
  const isGoodbyeVisible = useGoodbyeModalStore((state) => state.isGoodbyeVisible)

  // APP_2 (Lifetime): Hide FloatingNavButtons - Notes and Anua are in PermanentMenuBar
  if (hasLifetimeAccess) {
    return null
  }

  // Goodbye modal open: hide so nav doesn't block modal touches (back, home, open gift)
  if (isGoodbyeVisible) {
    return null
  }

  // APP_1 (Trial): Limited mode logic
  // Limited mode only applies to Chakras101 page in trial mode (waiting room context)
  // Notes and Community Halls are available in App 1 when journey starts (first Monday opens)
  const isChakras101Page =
    pathname?.includes("Chakras101") || segments.includes("Chakras101")
  const shouldUseLimitedMode = !hasLifetimeAccess && isChakras101Page

  // Get current chakra day and name for SocialSanctuaryModal
  const currentDay = getCurrentDayOfWeek()
  const chakraName = getChakraName(currentDay)
  // Screen context: which chakra page user is viewing (e.g. Root = 0). Notes store to this.
  const contextChakraDay =
    getContextChakraDayFromRoute(pathname, segments) ?? currentDay

  // Don't show on certain screens, when pill bottom sheet is open, or when menu is open.
  // Course pages 1-7 ([chakra]: root, sacral, solar, heart, throat, thirdeye, crown) are NOT in
  // shouldHide – FloatingNavButtons are shown on all chakra day screens.
  // Use both pathname and segments for reliable detection
  // WelcomeScreen is the index route - check segments array for empty or just ['(chakras)']
  const segmentsLength: number = segments.length
  const isRootChakrasRoute =
    segmentsLength === 0 ||
    (segmentsLength === 1 && segments[0] === "(chakras)") ||
    pathname === "/(chakras)" ||
    pathname === "/(chakras)/" ||
    pathname === "/(chakras)/index" ||
    pathname === "/" ||
    (pathname &&
      pathname.startsWith("/(chakras)") &&
      pathname.split("/").filter(Boolean).length <= 2)

  const isWelcomeScreen =
    isRootChakrasRoute ||
    segments.includes("WelcomeScreen") ||
    pathname?.includes("/WelcomeScreen") ||
    pathname?.includes("WelcomeScreen") ||
    pathname?.includes("index")

  // CRITICAL: Hide FloatingNavButtons on waiting screen - WaitingScreen has its own Anua button
  // Waiting screen is shown when on ChakraHome (root chakras route) in trial mode before journey starts
  // Also check if we're on ChakraHome route (where waiting screen is rendered)
  const isWaitingScreen =
    isRootChakrasRoute ||
    isWelcomeScreen ||
    segments.includes("ChakraHome") ||
    pathname?.includes("ChakraHome")

  const shouldHide =
    segments.includes("AudioPlayer") ||
    segments.includes("CommitmentGate") ||
    segments.includes("DevPaywall") ||
    segments.includes("EnergyExchange") ||
    segments.includes("ChakraHub") ||
    segments.includes("DateSelection") ||
    segments.includes("TribeChat") ||
    segments.includes("QuizScreen") ||
    segments.includes("AnuaChat") ||
    segments.includes("GiftChakra") ||
    pathname?.includes("/AudioPlayer") ||
    pathname?.includes("/CommitmentGate") ||
    pathname?.includes("/DevPaywall") ||
    pathname?.includes("/EnergyExchange") ||
    pathname?.includes("/ChakraHub") ||
    pathname?.includes("/DateSelection") ||
    pathname?.includes("DateSelection") ||
    pathname?.includes("/TribeChat") ||
    pathname?.includes("TribeChat") ||
    pathname?.includes("/QuizScreen") ||
    pathname?.includes("QuizScreen") ||
    pathname?.includes("/AnuaChat") ||
    pathname?.includes("AnuaChat") ||
    pathname === "AnuaChat" ||
    (segments.length > 0 && segments[segments.length - 1] === "AnuaChat") ||
    pathname?.includes("/GiftChakra") ||
    pathname?.includes("GiftChakra") ||
    (segments.length > 0 && segments[segments.length - 1] === "GiftChakra") ||
    isWaitingScreen || // CRITICAL: Hide on waiting screen (root chakras route OR ChakraHome)
    isPillBottomSheetVisible ||
    isMenuOpen ||
    !pathname || // Safety: hide if pathname is undefined
    pathname === "/" // Safety: hide on root

  // EARLY RETURN - Most important check first
  if (shouldHide) {
    return null
  }

  // Open Notes (JourneyNotesView) - Bottom sheet
  const handleOpenNotes = () => {
    addHapticFeedback(HapticStrength.Light)
    setNotesSheetOpenKey((k) => k + 1)
    notesSheetRef.current?.present()
  }

  // Open Sanctuary: on Android go direct to Anua chat (skip modal so touches work). iOS shows modal.
  const handleOpenAnua = () => {
    addHapticFeedback(HapticStrength.Light)
    if (Platform.OS === "android") {
      useAnuaChatStore.getState().open({
        isWaitingRoom: shouldUseLimitedMode,
        chakraDayOverride: contextChakraDay ?? undefined,
      })
      return
    }
    setIsSanctuaryModalVisible(true)
  }

  const openTribeChat = () => {
    addHapticFeedback(HapticStrength.Light)
    router.push("/(chakras)/TribeChat")
  }

  // TRIAL MODE: Leaf + Tribe Chat (left, stacked), Anua (right)
  if (!hasLifetimeAccess) {
    // Calculate bottom position for both buttons to align them
    const bottomPosition = Math.max(insets.bottom, 4) + 8
    const leftButtonGap = 8

    return (
      <>
        {/* Left side: Leaf (top), Tribe Chat (below) - modern floating stack */}
        <View
          style={{
            position: "absolute",
            left: 16,
            bottom: bottomPosition,
            flexDirection: "column",
            alignItems: "flex-start",
            gap: leftButtonGap,
            zIndex: 100,
          }}
        >
          <Pressable
            onPress={handleOpenNotes}
            style={[styles.buttonStacked, styles.leafButton]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Notes Along the Way"
            accessibilityHint="Tap to view and add your journey notes"
            {...(Platform.OS === "android" && { delayPressIn: ANDROID_PRESS_DELAY_MS })}
          >
            <Ionicons name="leaf" size={20} color="#87AE73" />
          </Pressable>
          <Pressable
            onPress={openTribeChat}
            style={[styles.buttonStacked, styles.tribeButton]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Tribe Chat"
            accessibilityHint="Connect with people you invited to the journey"
            {...(Platform.OS === "android" && { delayPressIn: ANDROID_PRESS_DELAY_MS })}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={18}
              color="rgba(135, 174, 115, 0.95)"
            />
          </Pressable>
        </View>

        {/* Anua Button - Right side, aligned with Leaf button */}
        <View
          style={{
            position: "absolute",
            bottom: bottomPosition, // Same position as Leaf button
            right: 16,
            alignItems: "flex-end",
            zIndex: 100,
          }}
        >
          <AppText
            font="instrument-regular"
            size="xs"
            style={{
              color: "rgba(255,255,255,0.88)",
              marginBottom: 4,
              fontSize: 11,
              letterSpacing: 0.5,
            }}
          >
            sanctuary
          </AppText>
          <Pressable
            onPress={handleOpenAnua}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 44,
              height: 44,
              shadowColor: "#9D4EDD",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 8,
            }}
            accessibilityLabel="Anua Sanctuary"
            accessibilityHint="Tap to connect with Anua and the community"
            {...(Platform.OS === "android" && { delayPressIn: ANDROID_PRESS_DELAY_MS })}
          >
            <Image
              source={require("@/assets/images/Anua_Hero_Icon_Image.png")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
              }}
              resizeMode="cover"
            />
          </Pressable>
        </View>

        {/* Social Sanctuary Modal - Limited mode when on Chakras101 in trial */}
        <SocialSanctuaryModal
          visible={isSanctuaryModalVisible}
          onClose={() => setIsSanctuaryModalVisible(false)}
          chakraDay={currentDay}
          chakraName={chakraName}
          onOpenAnuaChat={() => {
            notesSheetRef.current?.dismiss()
            setIsSanctuaryModalVisible(false)
            setTimeout(() => {
              useAnuaChatStore
                .getState()
                .open({ isWaitingRoom: shouldUseLimitedMode })
            }, 200)
          }}
          isLimitedMode={shouldUseLimitedMode}
          showShareWithCommunity={false}
          onShowCommunityPreview={(type) => {
            // Close sanctuary modal first
            setIsSanctuaryModalVisible(false)
            // Then show the appropriate preview
            setPreviewFeatureType(type)
            if (type === "share") {
              setShowCommunityPreview(true)
            } else {
              setShowHallsPreview(true)
            }
          }}
        />

        {/* Community Feature Preview Modals */}
        <CommunityFeaturePreviewModal
          visible={showCommunityPreview}
          onClose={() => setShowCommunityPreview(false)}
          featureType="share"
        />
        <CommunityFeaturePreviewModal
          visible={showHallsPreview}
          onClose={() => setShowHallsPreview(false)}
          featureType="halls"
        />

        {/* Notes Bottom Sheet - Default 2/3 open, dimmed backdrop */}
        <BottomSheetModal
          ref={notesSheetRef}
          index={1}
          snapPoints={["50%", "90%"]}
          enablePanDownToClose
          onChange={(index) => setIsNotesSheetOpen(index >= 0)}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} opacity={0.6} />
          )}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
        >
          <JourneyNotesView
            sheetOpenKey={notesSheetOpenKey}
            contextChakraDay={contextChakraDay}
            onOpenFullPage={() => {
              notesSheetRef.current?.dismiss()
              setTimeout(
                () =>
                  router.push(
                    `/(chakras)/NotesAlongTheWay?contextDay=${contextChakraDay}`,
                  ),
                300,
              )
            }}
            onSendToAnua={(content) => {
              notesSheetRef.current?.dismiss()
              setTimeout(
                () =>
                  useAnuaChatStore.getState().open({ initialMessage: content }),
                200,
              )
            }}
          />
        </BottomSheetModal>
      </>
    )
  }

  // POST-PAYWALL: Both buttons above menu bar (left and right)
  // Menu bar height is ~60px, so position buttons above it
  const menuBarHeight = 60
  const buttonSpacing = 16

  return (
    <>
      {/* Leaf Button - Above menu bar, left (lowered) */}
      <Pressable
        onPress={handleOpenNotes}
        style={[
          styles.button,
          styles.leafButton,
          {
            bottom:
              Math.max(insets.bottom, 4) + menuBarHeight + buttonSpacing + 12, // Lowered by 12px
            left: 16,
          },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        {...(Platform.OS === "android" && { delayPressIn: ANDROID_PRESS_DELAY_MS })}
      >
        <Ionicons name="leaf" size={20} color="#87AE73" />
      </Pressable>

      {/* Anua Button - Above menu bar, right (as low as possible) */}
      <View
        style={{
          position: "absolute",
          bottom: Math.max(insets.bottom, 4) + menuBarHeight + 8, // As low as possible above menu
          right: 16,
          alignItems: "flex-end",
          zIndex: 100,
        }}
      >
        <AppText
          font="instrument-regular"
          size="xs"
          style={{
            color: "rgba(255,255,255,0.88)",
            marginBottom: 4,
            fontSize: 11,
            letterSpacing: 0.5,
          }}
        >
          sanctuary
        </AppText>
        <Pressable
          onPress={handleOpenAnua}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            width: 44,
            height: 44,
            shadowColor: "#9D4EDD",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          }}
          {...(Platform.OS === "android" && { delayPressIn: ANDROID_PRESS_DELAY_MS })}
        >
          <Image
            source={require("@/assets/images/Anua_Hero_Icon_Image.png")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
            }}
            resizeMode="cover"
          />
        </Pressable>
      </View>

      {/* Social Sanctuary Modal - Limited mode when on Chakras101 in trial */}
      <SocialSanctuaryModal
        visible={isSanctuaryModalVisible}
        onClose={() => setIsSanctuaryModalVisible(false)}
        chakraDay={currentDay}
        chakraName={chakraName}
        onOpenAnuaChat={() => {
          notesSheetRef.current?.dismiss()
          setIsSanctuaryModalVisible(false)
          setTimeout(() => {
            useAnuaChatStore
              .getState()
              .open({ isWaitingRoom: shouldUseLimitedMode })
          }, 200)
        }}
        isLimitedMode={shouldUseLimitedMode}
        onShowCommunityPreview={(type) => {
          // Close sanctuary modal first
          setIsSanctuaryModalVisible(false)
          // Then show the appropriate preview
          setPreviewFeatureType(type)
          if (type === "share") {
            setShowCommunityPreview(true)
          } else {
            setShowHallsPreview(true)
          }
        }}
      />

      {/* Community Feature Preview Modals */}
      <CommunityFeaturePreviewModal
        visible={showCommunityPreview}
        onClose={() => setShowCommunityPreview(false)}
        featureType="share"
      />
      <CommunityFeaturePreviewModal
        visible={showHallsPreview}
        onClose={() => setShowHallsPreview(false)}
        featureType="halls"
      />

        {/* Notes Bottom Sheet - Default 2/3 open, dimmed backdrop */}
        <BottomSheetModal
          ref={notesSheetRef}
          index={1}
          snapPoints={["50%", "90%"]}
          enablePanDownToClose
          onChange={(index) => setIsNotesSheetOpen(index >= 0)}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} opacity={0.6} />
          )}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
        >
          <JourneyNotesView
            sheetOpenKey={notesSheetOpenKey}
            contextChakraDay={contextChakraDay}
            onOpenFullPage={() => {
              notesSheetRef.current?.dismiss()
              setTimeout(
                () =>
                  router.push(
                    `/(chakras)/NotesAlongTheWay?contextDay=${contextChakraDay}`,
                  ),
                300,
              )
            }}
            onSendToAnua={(content) => {
              notesSheetRef.current?.dismiss()
              setTimeout(
                () =>
                  useAnuaChatStore.getState().open({ initialMessage: content }),
                200,
              )
            }}
          />
        </BottomSheetModal>
      </>
    )
  }

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  buttonStacked: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  leafButton: {
    borderColor: "rgba(135, 174, 115, 0.5)",
  },
  tribeButton: {
    borderColor: "rgba(135, 174, 115, 0.45)",
  },
  anuaButton: {
    borderColor: "rgba(157, 78, 221, 0.5)",
  },
  bottomSheetBackground: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  handleIndicator: {
    backgroundColor: "#FFFFFF",
    width: 40,
  },
})
