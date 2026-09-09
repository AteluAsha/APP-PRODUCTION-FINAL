/**
 * Permanent Menu Bar Component
 *
 * A mystical, energetic bottom menu bar with sacred geometry and soul energy
 * Features: Sacred geometry icons, chakra-colored gradients, pulsating animations, light reveals
 */

import React, { useState, useEffect } from "react"
import { View, Pressable, StyleSheet, Image } from "react-native"
import { useRouter, usePathname, useSegments } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import {
  TreeIcon,
  ChakraCardIcon,
  FeatherIcon,
  LeafIcon,
  AudioIcon,
} from "./MenuIcons"
import { Ionicons } from "@expo/vector-icons"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { useMemo } from "react"
import { getCurrentDayOfWeek } from "@/utils/date"
import { getContextChakraDayFromRoute } from "@/utils/notesContextChakra"
import { isChakraHubPath, isCourseFocusScreen } from "@/utils/courseFocusScreen"
import { ANUA_CHAT_ENABLED } from "@/constants/anuaAccess"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { useMenuBarStore } from "@/hooks/useMenuBarStore"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { useSplashOverlayStore } from "@/hooks/useSplashOverlayStore"
import { MenuBarMiniPlayer } from "@/components/navigation/MenuBarMiniPlayer"
interface MenuItem {
  id: string
  iconComponent?: "tree" | "chakraCard" | "feather" | "leaf" | "audio" // Optional for custom icons like Anua
  label: string
  route?: string
  onPress?: () => void
  isActive?: boolean
  gradient: string[]
  pulseDelay: number
  geometryIcon?: "circle" | "triangle" | "hexagon" | "star" | "flower"
}

/** Right padding when menu bar is empty of chevron; keeps balance with mini player / edge. */
const MENU_BAR_PADDING_RIGHT_DEFAULT = 56
/**
 * When chevron is visible: inset (16) + button (32) + gap before last icon so taps don’t fight.
 * Do not use a small value here — it replaces the default and was previously 16px (too tight).
 */
const MENU_BAR_PADDING_RIGHT_WITH_TOGGLE = 76

// Sacred geometry and chakra energy colors for each menu item
const MENU_ITEM_CONFIG = {
  home: {
    gradient: ["#9333EA", "#7B2CBF", "#6A1B9A"], // Crown purple - highest energy
    pulseDelay: 0,
    geometryIcon: "circle" as const,
  },
  gallery: {
    gradient: ["#FCD34D", "#F59E0B", "#D97706"], // Solar Plexus gold - creative energy
    pulseDelay: 200,
    geometryIcon: "hexagon" as const,
  },
  sanctuary: {
    gradient: ["#10B981", "#059669", "#047857"], // Heart green - community energy
    pulseDelay: 400,
    geometryIcon: "flower" as const,
  },
  diary: {
    gradient: ["#87AE73", "#6B8E5A", "#5A7A4A"], // Sage green - growth energy
    pulseDelay: 600,
    geometryIcon: "star" as const,
  },
  audio: {
    gradient: ["#9D4EDD", "#7B2CBF", "#6A1B9A"], // Purple - sound healing energy
    pulseDelay: 800,
    geometryIcon: "circle" as const,
  },
  notes: {
    gradient: ["#87AE73", "#6B8E5A", "#5A7A4A"], // Sage green - notes energy
    pulseDelay: 1000,
    geometryIcon: "star" as const,
  },
  anua: {
    gradient: ["#9D4EDD", "#7B2CBF", "#6A1B9A"], // Purple - Anua energy
    pulseDelay: 1200,
    geometryIcon: "flower" as const,
  },
  tribe: {
    gradient: ["#87AE73", "#6B8E5A", "#5A7A4A"], // Sage - Tribe Chat
    pulseDelay: 1400,
    geometryIcon: "circle" as const,
  },
  preview: {
    gradient: ["#FCD34D", "#F59E0B", "#D97706"], // Solar - preview course
    pulseDelay: 100,
    geometryIcon: "star" as const,
  },
  chakras101: {
    gradient: ["#FCD34D", "#F59E0B", "#D97706"], // Solar - Chakras 101
    pulseDelay: 200,
    geometryIcon: "hexagon" as const,
  },
}

export const PermanentMenuBar: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const segments = useSegments()
  const insets = useSafeAreaInsets()
  const [localMenuOpen, setLocalMenuOpen] = useState(false) // Local state for animations
  const setIsMenuOpen = useMenuBarStore((state) => state.setIsMenuOpen)

  const currentDay = getCurrentDayOfWeek()
  const contextChakraDay =
    getContextChakraDayFromRoute(pathname, segments) ?? currentDay

  const isGoodbyeVisible = useGoodbyeModalStore((state) => state.isGoodbyeVisible)
  const splashOverlayActive = useSplashOverlayStore((s) => s.splashOverlayActive)
  const onChakraHub = isChakraHubPath(pathname)
  const onCourseFocus = isCourseFocusScreen(pathname, segments)

  useEffect(() => {
    if (!onChakraHub) setLocalMenuOpen(false)
  }, [onChakraHub])

  // Menu bar slide animation - Default to hidden everywhere
  const menuTranslateY = useSharedValue(100) // Always start hidden
  const arrowOpacity = useSharedValue(1) // Always show arrow
  const arrowRotation = useSharedValue(0) // Start pointing up (closed)

  // Update menu position based on localMenuOpen state and sync to global store
  useEffect(() => {
    if (localMenuOpen) {
      // Open menu - slide up
      menuTranslateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
      arrowRotation.value = withTiming(180, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
      setIsMenuOpen(true) // Update global store
    } else {
      // Close menu - slide down
      menuTranslateY.value = withTiming(100, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
      arrowRotation.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
      setIsMenuOpen(false) // Update global store
    }
  }, [localMenuOpen, setIsMenuOpen])

  const handleToggleMenu = () => {
    addHapticFeedback(HapticStrength.Light)
    setLocalMenuOpen((prev) => !prev)
  }

  const animatedMenuStyle = useAnimatedStyle(() => {
    const isHidden = menuTranslateY.value >= 100
    return {
      transform: [{ translateY: menuTranslateY.value }],
      opacity: interpolate(menuTranslateY.value, [0, 100], [1, 0]),
      pointerEvents: isHidden ? "none" : ("auto" as const),
    }
  })

  const animatedArrowStyle = useAnimatedStyle(() => {
    return {
      opacity: arrowOpacity.value,
      transform: [{ rotate: `${arrowRotation.value}deg` }],
    }
  })

  // Determine active route
  const getIsActive = (route?: string): boolean => {
    if (!route) return false
    return pathname === route || pathname?.startsWith(route)
  }

  // Notes, Audio Library, Gallery of Gnosis, Anua.
  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [
      {
        id: "notes",
        iconComponent: "leaf",
        label: "Notes",
        onPress: () => {
          router.push(
            `/(chakras)/NotesAlongTheWay?contextDay=${contextChakraDay}`,
          )
        },
        isActive: false,
        gradient: MENU_ITEM_CONFIG.notes.gradient,
        pulseDelay: MENU_ITEM_CONFIG.notes.pulseDelay,
        geometryIcon: MENU_ITEM_CONFIG.notes.geometryIcon,
      },
      {
        id: "audio",
        iconComponent: "audio",
        label: "Audio",
        route: "/(chakras)/AudioLibrary",
        isActive: getIsActive("/(chakras)/AudioLibrary"),
        gradient: MENU_ITEM_CONFIG.audio.gradient,
        pulseDelay: MENU_ITEM_CONFIG.audio.pulseDelay,
        geometryIcon: MENU_ITEM_CONFIG.audio.geometryIcon,
      },
      {
        id: "gallery",
        iconComponent: "chakraCard",
        label: "Gallery",
        route: "/(chakras)/GalleryOfGnosis",
        isActive: getIsActive("/(chakras)/GalleryOfGnosis"),
        gradient: MENU_ITEM_CONFIG.gallery.gradient,
        pulseDelay: MENU_ITEM_CONFIG.gallery.pulseDelay,
        geometryIcon: MENU_ITEM_CONFIG.gallery.geometryIcon,
      },
    ]
    if (ANUA_CHAT_ENABLED) {
      items.push({
        id: "anua",
        iconComponent: "tree",
        label: "Anua",
        onPress: () =>
          useAnuaChatStore.getState().open({
            chakraDayOverride: contextChakraDay ?? undefined,
          }),
        isActive: false,
        gradient: MENU_ITEM_CONFIG.anua.gradient,
        pulseDelay: MENU_ITEM_CONFIG.anua.pulseDelay,
        geometryIcon: MENU_ITEM_CONFIG.anua.geometryIcon,
      })
    }
    return items
  }, [pathname, contextChakraDay, router])

  const handleItemPress = (item: MenuItem) => {
    addHapticFeedback(HapticStrength.Light)
    // Anua: always open chat directly (iOS and Android). No Sanctuary modal in between.
    if (item.id === "anua") {
      useAnuaChatStore.getState().open({
        chakraDayOverride: contextChakraDay ?? undefined,
      })
      return
    }
    if (item.onPress) {
      item.onPress()
    } else if (item.route) {
      router.push(item.route as any)
    }
  }

  const showMenuToggleArrow = onChakraHub

  if (isGoodbyeVisible) {
    return null
  }

  if (splashOverlayActive) {
    return null
  }

  // Course days are a focus space: no hub toggle menu.
  // Crystal bowl may keep playing — still show the mini player.
  if (onCourseFocus) {
    return (
      <View pointerEvents="box-none" collapsable={false}>
        <MenuBarMiniPlayer />
      </View>
    )
  }

  const onFullScreenOverlay =
    pathname?.includes("AudioPlayer") ||
    pathname?.includes("Paywall") ||
    pathname?.includes("EnergyExchange") ||
    pathname?.includes("WellnessGate") ||
    pathname?.includes("DayPresence") ||
    pathname?.includes("NotesAlongTheWay") ||
    pathname?.includes("ProfileMenu") ||
    pathname?.includes("Profile") ||
    pathname?.includes("GiftChakra") ||
    pathname?.includes("GalleryOfGnosis") ||
    pathname?.includes("Contribute")

  if (onFullScreenOverlay) {
    return null
  }

  // Toggle menu lives only on ChakraHub. Elsewhere, only the mini player if audio is going.
  if (!onChakraHub) {
    return (
      <View pointerEvents="box-none" collapsable={false}>
        <MenuBarMiniPlayer />
      </View>
    )
  }

  return (
    <View style={{ opacity: 1 }} pointerEvents="box-none" collapsable={false}>
      <Animated.View
        style={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 4) },
          animatedMenuStyle,
          { justifyContent: "space-between" as const },
          showMenuToggleArrow
            ? { paddingRight: MENU_BAR_PADDING_RIGHT_WITH_TOGGLE }
            : { paddingRight: MENU_BAR_PADDING_RIGHT_DEFAULT },
        ]}
      >
        {menuItems.map((item) => (
          <MenuBarItem
            key={item.id}
            item={item}
            onPress={() => handleItemPress(item)}
            isVertical={false}
          />
        ))}
      </Animated.View>

      <MenuBarMiniPlayer />

      {showMenuToggleArrow ? (
        <Animated.View
          style={[
            styles.arrowContainer,
            {
              right: 16,
              bottom: Math.max(insets.bottom, 4) + 20,
            },
            animatedArrowStyle,
          ]}
        >
          <Pressable
            onPress={handleToggleMenu}
            style={styles.arrowButton}
            hitSlop={{ top: 10, bottom: 10, left: 18, right: 10 }}
            accessibilityLabel={localMenuOpen ? "Close Menu" : "Open Menu"}
            accessibilityHint="Tap to toggle the navigation menu"
          >
            <LinearGradient
              colors={["rgba(135, 174, 115, 0.3)", "rgba(107, 142, 90, 0.2)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.arrowGradient}
            >
              <Ionicons
                name="chevron-up"
                size={16}
                color="rgba(255, 255, 255, 0.9)"
              />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  )
}

// Individual menu item with pulsating animation and sacred geometry
interface MenuBarItemProps {
  item: MenuItem
  onPress: () => void
  isVertical?: boolean
  /** Trial ChakraHome (not waiting room): cluster icons — no flex:1 stretch across full width. */
  trialChakraHomeCluster?: boolean
  /** Trial waiting room only: equal flex slots on full-width row for readable labels. */
  waitingRoomSlot?: boolean
}

const MenuBarItem: React.FC<MenuBarItemProps> = ({
  item,
  onPress,
  isVertical = false,
  trialChakraHomeCluster = false,
  waitingRoomSlot = false,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const geometryOpacity = useSharedValue(0)
  const geometryScale = useSharedValue(0.8)
  const labelOpacity = useSharedValue(0.88)
  const labelColor = useSharedValue(0)

  // Gentle, flowing animations for hover state - "awakening and sleeping"
  useEffect(() => {
    if (isHovered) {
      // Awakening - gentle rise
      geometryOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
      geometryScale.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
      labelOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
      labelColor.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
    } else {
      // Sleeping - gentle fade
      geometryOpacity.value = withTiming(0, {
        duration: 500,
        easing: Easing.in(Easing.ease),
      })
      geometryScale.value = withTiming(0.8, {
        duration: 500,
        easing: Easing.in(Easing.ease),
      })
      labelOpacity.value = withTiming(0.88, {
        duration: 500,
        easing: Easing.in(Easing.ease),
      })
      labelColor.value = withTiming(0, {
        duration: 500,
        easing: Easing.in(Easing.ease),
      })
    }
  }, [isHovered])

  const animatedGeometryStyle = useAnimatedStyle(() => {
    return {
      opacity: geometryOpacity.value,
      transform: [{ scale: geometryScale.value }],
    }
  })

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: labelOpacity.value,
    }
  })

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPressIn={() => setIsHovered(true)}
      onPressOut={() => {
        // Small delay before sleeping to allow for smooth transitions
        setTimeout(() => setIsHovered(false), 100)
      }}
      style={
        isVertical
          ? styles.verticalMenuItemContainer
          : [
              styles.menuItemContainer,
              trialChakraHomeCluster && styles.menuItemContainerTrialCluster,
              waitingRoomSlot && styles.menuItemContainerWaitingRoom,
            ]
      }
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {/* Icon Container - subtle gradient tint and depth for all states */}
        <View
          style={[
            styles.iconContainer,
            {
              borderColor: item.isActive
                ? `${item.gradient[0]}99`
                : `${item.gradient[0]}55`,
              shadowColor: item.gradient[0],
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: item.isActive ? 0.45 : 0.22,
              shadowRadius: item.isActive ? 8 : 5,
              elevation: item.isActive ? 6 : 3,
            },
          ]}
        >
          <LinearGradient
            colors={[
              `${item.gradient[0]}66`,
              `${item.gradient[1]}44`,
              `${item.gradient[2] ?? item.gradient[1]}22`,
            ]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={styles.iconGradientFill}
          />
          <LinearGradient
            colors={["rgba(255,255,255,0.38)", "rgba(255,255,255,0.04)", "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.55 }}
            style={styles.iconSheen}
          />

          {/* Sacred Geometry Icon - Only on Hover/Press with Illumination */}
          {item.geometryIcon && (
            <Animated.View
              style={[styles.geometryIconContainer, animatedGeometryStyle]}
            >
              {/* Illumination glow */}
              <LinearGradient
                colors={
                  [item.gradient[0], item.gradient[1], "transparent"] as [
                    string,
                    string,
                    ...string[],
                  ]
                }
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
                style={styles.geometryGlow}
              />

              {/* Geometry shape */}
              {item.geometryIcon === "circle" && (
                <View
                  style={[
                    styles.geometryCircle,
                    { borderColor: item.gradient[0] },
                  ]}
                />
              )}
              {item.geometryIcon === "hexagon" && (
                <View
                  style={[
                    styles.geometryHexagon,
                    { borderColor: item.gradient[0] },
                  ]}
                />
              )}
              {item.geometryIcon === "flower" && (
                <View
                  style={[
                    styles.geometryFlower,
                    { borderColor: item.gradient[0] },
                  ]}
                />
              )}
              {item.geometryIcon === "star" && (
                <View
                  style={[
                    styles.geometryStar,
                    { borderColor: item.gradient[0] },
                  ]}
                />
              )}
              {item.geometryIcon === "triangle" && (
                <View
                  style={[
                    styles.geometryTriangle,
                    { borderColor: item.gradient[0] },
                  ]}
                />
              )}
            </Animated.View>
          )}

          {/* Custom Icon */}
          <View style={styles.icon}>
            {item.id === "anua" ? (
              <Image
                source={require("@/assets/images/Anua_Hero_Icon_Image.png")}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                }}
                resizeMode="cover"
              />
            ) : item.id === "tribe" ? (
              <Ionicons
                name="chatbubble-ellipses"
                size={20}
                color="#F4EDE0"
              />
            ) : item.iconComponent === "tree" ? (
              <TreeIcon
                size={20}
                isActive={item.isActive}
                themeColor={item.gradient[0]}
              />
            ) : item.id === "gallery" ? (
              <Image
                source={require("@/assets/images/elementssolar.png")}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                }}
                resizeMode="cover"
              />
            ) : item.id === "chakras101" ? (
              <Image
                source={require("@/assets/images/7chakras.png")}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            ) : item.id === "preview" ? (
              <Ionicons
                name="sparkles"
                size={20}
                color="#F4EDE0"
              />
            ) : item.iconComponent === "chakraCard" ? (
              <ChakraCardIcon
                size={20}
                isActive={item.isActive}
                themeColor={item.gradient[0]}
              />
            ) : item.iconComponent === "feather" ? (
              <FeatherIcon
                size={20}
                isActive={item.isActive}
                themeColor={item.gradient[0]}
              />
            ) : item.iconComponent === "leaf" ? (
              <LeafIcon
                size={20}
                isActive={item.isActive}
                themeColor={item.gradient[0]}
              />
            ) : item.iconComponent === "audio" ? (
              <AudioIcon
                size={20}
                isActive={item.isActive}
                themeColor={item.gradient[0]}
              />
            ) : null}
          </View>
        </View>

        {/* Label - full width of menu slot so text stays centered under icon */}
        <Animated.View
          style={[
            animatedLabelStyle,
            isVertical && { marginTop: 4 },
            {
              alignSelf: "stretch",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <AppText
            font={
              item.isActive || isHovered
                ? "instrument-medium"
                : "instrument-regular"
            }
            size="xs"
            numberOfLines={1}
            style={[
              { textAlign: "center" },
              item.isActive
                ? [styles.activeLabel, { color: item.gradient[0] }]
                : isHovered
                  ? [
                      styles.hoverLabel,
                      {
                        color: item.gradient[0],
                        textShadowColor: `${item.gradient[0]}60`,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 8,
                      },
                    ]
                  : styles.inactiveLabel,
              isVertical && {
                writingDirection: "ltr",
                textAlign: "center",
              },
            ]}
          >
            {item.label}
          </AppText>
        </Animated.View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(135, 174, 115, 0.15)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 16,
    paddingRight: MENU_BAR_PADDING_RIGHT_DEFAULT,
    zIndex: 50,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  /** Trial waiting room only — full bar width so four labels are not ellipsized (replaces old maxWidth 280). */
  waitingRoomMenuRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    paddingHorizontal: 4,
    gap: 4,
  },
  verticalContainer: {
    position: "absolute",
    left: 0,
    width: 70,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRightWidth: 0.5,
    borderRightColor: "rgba(255, 255, 255, 0.08)",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    zIndex: 50, // Lower zIndex to prevent blocking other UI elements
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5, // Lower elevation to prevent blocking
  },
  menuItemContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
    position: "relative",
  },
  /** Trial ChakraHome only — do not stretch items across full width; cluster with parent gap. */
  menuItemContainerTrialCluster: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    paddingHorizontal: 6,
  },
  /** Trial waiting room only — equal share of full-width row for readable labels. */
  menuItemContainerWaitingRoom: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  verticalMenuItemContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: "relative",
    minHeight: 60,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(12, 10, 8, 0.9)",
    marginBottom: 4,
    position: "relative",
    overflow: "hidden",
    zIndex: 0,
    borderWidth: 1,
  },
  iconGradientFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 21,
  },
  iconSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
  },
  iconGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.2,
    borderRadius: 24,
  },
  icon: {
    zIndex: 3, // Icon on top
  },
  activeLabel: {
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 2,
  },
  hoverLabel: {
    marginTop: 2,
  },
  inactiveLabel: {
    color: "rgba(255, 255, 255, 0.98)",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
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
  geometryIconContainer: {
    position: "absolute",
    width: 48, // Extend beyond container
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1, // Ensure it's above background but below icon
    top: -4, // Center it properly
    left: -4,
  },
  geometryGlow: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    opacity: 0.4,
  },
  geometryCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
  },
  geometryHexagon: {
    width: 32,
    height: 32,
    borderWidth: 2.5,
    transform: [{ rotate: "30deg" }],
  },
  geometryFlower: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2.5,
    borderStyle: "dashed",
  },
  geometryStar: {
    width: 30,
    height: 30,
    borderWidth: 2.5,
    transform: [{ rotate: "45deg" }],
  },
  geometryTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "currentColor",
  },
  arrowContainer: {
    position: "absolute",
    alignItems: "center",
    zIndex: 100, // Higher than menu bar but lower than critical UI elements
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.4)",
    shadowColor: "#87AE73",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  arrowGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  dayIndicator: {
    position: "absolute",
    zIndex: 100, // Above menu bar but below critical UI
    shadowColor: "#9D4EDD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  dayIndicatorGradient: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  dayIndicatorText: {
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})
