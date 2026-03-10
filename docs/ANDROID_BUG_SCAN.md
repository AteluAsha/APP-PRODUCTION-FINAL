# Android build bug scan (production prep)

Quick reference for seeing updates on the emulator and known Android issues.

## Seeing quiz and data changes on the Android emulator

- Quiz content lives in `assets/data/ChakraQuizzes/chakra_quizzes.json` and is loaded at bundle time via `require()` in QuizScreen. **No native rebuild is required.**
- To see the latest quiz (or any JS/data) changes:
  1. Keep the app connected to Metro (use `http://10.0.2.2:8081` in the dev client; see [ANDROID_METRO_RELOAD.md](ANDROID_METRO_RELOAD.md)).
  2. After saving files, **reload explicitly**: press **`r`** in the Metro terminal or **double-tap R** in the emulator.
- If the app was reinstalled or you started fresh, run Android with Metro in one flow so the bundle loads from Metro: e.g. `REACT_NATIVE_PACKAGER_HOSTNAME=10.0.2.2 env -u CI npx expo run:android` (keep that terminal open).

## Known Android issues (documented and fixed)

| Issue | Doc | Status |
|-------|-----|--------|
| White box when opening "Open Your Gift" (ChakraCardRevealModal) | [ANDROID_MODAL_WHITE_BOX.md](ANDROID_MODAL_WHITE_BOX.md) | Fixed: root and SafeAreaView have `backgroundColor: "#000"` in ChakraCardRevealModal. |
| Exposed background on Sound Bath / Audio Library | [ANDROID_SOUND_PAGES_BACKGROUND.md](ANDROID_SOUND_PAGES_BACKGROUND.md) | Fixed: full-bleed background + `minHeight` on Android. |
| Trial home root chakra ball cut off | IntegratedProgressStack | Fixed: removed `minHeight: windowHeight`; stack uses `maxHeight: viewportHeight` (window − safe area) so all 7 chakra balls fit on screen and root is never cut off. |
| Scratchy/crashy audio in emulator | [ANDROID_AUDIO_TROUBLESHOOTING.md](ANDROID_AUDIO_TROUBLESHOOTING.md) | Emulator known to be poor; test on real device; dev-only workarounds in code. |
| All buttons stop working after ~1–2 min (waiting room) | (this section) | **Cause:** CommunicationReminderModal opens 60s after entering waiting room; on Android the Modal overlay can block touches or the card can fail to receive taps. **Fix:** CommunicationReminderModal uses `statusBarTranslucent`, card has `elevation`/`zIndex` and `collapsable={false}`, buttons have `hitSlop`. WaitingScreen auto-dismisses the modal after 2 min so the screen never stays stuck. |

## Modal audit (Android white-box prevention)

Per [ANDROID_MODAL_WHITE_BOX.md](ANDROID_MODAL_WHITE_BOX.md), the first child of `<Modal>` must have an explicit `backgroundColor` so Android does not show the platform default (white) in unpainted regions. Spot-checked:

- **ChakraCardRevealModal**: Root and SafeAreaView have `backgroundColor: "#000"` (documented fix).
- **AnuaChatModal**: First child and SafeAreaView use `backgroundColor: "#000"`.
- **GoodbyeModal**: Uses `backgroundColor: "#000"` on the overlay View.
- **SocialSanctuaryModal**: SafeAreaView (first child) has `backgroundColor: "#000000"`.
- **IntegrationMomentModal**: First child View has `backgroundColor: "#000000"`.
- **DateConfirmationModal**, **ReturnToCourseModal**: First child has opaque overlay background.

No additional modals were found with an unpainted root that would cause a white strip on Android.

## Build note (non-blocking)

- Gradle may show: `ksp-1.9.24-1.0.20 is too old for kotlin-1.9.25`. This is a KSP/Kotlin version warning from a dependency (expo-updates). The app typically still builds; if you hit a hard failure, consider upgrading KSP or aligning Kotlin versions in the Android project.

## Checklist before production

1. Test on a **real Android device** (audio and layout), not only the emulator.
2. Confirm Metro reload flow: use `10.0.2.2:8081`, reload after JS/data changes.
3. Run through critical paths: trial home (chakra stack position), quiz (affirmations, Explore further), modals (Goodbye → Open Your Gift, Anua chat), and sound screens (background full-bleed).
