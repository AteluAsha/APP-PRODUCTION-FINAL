# Notes Along the Way – Global Audit

## Summary

Notes Along the Way is correctly synced for both trial and lifetime users, inputs save immediately to local persisted storage, and close/back/revert behavior is correct. One small improvement was made (Send-to-Anua fallback in sheet). Access is easy in the moment from multiple entry points.

---

## 1. Sync to Trial and Lifetime

### Single store, both apps

- **Store:** [hooks/useJourneyNotesStore.ts](hooks/useJourneyNotesStore.ts) – one global store; no trial vs lifetime split. Notes persist across app restarts, trial resets, and app updates (doc: "Notes are always stored and never deleted unless user chooses").
- **Trial (APP_1):** Notes are available as soon as the journey starts (first Monday). Entry: **FloatingNavButtons** – Leaf button opens the notes bottom sheet. Trial users do not see PermanentMenuBar; they use the floating Leaf to open notes.
- **Lifetime (APP_2):** Notes always available. Entry: **PermanentMenuBar** – "Notes" menu item opens the same notes sheet. **FloatingNavButtons** is hidden when `hasLifetimeAccess`, so lifetime users use the menu bar only.
- **Full-page route:** [app/(chakras)/NotesAlongTheWay.tsx](app/(chakras)/NotesAlongTheWay.tsx) – available to both trial and lifetime; reached via "Open full diary" from the sheet or direct navigation (e.g. AudioPlayer link with `contextDay`).

### Context (chakra day)

- Notes are stored by **chakra day** (0–6), not calendar date. [utils/notesContextChakra.ts](utils/notesContextChakra.ts) derives context from route (e.g. Root page → day 0). When not on a chakra page, `getCurrentDayOfWeek()` is used. Both **JourneyNotesView** and **NotesAlongTheWay** use `contextChakraDay` / `effectiveContext` so "in the moment" means the day they're viewing.

---

## 2. Inputs Save Correctly

### Add flow

- **JourneyNotesView** and **NotesAlongTheWay:** User types in `TextInput` (max 1000 chars, `<>` stripped). On "Send" (add button), `handleAddNote` runs: `addNote({ chakraDay: targetDay, content: trimmedText, type: "journey" })`, then `setNoteText("")`. Target day is `selectedChakraDay === "all" ? effectiveContext : selectedChakraDay`.
- **Store:** `addNote` creates a note with `id` (timestamp + random), `createdAt` (ISO), and appends to `notes`. Zustand `persist` middleware writes to AsyncStorage on every state change, so the new note is saved immediately.
- **No server:** All notes are local (AsyncStorage). No Firestore or remote sync; no network dependency, so no "high traffic" server load. High traffic on the client means many rapid local writes; AsyncStorage handles normal usage (add a few notes at a time) without issue.

### Messages stored correctly

- Each note: `id`, `chakraDay`, `content`, `createdAt`, `type: "journey"`. Display uses `formatDate(note.createdAt)` and `note.content`. No truncation or corruption in the pipeline.
- **Sanitization:** `handleTextChange` limits length to 1000 and removes `<` and `>` to avoid injection; content is stored as entered (trimmed on add).

---

## 3. High-Traffic Use

- **Local-only:** No rate limiting needed for a backend; all writes are to device storage.
- **Persist:** Zustand persist runs on each `set()`. Many rapid adds in a short time could cause many serializations; for typical use (user adding one note at a time) this is fine. If we ever see slowness with very fast successive adds, we could add a debounced persist or partial updates in a future iteration.
- **Read path:** `getAllNotes("journey")` and `getNotesForDay(chakraDay)` are in-memory filters; no heavy work. List and filter logic are correct for large note counts (grouping by day, sorting).

---

## 4. Close / Back / Revert

### Full page (NotesAlongTheWay)

- **Back:** [components/ActionBar.tsx](components/ActionBar.tsx) is used with default props (no custom `onBackPress`). ActionBar calls `router.back()` when `router.canGoBack()`, so the user returns to the previous screen. **Working as intended.**

### Notes sheet (JourneyNotesView)

- **Close:** Sheet is a **BottomSheetModal** with `enablePanDownToClose` and **BottomSheetBackdrop**. User can swipe down or tap backdrop to dismiss. Parent (PermanentMenuBar or FloatingNavButtons) holds the ref and can call `notesSheetRef.current?.dismiss()` when needed (e.g. "Open full diary", "Send thought to Anua"). **Working as intended.**
- **Android back:** [FloatingNavButtons](components/navigation/FloatingNavButtons.tsx) registers a `BackHandler` when the notes sheet is open and dismisses it so the user is not stuck. **Working as intended.**

### Revert / discard

- **No edit-in-place:** Notes are add-only in the UI; there is no edit or delete button. So there is no "revert edit" flow.
- **Draft:** If the user types but does not tap Send and then closes the sheet or navigates back, the draft is lost (not saved). This is expected; the input is intentionally cleared only after a successful add. No discard confirmation is implemented; we could add one later if desired.

---

## 5. Easy Access in the Moment

### Entry points

| Context | How to open notes |
|--------|---------------------|
| **Trial (ChakraHome, chakra day, etc.)** | Leaf floating button (left) → notes sheet. |
| **Lifetime (ChakraHub, any screen with menu bar)** | Menu bar → "Notes" → notes sheet. |
| **AudioPlayer (any)** | Notes entry in player UI → notes sheet with `theme="player"` and `contextChakraDay={dayIndex}`. |
| **From sheet** | "Open full diary" → dismisses sheet, then `router.push(NotesAlongTheWay?contextDay=…)`. |
| **Direct route** | `/(chakras)/NotesAlongTheWay` or `?contextDay=0`–`6` to open full page with a specific day. |

### In-the-moment behavior

- **Chakra day selector:** Both the sheet and full page have **ChakraDaySelector** so the user can filter by day or "All" and choose which day a new note is attached to. Default is the current screen context (`effectiveContext`).
- **Hint (sheet):** "All notes save to the chakra you're exploring in this moment." Aligns UX with storing by chakra day.
- **Placeholder:** "Share your reflections for [DayName]..." so it’s clear which day the next note will go to.

---

## 6. Fix Applied

- **Send thought to Anua (sheet):** When a parent does not pass `onSendToAnua` to JourneyNotesView, "Send thought to Anua" now still opens Anua with the note content by calling `useAnuaChatStore.getState().open({ initialMessage: note.content })`. Parents that pass `onSendToAnua` unchanged: they dismiss the sheet and then open Anua so the flow stays correct.

---

## 7. Checklist (Manual Verification)

- [ ] **Trial:** On ChakraHome or a chakra day, tap Leaf → notes sheet opens. Add a note → it appears and persists after closing and reopening.
- [ ] **Lifetime:** From ChakraHub, open menu bar → Notes → sheet opens. Add a note → same persistence.
- [ ] **Full page:** From sheet, tap "Open full diary" → full page opens with same notes. Back button returns to previous screen.
- [ ] **AudioPlayer:** From player, open notes → sheet with player theme; add note for that chakra day; close sheet.
- [ ] **Android back:** With notes sheet open (trial or lifetime), press device Back → sheet dismisses.
- [ ] **Context day:** On Root (Monday) page, add note → note appears under Monday/Root. Change selector to another day, add note → appears under that day.
- [ ] **Send to Anua:** In sheet or full page, tap "Send thought to Anua" on a note → Anua opens with that text (and sheet dismisses when parent provides callback).
