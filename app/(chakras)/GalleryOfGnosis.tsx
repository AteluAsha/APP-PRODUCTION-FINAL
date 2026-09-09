import React, { useMemo, useState, useCallback, useRef, useEffect } from "react"
import { View, ScrollView, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ActionBar } from "@/components/ActionBar"
import { ScreenCrashBoundary } from "@/components/ScreenCrashBoundary"
import { AppText } from "@/components/AppText"
import { ChakraCard } from "@/components/chakras/GalleryOfGnosis/ChakraCard"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"
import {
  CHAKRA_TO_DAY,
  galleryFocusIndex,
  parseChakraSlug,
} from "@/utils/chakraMapping"
import { goToChakraHubRoot } from "@/utils/navigationHelpers"
import {
  CHAKRA_NAMES,
  getChakraColor,
} from "@/constants/chakras/chakraConstants"

/**
 * Gallery of Gnosis - Chakra Cards Carousel
 * Uses ScrollView + snapToInterval for reliable centering. Item width = measured viewport.
 * `?chakra=` from View in Gallery opens that exact unlocked card.
 * Top-left pops when there is history, else ChakraHub. Gift entry uses Home.
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

function GalleryOfGnosis() {
  const router = useRouter()
  const { chakra: chakraParam } = useLocalSearchParams<{
    chakra?: string | string[]
  }>()
  const focusChakra = parseChakraSlug(chakraParam)
  const openedFromGift = focusChakra != null
  const { completedChakras, everCompletedChakras, hasEverCompletedChakra } =
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
  }, [completedChakras, everCompletedChakras, hasEverCompletedChakra])

  const startIndex = useMemo(
    () => galleryFocusIndex(unlockedChakras, focusChakra),
    [unlockedChakras, focusChakra],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current && unlockedChakras.length > 0 && itemWidth > 0) {
        scrollRef.current.scrollTo({
          x: itemWidth * startIndex,
          animated: false,
        })
        setCurrentIndex(startIndex)
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [itemWidth, unlockedChakras.length, startIndex])

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
    if (openedFromGift || !router.canGoBack()) {
      goToChakraHubRoot()
      return
    }
    router.back()
  }

  if (unlockedChakras.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#0f1210" }}
        edges={["top", "left", "right"]}
      >
        <ActionBar
          onBackPress={handleBack}
          useHomeButton={openedFromGift}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <AppText
            font="cormorant-regular"
            size="2xl"
            style={{
              color: "rgba(255,255,255,0.95)",
              textAlign: "center",
              marginBottom: 24,
              letterSpacing: 1.2,
            }}
          >
            Gallery of Gnosis
          </AppText>
          <View
            style={{
              width: 48,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.25)",
              marginBottom: 28,
            }}
          />
          <AppText
            font="cormorant-italic"
            style={{
              fontFamily: "CormorantGaramondItalic",
              fontSize: 22,
              lineHeight: 34,
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              marginBottom: 20,
              paddingHorizontal: 8,
            }}
          >
            Your gallery is a sacred space. As you complete each day's journey, a
            chakra card will appear here—a gift from your practice and a gentle
            reminder of the ground you've covered.
          </AppText>
          <AppText
            font="cormorant-regular"
            size="base"
            style={{
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              lineHeight: 26,
              paddingHorizontal: 8,
            }}
          >
            There is no rush. When you're ready, your first card will be waiting.
          </AppText>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ActionBar onBackPress={handleBack} useHomeButton={openedFromGift} />
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <View
          style={{
            alignItems: "center",
            paddingTop: 12,
            paddingBottom: 6,
            paddingHorizontal: 16,
          }}
        >
          <AppText
            font="cormorant-italic"
            size="3xl"
            style={{
              color: "rgba(255,255,255,0.98)",
              letterSpacing: 2,
              marginBottom: 8,
              textShadowColor: "rgba(168, 201, 154, 0.5)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 12,
            }}
          >
            Gallery of Gnosis
          </AppText>
          <AppText
            font="instrument-regular"
            size="xs"
            style={{
              color: "rgba(168, 201, 154, 0.85)",
              letterSpacing: 1.5,
              marginBottom: 8,
              textShadowColor: "rgba(168, 201, 154, 0.2)",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 6,
            }}
          >
            {currentIndex + 1} of {unlockedChakras.length}
          </AppText>
          {unlockedChakras[currentIndex] && (
            <AppText
              font="instrument-semibold"
              size="lg"
              style={{
                color: getChakraColor(
                  CHAKRA_TO_DAY[unlockedChakras[currentIndex]],
                ),
                letterSpacing: 1,
                textShadowColor: "rgba(0,0,0,0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              {`${CHAKRA_NAMES[CHAKRA_TO_DAY[unlockedChakras[currentIndex]]]} Chakra`}
            </AppText>
          )}
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
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "flex-start",
              paddingTop: 12,
            }}
          >
            {unlockedChakras.map((chakra, index) => {
              const content = chakraContent[chakra]
              return (
                <View
                  key={chakra}
                  style={{
                    width: itemWidth,
                    flex: 1,
                    alignSelf: "stretch",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    paddingHorizontal: 0,
                    overflow: "visible",
                  }}
                >
                  <ChakraCard
                    chakra={chakra}
                    content={content}
                    isActive={index === currentIndex}
                    hideTitle
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

export default function GalleryOfGnosisScreen() {
  return (
    <ScreenCrashBoundary>
      <GalleryOfGnosis />
    </ScreenCrashBoundary>
  )
}
