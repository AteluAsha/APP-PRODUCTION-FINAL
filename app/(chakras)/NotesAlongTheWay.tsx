/**
 * Notes Along the Way - Full Page Diary
 *
 * Running notepad scroll with all reflections, divided by chakra days.
 * Opened from the bottom sheet "Open full diary" or directly.
 */
import React, { useState, useCallback, useMemo } from "react"
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { useJourneyNotesStore } from "@/hooks/useJourneyNotesStore"
import { LinearGradient } from "expo-linear-gradient"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import { SCROLL_BREATHING_BOTTOM_PADDING } from "@/constants/layout"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { ActionBar } from "@/components/ActionBar"
import { getDayName, getChakraName } from "@/constants/chakras/chakraConstants"
import { getCurrentDayOfWeek } from "@/utils/date"
import { ChakraDaySelector } from "@/components/chakras/ChakraDaySelector"

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

  const displayDayName =
    selectedChakraDay === "all"
      ? getDayName(effectiveContext)
      : getDayName(selectedChakraDay)

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ActionBar />
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

      <View style={styles.header}>
        <AppText
          font="instrument-bold"
          size="2xl"
          style={[styles.headerText, { color: "#ffffff", marginBottom: 4 }]}
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

      <ChakraDaySelector
        selectedDay={selectedChakraDay}
        onSelect={setSelectedChakraDay}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputRow}>
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
              placeholderTextColor="rgba(135, 174, 115, 0.5)"
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
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {Object.entries(notesByDay)
              .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
              .map(([dayStr, dayNotes]) => {
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
                        <Pressable
                          onPress={() => {
                            addHapticFeedback(HapticStrength.Light)
                            useAnuaChatStore
                              .getState()
                              .open({ initialMessage: note.content })
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={{ alignSelf: "flex-start", marginTop: 8 }}
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
                    ))}
                  </View>
                )
              })}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerText: {
    textShadowColor: "rgba(135, 174, 115, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  keyboardView: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
    minHeight: 100,
  },
  inputGradient: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(135, 174, 115, 0.3)",
    overflow: "hidden",
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 20,
    padding: 16,
    color: "#FFFFFF",
    minHeight: 100,
    maxHeight: 200,
    fontSize: 16,
    lineHeight: 24,
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
