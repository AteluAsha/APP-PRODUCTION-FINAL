import React from "react"
import { View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

interface BackgroundOpacityProps {
  backgroundOpacity: number
  topGradientHeight?: number
  bottomGradientHeight?: number
}

const BackgroundOpacity = ({
  backgroundOpacity,
  topGradientHeight = 0,
  bottomGradientHeight = 0,
}: BackgroundOpacityProps) => {
  return (
    <>
      {/* Top Gradient — pointerEvents box-none so overlays never block button taps */}
      {topGradientHeight > 0 && (
        <LinearGradient
          pointerEvents="box-none"
          colors={["#000000", "transparent"]}
          style={{
            position: "absolute",
            top: 0,
            height: topGradientHeight,
            width: "100%",
          }}
        />
      )}

      {/* Bottom Gradient */}
      {bottomGradientHeight > 0 && (
        <LinearGradient
          pointerEvents="box-none"
          colors={["transparent", "#000000"]}
          style={{
            position: "absolute",
            bottom: 0,
            height: bottomGradientHeight,
            width: "100%",
          }}
        />
      )}

      {/* Background Opacity Overlay — box-none so taps pass through to buttons */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
        }}
      />
    </>
  )
}

export default BackgroundOpacity
