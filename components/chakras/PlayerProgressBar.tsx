import { View } from "react-native"
import { Slider } from "react-native-awesome-slider"
import {
  useSharedValue,
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated"
import { formatTime } from "@/utils/format"
import { AppText } from "../AppText"

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
})

export const PlayerProgressBar = ({
  positionMs,
  durationMs,
  seekToPosition,
}: {
  positionMs: number
  durationMs: number
  seekToPosition: (newPositionMs: number) => Promise<void>
}) => {
  const isSliding = useSharedValue(false)
  const progress = useSharedValue(0)
  const min = useSharedValue(0)
  const max = useSharedValue(1)

  // Determine if duration is valid for progress calculation
  const isValidDuration = durationMs > 0

  // Update progress only if duration is valid and not currently sliding
  if (isValidDuration && !isSliding.value) {
    progress.value = positionMs / durationMs
  } else if (!isValidDuration) {
    // Reset progress if duration becomes invalid
    progress.value = 0
  }

  return (
    <View className={`flex-row items-center mb-6 w-full`}>
      {/* Container for the slider/static bar - occupy same space */}
      <View className="flex-1 h-4 justify-center">
        {isValidDuration ? (
          <Slider
            progress={progress}
            minimumValue={min}
            maximumValue={max}
            containerStyle={{
              height: 3,
              borderRadius: 16,
            }}
            thumbWidth={0}
            renderBubble={() => null}
            theme={{
              minimumTrackTintColor: "#ffffff",
              maximumTrackTintColor: "#6b7280",
            }}
            onSlidingStart={() => (isSliding.value = true)}
            onValueChange={async (value) => {
              // Prevent seeking if duration is somehow invalid during change
              if (!isValidDuration) return
              await seekToPosition(value * durationMs)
            }}
            onSlidingComplete={async (value) => {
              // if the user is not sliding, we should not update the position
              if (!isSliding.value) return
              isSliding.value = false

              // Prevent seeking if duration is somehow invalid on complete
              if (!isValidDuration) return
              await seekToPosition(value * durationMs)
            }}
          />
        ) : (
          // Render a static bar when duration is invalid
          <View className="h-[3px] bg-[#6b7280] rounded-full" />
        )}
      </View>

      <AppText
        font="instrument-medium"
        size="sm"
        style={{
          marginLeft: 8,
          width: 48,
          textAlign: "right",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {isValidDuration ? formatTime(positionMs) : "0:00"}
      </AppText>
    </View>
  )
}
