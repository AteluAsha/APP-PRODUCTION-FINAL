# Waiting Room "Layer on Top" Bug – Investigation

## User clue

- User was stuck in the waiting room: no buttons working.
- Pressing the **hardware back button** on the phone caused a "revert" and a **layer removed itself**; after that, everything was clickable.

So something was rendering **on top** of the waiting room and capturing touches; that layer was dismissed by the Android back action.

## What we found

### 1. ChakraHome wrapper View (fixed)

When the waiting room is shown, ChakraHome returns:

```tsx
<View style={{ flex: 1, backgroundColor: "#000000" }}>
  {showWaitingScreen && <WaitingScreen ... />}
</View>
```

That wrapper **View had no `pointerEvents`**, so it defaulted to `"auto"`. On Android, that can make the parent view participate in hit-testing and **capture touches** before they reach `WaitingScreen`’s buttons/overlays. So the wrapper acted like an invisible full-screen layer: same visual (black) but taps never reached the waiting room.

**Fix:** Set `pointerEvents="box-none"` on that wrapper so it never captures touches; only `WaitingScreen` (and its children/overlays) receive them.

### 2. Possible modal layer (back button closes it)

If the user had a **Modal** open on top of the waiting room, the same behavior would match:

- Nothing clickable (modal overlay or dimmer capturing touches).
- Hardware back triggers `onRequestClose` → modal closes → waiting room becomes clickable.

Relevant modals used by the waiting room:

- **CommunicationReminderModal** – shown 60s after entering the room (if notification permission not granted). It has `onRequestClose={handleNotNow}`, so back would close it.
- **InviteFriendModal** – shown when the user taps "Build Your Tribe". Also has `onRequestClose`.

So if either modal was open (or appeared to be closed but was still mounted and blocking), pressing back would remove that layer and make the room clickable again.

### 3. Other overlays checked

- **PathSelectionGate** – only renders on WelcomeScreen (pathname check); not shown on ChakraHome.
- **GlobalHomeButton / FloatingNavButtons** – hidden when on ChakraHome in trial (waiting room); not the blocking layer.
- **ProfileSheet** – opens only from menu; not auto-shown on waiting room.
- **StillnessScreen** – only on (chakras) index during redirect; not on top of ChakraHome.

## Summary

- **Root cause addressed:** ChakraHome’s waiting wrapper now uses `pointerEvents="box-none"` so it cannot block touches to `WaitingScreen`.
- **If it happens again:** Check whether a modal (CommunicationReminderModal after 60s or InviteFriendModal) was open; back would close it and explain the “layer removed” behavior.

## Code change

- **File:** `components/chakras/ChakraHome.tsx`
- **Change:** On the `View` that wraps `WaitingScreen` when `needsWaiting` is true, add `pointerEvents="box-none"`.
