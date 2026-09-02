/**
 * Gift Chakra Screen – Full-screen chakra card reveal after "Open Your Gift" on goodbye.
 * Replaces opening ChakraCardRevealModal on top of GoodbyeModal (which caused Android freeze).
 * Actions: View in Gallery (that exact card), Return home (ChakraHub).
 */
import React, { useCallback } from "react"
import {
  View,
  Pressable,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { AppText } from "@/components/AppText"
import { ChakraCard } from "@/components/chakras/GalleryOfGnosis/ChakraCard"
import { Chakra } from "@/types/chakras/Chakra"
import { chakraContent } from "@/constants/chakras/content"
import { ActionBar } from "@/components/ActionBar"
import { TOUCH } from "@/constants/layout"
import { parseChakraSlug } from "@/utils/chakraMapping"
import { goToChakraHubRoot } from "@/utils/navigationHelpers"

export default function GiftChakraScreen() {
  const router = useRouter()
  const { chakra: chakraParam } = useLocalSearchParams<{ chakra?: string | string[] }>()
  const chakra = parseChakraSlug(chakraParam) ?? Chakra.ROOT
  const content = chakraContent[chakra]

  const handleClose = useCallback(() => {
    goToChakraHubRoot()
  }, [])

  const handleViewInGallery = useCallback(() => {
    router.replace(`/(chakras)/GalleryOfGnosis?chakra=${chakra}` as const)
  }, [router, chakra])

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ActionBar useXButton={true} onXPress={handleClose} />
        <View style={styles.content}>
          <View style={styles.titleBlock}>
            <AppText
              font="instrument-regular"
              size="xl"
              style={styles.titleText}
            >
              Your Gift Awaits
            </AppText>
            <AppText
              font="instrument-regular"
              size="base"
              style={styles.subtitleText}
            >
              You've unlocked a Chakra Card!
            </AppText>
          </View>

          <View style={styles.cardWrap}>
            <ChakraCard
              chakra={chakra}
              content={content}
              isActive={true}
            />
          </View>

          <View style={styles.actions}>
            {Platform.OS === "android" ? (
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={TOUCH.hitSlop}
                activeOpacity={TOUCH.activeOpacity}
                style={styles.closeButton}
              >
                <AppText font="instrument-regular" size="base" style={styles.closeButtonText}>
                  Return home
                </AppText>
              </TouchableOpacity>
            ) : (
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <AppText font="instrument-regular" size="base" style={styles.closeButtonText}>
                  Return home
                </AppText>
              </Pressable>
            )}
            {Platform.OS === "android" ? (
              <TouchableOpacity
                onPress={handleViewInGallery}
                hitSlop={TOUCH.hitSlop}
                activeOpacity={TOUCH.activeOpacity}
                style={styles.galleryButtonWrap}
              >
                <LinearGradient
                  colors={[
                    "rgba(0, 0, 0, 0.6)",
                    "rgba(139, 115, 85, 0.25)",
                    "rgba(168, 201, 154, 0.15)",
                    "rgba(0, 0, 0, 0.5)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  locations={[0, 0.3, 0.7, 1]}
                  style={styles.galleryButton}
                >
                  <AppText font="instrument-medium" size="base" style={styles.galleryButtonText}>
                    View in Gallery
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <Pressable onPress={handleViewInGallery} style={styles.galleryButtonWrap}>
                <LinearGradient
                  colors={[
                    "rgba(0, 0, 0, 0.6)",
                    "rgba(139, 115, 85, 0.25)",
                    "rgba(168, 201, 154, 0.15)",
                    "rgba(0, 0, 0, 0.5)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  locations={[0, 0.3, 0.7, 1]}
                  style={styles.galleryButton}
                >
                  <AppText font="instrument-medium" size="base" style={styles.galleryButtonText}>
                    View in Gallery
                  </AppText>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  safe: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    paddingTop: 32,
    paddingBottom: 24,
  },
  titleBlock: {
    width: "100%",
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: "center",
  },
  titleText: {
    letterSpacing: 1,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(168, 201, 154, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  subtitleText: {
    letterSpacing: 0.8,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    textShadowColor: "rgba(168, 201, 154, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 420,
    flex: 1,
    minHeight: 200,
    maxHeight: 400,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    paddingBottom: 16,
    gap: 16,
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 9999,
  },
  closeButtonText: {
    color: "rgba(255,255,255,0.85)",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  galleryButtonWrap: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "rgba(168, 201, 154, 0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  galleryButton: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: "rgba(168, 201, 154, 0.3)",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    overflow: "hidden",
  },
  galleryButtonText: {
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.8,
    textShadowColor: "rgba(168, 201, 154, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
})
