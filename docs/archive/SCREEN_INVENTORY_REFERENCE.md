# Screen Inventory Reference – 7 Chakras 7 Days App

**Purpose:** Comprehensive map of every screen, flow, and key file. Use this when making changes to avoid critical errors. Reference for AI sessions and developers.

**Last updated:** Feb 2026 (post-resurrection)

---

## App Modes

| Mode         | Condition                         | Home                            | UI                              |
| ------------ | --------------------------------- | ------------------------------- | ------------------------------- |
| **Trial 1**  | First 7-day trial, no paywall     | ChakraHome (progressive reveal) | FloatingNavButtons (Leaf, Anua) |
| **Trial 2**  | Second trial week (if incomplete) | ChakraHome                      | Same                            |
| **Lifetime** | Post-paywall / scholarship        | ChakraHub                       | PermanentMenuBar                |
| **Paywall**  | CommitmentGate shown              | ChakraHome (with gate overlay)  | Minimal                         |

---

## Flow Diagram

```
Splash (SplashScreenReveal)
    ↓
Path Selection (WelcomeScreen) – "Enter Path" / "7 Chakras in 7 Days"
    ↓
    ├─ hasLifetimeAccess → ChakraHub (lifetime home)
    └─ Trial path → DateSelection
                        ↓
                    ChakraHome
                        ├─ showWaitingScreen → WaitingScreen (trial, before first Monday)
                        ├─ shouldShowCommitmentGate → CommitmentGate (paywall overlay)
                        └─ else → IntegratedProgressStack (7 chakra balls, progressive reveal)
```

---

## All Screens (Alphabetical)

### Root Stack (app/\_layout.tsx)

| Route            | File                       | Purpose                                                       |
| ---------------- | -------------------------- | ------------------------------------------------------------- |
| `(chakras)`      | app/(chakras)/\_layout.tsx | Main app stack                                                |
| `AudioPlayer`    | app/AudioPlayer.tsx        | Full-screen audio player (distraction-free: no menu, no Anua) |
| `CommunityHalls` | app/CommunityHalls.tsx     | Social/community screen                                       |
| `+not-found`     | app/+not-found.tsx         | 404                                                           |

### (chakras) Stack

| Route                       | File                                        | Purpose                                                                |
| --------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| `index`                     | app/(chakras)/index.tsx                     | Loading → redirects to WelcomeScreen                                   |
| `WelcomeScreen`             | app/(chakras)/WelcomeScreen.tsx             | Path selection ("Enter Path")                                          |
| `ChakraHome`                | app/(chakras)/ChakraHome.tsx                | Trial home: WaitingScreen OR IntegratedProgressStack OR CommitmentGate |
| `DateSelection`             | app/(chakras)/DateSelection.tsx             | Pick start date for trial                                              |
| `ChakraHub`                 | app/(chakras)/ChakraHub.tsx                 | Lifetime home: all 7 chakras, menu                                     |
| `[chakra]`                  | app/(chakras)/[chakra].tsx                  | Dynamic chakra day (root, sacral, solar, etc.) – ChakraTemplate        |
| `TribeChat`                 | app/(chakras)/TribeChat.tsx                 | Tribe chat                                                             |
| `DevPaywall`                | app/(chakras)/DevPaywall.tsx                | Dev-only: CommitmentGate for testing                                   |
| `CoursePreview`             | app/(chakras)/CoursePreview.tsx             | Course preview                                                         |
| `SoundBath`                 | app/(chakras)/SoundBath.tsx                 | Tuning fork / crystal bowl                                             |
| `AudioLibrary`              | app/(chakras)/AudioLibrary.tsx              | Music room – all audio by chakra                                       |
| `HeadToHeart`               | app/(chakras)/HeadToHeart.tsx               | Head to Heart meditations                                              |
| `Chakras101`                | app/(chakras)/Chakras101.tsx                | Chakras 101 / learning                                                 |
| `EnergyExchange`            | app/(chakras)/EnergyExchange.tsx            | Pay / contribute                                                       |
| `AccountabilityOfAwakening` | app/(chakras)/AccountabilityOfAwakening.tsx | Accountability                                                         |
| `GalleryOfGnosis`           | app/(chakras)/GalleryOfGnosis.tsx           | Gallery                                                                |
| `NotesAlongTheWay`          | app/(chakras)/NotesAlongTheWay.tsx          | Full-page notes diary                                                  |
| `Contribute`                | app/(chakras)/Contribute.tsx                | Contribute                                                             |
| `QuizScreen`                | app/(chakras)/QuizScreen.tsx                | Mirror quiz (per chakra)                                               |

### Modals / Overlays (not routes)

| Component         | File                                        | Shown when                         |
| ----------------- | ------------------------------------------- | ---------------------------------- |
| WelcomeModal      | components/chakras/WelcomeModal.tsx         | First launch, date picker fallback |
| WaitingScreen     | components/chakras/WaitingScreen.tsx        | Trial, before first Monday         |
| GoodbyeModal      | components/chakras/GoodbyeModal.tsx         | After completing 7th chakra        |
| CommitmentGate    | components/chakras/CommitmentGate.tsx       | Post-trial 2, paywall              |
| ScholarshipModal  | components/chakras/ScholarshipModal.tsx     | From CommitmentGate                |
| PathSelectionGate | components/navigation/PathSelectionGate.tsx | Wraps app, routes to WelcomeScreen |

---

## Key Components by Screen

### ChakraTemplate (Trial 1 & 2 chakra days)

- **File:** `components/chakras/ChakraTemplate.tsx`
- **Used by:** `[chakra]` route
- **Props:** `chakra` (ROOT, SACRAL, etc.)
- **Contains:** HeaderSection, Part2Section, Part3Section, AudioRow, ElementsSection, AffirmationSection, CommitmentGate (Part 3)

### ChakraHome (Trial home)

- **File:** `app/(chakras)/ChakraHome.tsx`
- **Shows:** WaitingScreen | CommitmentGate | IntegratedProgressStack
- **Modals:** WelcomeModal, GoodbyeModal

### ChakraHub (Lifetime home)

- **File:** `app/(chakras)/ChakraHub.tsx`
- **Shows:** 7 chakra cards, hamburger menu
- **Modals:** GoodbyeModal

### AudioPlayer

- **File:** `app/AudioPlayer.tsx`
- **HARD RULE:** When open, hide globally: PermanentMenuBar, FloatingNavButtons, GlobalHomeButton
- **Visual:** PulsingChakraBall (day-matched), PlayerProgressBar, play controls

---

## Global UI (app/\_layout.tsx)

| Component          | File                                         | Hidden when                                                                                                                     |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| PermanentMenuBar   | components/navigation/PermanentMenuBar.tsx   | !hasLifetimeAccess, WelcomeScreen, DateSelection, CommitmentGate, DevPaywall, TribeChat, **AudioPlayer**                        |
| FloatingNavButtons | components/navigation/FloatingNavButtons.tsx | hasLifetimeAccess, AudioPlayer, CommitmentGate, ChakraHub, DateSelection, TribeChat, QuizScreen, EnergyExchange, WaitingScreen  |
| GlobalHomeButton   | components/navigation/GlobalHomeButton.tsx   | Chakras101, CommitmentGate, DevPaywall, EnergyExchange, DateSelection, TribeChat, **AudioPlayer**, WelcomeScreen, WaitingScreen |
| GlobalAnuaChat     | components/navigation/GlobalAnuaChat.tsx     | Renders AnuaChatModal from store                                                                                                |
| PathSelectionGate  | components/navigation/PathSelectionGate.tsx  | Routes to WelcomeScreen or ChakraHub                                                                                            |

---

## Chakra Day Mapping

| Day     | Chakra       | Route slug |
| ------- | ------------ | ---------- |
| 0 (Mon) | Root         | root       |
| 1 (Tue) | Sacral       | sacral     |
| 2 (Wed) | Solar Plexus | solar      |
| 3 (Thu) | Heart        | heart      |
| 4 (Fri) | Throat       | throat     |
| 5 (Sat) | Third Eye    | thirdeye   |
| 6 (Sun) | Crown        | crown      |

---

## Critical Files (Do Not Break)

| Purpose           | File                                        |
| ----------------- | ------------------------------------------- |
| Store rehydration | hooks/useStoreRehydration.ts                |
| Chakra journey    | hooks/useChakraJourneyStore.ts              |
| Current audio     | hooks/useCurrentAudioStore.ts               |
| Timegate logic    | src/services/timegate.ts                    |
| Path selection    | components/navigation/PathSelectionGate.tsx |
| Trial home logic  | app/(chakras)/ChakraHome.tsx                |
| Chakra template   | components/chakras/ChakraTemplate.tsx       |

---

## Screenshot Capture (for reference)

### Automated capture (web dev)

Run with `EXPO_PUBLIC_CAPTURE_SCREENS=1` to render `CaptureAll` instead of the app. This captures all screens from `assets/dev-gallery/gallery-config.ts` and downloads PNGs to your browser's Downloads folder.

**Steps:**

1. Run: `npm run capture:screens` (or `EXPO_PUBLIC_CAPTURE_SCREENS=1 npm run web`)
2. Wait for capture to complete (~2 min for 31 screens)
3. Check Downloads folder for PNGs
4. Move screenshots to `assets/dev-gallery/snapshots/` (create folder if needed)
5. **Disable CaptureAll** when done: In `app/_layout.tsx`, comment out or remove the `if (Platform.OS === "web" && __DEV__)` block that returns `<CaptureAll />`, so the normal app loads again

**Screens captured (31 total):**

- Trial 1: Root, Sacral, Solar, Heart, Throat, Third Eye, Crown (7)
- Trial 2: Same 7 chakra days (7)
- Thresholds: WelcomeModal, WaitingScreen, GoodbyeModal, CommitmentGate (4)
- Sanctuary: ChakraHub, CommunityHalls (2)
- Entry: WelcomeScreen, DateSelection, ChakraHome (3)
- Lifetime: AudioPlayer, AudioLibrary, SoundBath, HeadToHeart, Chakras101, EnergyExchange, GalleryOfGnosis, NotesAlongTheWay, DevPaywall (9)

**Note:** AudioPlayer captures the "No audio selected" state unless store is pre-populated. Some screens may need store/context and could show loading or fallback UI.

### Manual capture (iOS Simulator)

1. Run: `npm run ios`
2. Navigate to each screen
3. Cmd+S in Simulator to save screenshot to Desktop
