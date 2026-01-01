import React from "react"
import { View, Pressable } from "react-native"
import { tv } from "tailwind-variants"
import { AppText } from "@/components/AppText"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import { useShallow } from "zustand/react/shallow"

export enum DisplayMode {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
  INTEGRATED = "integrated",
}

interface DeveloperToolsProps {
  showDevTools: boolean
  toggleDevTools: () => void
  currentDay: number
  onChangeDay: () => void
  toggleWaitingScreen: () => void
  displayMode: DisplayMode
  setDisplayMode: (mode: DisplayMode) => void
  resetFirstLaunch?: () => void
}

// Define variants
const simulateButtonTextVariants = tv({
  base: "text-sm text-center",
  variants: {
    disabled: {
      true: "text-gray-500",
      false: "text-white",
    },
  },
})

export const DeveloperTools: React.FC<DeveloperToolsProps> = ({
  showDevTools,
  toggleDevTools,
  currentDay,
  onChangeDay,
  toggleWaitingScreen,
  displayMode,
  setDisplayMode,
  resetFirstLaunch,
}) => {
  const {
    journeyStarted,
    journeyWeekStartDate,
    allChakrasCompleted,
    completedChakras,
    _setAllCompleted,
    setJourneyWeekStartDate,
    resetJourney: storeResetJourney,
    clearAllCompleted,
  } = useChakraJourneyStore(
    useShallow((state) => ({
      journeyStarted: state.journeyStarted,
      journeyWeekStartDate: state.journeyWeekStartDate,
      allChakrasCompleted: state.allChakrasCompleted,
      completedChakras: state.completedChakras,
      _setAllCompleted: state._setAllCompleted,
      setJourneyWeekStartDate: state.setJourneyWeekStartDate,
      resetJourney: state.resetJourney,
      clearAllCompleted: state.clearAllCompleted,
    })),
  )

  // Map day index to name
  const getDayName = (dayIndex: number): string => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]
    return days[dayIndex]
  }

  // Get next display mode in rotation
  const getNextDisplayMode = (current: DisplayMode): DisplayMode => {
    switch (current) {
      case DisplayMode.HORIZONTAL:
        return DisplayMode.INTEGRATED
      case DisplayMode.VERTICAL:
        return DisplayMode.HORIZONTAL
      case DisplayMode.INTEGRATED:
        return DisplayMode.VERTICAL
      default:
        return DisplayMode.VERTICAL
    }
  }

  // Format display mode for display
  const formatDisplayMode = (mode: DisplayMode): string => {
    switch (mode) {
      case DisplayMode.HORIZONTAL:
        return "Horizontal"
      case DisplayMode.VERTICAL:
        return "Vertical Stack"
      case DisplayMode.INTEGRATED:
        return "Integrated"
      default:
        return "Unknown"
    }
  }

  const handleSimulateWeekTransition = () => {
    if (journeyWeekStartDate) {
      const currentStartDate = new Date(journeyWeekStartDate)
      const pastDate = new Date(
        currentStartDate.setDate(currentStartDate.getDate() - 7),
      )
      const pastDateISO = pastDate.toISOString().split("T")[0]
      setJourneyWeekStartDate(pastDateISO)
      console.log(
        `Simulating week transition: Set start date to ${pastDateISO}`,
      )
    }
  }

  const handleFullReset = () => {
    // console.log('[DevTools] handleFullReset: Calling storeResetJourney... Current store state:', { ... })
    storeResetJourney() // Call the store's full reset
    _setAllCompleted(false) // Ensure permanent completion is also reset
    // console.log('[DevTools] handleFullReset: Reset actions called.')
  }

  return (
    <>
      {/* Developer tools toggle button - always visible */}
      <Pressable
        onPress={toggleDevTools}
        className="absolute top-8 right-4 z-10 px-3 py-2 bg-gray-800/70 rounded-lg border border-gray-700"
      >
        <AppText font="koh-santepheap" size="sm">
          {showDevTools ? "Hide Developer Tools" : "Show Developer Tools"}
        </AppText>
      </Pressable>

      {/* Developer tools panel - conditionally visible */}
      {showDevTools && (
        <View className="absolute top-20 right-4 z-10 p-4 bg-gray-800/80 rounded-lg border border-gray-600 min-w-[220px]">
          <AppText
            font="koh-santepheap"
            size="base"
            className="mb-3 text-center"
          >
            Developer Tools
          </AppText>

          {/* Current State Display */}
          <View className="mb-3 p-2 bg-black/20 rounded">
            <AppText
              font="instrument-regular"
              size="xs"
              className="mb-1 text-gray-400"
            >
              Store State:
            </AppText>
            <AppText font="instrument-regular" size="xs">
              Started: {journeyStarted ? "Yes" : "No"}
            </AppText>
            <AppText font="instrument-regular" size="xs">
              Week Start: {journeyWeekStartDate ?? "N/A"}
            </AppText>
            <AppText font="instrument-regular" size="xs">
              Completed #: {completedChakras.length}
            </AppText>
            <AppText font="instrument-regular" size="xs">
              All Done: {allChakrasCompleted ? "Yes" : "No"}
            </AppText>
          </View>

          {/* Day Override */}
          <View className="mb-3">
            <AppText font="koh-santepheap" size="xs" className="mb-1">
              Current Day Override: {getDayName(currentDay)}
            </AppText>
            <Pressable
              onPress={onChangeDay}
              className="bg-blue-500/30 py-2 px-4 rounded-md"
            >
              <AppText font="koh-santepheap" size="sm" className="text-center">
                Next Day
              </AppText>
            </Pressable>
          </View>

          {/* Display Mode */}
          <View className="mb-3">
            <AppText font="koh-santepheap" size="xs" className="mb-1">
              Display Mode: {formatDisplayMode(displayMode)}
            </AppText>
            <Pressable
              onPress={() => setDisplayMode(getNextDisplayMode(displayMode))}
              className="bg-blue-500/30 py-2 px-4 rounded-md"
            >
              <AppText font="koh-santepheap" size="sm" className="text-center">
                Change Display Mode
              </AppText>
            </Pressable>
          </View>

          {/* Journey Simulation Controls */}
          <View className="mb-3">
            <AppText font="koh-santepheap" size="xs" className="mb-1">
              Journey Simulation:
            </AppText>
            <Pressable
              onPress={toggleWaitingScreen}
              className="bg-purple-500/30 py-2 px-4 rounded-md mb-2"
            >
              <AppText font="koh-santepheap" size="sm" className="text-center">
                Toggle Waiting Screen
              </AppText>
            </Pressable>
            <Pressable
              onPress={handleSimulateWeekTransition}
              className="bg-purple-500/30 py-2 px-4 rounded-md mb-2"
              disabled={!journeyWeekStartDate}
            >
              <AppText
                font="koh-santepheap"
                className={simulateButtonTextVariants({
                  disabled: !journeyWeekStartDate,
                })}
              >
                Simulate Week Transition
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => _setAllCompleted(!allChakrasCompleted)}
              className="bg-purple-500/30 py-2 px-4 rounded-md mb-2"
            >
              <AppText
                font="koh-santepheap"
                className={simulateButtonTextVariants({ disabled: false })}
              >
                Toggle All Completed Flag
              </AppText>
            </Pressable>
            {/* Reset Options */}
            <View className="mb-3">
              <AppText
                font="koh-santepheap"
                className="text-white text-xs mb-1"
              >
                Reset Options:
              </AppText>
              {resetFirstLaunch && (
                <Pressable
                  onPress={resetFirstLaunch}
                  className="bg-orange-500/30 py-2 px-4 rounded-md mb-2"
                >
                  <AppText
                    font="koh-santepheap"
                    className={simulateButtonTextVariants({ disabled: false })}
                  >
                    Show Welcome Modal
                  </AppText>
                </Pressable>
              )}
              <Pressable
                onPress={clearAllCompleted}
                className="bg-red-500/30 py-2 px-4 rounded-md mb-2"
              >
                <AppText
                  font="koh-santepheap"
                  className={simulateButtonTextVariants({ disabled: false })}
                >
                  Clear Weekly Completions
                </AppText>
              </Pressable>
              <Pressable
                onPress={handleFullReset}
                className="bg-red-800/30 py-2 px-4 rounded-md"
              >
                <AppText
                  font="koh-santepheap"
                  className={simulateButtonTextVariants({ disabled: false })}
                >
                  Full Journey Reset
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </>
  )
}
