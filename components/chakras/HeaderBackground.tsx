import { PropsWithChildren, useEffect, useState } from "react"
import {
  View,
  ImageBackground,
  Image,
  ImageSourcePropType,
} from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { Chakra } from "@/types/chakras/Chakra"
import { SOMATIC_HERO_IMAGE_FADE_MS } from "@/constants/layout"

/** Default orb distance from top; Throat (Day 5) uses more so orb sits at throat, not over face. */
const DEFAULT_CHAKRA_ORB_MARGIN_TOP = 64
/** Throat: moved down so blue orb sits at throat on hero image, not on chin (Android). */
const THROAT_CHAKRA_ORB_MARGIN_TOP = 308

/** Throat header: shift background right so model isn't stacked under orb (crop left, show more right). */
const THROAT_HEADER_IMAGE_SHIFT_RIGHT_PX = 28

type HeaderBackgroundProps = PropsWithChildren<{
  backgroundSource: ImageSourcePropType
  chakraImageSource: ImageSourcePropType
  chakraImageSizePx: number
  headerHeight: number
  chakra?: Chakra
}>
export const HeaderBackground = ({
  backgroundSource,
  chakraImageSource,
  chakraImageSizePx,
  headerHeight,
  chakra,
}: HeaderBackgroundProps) => {
  const marginTop =
    chakra === Chakra.THROAT ? THROAT_CHAKRA_ORB_MARGIN_TOP : DEFAULT_CHAKRA_ORB_MARGIN_TOP
  const isThroat = chakra === Chakra.THROAT

  const [bgLoaded, setBgLoaded] = useState(false)
  const [orbLoaded, setOrbLoaded] = useState(false)
  const headerOpacity = useSharedValue(0)
  const headerFadeStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }))

  useEffect(() => {
    setBgLoaded(false)
    setOrbLoaded(false)
    headerOpacity.value = 0
  }, [backgroundSource, chakraImageSource, headerOpacity])

  useEffect(() => {
    if (bgLoaded && orbLoaded) {
      headerOpacity.value = withTiming(1, { duration: SOMATIC_HERO_IMAGE_FADE_MS })
    }
  }, [bgLoaded, orbLoaded, headerOpacity])

  const backgroundImage = (
    <ImageBackground
      source={backgroundSource}
      style={{
        width: isThroat
          ? headerHeight + THROAT_HEADER_IMAGE_SHIFT_RIGHT_PX * 2
          : "100%",
        height: headerHeight,
        marginLeft: isThroat ? -THROAT_HEADER_IMAGE_SHIFT_RIGHT_PX : undefined,
      }}
      resizeMode="cover"
      onLoadEnd={() => setBgLoaded(true)}
    >
      <Image
        source={chakraImageSource}
        style={{
          width: chakraImageSizePx,
          height: chakraImageSizePx,
          alignSelf: "center",
          marginTop,
        }}
        resizeMode="contain"
        onLoad={() => setOrbLoaded(true)}
      />
    </ImageBackground>
  )

  const wrapped = (
    <Animated.View style={headerFadeStyle}>
      {backgroundImage}
    </Animated.View>
  )

  if (isThroat) {
    return (
      <View style={{ width: "100%", height: headerHeight, overflow: "hidden" }}>
        {wrapped}
      </View>
    )
  }
  return wrapped
}
