# Preload UX: Path selection + waiting room flow

## Your idea (summary)

1. **Trigger at path selection:** When the user selects the 7 chakras path (e.g. taps "Enter Path" on WelcomeScreen), show either:
   - **Automatic:** Start preload intent (no popup), or
   - **Popup:** "Preload course materials for a more offline experience?" [Yes] [Not now].

2. **Downloads start in the waiting room:** Actual downloads begin **after** they reach the waiting room (ChakraHome showing WaitingScreen). That screen is low-usage, can run at night, and feels like the right moment in the journey.

3. **Flow:** Path selection → (optional popup) → Date selection → Waiting room → **downloads begin here**.

---

## Does this solve everything at once?

**Yes.** It gives you:

- **Intentional UX:** Preload is tied to the moment they commit to the path (and optionally their explicit "Yes").
- **Healing-aligned:** Framed as "course materials" and "offline experience," not a technical download.
- **Right moment:** Waiting room = low engagement, ideal for background work; can run at night if the app is open.
- **Same technical outcome:** We still run `preloadAllAudioHeads(storage)` (first ~3 min of all audio). Only the **when** and **where** change.
- **Playback unchanged:** We keep `prepareLongAudioForPlay`, head cache, and download-on-first-play. So even if they tap play before preload finishes, they still get smooth start (head or full).

So: same robustness and smooth playback, with a more holistic, journey-aligned UX.

---

## Current implementation vs proposed

| Aspect                  | Current (what we built)                         | Proposed (path + waiting room)                                                                |
| ----------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **When preload starts** | After first paint (~3.5 s), once per app launch | When user reaches **waiting room** (and optionally only if they said "Yes" at path selection) |
| **User awareness**      | None; fully silent                              | Optional popup at path selection; downloads when they're already in the flow                  |
| **Data/storage**        | Runs for everyone on every first open           | Runs only for users who chose the path (and optionally opted in)                              |
| **Narrative**           | Technical / invisible                           | "Course materials" / "offline experience" / part of the journey                               |
| **Best moment**         | As soon as app is ready                         | When they're waiting for their start date (low usage, can be at night)                        |

**Verdict:** The proposed flow is a better fit for a healing app: same tech, better timing and framing. Recommended.

---

## What stays the same (no throwaway work)

All of this stays as-is:

- **Head cache:** `downloadAudioHead`, `getLocalAudioHeadUri`, `getLocalAudioUriOrHead` in `audioDownload.ts`.
- **Playback:** `prepareLongAudioForPlay` in `crystalBowlPlayback.ts` (full → head → download head → stream fallback). Used for Tuning Fork, Crystal Bowl, Embodiment in AudioLibrary.
- **Preload job:** `preloadAllAudioHeads(storage)` and the manifest in `audioPreloadManifest.ts`.
- **Download-on-first-play:** If they play before preload runs (or if they skipped preload), we still download head or full on first play and then play from cache.

**Only change:** **When** we call `preloadAllAudioHeads` and **optional** consent UI.

---

## Recommended implementation

### 1. Remove first-paint preload from root layout

- In `app/_layout.tsx`, remove the `useEffect` that runs `preloadAllAudioHeads(storage)` when `assetsReady` (or keep it behind a feature flag if you want A/B later). This stops preload from running on every first open.

### 2. Auto-trigger (no popup)

**Trial:** When the user taps "Enter Path", navigate straight to DateSelection. No confirmation modal. When they reach the waiting room, preload starts automatically (once per device). Choosing the path is the intent; the download begins in the waiting room.

**Lifetime users:** No preload step. They either already cached in the waiting room as trial, or we use download-on-first-play.

### 3. Start downloads when they reach the waiting room

- **Where:** When **WaitingScreen** is mounted (inside `components/chakras/WaitingScreen.tsx`), or when **ChakraHome** first renders with `showWaitingScreen === true`.
- **Logic:**
  - If you have a popup: only run `preloadAllAudioHeads(storage)` when the "preload" flag is true.
  - If you go automatic (no popup): run `preloadAllAudioHeads(storage)` whenever the user is on the waiting room, once per "journey" (e.g. once per course start, or once ever).
- **Guard:** Use a one-time guard so we don’t re-run every time they navigate back to the waiting room (e.g. MMKV `audioPreloadStartedForCourse: true` or `audioHeadsPreloadDone: true`). When they land on WaitingScreen the first time (or first time for this course), set the guard and start the job in the background (don’t block UI).
- **Wi‑Fi (optional):** You can later add "Prefer Wi‑Fi only" and skip or defer preload on cellular; for now, starting in the waiting room already avoids the "first open on cellular" issue.

### 4. Optional: light feedback on waiting room

- **Minimal:** No UI; preload runs silently (best for "can run at night").
- **Soft:** Small line under the main waiting copy: "Preparing your course materials for offline listening…" and hide it when `preloadAllAudioHeads` has finished (or when the one-time guard is set). No progress bar needed unless you want it.

---

## Flow summary

1. User taps "Enter Path" on WelcomeScreen (trial) or confirms date (lifetime timegate).
2. Optional: Modal "Preload course materials for a more offline experience?" [Preload] [Maybe later]. If Preload → set `userWantsAudioPreload: true`.
3. User goes to Date selection (if not already there) → confirms date → lands on ChakraHome → **WaitingScreen**.
4. When WaitingScreen mounts (and, if you use the popup, flag is true): run `preloadAllAudioHeads(storage)` once in the background; set guard so we don’t run again on every revisit.
5. Playback is unchanged: we still prefer full/head and download on first play if needed.

---

## Conclusion

- **Your idea does solve the UX and timing in one go:** path selection frames the choice, waiting room is the right moment to start downloads (low usage, can run at night), and we keep all existing behavior for playback and robustness.
- **Best path forward:** Keep the current tech (heads, prepareLongAudioForPlay, preloadAllAudioHeads). Switch to **waiting-room–triggered preload** and add the **optional popup at path selection** for a more holistic, healing-oriented flow.
