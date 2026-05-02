/**
 * Copy for journey notes export (share sheet). Single source for sheet + full diary.
 */

export const JOURNEY_NOTES_EXPORT_COPY = {
  exportHint: "Export reflections",
  alertTitle: "Take your notes with you",
  alertMessage:
    "Your notes stay on this device until you send them.\n\nPresent thoughts — reflections since your last export.\n\nFull download — your whole diary in one file.",
  presentLabel: "Present thoughts",
  fullLabel: "Full download",
  cancel: "Cancel",
  emptyTitle: "Nothing to export yet",
  emptyMessage: "When you have reflections here, you can send them wherever you keep what matters.",
  nothingNewTitle: "All caught up",
  nothingNewMessage:
    "There are no new reflections since your last export. Try Full download if you want everything in one file.",
  sharingUnavailableTitle: "Sharing unavailable",
  sharingUnavailableMessage:
    "This device cannot open the share sheet right now. Try again later.",
  exportErrorTitle: "Could not export",
  exportErrorMessage: "Something went wrong preparing your file. Please try again.",
} as const
