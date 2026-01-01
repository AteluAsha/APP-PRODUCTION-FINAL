import React, { useState } from "react"
import { ImageBackground, ImageSourcePropType } from "react-native"

interface ResponsiveImageBackgroundProps {
  children: React.ReactNode
  source: ImageSourcePropType
  width: number
  className?: string
}

const ResponsiveImageBackground: React.FC<ResponsiveImageBackgroundProps> = ({
  source,
  width,
  children,
  className,
}) => {
  const [aspectRatio, setAspectRatio] = useState(1) // Default aspect ratio

  return (
    <ImageBackground
      source={source}
      style={{
        width: width, // Fixed width
        height: width / aspectRatio,
      }}
      className={className}
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
