/**
 * Homescreen: 7 chakra balls locked in the opening frame, toggle menu below.
 * Sanctuary list is hidden — Gallery, Audio Library, Notes, and Anua live in the menu.
 */
import React, { useMemo, useEffect } from "react"
import { View, useWindowDimensions } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"
import { getChakraIndex } from "@/utils/chakraMapping"
import { getCurrentDayOfWeek } from "@/utils/date"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { useChakrasData } from "@/hooks/useChakrasData"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import GoodbyeModal from "@/components/chakras/GoodbyeModal"
import { useIsFocused } from "@react-navigation/native"
import {
  HUB_ALPHA_OMEGA_FOOTER_PADDING_TOP,
  lifetimeHubFirstScreenStackHeight,
} from "@/constants/layout"
import { IntegratedProgressStack } from "@/components/chakras/IntegratedProgressStack"
import { AppText } from "@/components/AppText"
import { openChakraDay } from "@/utils/openChakraDay"
import { usePeriodicPaywall } from "@/hooks/usePeriodicPaywall"
import { TomorrowAwakeningModal } from "@/components/chakras/TomorrowAwakeningModal"
import { useTomorrowAwakeningStore } from "@/hooks/useTomorrowAwakeningStore"
import { HubCosmicField, HubCosmicLights } from "@/components/chakras/HubCosmicField"

export default function ChakraHub() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const currentDay = getCurrentDayOfWeek()
  const {
    markChakraCompleted,
    hasParticipatedDay,
    hasCompletedChakra,
    allChakrasCompleted,
    awakenedHubChakras,
    awakenHubChakra,
    hasLifetimeAccess,
  } = useChakraJourneyStore(
    useShallow((state) => ({
      markChakraCompleted: state.markChakraCompleted,
      hasParticipatedDay: state.hasParticipatedDay,
      hasCompletedChakra: state.hasCompletedChakra,
      allChakrasCompleted: state.allChakrasCompleted,
      awakenedHubChakras: state.awakenedHubChakras,
      awakenHubChakra: state.awakenHubChakra,
      hasLifetimeAccess: state.hasLifetimeAccess,
    })),
  )
  const { completedChakra, clearCompletedChakra } = useCompletedChakraStore()
  const isHubFocused = useIsFocused()
  const isGoodbyeVisible = isHubFocused && completedChakra != null
  const tomorrowDayIndex = useTomorrowAwakeningStore((s) => s.completedDayIndex)
  const clearTomorrowAwakening = useTomorrowAwakeningStore(
    (s) => s.clearTomorrowAwakening,
  )
  usePeriodicPaywall(
    !hasLifetimeAccess && !isGoodbyeVisible && tomorrowDayIndex == null,
  )

  useEffect(() => {
    if (completedChakra) {
      const chakraDayIndex = getChakraIndex(completedChakra)
      markChakraCompleted(chakraDayIndex)
    }
  }, [completedChakra, markChakraCompleted])

  const closeGoodbyeModal = () => {
    clearCompletedChakra()
  }
  const { chakrasData } = useChakrasData()

  const { height: windowHeight } = useWindowDimensions()
  const stackBlockHeight = lifetimeHubFirstScreenStackHeight(
    windowHeight,
    insets.top,
    insets.bottom,
  )

  const stackChakraData = useMemo(() => {
    if (chakrasData.length === 0) return []
    return chakrasData.map((item) => ({
      ...item,
      onPress: (r: any) => {
        addHapticFeedback(HapticStrength.Light)
        awakenHubChakra(item.day)
        openChakraDay(item.day, r)
      },
    }))
  }, [chakrasData, awakenHubChakra])

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <HubCosmicField />
      {/* Lights behind the stack — never intercepts chakra presses */}
      <HubCosmicLights />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: 'transparent', zIndex: 1 }}
        edges={['left', 'right']}
      >
        <View
          style={{
            flex: 1,
            paddingTop: insets.top,
            minHeight: stackBlockHeight,
            justifyContent: 'center',
            width: '100%',
            overflow: 'visible',
            backgroundColor: 'transparent',
          }}
        >
          <IntegratedProgressStack
            currentDay={currentDay}
            hasCompletedChakra={hasCompletedChakra}
            hasParticipatedDay={hasParticipatedDay}
            allChakrasCompleted={allChakrasCompleted}
            hasLifetimeAccess={true}
            inCourseMode={false}
            showAllChakrasForLifetimeHub={true}
            isHubChakraAwakened={(day) =>
              (awakenedHubChakras ?? [0]).includes(day) ||
              hasCompletedChakra(day)
            }
            chakraData={stackChakraData}
            router={router}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            backgroundColor: "transparent",
            paddingTop: HUB_ALPHA_OMEGA_FOOTER_PADDING_TOP,
            paddingBottom: Math.max(insets.bottom, 12),
          }}
          pointerEvents="none"
        >
          <AppText
            font="cormorant-italic"
            style={{
              color: "rgba(212, 165, 116, 0.8)",
              fontSize: 24,
            }}
          >
            α
          </AppText>
          <AppText
            font="cormorant-italic"
            style={{
              color: "rgba(212, 165, 116, 0.5)",
              fontSize: 16,
            }}
          >
            ✧
          </AppText>
          <AppText
            font="cormorant-italic"
            style={{
              color: "rgba(212, 165, 116, 0.8)",
              fontSize: 24,
            }}
          >
            Ω
          </AppText>
        </View>
      </SafeAreaView>

      <GoodbyeModal
        isVisible={isGoodbyeVisible}
        onClose={closeGoodbyeModal}
        chakraDay={
          completedChakra ? getChakraIndex(completedChakra) : undefined
        }
      />
      <TomorrowAwakeningModal
        visible={
          isHubFocused && tomorrowDayIndex != null && !isGoodbyeVisible
        }
        completedDayIndex={tomorrowDayIndex}
        onClose={clearTomorrowAwakening}
      />
    </View>
  )
}
