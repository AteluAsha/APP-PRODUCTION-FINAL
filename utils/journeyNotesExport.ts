/**
 * Journey notes → plain-text file → system share sheet (iOS + Android).
 * Reads from useJourneyNotesStore only; updates export watermark after share succeeds.
 */

import { Alert, Platform } from "react-native"
import * as Clipboard from "expo-clipboard"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import { getDayName, getChakraName } from "@/constants/chakras/chakraConstants"
import { JOURNEY_NOTES_EXPORT_COPY } from "@/constants/journeyNotesExportCopy"
import { showHealingToast } from "@/utils/healingToast"
import {
  useJourneyNotesStore,
  type JourneyNote,
} from "@/hooks/useJourneyNotesStore"

export type JourneyNotesExportMode = "incremental" | "full"

function formatNoteDate(dateString: string): string {
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

function formatExportHeaderDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

/** Journey notes only, sorted oldest first (diary order). */
export function selectJourneyNotesForExport(
  mode: JourneyNotesExportMode,
  notes: JourneyNote[],
  lastExportAt: string | null | undefined,
): JourneyNote[] {
  const journey = notes.filter(
    (n) => n.type === "journey" || n.type === undefined,
  )
  const anchor = lastExportAt ? new Date(lastExportAt).getTime() : null
  const filtered =
    mode === "full" || anchor == null
      ? journey
      : journey.filter((n) => new Date(n.createdAt).getTime() > anchor)
  return [...filtered].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

export function formatJourneyNotesPlainText(
  notes: JourneyNote[],
  exportKind: JourneyNotesExportMode,
): string {
  const exportedAt = new Date().toISOString()
  const lines: string[] = []
  lines.push("Awakening Soul — Notes Along the Way")
  lines.push(`Exported: ${formatExportHeaderDate(exportedAt)}`)
  lines.push(
    exportKind === "full"
      ? "(Full download)"
      : "(Present thoughts — since last export)",
  )
  lines.push("")
  for (const note of notes) {
    lines.push("---")
    lines.push(`${getDayName(note.chakraDay)} — ${getChakraName(note.chakraDay)}`)
    lines.push(formatNoteDate(note.createdAt))
    lines.push(note.content.trim())
    lines.push("")
  }
  return lines.join("\n")
}

async function shareTextFile(body: string): Promise<void> {
  const base = FileSystem.cacheDirectory
  if (!base) {
    throw new Error("No cache directory")
  }
  const path = `${base}soulschool-notes-${Date.now()}.txt`
  await FileSystem.writeAsStringAsync(path, body, {
    encoding: FileSystem.EncodingType.UTF8,
  })
  const available = await Sharing.isAvailableAsync()
  if (!available) {
    await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => {})
    throw new Error("sharing_unavailable")
  }
  try {
    await Sharing.shareAsync(path, {
      mimeType: "text/plain",
      dialogTitle: JOURNEY_NOTES_EXPORT_COPY.alertTitle,
      ...(Platform.OS === "ios"
        ? { UTI: "public.plain-text" as const }
        : {}),
    })
  } finally {
    await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => {})
  }
}

async function runJourneyNotesExport(mode: JourneyNotesExportMode): Promise<void> {
  const { getAllNotes, lastJourneyNotesExportAt, markJourneyNotesExportedNow } =
    useJourneyNotesStore.getState()
  const notes = getAllNotes("journey")
  const lastAt = lastJourneyNotesExportAt ?? null
  const selected = selectJourneyNotesForExport(mode, notes, lastAt)

  if (mode === "incremental" && selected.length === 0) {
    Alert.alert(
      JOURNEY_NOTES_EXPORT_COPY.nothingNewTitle,
      JOURNEY_NOTES_EXPORT_COPY.nothingNewMessage,
    )
    return
  }

  if (selected.length === 0) {
    Alert.alert(
      JOURNEY_NOTES_EXPORT_COPY.emptyTitle,
      JOURNEY_NOTES_EXPORT_COPY.emptyMessage,
    )
    return
  }

  const body = formatJourneyNotesPlainText(selected, mode)
  try {
    await shareTextFile(body)
    markJourneyNotesExportedNow()
  } catch (e) {
    if (
      e instanceof Error &&
      e.message === "sharing_unavailable"
    ) {
      Alert.alert(
        JOURNEY_NOTES_EXPORT_COPY.sharingUnavailableTitle,
        JOURNEY_NOTES_EXPORT_COPY.sharingUnavailableMessage,
      )
      return
    }
    if (__DEV__) console.error("[journeyNotesExport]", e)
    Alert.alert(
      JOURNEY_NOTES_EXPORT_COPY.exportErrorTitle,
      JOURNEY_NOTES_EXPORT_COPY.exportErrorMessage,
    )
  }
}

/** Opens native chooser then share sheet. Safe to call from any UI thread. */
export function promptJourneyNotesExport(): void {
  const notes = useJourneyNotesStore.getState().getAllNotes("journey")
  if (notes.length === 0) {
    Alert.alert(
      JOURNEY_NOTES_EXPORT_COPY.emptyTitle,
      JOURNEY_NOTES_EXPORT_COPY.emptyMessage,
    )
    return
  }

  Alert.alert(
    JOURNEY_NOTES_EXPORT_COPY.alertTitle,
    JOURNEY_NOTES_EXPORT_COPY.alertMessage,
    [
      { text: JOURNEY_NOTES_EXPORT_COPY.cancel, style: "cancel" },
      {
        text: JOURNEY_NOTES_EXPORT_COPY.copyLabel,
        onPress: () => {
          void copyJourneyNotesToClipboard("full")
        },
      },
      {
        text: JOURNEY_NOTES_EXPORT_COPY.presentLabel,
        onPress: () => {
          void runJourneyNotesExport("incremental")
        },
      },
      {
        text: JOURNEY_NOTES_EXPORT_COPY.fullLabel,
        onPress: () => {
          void runJourneyNotesExport("full")
        },
      },
    ],
  )
}

export async function copyJourneyNotesToClipboard(
  mode: JourneyNotesExportMode = "full",
): Promise<void> {
  const { getAllNotes, lastJourneyNotesExportAt } =
    useJourneyNotesStore.getState()
  const notes = getAllNotes("journey")
  const selected = selectJourneyNotesForExport(
    mode,
    notes,
    lastJourneyNotesExportAt ?? null,
  )
  if (selected.length === 0) {
    Alert.alert(
      JOURNEY_NOTES_EXPORT_COPY.emptyTitle,
      JOURNEY_NOTES_EXPORT_COPY.emptyMessage,
    )
    return
  }
  await Clipboard.setStringAsync(
    formatJourneyNotesPlainText(selected, mode),
  )
  showHealingToast("notesCopied")
}

export async function copyNoteText(content: string): Promise<void> {
  const trimmed = content.trim()
  if (!trimmed) return
  await Clipboard.setStringAsync(trimmed)
  showHealingToast("thoughtCopied")
}
