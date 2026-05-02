/**
 * Permanent Menu Bar Component
 *
 * A mystical, energetic bottom menu bar with sacred geometry and soul energy
 * Features: Sacred geometry icons, chakra-colored gradients, pulsating animations, light reveals
 */

import React, { useState, useEffect, useRef } from "react"
import { View, Pressable, StyleSheet, Platform } from "react-native"
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
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { useMemo } from "react"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { useShallow } from "zustand/react/shallow"
import { getCurrentDayOfWeek } from "@/utils/date"
import { getContextChakraDayFromRoute } from "@/utils/notesContextChakra"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { DAY_NAMES, getDayName } from "@/constants/chakras/chakraConstants"
import { useMenuBarStore } from "@/hooks/useMenuBarStore"
import { useGoodbyeModalStore } from "@/hooks/useGoodbyeModalStore"
import { useSplashOverlayStore } from "@/hooks/useSplashOverlayStore"
import { MenuBarMiniPlayer } from "@/components/navigation/MenuBarMiniPlayer"
import { getChakraName } from "@/constants/chakras/chakraConstants"
import { Image } from "react-native"
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
/** Trial ChakraHome horizontal cluster only — space between the four icons (waiting room uses its own row gap). */
const TRIAL_CHAKRA_HOME_ICON_GAP = 12

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
  const isWaitingScreenVisible = useMenuBarStore(
    (state) => state.isWaitingScreenVisible,
  )
  const waitingRoomActions = useMenuBarStore(
    (state) => state.waitingRoomActions,
  )

  const currentDay = getCurrentDayOfWeek()
  const chakraName = getChakraName(currentDay)
  const contextChakraDay =
    getContextChakraDayFromRoute(pathname, segments) ?? currentDay

  // Get lifetime access status - menu bar ONLY shows after paywall
  const hasLifetimeAccess = useChakraJourneyStore(
    useShallow((state) => state.hasLifetimeAccess),
  )
  const source = useCurrentAudioStore((s) => s.source)
  const audioOrigin = useCurrentAudioStore((s) => s.audioOrigin)
  const isGoodbyeVisible = useGoodbyeModalStore((state) => state.isGoodbyeVisible)
  const splashOverlayActive = useSplashOverlayStore((s) => s.splashOverlayActive)
  // Lifetime menu bar is permanently visible. Trial uses same menu bar (4 or 5 items).

  // Determine if we're on a home/landing screen where menu should be hidden by default
  // NOTE: All hooks must run unconditionally (Rules of Hooks) - no early return before hooks
  const isHomeOrLandingScreen = useMemo(() => {
    return (
      pathname === "/(chakras)" ||
      pathname === "/(chakras)/" ||
      pathname?.startsWith("/(chakras)/ChakraHub") ||
      pathname?.includes("/WelcomeScreen")
    )
  }, [pathname])

  // Hide menu bar on paywall (CommitmentGate) - it's a gate, not a navigation screen
  const isPaywallScreen = useMemo(() => {
    return pathname?.includes("CommitmentGate")
  }, [pathname])

  // Determine if we should use vertical (left wall) layout for healing screens
  const useVerticalLayout = useMemo(() => {
    return (
      pathname?.startsWith("/(chakras)/[chakra]") ||
      pathname?.startsWith("/(chakras)/SoundBath") ||
      pathname?.startsWith("/(chakras)/AudioLibrary") ||
      pathname?.startsWith("/(chakras)/HeadToHeart") ||
      pathname?.startsWith("/(chakras)/Chakras101") ||
      pathname?.startsWith("/(chakras)/DivineLaws") ||
      pathname?.startsWith("/(chakras)/AccountabilityOfAwakening") ||
      pathname?.startsWith("/(chakras)/GalleryOfGnosis")
    )
  }, [pathname])

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

  // Menu items with energetic configurations
  // Trial waiting room: exactly 4 buttons – Preview, Chakras 101, Anua, Notes (no Tribe, no arrow).
  // Trial elsewhere: Sanctuary, Anua, Notes, Tribe + arrow.
  // APP_2 (Lifetime): Full bar. Lifetime on waiting room: no menu bar.
  const menuItems: MenuItem[] = useMemo(() => {
    const sanctuaryItem: MenuItem = {
      id: "community",
      iconComponent: "feather",
      label: "Sanctuary",
      route: "/CommunityHalls",
      isActive: getIsActive("/CommunityHalls"),
      gradient: MENU_ITEM_CONFIG.sanctuary.gradient,
      pulseDelay: MENU_ITEM_CONFIG.sanctuary.pulseDelay,
      geometryIcon: MENU_ITEM_CONFIG.sanctuary.geometryIcon,
    }
    const anuaItem: MenuItem = {
      id: "anua",
      iconComponent: "leaf",
      label: "Anua",
      onPress: () =>
        useAnuaChatStore.getState().open({
          chakraDayOverride: contextChakraDay ?? undefined,
        }),
      isActive: false,
      gradient: MENU_ITEM_CONFIG.anua.gradient,
      pulseDelay: MENU_ITEM_CONFIG.anua.pulseDelay,
      geometryIcon: MENU_ITEM_CONFIG.anua.geometryIcon,
    }
    const notesItem: MenuItem = {
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
    }
    const tribeItem: MenuItem = {
      id: "tribe",
      iconComponent: "leaf",
      label: "Tribe",
      route: "/(chakras)/TribeChat",
      isActive: false,
      gradient: MENU_ITEM_CONFIG.tribe.gradient,
      pulseDelay: MENU_ITEM_CONFIG.tribe.pulseDelay,
      geometryIcon: MENU_ITEM_CONFIG.tribe.geometryIcon,
    }

    // Trial waiting room: ONLY these 4 options (Preview, Chakras 101, Anua, Notes). No Tribe. Toggle arrow is shown so user can expand/collapse the bar.
    // From waiting room, Anua ALWAYS opens directly to Anua chat (never Social Sanctuary modal).
    if (!hasLifetimeAccess && isWaitingScreenVisible) {
      const previewItem: MenuItem = {
        id: "preview",
        iconComponent: "feather",
        label: "Preview",
        onPress: () => waitingRoomActions.onPreviewPress?.(),
        isActive: false,
        gradient: MENU_ITEM_CONFIG.preview.gradient,
        pulseDelay: MENU_ITEM_CONFIG.preview.pulseDelay,
        geometryIcon: MENU_ITEM_CONFIG.preview.geometryIcon,
      }
      const chakras101Item: MenuItem = {
        id: "chakras101",
        iconComponent: "chakraCard",
        label: "Chakras 101",
        onPress: () => waitingRoomActions.onChakras101Press?.(),
        isActive: false,
        gradient: MENU_ITEM_CONFIG.chakras101.gradient,
        pulseDelay: MENU_ITEM_CONFIG.chakras101.pulseDelay,
        geometryIcon: MENU_ITEM_CONFIG.chakras101.geometryIcon,
      }
      const anuaWaitingRoomItem: MenuItem = {
        ...anuaItem,
        onPress: () =>
          useAnuaChatStore.getState().open({
            chakraDayOverride: contextChakraDay ?? undefined,
          }),
      }
      return [previewItem, chakras101Item, anuaWaitingRoomItem, notesItem]
    }

    if (!hasLifetimeAccess) {
      // Trial (not waiting room): Sanctuary → CommunityHalls, Anua → chat, Notes, Tribe + arrow (all go directly)
      return [sanctuaryItem, anuaItem, notesItem, tribeItem]
    }

    // Lifetime: Music, Sanctuary, Anua, Notes, Tribe, Gallery
    return [
      {
        id: "music",
        iconComponent: "audio",
        label: "Music",
        route: "/(chakras)/AudioLibrary",
        isActive: getIsActive("/(chakras)/AudioLibrary"),
        gradient: MENU_ITEM_CONFIG.audio.gradient,
        pulseDelay: MENU_ITEM_CONFIG.audio.pulseDelay,
        geometryIcon: MENU_ITEM_CONFIG.audio.geometryIcon,
      },
      sanctuaryItem,
      anuaItem,
      notesItem,
      tribeItem,
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
  }, [pathname, hasLifetimeAccess, isWaitingScreenVisible, waitingRoomActions])

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

  const isTrialChakraHomeRoute =
    Boolean(pathname?.includes("ChakraHome")) ||
    (segments as string[]).includes("ChakraHome")

  /** Trial: chevron on waiting room or ChakraHome dashboard only (gated). */
  const showTrialMenuToggleArrow =
    !hasLifetimeAccess &&
    (isWaitingScreenVisible ||
      (isTrialChakraHomeRoute && !useVerticalLayout && !isWaitingScreenVisible))

  /** Lifetime: standard expand/collapse chevron on ChakraHub and ChakraHome (horizontal bar). */
  const showLifetimeMenuToggleArrow =
    hasLifetimeAccess &&
    !useVerticalLayout &&
    (Boolean(pathname?.includes("ChakraHub")) ||
      Boolean(pathname?.includes("ChakraHome")))

  const showMenuToggleArrow =
    showTrialMenuToggleArrow || showLifetimeMenuToggleArrow

  // Goodbye modal open: hide so menu bar doesn't block modal touches
  if (isGoodbyeVisible) {
    return null
  }

  // Sacred void: no menu layer during JS splash / somatic fade-in (Android arrival polish)
  if (splashOverlayActive) {
    return null
  }

  // Hide menu bar on WelcomeScreen, DateSelection, and index (stillness) only. ChakraHome and ChakraHub SHOW the menu bar.
  const isWelcomeScreen =
    pathname === "/(chakras)" ||
    pathname === "/(chakras)/" ||
    pathname === "/(chakras)/index" ||
    pathname === "/" ||
    pathname?.includes("/WelcomeScreen") ||
    pathname?.includes("WelcomeScreen") ||
    segments.includes("WelcomeScreen")

  // EARLY RETURN - Hide on onboarding/selection/stillness only (NOT ChakraHome, NOT ChakraHub)
  if (
    segments.includes("DateSelection") ||
    pathname?.includes("/DateSelection") ||
    pathname?.includes("DateSelection") ||
    isWelcomeScreen ||
    pathname === "/"
  ) {
    return null
  }

  // Hide menu bar on paywall (all variants), Energy Exchange, Tribe Chat, AudioPlayer, Anua Chat, CommunityHalls, Notes Along the Way, and GiftChakra
  if (
    pathname?.includes("CommitmentGate") ||
    pathname?.includes("Paywall") ||
    pathname?.includes("EnergyExchange") ||
    pathname?.includes("TribeChat") ||
    pathname?.includes("AudioPlayer") ||
    pathname?.includes("CommunityHalls") ||
    pathname?.includes("NotesAlongTheWay") ||
    pathname?.includes("AnuaChat") ||
    pathname?.includes("GiftChakra") ||
    pathname === "AnuaChat" ||
    segments.includes("EnergyExchange") ||
    segments.includes("AudioPlayer") ||
    segments.includes("AnuaChat") ||
    segments.includes("NotesAlongTheWay") ||
    segments.includes("GiftChakra") ||
    (segments.length > 0 && segments[segments.length - 1] === "AnuaChat") ||
    (segments.length > 0 && segments[segments.length - 1] === "GiftChakra")
  ) {
    return null
  }

  // Lifetime user viewing trial waiting room: no menu bar (they have "Exit course mode" / return to lifetime).
  if (isWaitingScreenVisible && hasLifetimeAccess) {
    return null
  }

  const waitingRoomBarStyle =
    isWaitingScreenVisible &&
    !hasLifetimeAccess &&
    Platform.OS === "android"
      ? { elevation: 24, zIndex: 9999 }
      : undefined

  /** Trial 4-icon bottom bar (ChakraHome, etc.) — not waiting room, not vertical healing layout. */
  const isTrialMainHorizontalBar =
    !hasLifetimeAccess &&
    !isWaitingScreenVisible &&
    !useVerticalLayout

  return (
    <View
      style={[{ opacity: 1 }, waitingRoomBarStyle]}
      pointerEvents="box-none"
      collapsable={false}
    >
      {/* Menu Bar - Vertical (left wall) for healing screens, Horizontal (bottom) for others */}
      {useVerticalLayout ? (
        <Animated.View
          style={[
            styles.verticalContainer,
            {
              top: Math.max(insets.top, 8) + 60,
              bottom: Math.max(insets.bottom, 8) + 60,
            },
          ]}
        >
          {menuItems.map((item) => (
            <MenuBarItem
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item)}
              isVertical={true}
            />
          ))}
        </Animated.View>
      ) : (
        <>
          <Animated.View
            style={[
              styles.container,
              { paddingBottom: Math.max(insets.bottom, 4) },
              animatedMenuStyle,
              // Trial waiting room: center row (full width inside waitingRoomMenuRow). Trial ChakraHome: centered cluster (not edge-to-edge). Lifetime: space-between.
              isWaitingScreenVisible && !hasLifetimeAccess
                ? { justifyContent: "center" as const }
                : isTrialMainHorizontalBar
                  ? {
                      justifyContent: "center" as const,
                      gap: TRIAL_CHAKRA_HOME_ICON_GAP,
                    }
                  : { justifyContent: "space-between" as const },
              showMenuToggleArrow
                ? { paddingRight: MENU_BAR_PADDING_RIGHT_WITH_TOGGLE }
                : { paddingRight: MENU_BAR_PADDING_RIGHT_DEFAULT },
            ]}
          >
            {isWaitingScreenVisible && !hasLifetimeAccess ? (
              <View style={styles.waitingRoomMenuRow}>
                {menuItems.map((item) => (
                  <MenuBarItem
                    key={item.id}
                    item={item}
                    onPress={() => handleItemPress(item)}
                    isVertical={false}
                    waitingRoomSlot
                  />
                ))}
              </View>
            ) : (
              <>
                {menuItems.map((item) => (
                  <MenuBarItem
                    key={item.id}
                    item={item}
                    onPress={() => handleItemPress(item)}
                    isVertical={false}
                    trialChakraHomeCluster={isTrialMainHorizontalBar}
                  />
                ))}
              </>
            )}
          </Animated.View>
        </>
      )}

      {/* Mini player - above Music icon, stays when menu toggles closed */}
      <MenuBarMiniPlayer />

      {/* Trial: gated chevron. Lifetime: chevron on ChakraHub / ChakraHome horizontal bar. */}
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
  const labelOpacity = useSharedValue(0.5)
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
      labelOpacity.value = withTiming(0.5, {
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
              borderWidth: 1,
              borderColor: item.isActive
                ? item.gradient[0]
                : `${item.gradient[0]}40`,
              backgroundColor: item.isActive
                ? `${item.gradient[0]}18`
                : `${item.gradient[0]}0a`,
              shadowColor: item.gradient[0],
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: item.isActive ? 0.35 : 0.15,
              shadowRadius: item.isActive ? 6 : 4,
              elevation: item.isActive ? 4 : 2,
            },
          ]}
        >
          {/* Gradient glow for active state */}
          {item.isActive && (
            <LinearGradient
              colors={item.gradient as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            />
          )}

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
                color={
                  item.isActive ? item.gradient[0] : "rgba(135, 174, 115, 0.9)"
                }
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
                color={item.isActive ? item.gradient[0] : "rgba(252, 211, 77, 0.9)"}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 4,
    position: "relative",
    overflow: "visible", // Changed to visible so geometry icons show properly
    zIndex: 0, // Base layer
    // Ensure container doesn't clip geometry
    padding: 4, // Add padding so geometry can extend beyond
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
