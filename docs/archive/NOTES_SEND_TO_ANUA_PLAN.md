# Notes → Send Thought to Anua – Implementation Plan

## Goal

Add a **subtle** option on each note in "Notes Along the Way" to **send that note to Anua**, which immediately opens her chat with the note as the first user message and starts the conversation (Anua responds).

- Label: **"Send thought to Anua"** (or similar, subtle copy)
- UX: Clever but not distracting; discoverable but not intrusive

---

## Current Architecture

- **JourneyNotesView** (bottom sheet): Rendered by FloatingNavButtons / PermanentMenuBar
- **NotesAlongTheWay** (full page): Standalone route
- **AnuaChatModal**: Rendered inside SocialSanctuaryModal (and WaitingScreen)
- **SocialSanctuaryModal**: Opened via FloatingNavButtons / PermanentMenuBar when user taps Anua

---

## Design: Subtle "Send thought to Anua"

- **Placement**: Per note card – small, low-visibility control
- **Options**:
  - A: Small leaf or sparkle icon at bottom-right of each note card; tap reveals or shows "Send to Anua"
  - B: Long-press on note → contextual "Send thought to Anua" option
  - C: Faint text link or icon below the note content: "Share with Anua" / "Send to Anua"
- **Recommendation**: **Option C** – small, muted text or icon below each note: e.g. `"Send thought to Anua"` in `text-white/40`, `size="xs"`. Feels integrated and discoverable without dominating the note.

---

## Technical Approach

### Option A: Global Store (Recommended)

Use a **Zustand store** so any screen can open Anua with an optional initial message.

1. **`useAnuaChatStore`**
   - `open(options?: { initialMessage?: string })`
   - `close()`
   - `isOpen: boolean`
   - `initialMessage: string | null`

2. **Render `AnuaChatModal` in root layout**
   - Single instance, always available
   - Reads `isOpen`, `initialMessage` from store
   - Uses `getCurrentDayOfWeek()` and `getChakraName()` for context

3. **Update entry points**
   - **SocialSanctuaryModal**: Call `store.open()` instead of local `isAnuaChatVisible`
   - **WaitingScreen**: Same
   - **JourneyNotesView** and **NotesAlongTheWay**: On "Send thought to Anua" tap → `store.open({ initialMessage: note.content })`; parent dismisses notes sheet if needed

4. **`AnuaChatModal`**
   - Add prop `initialMessage?: string | null`
   - On open, when `initialMessage` is set:
     - Add greeting as usual
     - Add user message with `initialMessage`
     - Call `askAnua` with that text and append Anua’s reply
     - Skip greeting voice when starting from a note (or keep it, product choice)

---

### Option B: Callback-Only (No Store)

- Lift `AnuaChatModal` into FloatingNavButtons / PermanentMenuBar
- Pass `onSendNoteToAnua` into `JourneyNotesView`
- **Issue**: NotesAlongTheWay is a route, not a child of those components, so it cannot use this callback. Would need another mechanism for the full page.

→ **Recommend Option A** so both sheet and full-page notes can open Anua.

---

## Files to Change

| File                                         | Changes                                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `hooks/useAnuaChatStore.ts`                  | **New** – store for open/close and `initialMessage`                                    |
| `components/social/AnuaChatModal.tsx`        | Add `initialMessage`; when set, add user msg + auto-send and show Anua reply           |
| `app/_layout.tsx`                            | Render `AnuaChatModal` from store (or `GlobalAnuaChat` wrapper)                        |
| `components/social/SocialSanctuaryModal.tsx` | Use store instead of local `isAnuaChatVisible`                                         |
| `components/chakras/WaitingScreen.tsx`       | Use store instead of local `isAnuaChatVisible`                                         |
| `components/chakras/JourneyNotesView.tsx`    | Add per-note "Send thought to Anua" control; on tap → `store.open({ initialMessage })` |
| `app/(chakras)/NotesAlongTheWay.tsx`         | Same per-note control and `store.open()`                                               |

---

## UI: Per-Note "Send thought to Anua"

**Placement**: Inside each `noteCard`, below the note content and date.

```tsx
{
  /* Inside note card, after note.content */
}
;<Pressable
  onPress={() => onSendToAnua?.(note.content)}
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  style={{ alignSelf: "flex-start", marginTop: 8 }}
>
  <AppText font="instrument-regular" size="xs" className="text-white/40">
    Send thought to Anua
  </AppText>
</Pressable>
```

- Style: `text-white/40`, `size="xs"`, minimal padding
- Optional: small icon (e.g. `leaf-outline` or `chatbubble-outline`) before text
- Haptic feedback on tap

---

## Flow Summary

1. User sees a note in Notes (sheet or full page).
2. Taps subtle **"Send thought to Anua"**.
3. Notes sheet (if open) is dismissed.
4. Anua chat opens with:
   - Greeting
   - User message = note content
   - Anua’s reply (from API)
5. User continues the conversation as normal.

---

## Edge Cases

1. **No API / Anua unavailable**  
   Same error handling as today; user sees Anua’s fallback message.

2. **Long notes**  
   Send full content; Gemini can handle long inputs. If needed, truncate with "..." and a char limit (e.g. 500).

3. **Notes on WaitingScreen**  
   Notes are not available on WaitingScreen, so no change there.

4. **Chakra context**  
   Use `getCurrentDayOfWeek()` when opening from store. Later, could pass `chakraDay` from the note’s `chakraDay` for finer context.

---

## Summary

1. Add `useAnuaChatStore` for global Anua open/close and optional `initialMessage`.
2. Render `AnuaChatModal` from layout and drive it with the store.
3. Add `initialMessage` support in `AnuaChatModal` (user message + auto-send + Anua reply).
4. Migrate SocialSanctuaryModal and WaitingScreen to use the store.
5. Add subtle "Send thought to Anua" control per note in JourneyNotesView and NotesAlongTheWay.
6. Dismiss notes sheet when opening Anua from the sheet.
