import { PropsWithChildren } from "react"
import { ImageBackground, Image, ImageSourcePropType, View } from "react-native"

/** Subtle dark overlay on hero images so overexposed/bright assets render with consistent tone (all 7 days) */
const HERO_OVERLAY_OPACITY = 0.18

type HeaderBackgroundProps = PropsWithChildren<{
  backgroundSource: ImageSourcePropType
  chakraImageSource: ImageSourcePropType
  chakraImageSizePx: number
  /** Hero height - keeps ImageBackground dimensions for reliable iOS render */
  height?: number
}>
export const HeaderBackground = ({
  backgroundSource,
  chakraImageSource,
  chakraImageSizePx,
  height = 400,
}: HeaderBackgroundProps) => {
  return (
    <ImageBackground
      source={backgroundSource}
      resizeMode="cover"
      style={{
        width: "100%",
        height,
        justifyContent: "flex-start",
        alignItems: "center",
      }}
      onError={(e) => {
        if (__DEV__) {
          console.warn(
            "[HeaderBackground] Hero background image failed to load:",
            e.nativeEvent.error,
          )
        }
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `rgba(0, 0, 0, ${HERO_OVERLAY_OPACITY})`,
        }}
      />
      <Image
        source={chakraImageSource}
        resizeMode="contain"
        style={{
          width: chakraImageSizePx,
          height: chakraImageSizePx,
          marginTop: 64,
        }}
        onError={(e) => {
          if (__DEV__) {
            console.warn(
              "[HeaderBackground] Chakra image failed to load:",
              e.nativeEvent.error,
            )
          }
        }}
      />
    </ImageBackground>
  )
}
