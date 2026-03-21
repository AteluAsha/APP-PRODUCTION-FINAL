# Production flow: first open to full app

Single reference for the path from first launch through trials and lifetime. Audio and cache run at the points below.

## First open

1. **Native splash** (`SoulSchool_APP_HeroLoadImage.png`): small centered shield until JS mounts.
2. **AnimatedSplashScreen** (`app/_layout.tsx`): native shield stays until the Soul School hero image has loaded and painted (`onLoad` + frame), then `SplashScreen.hideAsync()`; solid black + 5s sine breath pulse on `SoulSchool_HERO_Logo.png` while fonts/preloads finish, then fades out. **`(chakras)/index`** stays black and **replaces** to the first screen when store rehydration + nav are ready.
3. **First screen** is one of: WelcomeScreen (trial first time), DateSelection (trial after trial 1), ChakraHome (trial in journey / waiting room), ChakraHub (lifetime).

No error screen on success; ErrorBoundary fallback shows hero logo only.

## Trial: Welcome → DateSelection → Waiting room

- WelcomeScreen "Enter Path" → DateSelection.
- User picks date → DateConfirmationModal (wide card, MODAL_CARD_MAX_WIDTH) → Confirm.
- Replace to ChakraHome with `showWaitingScreen` true → **Waiting room**.
- **Audio preload** starts here (once per device): WaitingScreen effect runs `preloadAllAudioHeads` then `preloadAllAudioFullFiles`; guard in `audioPreloadGuard.ts` prevents re-run.
- Menu bar: 4 items (Preview, Chakras 101, Anua, Notes). Preview → route `/(chakras)/Preview` (Stack fade).

## Trial: Begin → ChakraHome (7 days)

- "Begin Your Journey" (or equivalent) → `setShowWaitingScreen(false)`; ChakraHome shows 7 chakra balls.
- Day tap → `[chakra]` or SoundBath; **backup preload** for that day: `preloadFullFilesForChakra` from ChakraTemplate / AudioLibrary so the day’s audio is cached even if waiting room was skipped.
- Audio playback: local-first (localUri or getLocalAudioUri); then Firebase URL. No bypass of local-first.

## Trial: Goodbye → CommitmentGate

- Complete a day → GoodbyeModal. After trial completion → CommitmentGate (paywall).
- Trial 2: From gate "2nd offering" → DateSelection → waiting room → ChakraHome again.
- After paywall / purchase → ChakraHub (lifetime).

## Lifetime

- ChakraHub; menu bar: Music, Sanctuary, Anua, Notes, Tribe, Gallery.
- AudioLibrary only for lifetime (returns null for trial). Music Room and other audio flows unchanged.
- "Exit course mode" from lifetime trial waiting room → ChakraHub.

## Audio and cache summary

| When | What |
|------|------|
| Waiting room first time | `preloadAllAudioHeads` then `preloadAllAudioFullFiles` (guard: once per device) |
| Day open / audio press | `preloadFullFilesForChakra` for that day (backup) |
| Playback | Local file first; then Firebase; no streaming when local exists |

## Key files

- **Entry / splash:** `app/_layout.tsx` (preventAutoHideAsync + `AnimatedSplashScreen`), `app/(chakras)/index.tsx` (routing after overlay); `app.config.js` native shield; no legacy StillnessScreen or SplashScreenReveal
- **Preload:** `components/chakras/WaitingScreen.tsx` (effect), `src/utils/audioPreloadManifest.ts`, `src/utils/audioPreloadGuard.ts`
- **Preview (waiting room):** `app/(chakras)/Preview.tsx`, `components/chakras/PreviewJourney.tsx`
- **Menu bar:** `components/navigation/PermanentMenuBar.tsx` (visibility and items by route + trial/lifetime + waiting room)
