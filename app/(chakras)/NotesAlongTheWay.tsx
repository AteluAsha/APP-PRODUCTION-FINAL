/**
 * Notes Along the Way - Full Page Diary
 *
 * Running notepad scroll with all reflections, divided by chakra days.
 * Opened from the bottom sheet "Open full diary" or directly.
 */
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { useRouter, useLocalSearchParams } from "expo-router"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { runOnJS, FadeIn } from "react-native-reanimated"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { useJourneyNotesStore } from "@/hooks/useJourneyNotesStore"
import { LinearGradient } from "expo-linear-gradient"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { SCROLL_BREATHING_BOTTOM_PADDING, SCROLL_ANDROID_SMOOTH_PROPS } from "@/constants/layout"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { ActionBar } from "@/components/ActionBar"
import { getDayName, getChakraName } from "@/constants/chakras/chakraConstants"
import { getCurrentDayOfWeek } from "@/utils/date"
import { ChakraDaySelector } from "@/components/chakras/ChakraDaySelector"
import { JOURNEY_NOTES_EXPORT_COPY } from "@/constants/journeyNotesExportCopy"
import { promptJourneyNotesExport } from "@/utils/journeyNotesExport"

/** Android: KeyboardAvoidingView offset for status bar + ActionBar (both sit above KAV). */
const ACTION_BAR_KEYBOARD_OFFSET = 56

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  } catch {
    return ""
  }
}

export default function NotesAlongTheWay() {
  const router = useRouter()
  const params = useLocalSearchParams<{ contextDay?: string }>()
  const { getAllNotes, getNotesCount, addNote } = useJourneyNotesStore()
  const currentDay = getCurrentDayOfWeek()
  const contextDayParam =
    params.contextDay != null ? parseInt(params.contextDay, 10) : NaN
  const effectiveContext =
    !isNaN(contextDayParam) && contextDayParam >= 0 && contextDayParam <= 6
      ? contextDayParam
      : currentDay

  const notes = getAllNotes("journey")
  const notesCount = getNotesCount("journey")

  const [noteText, setNoteText] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  // Default to chakra of the day when opening; user can change via selector to post for another day.
  const [selectedChakraDay, setSelectedChakraDay] = useState<number | "all">(
    currentDay,
  )

  const handleAddNote = useCallback(async () => {
    const trimmedText = noteText.trim()
    if (!trimmedText || isAddingNote) return

    setIsAddingNote(true)
    addHapticFeedback(HapticStrength.Medium)

    const targetDay =
      selectedChakraDay === "all" ? effectiveContext : selectedChakraDay
    try {
      addNote({
        chakraDay: targetDay,
        content: trimmedText,
        type: "journey",
      })
      setNoteText("")
      // Scroll so new note (now at bottom) is visible just above input
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)
    } catch (error) {
      if (__DEV__) console.error("Error adding note:", error)
    } finally {
      setIsAddingNote(false)
    }
  }, [noteText, selectedChakraDay, effectiveContext, addNote, isAddingNote])

  const handleTextChange = useCallback((text: string) => {
    const sanitized = text.replace(/[<>]/g, "")
    if (sanitized.length <= 1000) setNoteText(sanitized)
  }, [])

  const scrollRef = useRef<ScrollView>(null)

  const filteredNotes = useMemo(() => {
    if (selectedChakraDay === "all") return notes
    return notes.filter((n) => n.chakraDay === selectedChakraDay)
  }, [notes, selectedChakraDay])

  const notesByDay = useMemo(() => {
    return filteredNotes.reduce(
      (acc, note) => {
        if (!acc[note.chakraDay]) acc[note.chakraDay] = []
        acc[note.chakraDay].push(note)
        return acc
      },
      {} as Record<number, typeof notes>,
    )
  }, [filteredNotes])

  // Bottom-up: oldest first (top of list), newest last (just above input). New comment lands above input; previous moves up.
  const notesByDaySorted = useMemo(() => {
    return Object.entries(notesByDay)
      .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
      .map(([dayStr, dayNotes]) => [
        dayStr,
        [...dayNotes].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      ] as const)
  }, [notesByDay])

  const insets = useSafeAreaInsets()

  // Swipe cycle includes "all": all → 0 → 1 → … → 6 → all (and reverse).
  const goNextChakraDay = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    setSelectedChakraDay((prev) => {
      if (prev === "all") return 0
      if (prev === 6) return "all"
      return prev + 1
    })
  }, [])
  const goPrevChakraDay = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    setSelectedChakraDay((prev) => {
      if (prev === "all") return 6
      if (prev === 0) return "all"
      return prev - 1
    })
  }, [])

  // Horizontal swipe on full diary: strict offsets so vertical scroll wins first (RNGH ScrollView).
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX(28)
        .failOffsetY([-10, 10])
        .onEnd((e) => {
          "worklet"
          const dx = e.translationX
          const vx = e.velocityX
          const threshold = 28
          const velocityThreshold = 60
          if (dx > threshold || vx > velocityThreshold) {
            runOnJS(goPrevChakraDay)()
          } else if (dx < -threshold || vx < -velocityThreshold) {
            runOnJS(goNextChakraDay)()
          }
        }),
    [goNextChakraDay, goPrevChakraDay],
  )

  const displayDayName =
    selectedChakraDay === "all"
      ? getDayName(effectiveContext)
      : getDayName(selectedChakraDay)

  const handleBack = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(chakras)/ChakraHub")
    }
  }, [router])

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ActionBar onBackPress={handleBack} />
      <LinearGradient
        colors={[
          "rgba(135, 174, 115, 0.08)",
          "rgba(107, 142, 90, 0.05)",
          "rgba(0, 0, 0, 0.98)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.swipeArea, styles.swipeAreaInner]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.gestureColumn}>
          <View style={styles.swipeZone}>
            <View style={styles.header} collapsable={false}>
              <View style={styles.headerTitleCol}>
                <AppText
                  font="instrument-bold"
                  size="2xl"
                  style={[
                    styles.headerText,
                    { color: "#ffffff", marginBottom: 4 },
                  ]}
                >
                  Notes Along the Way
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {notesCount === 0
                    ? "Your reflections will appear here"
                    : `${notesCount} reflection${notesCount !== 1 ? "s" : ""}`}
                </AppText>
              </View>
              {notesCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={JOURNEY_NOTES_EXPORT_COPY.exportHint}
                  hitSlop={12}
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    promptJourneyNotesExport()
                  }}
                  style={styles.exportIconWrap}
                >
                  <Ionicons
                    name="download-outline"
                    size={22}
                    color="rgba(135, 174, 115, 0.85)"
                  />
                </Pressable>
              ) : null}
            </View>
            <ChakraDaySelector
              selectedDay={selectedChakraDay}
              onSelect={setSelectedChakraDay}
            />
          </View>

          <KeyboardAvoidingView
            behavior="padding"
            style={styles.keyboardView}
            keyboardVerticalOffset={
              Platform.OS === "android"
                ? insets.top + ACTION_BAR_KEYBOARD_OFFSET
                : 0
            }
          >
          <View style={styles.contentColumn}>
            <Animated.View
              key={selectedChakraDay}
              entering={FadeIn.duration(140)}
              style={{ flex: 1 }}
            >
            {filteredNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="leaf-outline"
                  size={56}
                  color="rgba(135, 174, 115, 0.5)"
                />
                <AppText
                  font="instrument-regular"
                  size="base"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    marginTop: 24,
                    textAlign: "center",
                    paddingHorizontal: 24,
                  }}
                >
                  {selectedChakraDay === "all"
                    ? "Your journey notes will appear here"
                    : `No reflections yet for ${getDayName(selectedChakraDay)}. Share your first thought.`}
                </AppText>
                <AppText
                  font="instrument-regular"
                  size="sm"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    marginTop: 12,
                    textAlign: "center",
                    paddingHorizontal: 24,
                  }}
                >
                  Reflect on your journey as you progress through each chakra
                </AppText>
              </View>
            ) : (
              <ScrollView
                ref={scrollRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                {...(Platform.OS === "android" && SCROLL_ANDROID_SMOOTH_PROPS)}
                contentContainerStyle={styles.scrollContent}
              >
                {notesByDaySorted.map(([dayStr, dayNotes]) => {
                  const day = parseInt(dayStr, 10)
                  return (
                    <View key={day} style={styles.daySection}>
                      <View style={styles.dayHeader}>
                        <AppText
                          font="instrument-bold"
                          size="lg"
                          style={{ color: "#A8C99A" }}
                        >
                          {getDayName(day)} - {getChakraName(day)}
                        </AppText>
                        <AppText
                          font="instrument-regular"
                          size="xs"
                          style={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          {dayNotes.length} note{dayNotes.length !== 1 ? "s" : ""}
                        </AppText>
                      </View>
                      {dayNotes.map((note) => (
                        <View key={note.id} style={styles.noteCard}>
                          <AppText
                            font="instrument-regular"
                            size="xs"
                            style={{
                              color: "rgba(255,255,255,0.5)",
                              marginBottom: 8,
                            }}
                          >
                            {formatDate(note.createdAt)}
                          </AppText>
                          <AppText
                            font="instrument-regular"
                            size="base"
                            style={{
                              color: "rgba(255,255,255,0.9)",
                              lineHeight: 24,
                            }}
                          >
                            {note.content}
                          </AppText>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: 8,
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            <Pressable
                              onPress={() => {
                                addHapticFeedback(HapticStrength.Light)
                                useAnuaChatStore
                                  .getState()
                                  .open({
                                    initialMessage: note.content,
                                    chakraDayOverride: note.chakraDay,
                                  })
                              }}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={{ alignSelf: "flex-start" }}
                            >
                              <AppText
                                font="instrument-regular"
                                size="xs"
                                style={{ color: "rgba(255,255,255,0.4)" }}
                              >
                                Send thought to Anua
                              </AppText>
                            </Pressable>
                          </View>
                        </View>
                      ))}
                    </View>
                  )
                })}
              </ScrollView>
            )}
            </Animated.View>

            <View
              style={[
                styles.inputRow,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(135, 174, 115, 0.12)",
                  "rgba(107, 142, 90, 0.08)",
                  "rgba(0, 0, 0, 0.4)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <TextInput
                  value={noteText}
                  onChangeText={handleTextChange}
                  placeholder={`Share your reflections for ${displayDayName}...`}
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  multiline
                  maxLength={1000}
                  style={styles.textInput}
                  textAlignVertical="top"
                  spellCheck={false}
                  autoCorrect={false}
                />
              </LinearGradient>
              <Pressable
                onPress={handleAddNote}
                disabled={!noteText.trim() || isAddingNote}
                style={[
                  styles.addButton,
                  (!noteText.trim() || isAddingNote) && styles.addButtonDisabled,
                ]}
              >
                <LinearGradient
                  colors={
                    noteText.trim() && !isAddingNote
                      ? ["rgba(135, 174, 115, 0.4)", "rgba(107, 142, 90, 0.3)"]
                      : ["rgba(135, 174, 115, 0.15)", "rgba(107, 142, 90, 0.1)"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addButtonGradient}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={
                      noteText.trim() && !isAddingNote
                        ? "#A8C99A"
                        : "rgba(135, 174, 115, 0.4)"
                    }
                  />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
          </View>
        </GestureDetector>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  swipeArea: {
    flex: 1,
  },
  swipeAreaInner: {
    flex: 1,
  },
  gestureColumn: {
    flex: 1,
  },
  swipeZone: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
  },
  header: {
    paddingBottom: 8,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    // Clear ActionBar back button (left 16 + width 40 = 56px); add gap so title never overlaps on iOS and globally
    paddingLeft: 48,
    paddingRight: 4,
  },
  headerTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  exportIconWrap: {
    paddingTop: 4,
    paddingLeft: 4,
  },
  headerText: {
    textShadowColor: "rgba(135, 174, 115, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  keyboardView: {
    flex: 1,
  },
  contentColumn: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    minHeight: 112,
  },
  inputGradient: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.3)",
    overflow: "hidden",
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    minHeight: 112,
    maxHeight: 200,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "InstrumentRegular",
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
  },
  addButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(135, 174, 115, 0.4)",
    borderRadius: 26,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40 + SCROLL_BREATHING_BOTTOM_PADDING,
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  noteCard: {
    backgroundColor: "rgba(135, 174, 115, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "rgba(135, 174, 115, 0.2)",
  },
})
