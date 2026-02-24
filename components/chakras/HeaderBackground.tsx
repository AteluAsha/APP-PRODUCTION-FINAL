import { PropsWithChildren } from "react"
import { ImageBackground, Image, ImageSourcePropType } from "react-native"

type HeaderBackgroundProps = PropsWithChildren<{
  backgroundSource: ImageSourcePropType
  chakraImageSource: ImageSourcePropType
  chakraImageSizePx: number
}>
export const HeaderBackground = ({
  backgroundSource,
  chakraImageSource,
  chakraImageSizePx,
}: HeaderBackgroundProps) => {
  return (
    <ImageBackground
      source={backgroundSource}
      className={`w-full aspect-square object-cover self-center z-10`}
    >
      <Image
        source={chakraImageSource}
        className={`object-fill self-center mt-16 z-10`}
        style={{ width: chakraImageSizePx, height: chakraImageSizePx }}
      />
    </ImageBackground>
  )
}
