# Floating Audio Player Redesign Plan

## Current State

- **Component:** `MiniAudioPlayer` in `components/chakras/MiniAudioPlayer.tsx`
- **Where shown:** ChakraTemplate only (chakra day content screens)
- **Current design:** Large purple gradient bar, bright yellow border, shadow – visually aggressive
- **Current behavior:** Tap to open full AudioPlayer. No close, no play/pause, no navigation.

## User Requests

1. **Less aggressive, more simple** – Small, black, non-distracting
2. **Close button** – Shut music down and dismiss the bar
3. **Play/pause** – Control playback without opening full player
4. **Back to Music Room** – Navigate to AudioLibrary

---

## Option A: Minimal Redesign (Recommended)

**Effort:** Low  
**Scope:** MiniAudioPlayer only

### Design Changes

| Current                           | New                                                                 |
| --------------------------------- | ------------------------------------------------------------------- |
| Full-width bar (`left-4 right-4`) | Compact pill (`w-auto` or fixed ~280px, centered)                   |
| Purple gradient + yellow border   | Black/dark grey (`#1a1a1a`), subtle border `rgba(255,255,255,0.08)` |
| Large padding, big icons          | Compact: 8–10px padding, smaller icons (16–18px)                    |
| "Tap to open audio player"        | Remove; use icon affordances only                                   |
| Expand icon only                  | Play, Close, Music Room (list) icons                                |

### Controls

1. **Play/Pause** – Left: tap to open full AudioPlayer (same as current “tap bar”)
2. **Close** – Right: `useCurrentAudioStore.getState().reset()` → clears store, hides bar
3. **Music Room** – Middle or right: `router.push('/(chakras)/AudioLibrary')`

### Play/Pause Limitation

- Today, audio stops when leaving the full AudioPlayer (unmount unloads the track).
- The mini bar only appears after the user has left the full player, so audio is already stopped.
- **“Play”** = tap bar → open full AudioPlayer → it initializes and plays.
- **“Pause”** is not meaningful on the bar unless we add background audio; defer that for now.
- **Implementation:** Single play icon on the left that opens the full player (same as tapping the bar).

### Layout (Compact Black Bar)

```
[Play icon]  Track title (truncated)  [Music Room] [X Close]
```

- Small black pill, ~40px height
- Position: `bottom-24` (above nav/buttons), centered or left-aligned with margin
- Track title: one line, ellipsis
- No “Tap to open” text

---

## Option B: Global Mini Player + Background Audio

**Effort:** High  
**Scope:** Store, global layout, AudioPlayer refactor

- Render MiniAudioPlayer from root layout (like FloatingNavButtons)
- Keep `Audio.Sound` in a global hook/service so it survives navigation
- Add real play/pause on the mini bar
- More complex; defer unless Option A is insufficient.

---

## Implementation Checklist (Option A)

1. [x] Replace LinearGradient with simple black `View` (`#1a1a1a`)
2. [x] Remove yellow border and purple shadow
3. [x] Reduce size: compact pill, smaller padding
4. [x] Add **Close** button (X) – calls `reset()`
5. [x] Add **Music Room** button (list/music icon) – navigates to `/(chakras)/AudioLibrary`, resets store
6. [x] Keep **Play** affordance – tap bar or play icon opens full AudioPlayer
7. [x] Ensure close stops audio – `reset()` clears store. Add effect in AudioPlayer: when `source` becomes null, unload track (handles edge case where user navigated without popping, so AudioPlayer still mounted)
8. [ ] (Optional) Render MiniAudioPlayer globally when `source && metadata && !prefs?.isIntroAudio` for APP2 – so it shows when playing from Music Room and navigating elsewhere

---

## File Changes

| File                                     | Change                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------- |
| `components/chakras/MiniAudioPlayer.tsx` | Redesign: black compact bar, Play (open), Music Room (nav), Close (reset) |
| `app/AudioPlayer.tsx`                    | Add effect to unload track when source becomes null                       |
| `app/_layout.tsx`                        | (Optional) Add global MiniAudioPlayer for APP2 when audio is active       |

---

**Status:** Executed ✅
