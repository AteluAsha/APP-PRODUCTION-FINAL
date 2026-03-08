/**
 * Journey Notes View (Notes Along the Way)
 *
 * ARCHITECTURE: "Two Apps in One"
 * - APP_1 (Trial): Available when journey starts (first Monday opens)
 * - APP_2 (Lifetime): Always available
 *
 * Notes are always stored and never deleted unless user chooses.
 * Storage persists across app restarts via AsyncStorage.
 *
 * Features:
 * - Chakra selector scroll (filter by day)
 * - Words-first display (content visible, date as caption)
 * - Add notes for selected chakra day (defaults to screen context)
 * - Option to open full-page diary
 */

import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  View,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { AppText } from "@/components/AppText"
import { Ionicons } from "@expo/vector-icons"
import { useJourneyNotesStore } from "@/hooks/useJourneyNotesStore"
import { useAnuaChatStore } from "@/hooks/useAnuaChatStore"
import { LinearGradient } from "expo-linear-gradient"
import { addHapticFeedback, HapticStrength } from "@/utils/haptic"
import Animated, { FadeIn, Easing } from "react-native-reanimated"
import { BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { useSafeAreaInsets } from "react-native-safe-area-context"
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

export type JourneyNotesTheme = "default" | "player"

interface JourneyNotesViewProps {
  onNotePress?: (chakraDay: number) => void
  onOpenFullPage?: () => void
  /** When this changes (e.g. on sheet open), reset selection to screen context */
  sheetOpenKey?: number
  /** Chakra day of the screen user is viewing (e.g. Root page = 0). Store notes to this, not calendar date. */
  contextChakraDay?: number
  /** Callback when user taps "Send thought to Anua" on a note - dismiss sheet and open Anua */
  onSendToAnua?: (content: string) => void
  /** When "player", uses softer transparent sand/white styling (e.g. opened from audio player). */
  theme?: JourneyNotesTheme
}

const PLAYER_THEME = {
  bgGradient: [
    "rgba(30, 28, 26, 0.97)",
    "rgba(18, 16, 14, 0.98)",
    "rgba(0, 0, 0, 0.98)",
  ] as const,
  headerTextShadow: {
    textShadowColor: "transparent",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
  hintColor: "rgba(255,255,255,0.6)",
  inputGradient: [
    "rgba(255, 250, 240, 0.06)",
    "rgba(240, 235, 225, 0.04)",
    "rgba(0, 0, 0, 0.5)",
  ] as const,
  inputBorder: "rgba(255, 250, 240, 0.2)",
  inputGlow: "rgba(255, 250, 240, 0.06)",
  placeholderColor: "rgba(255,255,255,0.4)",
  emptyGradient: [
    "rgba(255, 250, 240, 0.08)",
    "rgba(240, 235, 225, 0.04)",
    "transparent",
  ] as const,
  emptyIconColor: "rgba(255, 250, 240, 0.5)",
  noteCardBg: "rgba(255, 250, 240, 0.06)",
  noteCardBorder: "rgba(255, 250, 240, 0.15)",
  dayHeaderColor: "rgba(255,255,255,0.9)",
  sendActive: "rgba(255, 250, 240, 0.9)",
  sendInactive: "rgba(255, 250, 240, 0.35)",
  loadingIconColor: "rgba(255, 250, 240, 0.6)",
  addButtonGradientActive: [
    "rgba(255, 250, 240, 0.2)",
    "rgba(240, 235, 225, 0.15)",
  ] as const,
  addButtonGradientInactive: [
    "rgba(255, 250, 240, 0.08)",
    "rgba(240, 235, 225, 0.05)",
  ] as const,
}

const DEFAULT_THEME = {
  bgGradient: [
    "rgba(135, 174, 115, 0.15)",
    "rgba(107, 142, 90, 0.1)",
    "rgba(0, 0, 0, 0.95)",
  ] as const,
  headerTextShadow: {
    textShadowColor: "rgba(135, 174, 115, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  hintColor: "rgba(135, 174, 115, 0.85)",
  inputGradient: [
    "rgba(135, 174, 115, 0.12)",
    "rgba(107, 142, 90, 0.08)",
    "rgba(0, 0, 0, 0.4)",
  ] as const,
  inputBorder: "rgba(135, 174, 115, 0.3)",
  inputGlow: "rgba(135, 174, 115, 0.1)",
  placeholderColor: "rgba(255, 255, 255, 0.7)",
  emptyGradient: [
    "rgba(135, 174, 115, 0.2)",
    "rgba(107, 142, 90, 0.1)",
    "transparent",
  ] as const,
  emptyIconColor: "rgba(135, 174, 115, 0.5)",
  noteCardBg: "rgba(135, 174, 115, 0.08)",
  noteCardBorder: "rgba(135, 174, 115, 0.2)",
  dayHeaderColor: "#A8C99A",
  sendActive: "#A8C99A",
  sendInactive: "rgba(135, 174, 115, 0.4)",
  loadingIconColor: "rgba(135, 174, 115, 0.7)",
  addButtonGradientActive: [
    "rgba(135, 174, 115, 0.4)",
    "rgba(107, 142, 90, 0.3)",
  ] as const,
  addButtonGradientInactive: [
    "rgba(135, 174, 115, 0.15)",
    "rgba(107, 142, 90, 0.1)",
  ] as const,
}

export const JourneyNotesView: React.FC<JourneyNotesViewProps> = ({
  onNotePress,
  onOpenFullPage,
  sheetOpenKey,
  contextChakraDay,
  onSendToAnua,
  theme = "default",
}) => {
  const t = theme === "player" ? PLAYER_THEME : DEFAULT_THEME
  const { getAllNotes, getNotesCount, addNote } = useJourneyNotesStore()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const currentDay = getCurrentDayOfWeek()

  const notes = getAllNotes("journey")
  const notesCount = getNotesCount("journey")

  const [showPreparingMessage, setShowPreparingMessage] = useState(true)
  const [noteText, setNoteText] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  // Context = screen user is viewing (e.g. Root page = 0). Fallback to calendar day if not on chakra page.
  const effectiveContext = contextChakraDay ?? currentDay
  const [selectedChakraDay, setSelectedChakraDay] = useState<number | "all">(
    effectiveContext,
  )

  useEffect(() => {
    const timer = setTimeout(() => setShowPreparingMessage(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Reset to screen context when sheet opens (parent passes sheetOpenKey + contextChakraDay)
  useEffect(() => {
    if (sheetOpenKey != null) setSelectedChakraDay(effectiveContext)
  }, [sheetOpenKey, effectiveContext])

  const handleAddNote = useCallback(async () => {
    const trimmedText = noteText.trim()
    if (!trimmedText || isAddingNote) return

    setIsAddingNote(true)
    addHapticFeedback(HapticStrength.Medium)

    // Store to screen context when "All" selected, else to user's chosen chakra
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

  const handleOpenFullPage = useCallback(() => {
    addHapticFeedback(HapticStrength.Light)
    onOpenFullPage?.() ??
      router.push(`/(chakras)/NotesAlongTheWay?contextDay=${effectiveContext}`)
  }, [onOpenFullPage, router, effectiveContext])

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
    <BottomSheetView
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}
    >
      <LinearGradient
        colors={[...t.bgGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <AppText
          font="instrument-bold"
          size="2xl"
          style={[
            styles.headerText,
            { color: "#ffffff", marginBottom: 8 },
            t.headerTextShadow,
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

      <ChakraDaySelector
        selectedDay={selectedChakraDay}
        onSelect={setSelectedChakraDay}
      />

      <View style={styles.hintWrap}>
        <AppText
          font="instrument-regular"
          size="xs"
          style={[styles.hintText, { color: t.hintColor }]}
        >
          All notes save to the chakra you're exploring in this moment.
        </AppText>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={[...t.inputGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.inputGradient, { borderColor: t.inputBorder }]}
          >
            <View
              style={[
                styles.inputGlow,
                { backgroundColor: t.inputGlow },
              ]}
            />
            <TextInput
              value={noteText}
              onChangeText={handleTextChange}
              placeholder={`Share your reflections for ${displayDayName}...`}
              placeholderTextColor={t.placeholderColor}
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
                  ? [...t.addButtonGradientActive]
                  : [...t.addButtonGradientInactive]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.addButtonGradient,
                theme === "player" && {
                  borderColor: t.inputBorder,
                },
              ]}
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  noteText.trim() && !isAddingNote ? t.sendActive : t.sendInactive
                }
              />
            </LinearGradient>
          </Pressable>
        </View>

        {showPreparingMessage ? (
          <Animated.View
            entering={FadeIn.duration(800).easing(Easing.out(Easing.ease))}
            style={[styles.loadingContainer, { minHeight: 200 }]}
          >
            <Ionicons name="leaf" size={40} color={t.loadingIconColor} />
            <AppText
              font="instrument-regular"
              size="base"
              style={{
                color: "rgba(255,255,255,0.8)",
                marginTop: 16,
                textAlign: "center",
              }}
            >
              Gathering your reflections...
            </AppText>
          </Animated.View>
        ) : filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={[...t.emptyGradient]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.emptyGradient}
            >
              <Ionicons
                name="leaf-outline"
                size={56}
                color={t.emptyIconColor}
              />
              <AppText
                font="instrument-regular"
                size="base"
                style={{
                  color: "rgba(255,255,255,0.8)",
                  marginTop: 24,
                  textAlign: "center",
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
                }}
              >
                Reflect on your journey as you progress through each chakra
              </AppText>
            </LinearGradient>
          </View>
        ) : (
          <BottomSheetScrollView
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
                        style={{ color: t.dayHeaderColor }}
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
                      <View
                        key={note.id}
                        style={[
                          styles.noteCard,
                          theme === "player" && {
                            backgroundColor: t.noteCardBg,
                            borderColor: t.noteCardBorder,
                            shadowColor: "transparent",
                            shadowOpacity: 0,
                            elevation: 0,
                          },
                        ]}
                      >
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
                            if (onSendToAnua) {
                              onSendToAnua(note.content)
                            } else {
                              useAnuaChatStore
                                .getState()
                                .open({ initialMessage: note.content })
                            }
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
          </BottomSheetScrollView>
        )}

        {notesCount > 0 && (
          <Pressable onPress={handleOpenFullPage} style={styles.fullPageLink}>
            <AppText
              font="instrument-regular"
              size="sm"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Open full diary
            </AppText>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="rgba(255, 255, 255, 0.5)"
            />
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </BottomSheetView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    paddingTop: 24,
    overflow: "hidden",
  },
  header: {
    marginBottom: 12,
    minHeight: 52,
  },
  headerText: {
    textShadowColor: "rgba(135, 174, 115, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    position: "relative",
    minHeight: 200,
  },
  emptyGradient: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 40,
    borderRadius: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
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
    shadowColor: "#87AE73",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
    marginTop: 0,
    paddingHorizontal: 20,
    gap: 12,
    minHeight: 112,
  },
  inputGradient: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(135, 174, 115, 0.3)",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#87AE73",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  inputGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "18%",
    backgroundColor: "rgba(135, 174, 115, 0.08)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    shadowColor: "#87AE73",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
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
  hintWrap: {
    alignSelf: "center",
    maxWidth: "100%",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  hintText: {
    textAlign: "center",
    lineHeight: 18,
    fontSize: 12,
  },
  fullPageLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    marginTop: 8,
  },
})
