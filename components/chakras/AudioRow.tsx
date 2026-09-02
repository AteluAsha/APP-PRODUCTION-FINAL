import React, { useRef, useState } from "react"
import {
  Pressable,
  View,
  ActivityIndicator,
  ImageBackground,
  Platform,
} from "react-native"
import { usePathname } from "expo-router"
import { FontAwesome } from "@expo/vector-icons"
import { AppText } from "@/components/AppText"
import { getMinutesString } from "@/utils/format"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import BackgroundOpacity from "../BackgroundOpacity"
import { useEmbodimentDurationCacheStore } from "@/hooks/useEmbodimentDurationCacheStore"
import { useCurrentAudioStore } from "@/hooks/useCurrentAudioStore"
import { VaultDownloadLine } from "@/components/chakras/VaultDownloadLine"
import {
  playSanctuaryTrack,
  prepareSanctuaryTrack,
  type SanctuaryPlaybackRequest,
} from "@/utils/sanctuaryPlayback"
import { showHealingToast } from "@/utils/healingToast"
import { useSanctuaryTrackReady } from "@/hooks/useSanctuaryTrackReady"
import {
    SANCTUARY_READY_BORDER,
    SANCTUARY_IDLE_BORDER,
    SANCTUARY_READY_GLOW,
    SANCTUARY_IDLE_GLOW,
} from "@/constants/audioUi"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"
import { MasterMeditationWelcomeModal } from "@/components/chakras/MasterMeditationWelcomeModal"
import { shouldShowMasterMeditationWelcome } from "@/constants/masterMeditationWelcome"

const WELCOME_OPEN_PLAYER_DELAY_MS = Platform.OS === "android" ? 360 : 80

export const AudioRow = ({
  title,
  author,
  durationMs,
  authorColor = "#FFFFFF",
  isIntroAudio = false,
  chakraColor,
  rightContent,
  disabled = false,
  embodimentCacheKey,
  onPlayTriggered,
}: {
  title: string
  author: string
  durationMs: number
  authorColor: string
  isIntroAudio?: boolean
  chakraColor?: string
  rightContent?: React.ReactNode
  disabled?: boolean
  embodimentCacheKey?: string
  onPlayTriggered?: () => void
}) => {
  const [isPreparing, setIsPreparing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [welcomeVisible, setWelcomeVisible] = useState(false)
  const openingAfterWelcomeRef = useRef(false)
  const isReady = useSanctuaryTrackReady(embodimentCacheKey)
  const hasSeenMasterMeditationWelcome = useFirstLaunchStore(
    (s) => s.hasSeenMasterMeditationWelcome,
  )
  const markMasterMeditationWelcomeSeen = useFirstLaunchStore(
    (s) => s.markMasterMeditationWelcomeSeen,
  )
  const offerWelcome = shouldShowMasterMeditationWelcome(
    embodimentCacheKey,
    hasSeenMasterMeditationWelcome,
  )
  const mountWelcomeModal =
    embodimentCacheKey != null &&
    shouldShowMasterMeditationWelcome(embodimentCacheKey, false)
  const pathname = usePathname()

  const buildPlaybackRequest = (): SanctuaryPlaybackRequest | null => {
    if (!embodimentCacheKey) return null
    return {
      audioId: embodimentCacheKey,
      title,
      author,
      durationMs,
      chakraColor,
      isIntroAudio,
      returnPath: pathname,
    }
  }

  const startPlayback = () => {
    onPlayTriggered?.()
    setLoadError(null)
    const opts = buildPlaybackRequest()
    if (!opts) return
    showHealingToast("gatheringPresence")
    useEmbodimentDurationCacheStore
      .getState()
      .setEmbodimentDurationCacheKey(opts.audioId)
    setIsPreparing(true)
    void playSanctuaryTrack(opts).finally(() => setIsPreparing(false))
  }

  const onMainPress = () => {
    if (disabled || isPreparing) return
    if (offerWelcome) {
      addHapticFeedback(HapticStrength.Light)
      showHealingToast("gatheringPresence")
      setWelcomeVisible(true)
      const opts = buildPlaybackRequest()
      if (opts && !isReady) {
        prepareSanctuaryTrack(opts)
      }
      return
    }
    addHapticFeedback(HapticStrength.Light)
    startPlayback()
  }

  const finishWelcome = () => {
    markMasterMeditationWelcomeSeen()
    setWelcomeVisible(false)
    if (openingAfterWelcomeRef.current) return
    openingAfterWelcomeRef.current = true
    setTimeout(() => {
      const opts = buildPlaybackRequest()
      const store = useCurrentAudioStore.getState()
      if (
        opts &&
        store.fullPlayerTrackId === opts.audioId &&
        store.source &&
        store.audioOrigin === "full-player"
      ) {
        openingAfterWelcomeRef.current = false
        return
      }
      startPlayback()
      openingAfterWelcomeRef.current = false
    }, WELCOME_OPEN_PLAYER_DELAY_MS)
  }

  return (
    <>
    <Pressable
      style={{
        width: "92%",
        alignSelf: "center",
        marginTop: 24,
        borderWidth: 2.5,
        borderColor: isReady ? SANCTUARY_READY_BORDER : SANCTUARY_IDLE_BORDER,
        borderRadius: 18,
        overflow: "hidden",
        opacity: disabled || isPreparing ? 0.72 : 1,
        shadowColor: isReady ? SANCTUARY_READY_GLOW : SANCTUARY_IDLE_GLOW,
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 6,
      }}
      onPress={onMainPress}
      disabled={disabled || isPreparing}
      accessibilityLabel={`Play ${title}`}
      accessibilityHint="Opens full-screen audio player"
    >
      <ImageBackground
        source={require("@/assets/images/colorbar.png")}
        style={{
          minHeight: 108,
          width: "100%",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
        imageStyle={{ resizeMode: "cover" }}
      >
        <BackgroundOpacity backgroundOpacity={0.32} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            paddingLeft: 24,
            paddingRight: rightContent ? 8 : 18,
            paddingVertical: 18,
          }}
        >
          <View
            style={{
              borderWidth: 2.5,
              borderColor: isReady ? SANCTUARY_READY_BORDER : "#ffffff",
              borderRadius: 26,
              width: 52,
              height: 52,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.28)",
            }}
          >
            {isPreparing || disabled ? (
              <ActivityIndicator size="small" color="rgba(255,255,255,0.9)" />
            ) : (
              <FontAwesome
                name="play"
                size={22}
                color="white"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <AppText
              font="instrument-medium"
              size="lg"
              style={{ marginBottom: 2, color: "#ffffff" }}
            >
              {title}
            </AppText>
            <AppText font="instrument-italic" size="sm">
              <AppText
                font="instrument-italic"
                size="base"
                style={{ color: authorColor }}
              >
                with {author}
              </AppText>{" "}
              - {getMinutesString(durationMs)}
            </AppText>
            <VaultDownloadLine audioId={embodimentCacheKey} />
            {loadError ? (
              <AppText
                font="instrument-regular"
                size="xs"
                style={{
                  marginTop: 6,
                  color: "rgba(255, 200, 100, 0.95)",
                }}
              >
                {loadError}
              </AppText>
            ) : null}
          </View>
          {rightContent != null ? <View>{rightContent}</View> : null}
        </View>
      </ImageBackground>
    </Pressable>
    {mountWelcomeModal ? (
      <MasterMeditationWelcomeModal
        visible={welcomeVisible}
        onBegin={finishWelcome}
        onDismiss={finishWelcome}
      />
    ) : null}
    </>
  )
}
