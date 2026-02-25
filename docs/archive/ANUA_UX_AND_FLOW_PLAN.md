# Anua UX, Flow, and Personality Plan

## Critical Correction: Anua Button Flow

**I made an error.** The Anua button does NOT open her chat directly (except in Waiting Room).

| Location                                                   | Correct Behavior                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Waiting Room**                                           | Anua icon → opens her chat DIRECTLY (only exception)                       |
| **Everywhere else** (FloatingNavButtons, PermanentMenuBar) | Anua icon → opens **Sanctuary** screen                                     |
| **Sanctuary screen**                                       | "Talk to Anua" button → must open her chat **immediately** (fix bugs here) |

**Revert**: FloatingNavButtons and PermanentMenuBar – change Anua button back to opening Sanctuary, not chat.

**Fix**: Sanctuary "Talk to Anua" button – ensure it properly dismisses notes sheet, closes sanctuary, delays, then opens Anua chat so her screen is visible and not blocked.

---

## 1. Revert Anua Button to Open Sanctuary

- **FloatingNavButtons**: `handleOpenAnua` → `setIsSanctuaryModalVisible(true)` (restore)
- **PermanentMenuBar**: Anua menu item `onPress` → `setIsSanctuaryModalVisible(true)` (restore)

---

## 2. Fix Sanctuary "Talk to Anua" Button

**Problem**: When user taps "Talk to Anua" in Sanctuary, it closed and Anua spoke over the Notes screen – chat modal not visible.

**Cause**: Notes sheet (if open) may block or stack above Anua modal; timing/order of dismissals.

**Fix**: Parent (FloatingNavButtons, PermanentMenuBar) provides `onOpenAnuaChat` that:

1. Dismisses notes sheet
2. Closes sanctuary modal
3. Waits 200ms
4. Calls `useAnuaChatStore.getState().open({ isWaitingRoom })`

**Sanctuary change**: "Talk to Anua" calls **only** `onOpenAnuaChat()` – parent owns the full flow. Remove `store.open()` and `onClose()` from the button; parent does it all.

---

## 3. Anua Chat: Text vs Voice Modes

**Current problem**: Text appears before she speaks; both show at once.

**Desired**:

- **Auto-speak**: Only once on opening (greeting).
- **After opening**: User must explicitly choose voice or text.
- **No dual display**: If she speaks, do not show text at the same time. One or the other.
- **Like Gemini**: Text mode OR voice button to hear. User decides.

### Mode Behavior

| Mode      | Anua's response                                                                                  | UI                                  |
| --------- | ------------------------------------------------------------------------------------------------ | ----------------------------------- |
| **Text**  | Show text in bubble only. No voice.                                                              | Standard chat bubbles               |
| **Voice** | Speak via ElevenLabs. Optionally show text only after she finishes (or not at all during speech) | "Speaking" screen / listening state |

### Implementation

- **Default**: Text mode (or user's last choice).
- **Voice toggle**: When ON, Anua speaks responses. When OFF, text only.
- **On opening**: Speak greeting once (if voice available), then respect mode.
- **During response**:
  - **Text mode**: Show text when received.
  - **Voice mode**: Show a "speaking" / listening UI while she speaks; show text only after speech finishes (or keep it as a "transcript" below).
- **Engaging speaking screen**: When she is speaking, show a distinct UI (e.g. waveform, “Anua is speaking…”) instead of immediately showing the full text bubble.

---

## 4. Anua's Personality / System Prompt

**Principle**: Anua never uses pre-formatted or canned text unless absolutely necessary.

**Default behavior**:

- Listen intently first
- Process with her wisdom
- Respond with direct, personalized engagement
- Live in the now

**Update** `getAnuaSystemInstruction` in `gemini.ts`:

- Add explicit instruction: prefer listening and direct engagement over pre-scripted answers
- Emphasize real-time, context-aware responses
- Avoid generic, templated replies

**Gemini Pro Live**: The Live API offers real-time voice/video. Current app uses Gemini 1.5 Pro REST. Moving to Live API would need WebSockets and a different integration. For this plan, focus on prompt and UX. Live API can be a later phase.

---

## Files to Modify

| File                                           | Changes                                                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `components/navigation/FloatingNavButtons.tsx` | Revert Anua button → open Sanctuary. Update `onOpenAnuaChat` to dismiss notes, close sanctuary, delay, open chat |
| `components/navigation/PermanentMenuBar.tsx`   | Revert Anua menu → open Sanctuary. Same `onOpenAnuaChat` logic                                                   |
| `components/social/SocialSanctuaryModal.tsx`   | "Talk to Anua" calls only `onOpenAnuaChat()`. Parent handles dismiss/close/open                                  |
| `components/social/AnuaChatModal.tsx`          | Text vs Voice modes; speaking screen; auto-speak only on open                                                    |
| `src/services/gemini.ts`                       | Update `getAnuaSystemInstruction` for listen-first, direct engagement, live-in-now                               |

---

## Summary

1. **Revert** Anua button to open Sanctuary (except Waiting Room).
2. **Fix** Sanctuary "Talk to Anua" so parent dismisses notes, closes sanctuary, delays, opens chat.
3. **Anua Chat UX**: Text or Voice; auto-speak only on open; no text + voice at same time; dedicated speaking screen when she speaks.
4. **System prompt**: Listen first, direct engagement, live in the now; avoid pre-formatted responses.
