# Anua Critical Fixes Plan

## Problems

1. **Sanctuary flow broken**: Tap Anua icon → sanctuary opens → tap "Talk to Anua" → sanctuary closes, but Anua chat does not appear; instead Anua speaks over the Notes screen (voice plays, chat modal not visible).
2. **Wrong flow**: User must always get Anua's dedicated chat screen when they want to talk to her. No intermediary.
3. **Back button**: Closing Anua must return to the exact previous screen/state.
4. **Audio overlap (CRITICAL)**: Anua can play over herself when multiple things are clicked. Multiple audio files must never play simultaneously.

---

## Root Causes

1. **Modal stacking**: Notes BottomSheetModal may render above or interfere with AnuaChatModal. When sanctuary closes, notes sheet (if open) becomes visible; Anua chat modal may not be on top.
2. **Unnecessary intermediary**: Anua icon opens sanctuary first; user expects direct chat.
3. **No central Anua audio manager**: Each `speakAsAnua` creates a new sound; previous sounds are never stopped, causing overlap.

---

## Solution

### Phase 1: Anua Button → Direct Chat (Globally)

**Change**: Anua icon ALWAYS opens her chat directly. Skip sanctuary.

| Location                    | Current                                               | New                                                                    |
| --------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| FloatingNavButtons (trial)  | `handleOpenAnua` → `setIsSanctuaryModalVisible(true)` | `handleOpenAnua` → dismiss notes sheet, then `useAnuaChatStore.open()` |
| PermanentMenuBar (lifetime) | Anua `onPress` → `setIsSanctuaryModalVisible(true)`   | Anua `onPress` → dismiss notes sheet, then `useAnuaChatStore.open()`   |
| WaitingScreen               | Already opens chat via store                          | No change                                                              |

**Sanctuary access**: Community features (Share, Community Halls) remain via:

- PermanentMenuBar: "Community" menu item → CommunityHalls route
- Trial: Community/Share via other entry points if they exist, or keep a separate "Sanctuary" / "Community" option

**Dismiss notes before opening Anua**: Ensure notes sheet is dismissed so nothing blocks the chat modal. Use a small delay (e.g. 150–200ms) after dismiss before opening Anua so the sheet is fully gone.

---

### Phase 2: Modal Stacking and Visibility

**Ensure AnuaChatModal is always on top**:

- Use React Native `Modal` with `presentationStyle="pageSheet"` (already in use)
- Add `statusBarTranslucent` and ensure it renders after any BottomSheetModal in the tree
- Consider rendering GlobalAnuaChat as the last child in the layout so it has highest z-index

**Dismiss blockers before opening**:

- Create `openAnuaChat(options?)` helper that: (1) dismisses notes sheet via ref/callback, (2) closes sanctuary if open, (3) waits 200ms, (4) calls store.open()
- FloatingNavButtons and PermanentMenuBar use this helper when Anua is tapped

---

### Phase 3: Back Button / Close Behavior

**Rule**: Closing Anua chat must not navigate or change routes. It only hides the modal.

- `AnuaChatModal` close button → `onClose()` → `store.close()` → modal hides
- No `router.back()` or `router.replace()`
- Underlying screen (chakra page, etc.) is unchanged
- If notes sheet was open before Anua, we had to dismiss it to show Anua. After closing Anua, we do NOT reopen notes automatically (that could be confusing). User returns to the main screen they were on. Document this as expected.

---

### Phase 4: Anua Audio – Single Instance (CRITICAL)

**Add to `src/services/elevenlabs.ts`**:

```ts
// Module-level reference to current Anua sound
let currentAnuaSound: Audio.Sound | null = null

export const stopAnuaAudio = async (): Promise<void> => {
  if (currentAnuaSound) {
    try {
      await currentAnuaSound.stopAsync()
      await currentAnuaSound.unloadAsync()
    } catch (e) {
      if (__DEV__) console.warn("Error stopping Anua audio:", e)
    }
    currentAnuaSound = null
  }
}
```

**Update `speakAsAnua`**:

- At the very start: `await stopAnuaAudio()`
- After `createAsync`: set `currentAnuaSound = sound`
- In `didJustFinish` and error handlers: set `currentAnuaSound = null`
- Ensure we never play if we didn't stop previous

**Update `synthesizeAnuaVoice`** (if called directly):

- Callers that play the sound must go through `speakAsAnua` or we need a shared play path that uses `stopAnuaAudio` first.

**All Anua voice entry points** must use this:

- AnuaChatModal (greeting, response)
- anuaRitualService
- anuaReader
- anuaNavigation
- gemini (if it speaks)
- VoiceRecordingModal / voiceSanctuary (if they use Anua voice)

They already call `speakAsAnua`; once we update `speakAsAnua` to stop before playing, all paths are covered.

---

## Files to Modify

| File                                           | Changes                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/services/elevenlabs.ts`                   | Add `stopAnuaAudio`, track `currentAnuaSound`, call stop at start of `speakAsAnua`          |
| `components/navigation/FloatingNavButtons.tsx` | Anua button → dismiss notes, delay, store.open(); remove or repurpose sanctuary             |
| `components/navigation/PermanentMenuBar.tsx`   | Anua menu item → dismiss notes, delay, store.open(); sanctuary only if needed elsewhere     |
| `components/social/SocialSanctuaryModal.tsx`   | Keep for Community/Share if needed; "Talk to Anua" can be removed or routed to store.open() |
| `app/_layout.tsx`                              | Ensure GlobalAnuaChat is rendered last for stacking (if needed)                             |

---

## Optional: Keep Sanctuary for Community/Share

If trial users need Share and Community Halls:

- Add a separate "Community" or "Sanctuary" floating button, or
- Keep sanctuary but make Anua icon open chat directly; sanctuary opens from a different control

For APP_2, "Community" already goes to CommunityHalls. "Anua" can go straight to chat.

---

## Summary

1. Anua icon → **always** open her chat directly (dismiss notes first, then store.open).
2. Dismiss notes (and any sanctuary) before opening Anua so the chat modal is on top.
3. Close Anua → only hide modal; no navigation.
4. **stopAnuaAudio()** before every `speakAsAnua`; single active Anua sound at a time.
