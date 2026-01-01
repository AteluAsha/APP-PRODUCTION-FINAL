import { View, ScrollView, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import PulsingButton from "@/components/chakras/PulsingButton"
import { useEffect, useState, useMemo, useCallback } from "react"
import { AppText } from "@/components/AppText"
import { useRouter } from "expo-router"
import { useCompletedChakraStore } from "@/hooks/useCompletedChakraStore"
import GoodbyeModal from "@/components/chakras/GoodbyeModal"
import { getChakraIndex } from "@/utils/chakraMapping"
import {
  getCurrentDayOfWeek,
  getCurrentWeekStartDateISO,
  hasReachedCourseStartDate,
} from "@/utils/date"
import { WaitingScreen } from "@/components/chakras/WaitingScreen"
import { useChakraJourneyStore } from "@/hooks/useChakraJourneyStore"
import {
  DeveloperTools,
  DisplayMode,
} from "@/components/chakras/DeveloperTools"
import { PreviewJourney } from "@/components/chakras/PreviewJourney"
import { DayProgressIndicator } from "@/components/chakras/DayProgressIndicator"
import { ChakraStackIndicator } from "@/components/chakras/ChakraStackIndicator"
import { IntegratedProgressStack } from "@/components/chakras/IntegratedProgressStack"
import { WelcomeModal } from "@/components/chakras/WelcomeModal"
import { useFirstLaunchStore } from "@/hooks/useFirstLaunchStore"
import { useShallow } from "zustand/react/shallow"
import { useChakrasData } from "@/hooks/useChakrasData"
import { CommitmentGate } from "@/components/chakras/CommitmentGate"
import { speakAsAnua, ANUA_FIRST_VOW, isElevenLabsAvailable } from "@/src/services/elevenlabs"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { AnuaLogo } from "@/components/anua/AnuaLogo"
import {
    shouldBypassTimegate,
    shouldAutoStartJourney,
    shouldShowWaitingScreen as shouldShowWaitingScreenCheck,
    isChakraDayAccessible,
    getGlobalDevMode,
    setGlobalDevMode,
} from "@/src/services/timegate"
import { DevOverrideSystem } from "@/components/chakras/DevOverrideSystem"

// Infer the state type from the store hook
type ChakraJourneyState = ReturnType<(typeof useChakraJourneyStore)["getState"]>

export const ChakraHome = () => {
  // Memoize expensive date calculations - these don't change during component lifecycle
  const realDayOfWeek = useMemo(() => getCurrentDayOfWeek(), [])
  const currentWeekStartDate = useMemo(() => getCurrentWeekStartDateISO(), [])

  // State for the day we're displaying, initialized with the real day
  // This allows the Developer Tools to override the displayed day for testing.
  const [currentDay, setCurrentDay] = useState(realDayOfWeek)

  // Get journey store state and actions
  const {
    journeyStarted,
    startJourney,
    markChakraCompleted,
    hasCompletedChakra,
    hasEverCompletedChakra,
    hasParticipatedDay,
    initialOpenDate,
    courseStartDate,
    setInitialOpenDate,
    completedTrialCourses,
    hasLifetimeAccess,
    allChakrasCompleted,
    completedChakras,
  } = useChakraJourneyStore(
    useShallow((state: ChakraJourneyState) => ({
      journeyStarted: state.journeyStarted,
      startJourney: state.startJourney,
      markChakraCompleted: state.markChakraCompleted,
      hasCompletedChakra: state.hasCompletedChakra,
      hasEverCompletedChakra: state.hasEverCompletedChakra,
      hasParticipatedDay: state.hasParticipatedDay,
      initialOpenDate: state.initialOpenDate,
      courseStartDate: state.courseStartDate,
      setInitialOpenDate: state.setInitialOpenDate,
      completedTrialCourses: state.completedTrialCourses,
      hasLifetimeAccess: state.hasLifetimeAccess,
      allChakrasCompleted: state.allChakrasCompleted,
      completedChakras: state.completedChakras,
    })),
  )

  // Get first launch state
  const { isFirstLaunch, setFirstLaunchComplete, resetForTesting } =
    useFirstLaunchStore()

  // State for welcome modal
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  // Whether to show waiting screen (show if not Monday and journey not started)
  const [showWaitingScreen, setShowWaitingScreen] = useState(false)

  // Whether to show preview journey screen
  const [showPreview, setShowPreview] = useState(false)

  // Whether to show payment gate (Day 14 - Sunday of second trial)
  const [showPaymentGate, setShowPaymentGate] = useState(false)

  // State for showing/hiding developer tools
  const [showDevTools, setShowDevTools] = useState(false)
  
  // State for dev override system
  const [showDevOverride, setShowDevOverride] = useState(false)
  
  // Sync global dev mode with dev override system (works even when __DEV__ is not set)
  const [globalDevMode, setGlobalDevModeState] = useState(() => getGlobalDevMode())
  
  // Update global dev mode state when it changes
  useEffect(() => {
    const checkDevMode = () => {
      const currentDevMode = getGlobalDevMode()
      if (currentDevMode !== globalDevMode) {
        setGlobalDevModeState(currentDevMode)
      }
    }
    // Check periodically (every 500ms) for changes
    const interval = setInterval(checkDevMode, 500)
    return () => clearInterval(interval)
  }, [globalDevMode])

  // State for display mode (horizontal, vertical, integrated)
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    DisplayMode.INTEGRATED,
  )

  const router = useRouter()
  const [isModalVisible, setModalVisible] = useState(false)

  const { completedChakra, clearCompletedChakra } = useCompletedChakraStore()

  // Fetch chakra data from Firestore
  const { chakrasData, isLoading: isLoadingChakras, error: chakrasError } =
    useChakrasData()

  // Set initial open date on first launch
  // In dev mode, also ensure journey starts immediately
  useEffect(() => {
    if (isFirstLaunch && !initialOpenDate) {
      const today = new Date().toISOString().split('T')[0]
      setInitialOpenDate(today)
    }
    
    // Development Override: Auto-start journey if in dev mode and not started
    const bypassTimegate = shouldBypassTimegate(hasLifetimeAccess)
    if (bypassTimegate && !journeyStarted) {
      if (__DEV__) {
        console.log('[ChakraHome] Dev mode: Auto-starting journey')
      }
      startJourney(currentWeekStartDate)
    }
  }, [isFirstLaunch, initialOpenDate, setInitialOpenDate, hasLifetimeAccess, journeyStarted, startJourney, currentWeekStartDate])

  // Check if this is the first launch and show welcome modal
  useEffect(() => {
    if (isFirstLaunch) {
      setShowWelcomeModal(true)
    }
  }, [isFirstLaunch])

  // Log the state whenever journeyStarted changes
  // useEffect(() => {
  //     console.log('[ChakraHome State Log] journeyStarted is now:', journeyStarted)
  // }, [journeyStarted])

  // Memoize expensive timegate calculations
  const bypassTimegate = useMemo(() => {
    return shouldBypassTimegate(hasLifetimeAccess) || globalDevMode
  }, [hasLifetimeAccess, globalDevMode])

  const hasCompletedTwoTrials = useMemo(() => {
    return completedTrialCourses === 2
  }, [completedTrialCourses])

  const shouldShowCommitmentGate = useMemo(() => {
    return hasCompletedTwoTrials && !hasLifetimeAccess && !bypassTimegate
  }, [hasCompletedTwoTrials, hasLifetimeAccess, bypassTimegate])

  const hasReachedStartDate = useMemo(() => {
    if (!courseStartDate) return false
    return hasReachedCourseStartDate(courseStartDate)
  }, [courseStartDate])

  const isMonday = useMemo(() => {
    return currentDay === 0
  }, [currentDay])

  useEffect(() => {
    // This effect handles the initial display logic based on the current day override
    // and whether the journey has started. It determines if the waiting screen
    // should be shown or if the journey should be automatically started (on Mondays).

    // Check if we should show commitment gate after 14 days (2 complete trials)
    // Commitment gate appears after completing 2 full 7-day trials
    // Skip commitment gate in development mode
    if (shouldShowCommitmentGate) {
      setShowPaymentGate(true)
      setShowWaitingScreen(false)
      return
    } else {
      setShowPaymentGate(false)
    }

    // Development Override or Lifetime Access: Bypass all time gates
    if (bypassTimegate) {
      setShowWaitingScreen(false)
      // Auto-start journey if not already started
      if (!journeyStarted) {
        startJourney(currentWeekStartDate)
      }
      return
    }

    // Time gate logic only applies during trial phase (not in dev mode)
    if (!courseStartDate) {
      // Course start date not yet calculated - wait for initial open date to be set
      // But in dev mode, we've already bypassed above
      return
    }

    // Check if we should show the waiting screen using timegate service
    const showWaiting = shouldShowWaitingScreenCheck(
      hasLifetimeAccess,
      hasReachedStartDate,
      isMonday,
      journeyStarted,
    )
    setShowWaitingScreen(showWaiting)

    // Auto-start logic:
    // - First trial: Auto-start on Monday if course start date reached
    // - After Trial 1: DON'T auto-start - user must press "Begin Again"
    // - After Trial 2: Show paywall (handled above)
    const shouldAutoStart = hasReachedStartDate && isMonday && !journeyStarted && completedTrialCourses === 0
    
    if (shouldAutoStart) {
      startJourney(currentWeekStartDate)
    }
  }, [
    currentDay,
    journeyStarted,
    startJourney,
    currentWeekStartDate,
    courseStartDate,
    shouldShowCommitmentGate,
    bypassTimegate,
    hasReachedStartDate,
    isMonday,
    hasLifetimeAccess,
  ])

  useEffect(() => {
    // This effect reacts to the completion of a chakra from the detail screen.
    if (completedChakra) {
      // Show the completion modal
      setModalVisible(true)
      // Mark the chakra (using the actual completed chakra's day index, not currentDay)
      const chakraDayIndex = getChakraIndex(completedChakra)
      markChakraCompleted(chakraDayIndex)
    }
    // Runs when a chakra is marked completed externally or the override day changes.
  }, [completedChakra, markChakraCompleted])

  // Memoize chakra data - only recalculate when chakrasData changes
  // Data comes sorted by day (0-6: Root to Crown)
  // The views use justify-end which aligns items to the bottom
  // With justify-end: first item in array = bottom, last item = top
  // We want: Root (day 0) at bottom, Crown (day 6) at top
  // So array should be [Root (0), ..., Crown (6)] - which is the natural order
  // But user reports Root is at top, suggesting the rendering is inverted
  // Solution: Keep natural order [Root, ..., Crown] - Root will be at bottom with justify-end
  const chakraData = useMemo(() => {
    return chakrasData.length > 0 ? chakrasData : []
  }, [chakrasData])
  
  // Debug logging in dev mode (MUST be before any conditional returns to follow Rules of Hooks)
  // Removed conditional __DEV__ check inside useEffect to ensure hook is always called
  // The console.log itself is conditional, but the hook is always called
  useEffect(() => {
    // Only log in dev mode, but hook is always called to maintain hook order
    if (__DEV__) {
      console.log('[ChakraHome Debug]', {
        chakraDataLength: chakrasData.length,
        journeyStarted,
        hasLifetimeAccess,
        currentDay,
        isLoadingChakras,
        chakrasError: chakrasError?.message,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chakrasData.length, journeyStarted, hasLifetimeAccess, currentDay, isLoadingChakras])

  const closeModal = () => {
    setModalVisible(false)
    clearCompletedChakra()
  }

  // Close welcome modal and mark first launch as complete
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false)
    setFirstLaunchComplete()
  }

  // Begin journey from welcome modal
  // Note: This no longer starts the journey immediately - the time gate logic
  // in the useEffect will handle starting the journey when conditions are met
  const handleBeginJourney = () => {
    setShowWelcomeModal(false)
    setFirstLaunchComplete()
    // The journey will start automatically when the course start date is reached
    // and it's a Monday, as handled by the time gate logic in the useEffect
  }

  // Preview handler for the waiting screen
  const handlePreviewPress = () => {
    setShowPreview(true)
    setShowWaitingScreen(false)
  }

  // Handler to return from preview to waiting screen
  const handleBackFromPreview = () => {
    setShowPreview(false)
    setShowWaitingScreen(true)
  }

  // Gallery handler - navigate to gallery of gnosis
  const handleGalleryPress = () => {
    router.push("/(chakras)/GalleryOfGnosis")
  }

  // Check if user has any unlocked chakra cards (across all trials)
  const hasUnlockedCards = useMemo(() => {
    // Check if any chakra was ever completed
    for (let i = 0; i < 7; i++) {
      if (hasEverCompletedChakra(i)) {
        return true
      }
    }
    return false
  }, [hasEverCompletedChakra, completedChakras])

  // Toggle waiting screen (for testing)
  const toggleWaitingScreen = () => {
    setShowWaitingScreen(!showWaitingScreen)
    if (showPreview) {
      setShowPreview(false)
    }
  }

  // Toggle developer tools visibility
  const toggleDevTools = () => {
    setShowDevTools(!showDevTools)
  }

  // Handler for changing the day
  const handleChangeDay = () => {
    const nextDay = (currentDay + 1) % 7
    // console.log(`[ChakraHome handleChangeDay] Changing day from ${currentDay} to ${nextDay}`) // <-- Remove log
    setCurrentDay(nextDay)
  }

  // Update developer tools to include first launch reset
  const resetFirstLaunch = () => {
    resetForTesting()
    setShowWelcomeModal(true)
  }

  // console.log('[ChakraHome Rendering Check] showWaitingScreen:', showWaitingScreen, 'showPreview:', showPreview) // <-- Remove this log

  // If showing payment gate, render it (highest priority)
  if (showPaymentGate) {
    return (
      <CommitmentGate
        onComplete={() => {
          setShowPaymentGate(false)
        }}
      />
    )
  }

  // If showing preview journey screen, render it instead of chakras or waiting screen
  if (showPreview) {
    return <PreviewJourney onBackPress={handleBackFromPreview} />
  }

  // If showing waiting screen, render it instead of chakras
  if (showWaitingScreen) {
    return (
      <WaitingScreen
        onPreviewPress={handlePreviewPress}
        onHideWaitingScreen={() => setShowWaitingScreen(false)}
        onGalleryPress={hasUnlockedCards ? handleGalleryPress : undefined}
        onBeginAgainPress={completedTrialCourses === 1 && isMonday ? () => {
          startJourney(currentWeekStartDate)
          setShowWaitingScreen(false)
        } : undefined}
        completedTrialCourses={completedTrialCourses}
        hasLifetimeAccess={hasLifetimeAccess}
        onPayPress={() => {
          setShowPaymentGate(true)
          setShowWaitingScreen(false)
        }}
      />
    )
  }

  // Show loading state while fetching chakra data
  if (isLoadingChakras) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <LoadingSpinner size={120} />
        <AppText font="instrument-medium" size="lg" className="mt-4 text-white italic">
          Preparing your sacred space...
        </AppText>
      </View>
    )
  }

  // Show error state if fetching failed
  if (chakrasError) {
    return (
      <View className="flex-1 justify-center items-center bg-black p-8">
        <AppText font="instrument-medium" size="lg" className="text-center mb-4 text-white/90">
          The chakras are taking a moment to arrive
        </AppText>
        <AppText font="instrument-regular" size="base" className="text-center text-white/70 italic">
          Please try again, or continue your journey
        </AppText>
      </View>
    )
  }

  // Memoize unlocked count calculation for Gallery button
  // Use completedChakras array directly for better performance
  const unlockedCount = useMemo(() => {
    return completedChakras.length
  }, [completedChakras])

  // Memoize render function to prevent recreation on every render
  const renderChakraDisplay = useCallback(() => {
    switch (displayMode) {
      case DisplayMode.HORIZONTAL:
        return (
          <View className="flex-1 mt-16">
            <DayProgressIndicator
              currentDay={currentDay}
              hasCompletedChakra={hasCompletedChakra}
              hasParticipatedDay={hasParticipatedDay}
              allChakrasCompleted={allChakrasCompleted}
            />
            <View className="flex-1 justify-end">
              {/* Horizontal Day Progress Indicator */}
              <View className="flex flex-col-reverse items-center justify-end w-full p-4">
                {chakraData.map(
                  ({
                    day: chakraDay,
                    affirmation,
                    description,
                    source,
                    onPress,
                  }) => (
                    <View key={chakraDay}>
                      {currentDay === chakraDay && (
                        <View className="flex flex-col items-center justify-end w-full pb-2 pt-6">
                          <AppText font="instrument-medium" size="lg">
                            {affirmation}
                          </AppText>
                          <AppText
                            font="instrument-medium"
                            size="2xl"
                            className="mt-1"
                          >
                            {description}
                          </AppText>
                        </View>
                      )}
                      {/* Show chakra if accessible (uses timegate service with dev override) */}
                      {isChakraDayAccessible(
                        chakraDay,
                        hasLifetimeAccess,
                        hasParticipatedDay,
                        currentDay,
                        allChakrasCompleted,
                      ) && (
                        <View>
                          <PulsingButton
                            source={source}
                            isAnimating={currentDay === chakraDay}
                            onPress={() => {
                              onPress(router)
                            }}
                            small={true}
                          />
                        </View>
                      )}
                    </View>
                  ),
                )}
              </View>
            </View>
          </View>
        )

      case DisplayMode.VERTICAL:
        return (
          <View className="flex-1 justify-end">
            {/* Vertical Chakra Stack Indicator */}
            <ChakraStackIndicator
              currentDay={currentDay}
              hasCompletedChakra={hasCompletedChakra}
              hasParticipatedDay={hasParticipatedDay}
              allChakrasCompleted={allChakrasCompleted}
            />

            <View className="flex flex-col-reverse items-center justify-end w-full p-4">
              {chakraData.map(
                ({
                  day: chakraDay,
                  affirmation,
                  description,
                  source,
                  onPress,
                }) => (
                  <View key={chakraDay}>
                    {currentDay === chakraDay && (
                      <View className="flex flex-col items-center justify-end w-full pb-2 pt-6">
                        <AppText font="instrument-medium" size="lg">
                          {affirmation}
                        </AppText>
                        <AppText
                          font="instrument-medium"
                          size="2xl"
                          className="mt-1"
                        >
                          {description}
                        </AppText>
                      </View>
                    )}
                    {/* Show chakra if accessible (uses timegate service with dev override) */}
                    {isChakraDayAccessible(
                      chakraDay,
                      hasLifetimeAccess,
                      hasParticipatedDay,
                      currentDay,
                      allChakrasCompleted,
                    ) && (
                      <View>
                        <PulsingButton
                          source={source}
                          isAnimating={currentDay === chakraDay}
                          onPress={() => {
                            onPress(router)
                          }}
                        />
                      </View>
                    )}
                  </View>
                ),
              )}
            </View>
          </View>
        )

      case DisplayMode.INTEGRATED:
        return (
          <IntegratedProgressStack
            currentDay={currentDay}
            hasCompletedChakra={hasCompletedChakra}
            hasParticipatedDay={hasParticipatedDay}
            allChakrasCompleted={allChakrasCompleted}
            chakraData={chakraData}
            router={router}
          />
        )

      default:
        return null
    }
  }, [displayMode, currentDay, hasCompletedChakra, hasParticipatedDay, allChakrasCompleted, hasLifetimeAccess, chakraData, router])

  // Handler for Anua's first vow test button
  const handleAnuaGreeting = async () => {
    try {
      if (isElevenLabsAvailable()) {
        await speakAsAnua(ANUA_FIRST_VOW)
      } else if (__DEV__) {
        if (__DEV__) {
          console.warn('ChakraHome: ElevenLabs is not configured. Please add ELEVENLABS_API_KEY and ANUA_VOICE_ID to your .env file.')
        }
      }
    } catch (error) {
      if (__DEV__) {
        if (__DEV__) {
          console.error('ChakraHome: Error speaking Anua greeting:', error)
        }
      }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
      {/* Developer Tools Component */}
      <DeveloperTools
        showDevTools={showDevTools}
        toggleDevTools={toggleDevTools}
        currentDay={currentDay}
        onChangeDay={handleChangeDay}
        toggleWaitingScreen={toggleWaitingScreen}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        resetFirstLaunch={resetFirstLaunch}
      />

      {/* Progress Indicator - Day X of 7 */}
      {journeyStarted && (
        <View className="absolute top-20 left-4 z-50">
          <View className="bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-700/50">
            <AppText font="instrument-medium" size="sm" className="text-white">
              Day {currentDay + 1} of 7
            </AppText>
            <View className="mt-1 h-1 bg-purple-700/30 rounded-full overflow-hidden">
              <View 
                className="h-full bg-purple-400 rounded-full"
                style={{ width: `${((currentDay + 1) / 7) * 100}%` }}
              />
            </View>
          </View>
        </View>
      )}

      {/* Top Right Buttons */}
      <View className="absolute top-20 right-4 z-50 flex-row gap-3">
        {/* ChakraHub Button - For Lifetime Access Users */}
        {hasLifetimeAccess && (
          <Pressable
            onPress={() => router.push('/(chakras)/ChakraHub')}
            className="active:opacity-80"
            style={{ shadowColor: '#9D4EDD', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
          >
            <LinearGradient
              colors={['#9D4EDD', '#7B2CBF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 12,
                padding: 12,
                borderWidth: 2,
                borderColor: '#FFD700',
              }}
            >
              <View className="flex-row items-center">
                <Ionicons name="home" size={18} color="#FFD700" style={{ marginRight: 6 }} />
                <AppText font="instrument-medium" size="sm" className="text-white">
                  Hub
                </AppText>
              </View>
            </LinearGradient>
          </Pressable>
        )}
        
        {/* Gallery of Gnosis Button */}
        {unlockedCount > 0 && (
              <Pressable
                onPress={() => router.push('/(chakras)/GalleryOfGnosis')}
                className="active:opacity-80"
                style={{ shadowColor: '#9D4EDD', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
              >
                <LinearGradient
                  colors={['#9D4EDD', '#7B2CBF']} // Purple gradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 2,
                    borderColor: '#FFD700', // Gold border
                  }}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="images" size={18} color="#FFD700" style={{ marginRight: 6 }} />
                    <AppText font="instrument-medium" size="sm" className="text-white">
                      Gallery
                    </AppText>
                    {unlockedCount > 0 && (
                      <View className="ml-2 bg-[#FFD700] rounded-full px-2 py-0.5 min-w-[20px] items-center">
                        <AppText font="instrument-bold" size="xs" className="text-black">
                          {unlockedCount}
                        </AppText>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </Pressable>
        )}

        {/* Anua Button - Wisdom and Light */}
        {isElevenLabsAvailable() && (
          <Pressable
            onPress={handleAnuaGreeting}
            className="active:opacity-80"
            style={{ 
              shadowColor: '#E0B0FF', 
              shadowOffset: { width: 0, height: 4 }, 
              shadowOpacity: 0.5, 
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={['#9D4EDD', '#7B2CBF', '#6A1B9A']} // Deep purple gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 16,
                padding: 10,
                borderWidth: 2,
                borderColor: '#FFD700', // Gold border
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 50,
                minHeight: 50,
              }}
            >
              <View className="items-center justify-center">
                {/* Anua Logo */}
                <AnuaLogo size={28} animated={true} />
              </View>
            </LinearGradient>
          </Pressable>
        )}
      </View>

      {/* ScrollView to enable scrolling through chakras */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 40, minHeight: '100%' }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        bounces={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {renderChakraDisplay()}
      </ScrollView>

      <GoodbyeModal 
        isVisible={isModalVisible} 
        onClose={() => closeModal()}
        chakraDay={completedChakra ? getChakraIndex(completedChakra) : currentDay}
      />

      {/* Welcome Modal for First Time Users */}
      <WelcomeModal
        isVisible={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        onBeginJourney={handleBeginJourney}
        currentDayOfWeek={realDayOfWeek}
        completedTrialCourses={completedTrialCourses}
        initialOpenDate={initialOpenDate}
      />
    </SafeAreaView>
  )
}
