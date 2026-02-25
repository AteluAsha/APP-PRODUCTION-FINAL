# Music Room Audio UX Overhaul Plan

## Mini Player Placement – Menu Bar Integration

**User idea:** Place the mini player as a tiny bar above the Music symbol on the menu bar. Attached to the menu bar. When the menu bar toggles closed, the mini player bar stays visible.

**Why this works:**

- **Contextual** – Controls sit where Music lives; users know where to look
- **Non-intrusive** – No floating overlay; fixed to the existing menu structure
- **Persistent** – Still accessible when the menu is collapsed (arrow remains; mini bar stays above)
- **Simple** – Small play/pause/close bar, no redirects or extra navigation

---

## Goals

1. **Remove the current floating mini player** – Too many issues; simplify
2. **Music Room – Inline play/pause** – No navigation to full playback screen; play button on each track row toggles play/pause
3. **Music Room – Background play + minimal mini** – When user leaves Music Room while audio is playing, audio continues; a tiny mini player (play, pause, close) appears so they can stop it anytime
4. **All other audio** – Stops when user leaves the page where the play button was

---

## Current State

| Location                        | Behavior                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Music Room (AudioLibrary)**   | `playWithPlaylist` → `router.push('/AudioPlayer')`                                                  |
| **Sound Healing (SoundBath)**   | Tuning fork / Crystal bowl → `router.push('/AudioPlayer')`                                          |
| **Chakra day (ChakraTemplate)** | AudioRow (intro/outro) → `router.push('/AudioPlayer')`; MiniAudioPlayer rendered at bottom          |
| **MiniAudioPlayer**             | Play (opens full player), title, Music Room nav, Close; shown when `source && !prefs?.isIntroAudio` |

---

## New Behavior

### Music Room (AudioLibrary)

| Action                           | Result                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------- |
| Tap track row                    | Toggle play/pause on that track (no navigation)                              |
| Stay in Music Room               | Track plays; play icon switches to pause on active row; other rows show play |
| Leave Music Room (navigate away) | Audio keeps playing; minimal mini player appears                             |
| Mini player                      | Play, Pause, Close only. No "open full player" or "go to Music Room"         |

### Everywhere Else (Sound Healing, Chakra day, etc.)

| Action                         | Result                                          |
| ------------------------------ | ----------------------------------------------- |
| Tap play                       | Navigate to full AudioPlayer screen (unchanged) |
| Leave that page (back/unmount) | Audio stops; reset store                        |

---

## Implementation Plan

### Phase 1: Store and Origin Tracking

**File:** `hooks/useCurrentAudioStore.ts`

- Add `audioOrigin: 'music-room' | 'other' | null`
- Add `setPlaying(playing: boolean)` – used by Music Room and mini player for play/pause
- Add `setSourceWithPlaylist` overload or new `setSourceFromMusicRoom` that sets `audioOrigin: 'music-room'`
- Ensure `setSource` (used by other pages) sets `audioOrigin: 'other'`
- `reset()` clears `audioOrigin`

### Phase 2: Headless Playback for Music Room

**Problem:** Today, playback happens inside the AudioPlayer screen. Music Room should play without navigating.

**Solution:** Add a **MusicRoomAudioManager** component that:

- Mounts in root layout (or inside a provider that wraps chakra routes)
- Subscribes to store: when `source && audioOrigin === 'music-room'`, it creates the expo-av Sound and manages play/pause
- Listens to `setPlaying` – when user toggles play/pause, it calls `track.playAsync()` or `track.pauseAsync()`
- Handles playlist advance (when track ends, call `advanceToNext()` and load next)
- Does NOT render any UI

**File:** `components/audio/MusicRoomAudioManager.tsx` (new)

- Uses same expo-av logic as current AudioPlayer (createAsync, status callback, etc.)
- Exposes `isPlaying` back to store (or derive from status)
- Renders `null`

### Phase 3: Music Room – Inline Play/Pause

**File:** `app/(chakras)/AudioLibrary.tsx`

- Remove `router.push('/AudioPlayer')` from `playWithPlaylist`
- `playWithPlaylist` calls `setSourceFromMusicRoom` (or equivalent) with `audioOrigin: 'music-room'`
- MusicRoomAudioManager picks up source and starts playing
- **Track row UI:** Show play vs pause icon based on:
  - Is this row the "current" track? (compare by title/source or store a `currentTrackId`)
  - Is it playing? (`isPlaying` from store)
- On row press: if same track and playing → pause; if same track and paused → play; if different track → load new and play

**Identifying current track:** Store `currentTrackId` (e.g. `chakra_index` or composite key) when setting source from Music Room. AudioTrackRow checks if it’s the active one.

### Phase 4: Mini Player – Attached to Menu Bar Above Music Icon

**Placement (user request):** A tiny bar above the Music symbol on the menu bar. Attached to the menu bar. When the menu bar toggles closed, the mini player bar stays visible.

**File:** `components/navigation/MenuBarMiniPlayer.tsx` (new) or integrated into `PermanentMenuBar.tsx`

**Visibility:** Show when:

- `source && metadata && audioOrigin === 'music-room'`
- AND user is NOT on `/(chakras)/AudioLibrary` (so it doesn’t duplicate inline controls)

**Content:** Play, Pause, Close only (compact pill/capsule above the Music icon)

**Layout:**

- **Horizontal (bottom) menu:** Position a small pill/bar above the Music icon (leftmost item). Use `position: absolute` so it sits above the Music circle. Width: ~80–100px (enough for three small buttons).
- **When menu closes:** The mini player is in a separate `View` that does NOT animate with `menuTranslateY`. It stays anchored (e.g. `bottom: insets.bottom + 60` or similar) so it remains visible when the menu slides down. The arrow button stays visible when closed – the mini player sits just above that region, aligned with the Music icon’s horizontal position.
- **Vertical (left wall) layout:** On healing screens, the Music icon is in the vertical stack. Show the mini bar above the Music item in that column, or reuse the same horizontal mini bar positioned above the bottom area where the Music icon would be in collapsed state. Simpler: always position the mini player at bottom-left, above where the Music icon lives in horizontal layout, so behavior is consistent.

**Structure:**

- Render the mini player as a sibling of the menu bar container, not inside the animated menu.
- `bottom` = `insets.bottom + [menu bar height + small gap]` when menu is open, or `insets.bottom + [arrow height + gap]` when closed – so it stays visible in both states.
- Align left with the Music icon’s approximate x position (first item).

**Actions:**

- Play → `setPlaying(true)`
- Pause → `setPlaying(false)`
- Close → `reset()`

### Phase 5: Remove Mini Player from ChakraTemplate

**File:** `components/chakras/ChakraTemplate.tsx`

- Remove `MiniAudioPlayer` import and usage
- Chakra day audio (intro/outro) continues to navigate to AudioPlayer; when user leaves that screen, audio stops (Phase 6)

### Phase 6: Stop Audio on Leave (Non–Music Room)

**File:** `app/AudioPlayer.tsx`

- On unmount or `useFocusEffect` with `return` (blur): call `reset()` when `audioOrigin === 'other'`
- This ensures Sound Healing / Chakra day audio stops when user goes back

**Alternative:** Use a layout-level effect: when route changes away from `/AudioPlayer` and `audioOrigin === 'other'`, call `reset()`. Simpler to do in AudioPlayer: `useEffect` cleanup on unmount calls `reset()`.

**File:** `app/(chakras)/SoundBath.tsx`

- No change to navigation; it still pushes to AudioPlayer
- Stopping is handled by AudioPlayer unmount

### Phase 7: Cleanup

- Remove old `MiniAudioPlayer.tsx` (or deprecate); replaced by `MenuBarMiniPlayer` in PermanentMenuBar
- Ensure AudioPlayer screen is never used for Music Room flows (no navigation from AudioLibrary)
- Update `setSource` so that when used by AudioRow, SoundBath, etc., it sets `audioOrigin: 'other'`

---

## File Summary

| File                                          | Action                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `hooks/useCurrentAudioStore.ts`               | Add `audioOrigin`, `setPlaying`, `isPlaying`; `setSourceFromMusicRoom`                  |
| `components/audio/MusicRoomAudioManager.tsx`  | **New** – headless playback when origin is music-room                                   |
| `app/(chakras)/AudioLibrary.tsx`              | Inline play/pause; no router.push; track active/playing state                           |
| `components/navigation/MenuBarMiniPlayer.tsx` | **New** – tiny bar above Music icon: play, pause, close; stays visible when menu closes |
| `components/chakras/ChakraTemplate.tsx`       | Remove MiniAudioPlayer                                                                  |
| `app/AudioPlayer.tsx`                         | On unmount, `reset()` when `audioOrigin === 'other'`                                    |
| `app/_layout.tsx`                             | Mount MusicRoomAudioManager                                                             |
| `components/navigation/PermanentMenuBar.tsx`  | Integrate MenuBarMiniPlayer above Music icon (stays when menu closes)                   |
| `components/chakras/AudioRow.tsx`             | `setSource` with `audioOrigin: 'other'`                                                 |
| `app/(chakras)/SoundBath.tsx`                 | No change (already navigates to AudioPlayer)                                            |

---

## Edge Cases

1. **User plays Music Room track, goes to Sound Healing, presses play there** – Reset first (clear Music Room audio), then set new source with `audioOrigin: 'other'`. Sound Healing opens AudioPlayer.
2. **User plays Music Room track, goes to Chakra day, presses embodiment audio** – Same: reset, then new source with `audioOrigin: 'other'`.
3. **Playlist advance** – MusicRoomAudioManager handles `didJustFinish` and `advanceToNext()` same as current AudioPlayer.
4. **Music Room – track row play/pause** – Must support pausing and resuming without changing source.

---

## Execution Order

1. Phase 1 – Store changes
2. Phase 2 – MusicRoomAudioManager
3. Phase 3 – AudioLibrary inline play
4. Phase 4 – New MiniAudioPlayer
5. Phase 5 – Remove MiniAudioPlayer from ChakraTemplate
6. Phase 6 – Stop on leave for non–Music Room
7. Phase 7 – Cleanup and verification
