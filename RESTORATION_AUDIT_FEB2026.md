# Restoration Audit – Feb 2026

## Scope
UX, flow, course, audio, pathways, and readiness for a fresh iOS build to verify restoration.

## Entry & Onboarding
- **Splash**: `SplashScreen.preventAutoHideAsync()` only; `hideAsync()` only in `handleHeroLogoComplete` (no hide on mount). Flow: native splash → SplashScreenReveal (hero logo pulse, 2s min) → main app.
- **First launch**: ChakraHome shows welcome+waiting block when `showWaitingScreen || showWelcomeModal || isFirstLaunch`; single black container; one WelcomeModal only (`isVisible={showWelcomeModal || isFirstLaunch}`).
- **Date flow**: ScrollDatePicker → DateConfirmationModal (Confirm/Change) → Begin → handleBeginJourney → timegate effect sets showWaitingScreen → WaitingScreen.
- **Waiting room**: WaitingScreen and WelcomeModal use explicit `style` (no layout-critical `className`). DateConfirmationModal same.

## Timegate & Course
- **Monday unlock**: Unchanged. When `courseStartDate` is reached and it’s Monday, waiting screen hides and first chakra appears; day-by-day via `isTrialChakraAccessible` / timegate.
- **APP1 (trial) vs APP2 (lifetime)**: Timegate and `shouldShowWaitingScreenCheck` handle both; lifetime somatic journey uses same waiting room until Monday.

## Payment & Paywall
- **RevenueCat**: Initialized in root _layout; ChakraHome uses `showPaymentGate` → `RevenueCatPaywall` (after trial 2, or when paywall needed).

## Routes & Screens
- **(chakras)** layout: index, WelcomeScreen, ChakraHome, TribeChat, DevPaywall, DateSelection, ChakraHub, CoursePreview, [chakra], SoundBath, AudioLibrary, HeadToHeart, Chakras101, EnergyExchange, AccountabilityOfAwakening, GalleryOfGnosis, NotesAlongTheWay, Donate. Corresponding files present under `app/(chakras)/`.

## Audio
- **Preload**: Root layout preloads 4 assets (root-erin-1, root-ethan-1, day1singingbowl, day1tuningfork).
- **Embodiment**: useEmbodimentAudio + Firebase paths; ChakraTemplate/AudioRow use store and navigation to AudioPlayer.
- **Crystal bowl / tuning fork**: useCrystalBowlAudio, useTuningForkAudio; SoundBath and related screens use them. AudioPlayer and useCurrentAudioStore wired for playback.

## Lifetime / Anua / Community
- Prior restoration: AnuaChatModal, SocialSanctuaryModal, NotesAlongTheWay, FloatingNavButtons use explicit `style` where layout/visibility matter.

## Gaps / Notes
- **Runtime**: This audit is code-level. Full “all systems go” (every pathway, every audio file, every button) requires a run on device/simulator after the clean iOS build.
- **Audio “synced”**: Paths and hooks are aligned with docs; actual Firebase files and playback must be confirmed in testing.

## Next Step
Deep iOS clean (Metro, Expo, node caches, ios/build, Pods) then fresh `expo run:ios` to verify restoration on a clean build.
