# App Audit Report – Audio, Navigation, Buttons, APP1/APP2 (Feb 2026)

## 1. Audio paths and playback

### Single source of truth
- **Firebase paths:** [constants/firebaseStoragePaths.ts](constants/firebaseStoragePaths.ts) is the single source for folder names. Hooks use these; filenames are in each hook and documented in the constant file.
- **Tuning fork:** `TuningForkAudio`; 7 hero files in [hooks/useTuningForkAudio.ts](hooks/useTuningForkAudio.ts) (`CHAKRA_TO_TUNING_FORK_FILE`). [src/utils/audioPreloadManifest.ts](src/utils/audioPreloadManifest.ts) has a sync comment.
- **Crystal bowl:** `crystal_Bowl_Meditation_Audio`; 7 hero files in [hooks/useCrystalBowlAudio.ts](hooks/useCrystalBowlAudio.ts). Preload manifest has sync comment.
- **Embodiment:** `FIREBASE_EMBODIMENT_FOLDER`. Third Eye uses two files (part one/two).
- **Head to Heart / Ancestral Wisdom:** `FIREBASE_ANCESTRAL_WISDOM_FOLDER`.

### Playback and high-traffic safeguards
- **Local-first:** [src/utils/crystalBowlPlayback.ts](src/utils/crystalBowlPlayback.ts) and [src/utils/audioDownload.ts](src/utils/audioDownload.ts) prefer local file when available; no streaming when local exists.
- **Rate limiting:** [src/utils/rateLimiter.ts](src/utils/rateLimiter.ts) used for Firebase and ElevenLabs.
- **Retry:** [src/utils/audioRetry.ts](src/utils/audioRetry.ts) for URL fetch.
- **URL cache:** [src/utils/audioCache.ts](src/utils/audioCache.ts) caches Firebase URLs.
- **AudioPlayer:** Validates source before `createAsync` (empty URI guard); on create failure calls store reset so UI shows “No audio selected.”
- **SoundBath:** Tuning fork and crystal bowl sources validated (no `{ uri: "" }` passed).

### Bundled fallbacks
- Content uses `require("@/assets/audio/day1tuningfork.mp3")` and `day1singingbowl.mp3` as fallbacks when Firebase/local not available. Same asset for all days in content; Firebase hooks provide per-day URLs.

**Verdict:** Audio paths are consistent, guarded, and suitable for high traffic. No extra issues found beyond the fixes already applied (tuning fork, crystal bowl, course intro).

---

## 2. APP1 vs APP2 (trial vs lifetime) – crossover check

### Entry (index)
- Lifetime → `ChakraHub`. Trial completedTrialCourses === 1 → `DateSelection`. Trial with courseStartDate → `ChakraHome`. Trial first time → `WelcomeScreen`. No crossover.

### Audio origin
- **music-room:** Set only from Audio Library (Frequency of Gnosis). [app/(chakras)/AudioLibrary.tsx](app/(chakras)/AudioLibrary.tsx) returns `null` when `!hasLifetimeAccess`, so trial never reaches the screen or sets `music-room`. No crossover.
- **other / full-player:** Used for SoundBath, Head to Heart, embodiment. Both trial and lifetime use these; intended.

### Mini player
- [components/navigation/PermanentMenuBar.tsx](components/navigation/PermanentMenuBar.tsx) returns `null` when `!hasLifetimeAccess`, so trial never sees the menu bar or mini player. Correct.

### Redirects
- SoundBath invalid chakra: `hasLifetimeAccess ? ChakraHub : ChakraHome`. QuizScreen “Go to Home”: same. GalleryOfGnosis back: lifetime → ChakraHub, trial → back(). GoodbyeModal: lifetime can replace to ChakraHub; trial push ChakraHome. All correct.

### ChakraHub
- Redirects trial to ChakraHome at top. No crossover.

**Verdict:** No accidental APP1/APP2 crossover found. Lifetime-only surfaces (Audio Library, Music Room, PermanentMenuBar) are gated by `hasLifetimeAccess`.

---

## 3. Back arrows and revert logic

### Day pages (ChakraTemplate)
- Back arrow removed; only chakra ball / “I have completed” lead to completion and Goodbye. Home via global menu (trial: FloatingNavButtons; lifetime: PermanentMenuBar). Correct.

### Screens with back arrow (ActionBar or ActionBarAnimated)
- **HeadToHeart, Chakras101:** `ActionBarAnimated` → `router.back()` (or custom onBackPress). Correct.
- **ChakraHub:** `ActionBar onBackPress={handleBack}` → `router.back()` or `router.replace("/(chakras)/ChakraHub")` if !canGoBack. Correct for lifetime root.
- **SoundBath:** X only (no back). X → `router.back()` or `router.replace("/(chakras)")` (ActionBar default). Correct.
- **AudioLibrary:** X → `router.replace("/(chakras)/ChakraHub")`. Lifetime only. Correct.
- **AudioPlayer:** X → `performClose()` → `closePlayerAndNavigate()` → reset then `router.back()` or `router.replace("/(chakras)/ChakraHub")` if !canGoBack. Trial gets exit-confirm modal first. Correct.
- **GalleryOfGnosis:** Back → lifetime `replace ChakraHub`, trial `back()`. Correct.
- **QuizScreen:** Back → `router.back()` (to day page). “Go to Home” → replace ChakraHub or ChakraHome by access. Correct.
- **GoodbyeModal:** Back arrow → `router.replace((chakras)/${currentChakra})` then onClose (to day page, no home flash). Correct.

### Timegate and course logic
- **index:** Paths 1–4 as documented; no wrong branch found.
- **DateSelection:** Replace to ChakraHub (lifetime), WelcomeScreen (trial back), SimpleGraceTransition or ChakraHome after confirm. Correct.
- **WelcomeScreen:** Replace ChakraHub (lifetime), push DateSelection (trial), replace SimpleGraceTransition (post–trial 2). Correct.

**Verdict:** Back arrows and revert targets align with timegates and trial vs lifetime. No issues found.

---

## 4. X buttons (close)

| Screen / component   | X behavior | Result |
|----------------------|------------|--------|
| AudioPlayer (no source) | handleCloseXNoSource → performClose | Reset, back or ChakraHub. Correct. |
| AudioPlayer (with source) | handleCloseX → trial: exit confirm modal; lifetime: performClose | Correct. |
| SoundBath            | ActionBar useXButton, no onXPress | Default: back or replace (chakras). Correct. |
| AudioLibrary         | onXPress={handleClose} | replace ChakraHub. Correct. |
| Modals (Goodbye, etc.) | onClose callbacks | Close modal only; no unintended navigation. Correct. |

**Verdict:** All X’s close or confirm-then-close as intended. No issues found.

---

## 5. Buttons – key flows

- **ChakraTemplate:** Pills → PillBottomSheet; Sound Healing → SoundBath; Path 2 → Head to Heart; Integration → IntegrationMomentModal; Quiz → QuizScreen; chakra ball / “I have completed” → navigateBack(true) → replace ChakraHome or ChakraHub. All correct.
- **SoundBath:** Tuning fork / crystal bowl → setSource, then trial push AudioPlayer; lifetime can stay “other” with mini player (but trial has no mini player, so trial always gets full player). Correct.
- **Head to Heart:** Play → setSource full-player, push AudioPlayer. Correct.
- **ChakraHome (trial):** Day cards → push `[chakra]`; Learn About Chakras → push Chakras101; etc. Correct.
- **ChakraHub:** Day cards → push `[chakra]`; Gallery, Community, etc. → correct routes. Correct.
- **PermanentMenuBar (lifetime):** Music → AudioLibrary; Tribe → TribeChat; Gallery → GalleryOfGnosis; Anua → open chat. Correct. Trial does not see this bar.

**Verdict:** Buttons point to the right screens and modals; trial vs lifetime behavior is correct.

---

## 6. Issues found

**None.** Audio paths are consistent and protected; APP1/APP2 separation is clear; back/X and button flows match timegates and design. The only issues addressed in this session were the Head to Heart `isIntroAudio` flag (fixed), course intro at track end (removed from AudioPlayer), and course intro restricted to waiting room first Anua open (implemented).

---

## 7. Major system ratings

| System | Rating | Why |
|--------|--------|-----|
| **Audio (Firebase + playback)** | Strong | Single source for paths, local-first, rate limit, retry, URL cache, source validation and reset on failure. Ready for traffic. |
| **APP1 / APP2 separation** | Strong | Clear gating on `hasLifetimeAccess` for menu, Audio Library, music-room origin; index and redirects branch correctly. |
| **Navigation / timegates** | Strong | index routes correctly; DateSelection, WelcomeScreen, SimpleGraceTransition and ChakraHome/ChakraHub flows are consistent; no back arrow on day pages; Goodbye only from chakra ball / checkbox. |
| **AudioPlayer** | Strong | Single-owner rule, close flow with reset, trial exit confirm, no course intro at track end, invalid source handling. |
| **Anua / course intro** | Strong | Intro only on first Anua open from waiting room (persisted); no intro after any track. |
| **UI consistency (X, back)** | Strong | ActionBar/ActionBarAnimated used consistently; X closes or confirm-then-close; back targets correct screens. |
| **Modals (Goodbye, Integration, etc.)** | Strong | Goodbye only from ChakraHome after completion; back from Goodbye to day page; other modals close without wrong navigation. |

Overall the app is in good shape for production use and high-traffic readiness from an audio and navigation perspective.
