import React, { useState } from "react"
import { ImageBackground, ImageSourcePropType, StyleProp, ViewStyle } from "react-native"

interface ResponsiveImageBackgroundProps {
  children: React.ReactNode
  source: ImageSourcePropType
  width: number
  className?: string
  style?: StyleProp<ViewStyle>
}

const ResponsiveImageBackground: React.FC<ResponsiveImageBackgroundProps> = ({
  source,
  width,
  children,
  className,
  style,
}) => {
  const [aspectRatio, setAspectRatio] = useState(1) // Default aspect ratio

  return (
    <ImageBackground
      source={source}
      style={[
        {
          width: width,
          height: width / aspectRatio,
        },
        style,
      ]}
      onLoad={(event) => {
        const { width: imgWidth, height: imgHeight } = event.nativeEvent.source
        setAspectRatio(imgWidth / imgHeight) // Update the aspect ratio dynamically
      }}
    >
      {children}
    </ImageBackground>
  )
}

export default ResponsiveImageBackground
