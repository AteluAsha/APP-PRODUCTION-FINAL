import React, { useMemo, useState, useCallback, useRef, useEffect } from "react"
import { View, ScrollView, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { ActionBar } from "@/components/ActionBar"
import { AppText } from "@/components/AppText"
import { ChakraCard } from "@/components/chakras/GalleryOfGnosis/ChakraCard"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"
import { CHAKRA_TO_DAY } from "@/utils/chakraMapping"

/**
 * Gallery of Gnosis - Chakra Cards Carousel
 * Uses ScrollView + snapToInterval for reliable centering. Item width = measured viewport.
 */
const { width: WINDOW_WIDTH } = Dimensions.get("window")

const CHAKRA_ORDER: Chakra[] = [
  Chakra.ROOT,
  Chakra.SACRAL,
  Chakra.SOLAR_PLEXUS,
  Chakra.HEART,
  Chakra.THROAT,
  Chakra.THIRD_EYE,
  Chakra.CROWN,
]

export default function GalleryOfGnosis() {
  const router = useRouter()
  const { completedChakras, hasEverCompletedChakra, hasLifetimeAccess } =
    useChakraJourneyStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(WINDOW_WIDTH)
  const scrollRef = useRef<ScrollView>(null)

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      const w = e.nativeEvent.layout.width
      if (w > 0) setViewportWidth(w)
    },
    [],
  )

  const itemWidth = viewportWidth

  const unlockedChakras = useMemo(() => {
    return CHAKRA_ORDER.filter((chakra) =>
      hasEverCompletedChakra(CHAKRA_TO_DAY[chakra]),
    )
  }, [completedChakras, hasEverCompletedChakra])

  // Start at last card (most recent) - delay to allow layout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current && unlockedChakras.length > 0 && itemWidth > 0) {
        scrollRef.current.scrollTo({
          x: itemWidth * (unlockedChakras.length - 1),
          animated: false,
        })
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [itemWidth, unlockedChakras.length])

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const offset = e.nativeEvent.contentOffset.x
      const index = Math.round(offset / itemWidth)
      const clamped = Math.max(0, Math.min(index, unlockedChakras.length - 1))
      setCurrentIndex(clamped)
    },
    [itemWidth, unlockedChakras.length],
  )

  const handleBack = () => {
    if (hasLifetimeAccess) {
      router.replace("/(chakras)/ChakraHub")
    } else {
      router.back()
    }
  }

  if (unlockedChakras.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ActionBar onBackPress={handleBack} />
        <View className="flex-1 items-center justify-center px-8">
          <AppText
            font="instrument-regular"
            size="2xl"
            className="text-center mb-4"
          >
            Gallery of Gnosis
          </AppText>
          <AppText
            font="instrument-regular"
            size="lg"
            className="text-center text-gray-400"
          >
            As you complete each day's journey, beautiful chakra cards will
            appear here as gifts from your practice.
          </AppText>
          <AppText
            font="instrument-regular"
            size="base"
            className="text-center text-gray-500 mt-4"
          >
            Each day you complete, a new card will appear here as a spiritual
            reward.
          </AppText>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ActionBar onBackPress={handleBack} />
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <View className="items-center py-2">
          <AppText
            font="instrument-regular"
            size="xl"
            className="mb-0.5 text-white/90"
            style={{ letterSpacing: 0.8 }}
          >
            Gallery of Gnosis
          </AppText>
          <AppText
            font="instrument-regular"
            size="xs"
            className="text-white/70"
            style={{ letterSpacing: 0.5 }}
          >
            {currentIndex + 1} of {unlockedChakras.length}
          </AppText>
        </View>

        <View style={{ flex: 1 }} onLayout={onLayout}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {unlockedChakras.map((chakra, index) => {
              const content = chakraContent[chakra]
              return (
                <View
                  key={chakra}
                  style={{
                    width: itemWidth,
                    minHeight: 480,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 12,
                    overflow: "visible",
                  }}
                >
                  <ChakraCard
                    chakra={chakra}
                    content={content}
                    isActive={index === currentIndex}
                  />
                </View>
              )
            })}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}
