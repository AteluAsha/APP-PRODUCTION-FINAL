import React, { useState } from "react"
import { ImageSourcePropType, Image, StyleProp, ImageStyle } from "react-native"

interface ResponsiveImageProps {
  source: ImageSourcePropType
  width: number
  className?: string
  style?: StyleProp<ImageStyle>
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  source,
  width,
  className,
  style,
}) => {
  const [aspectRatio, setAspectRatio] = useState(1) // Default aspect ratio

  return (
    <Image
      source={source}
      resizeMode="contain"
      style={[
        {
          width: width,
          height: width / aspectRatio,
        },
        style,
      ]}
      onLoad={(event) => {
        // Safely get image dimensions from the loaded event
        const source = event.nativeEvent?.source
        if (source && source.width && source.height) {
          const { width: imgWidth, height: imgHeight } = source
          setAspectRatio(imgWidth / imgHeight) // Update aspect ratio
        }
      }}
    />
  )
}

export default ResponsiveImage
