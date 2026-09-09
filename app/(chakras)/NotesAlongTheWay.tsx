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
  Modal,
  Alert,
  Image,
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
import { ANUA_CHAT_ENABLED } from "@/constants/anuaAccess"
import { ActionBar } from "@/components/ActionBar"
import { getDayName, getChakraName } from "@/constants/chakras/chakraConstants"
import { getCurrentDayOfWeek } from "@/utils/date"
import { ChakraDaySelector } from "@/components/chakras/ChakraDaySelector"
import { JOURNEY_NOTES_EXPORT_COPY } from "@/constants/journeyNotesExportCopy"
import {
  promptJourneyNotesExport,
  copyJourneyNotesToClipboard,
  copyNoteText,
} from "@/utils/journeyNotesExport"

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
  const [anuaInfoVisible, setAnuaInfoVisible] = useState(false)
  const [selectedChakraDay, setSelectedChakraDay] = useState<number | "all">(
    effectiveContext,
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

  // Horizontal swipe cycles days. A little diagonal still counts as a swipe;
  // more vertical movement lets the note list scroll instead.
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX(20)
        .failOffsetY([-18, 18])
        .onEnd((e) => {
          "worklet"
          const dx = e.translationX
          const vx = e.velocityX
          const threshold = 24
          const velocityThreshold = 50
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

  const openNoteWithAnua = useCallback((content: string, chakraDay: number) => {
    useAnuaChatStore.getState().open({
      initialMessage: content,
      chakraDayOverride: chakraDay,
    })
  }, [])

  const handleNoteLongPress = useCallback(
    (note: { content: string; chakraDay: number }) => {
      addHapticFeedback(HapticStrength.Medium)
      const buttons: {
        text: string
        style?: "cancel" | "default"
        onPress?: () => void
      }[] = [
        { text: JOURNEY_NOTES_EXPORT_COPY.cancel, style: "cancel" },
        {
          text: JOURNEY_NOTES_EXPORT_COPY.copyThisLabel,
          onPress: () => {
            void copyNoteText(note.content)
          },
        },
      ]
      if (ANUA_CHAT_ENABLED) {
        buttons.push({
          text: JOURNEY_NOTES_EXPORT_COPY.sitWithAnuaLabel,
          onPress: () => openNoteWithAnua(note.content, note.chakraDay),
        })
      }
      Alert.alert("This thought", undefined, buttons)
    },
    [openNoteWithAnua],
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ActionBar onBackPress={handleBack} />
      <LinearGradient
        colors={[
          "rgba(58, 42, 28, 0.45)",
          "rgba(18, 14, 10, 0.92)",
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
                  font="cormorant-italic"
                  style={styles.headerTitle}
                >
                  Notes Along the Way
                </AppText>
                <AppText
                  font="cormorant-italic"
                  style={styles.headerSub}
                >
                  {notesCount === 0
                    ? "A quiet place for what lands."
                    : `${notesCount} thought${notesCount !== 1 ? "s" : ""} kept here`}
                </AppText>
              </View>
              <View style={styles.headerActions}>
              {ANUA_CHAT_ENABLED ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={JOURNEY_NOTES_EXPORT_COPY.anuaInfoTitle}
                  hitSlop={12}
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    setAnuaInfoVisible(true)
                  }}
                  style={styles.exportIconWrap}
                >
                  <Image
                    source={require("@/assets/images/Anua_Hero_Icon_Image.png")}
                    style={styles.anuaMark}
                    resizeMode="cover"
                  />
                </Pressable>
              ) : null}
              {notesCount > 0 ? (
                <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={JOURNEY_NOTES_EXPORT_COPY.copyHint}
                  hitSlop={12}
                  onPress={() => {
                    addHapticFeedback(HapticStrength.Light)
                    void copyJourneyNotesToClipboard("full")
                  }}
                  style={styles.exportIconWrap}
                >
                  <Ionicons
                    name="copy-outline"
                    size={20}
                    color="rgba(244, 237, 224, 0.78)"
                  />
                </Pressable>
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
                    name="share-outline"
                    size={22}
                    color="rgba(244, 237, 224, 0.78)"
                  />
                </Pressable>
                </>
              ) : null}
              </View>
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
                  size={40}
                  color="rgba(244, 237, 224, 0.38)"
                />
                <AppText
                  font="cormorant-italic"
                  style={styles.emptyLead}
                >
                  {selectedChakraDay === "all"
                    ? "Nothing here yet. When something lands, it can rest here."
                    : `Nothing yet for ${getDayName(selectedChakraDay)}. When something lands, it can rest here.`}
                </AppText>
                <AppText
                  font="cormorant-italic"
                  style={styles.emptySub}
                >
                  These stay on this device.
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
                          font="cormorant-italic"
                          style={styles.dayName}
                        >
                          {getDayName(day)} · {getChakraName(day)}
                        </AppText>
                        <AppText
                          font="cormorant-regular"
                          style={styles.dayCount}
                        >
                          {dayNotes.length} note{dayNotes.length !== 1 ? "s" : ""}
                        </AppText>
                      </View>
                      {dayNotes.map((note) => (
                        <Pressable
                          key={note.id}
                          onLongPress={() => handleNoteLongPress(note)}
                          delayLongPress={380}
                          style={styles.noteCard}
                        >
                          <AppText
                            font="cormorant-italic"
                            style={styles.noteDate}
                          >
                            {formatDate(note.createdAt)}
                          </AppText>
                          <AppText
                            font="cormorant-regular"
                            style={styles.noteBody}
                          >
                            {note.content}
                          </AppText>
                        </Pressable>
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
                  "rgba(58, 42, 28, 0.35)",
                  "rgba(20, 16, 12, 0.55)",
                  "rgba(0, 0, 0, 0.35)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <TextInput
                  value={noteText}
                  onChangeText={handleTextChange}
                  placeholder={`A thought for ${displayDayName}…`}
                  placeholderTextColor="rgba(244, 237, 224, 0.42)"
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
                      ? ["rgba(196, 168, 126, 0.38)", "rgba(90, 68, 42, 0.55)"]
                      : ["rgba(196, 168, 126, 0.12)", "rgba(40, 32, 24, 0.4)"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addButtonGradient}
                >
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color={
                      noteText.trim() && !isAddingNote
                        ? "#F4EDE0"
                        : "rgba(244, 237, 224, 0.28)"
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
      <Modal
        visible={anuaInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAnuaInfoVisible(false)}
        statusBarTranslucent={Platform.OS === "android"}
      >
        {anuaInfoVisible ? (
          <Pressable
            style={styles.anuaOverlay}
            onPress={() => setAnuaInfoVisible(false)}
          >
            <Pressable
              style={styles.anuaCard}
              onPress={(e) => e.stopPropagation()}
            >
              <Image
                source={require("@/assets/images/Anua_Hero_Icon_Image.png")}
                style={styles.anuaCardMark}
                resizeMode="cover"
              />
              <AppText font="cormorant-italic" style={styles.anuaCardTitle}>
                {JOURNEY_NOTES_EXPORT_COPY.anuaInfoTitle}
              </AppText>
              <AppText font="cormorant-italic" style={styles.anuaCardBody}>
                {JOURNEY_NOTES_EXPORT_COPY.anuaInfoBody}
              </AppText>
              <Pressable
                onPress={() => setAnuaInfoVisible(false)}
                style={styles.anuaCardClose}
              >
                <AppText font="instrument-regular" style={styles.anuaCardCloseText}>
                  {JOURNEY_NOTES_EXPORT_COPY.anuaInfoClose}
                </AppText>
              </Pressable>
            </Pressable>
          </Pressable>
        ) : null}
      </Modal>
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
  headerTitle: {
    color: "rgba(244, 237, 224, 0.96)",
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 4,
  },
  headerSub: {
    color: "rgba(244, 237, 224, 0.58)",
    fontSize: 15,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 2,
  },
  exportIconWrap: {
    paddingTop: 4,
    paddingLeft: 8,
  },
  anuaMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(232, 201, 140, 0.35)",
  },
  headerText: {
    textShadowColor: "rgba(196, 168, 126, 0.25)",
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
    borderColor: "rgba(196, 168, 126, 0.22)",
    overflow: "hidden",
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    color: "#F4EDE0",
    minHeight: 112,
    maxHeight: 200,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "CormorantGaramondItalic",
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
    borderColor: "rgba(196, 168, 126, 0.35)",
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
  dayName: {
    color: "rgba(232, 201, 140, 0.88)",
    fontSize: 18,
  },
  dayCount: {
    color: "rgba(244, 237, 224, 0.45)",
    fontSize: 12,
  },
  noteCard: {
    backgroundColor: "rgba(42, 32, 22, 0.55)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(196, 168, 126, 0.18)",
  },
  noteDate: {
    color: "rgba(244, 237, 224, 0.42)",
    fontSize: 13,
    marginBottom: 8,
  },
  noteBody: {
    color: "rgba(244, 237, 224, 0.92)",
    fontSize: 17,
    lineHeight: 26,
  },
  emptyLead: {
    color: "rgba(244, 237, 224, 0.82)",
    marginTop: 20,
    textAlign: "center",
    paddingHorizontal: 28,
    fontSize: 20,
    lineHeight: 28,
  },
  emptySub: {
    color: "rgba(244, 237, 224, 0.45)",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 28,
    fontSize: 15,
  },
  anuaOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.62)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  anuaCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: "rgba(16, 12, 10, 0.98)",
    borderWidth: 1,
    borderColor: "rgba(232, 201, 140, 0.28)",
    alignItems: "center",
  },
  anuaCardMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 14,
  },
  anuaCardTitle: {
    color: "rgba(244, 237, 224, 0.95)",
    fontSize: 26,
    marginBottom: 10,
  },
  anuaCardBody: {
    color: "rgba(244, 237, 224, 0.78)",
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  anuaCardClose: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  anuaCardCloseText: {
    color: "rgba(232, 201, 140, 0.9)",
    fontSize: 14,
  },
})
