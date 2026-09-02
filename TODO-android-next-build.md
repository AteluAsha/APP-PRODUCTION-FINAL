# 1.1.9 / versionCode 18 — logged 2026-08-27

Play AAB uploaded by Erin. Waiting for Play to clear, then a Pixel download.

**Artifact:** `build-artifacts/SoulSchool-1.1.9-18.aab` (106 MB, signed with Play keystore gZ9Lce_wS5)

**In this binary**
- Sanctuary audio: Cloudflare R2 → `documentDirectory/sanctuary-audio/`. Playback is `file:///` only. No Play Asset Delivery. No compact bake-in. AAC is not in the AAB.
- Tap-to-rush + live % (`VaultFirstLoadPanel`, “Your first track takes a moment.”).
- Healing playback: `expo-audio` + Android `MeditationPlaybackService` (`FOREGROUND_SERVICE_MEDIA_PLAYBACK`).
- iOS equivalent already in config (`UIBackgroundModes: audio`). No extra iOS native service. Next App Store IPA must be a **new** 1.1.9 (18) EAS build so `expo-audio` is in the binary. Do not archive the checked-in `ios/` folder as-is. Do **not** resurrect Apple ODR / `meditation-asset-pack`.

**Pixel pass after Play install**
1. Fresh (or update) install of 1.1.9 (18). Confirm launcher name **Awakening Soul**.
2. Open a sanctuary track (Day 1 embodiment). Confirm live % and first-load copy. Player waits; rows do not block on the 117 MB file.
3. When it plays: lock the Pixel. Track must keep going (notification / media session). Unlock and confirm position held.
4. Incomplete vault files must not start playback.

Do not start another Play build or an iOS IPA unless asked.

---

# Parked — next Android build after 1.1.9 is live

**Deadline:** 1 November 2026

## 1. Play Billing 8+ / RevenueCat 9

Play requires Billing Library **8.0.0+**. This 1.1.9 AAB still ships Billing 7 via `react-native-purchases` 8.x. Upgrade to **9.x** and publish to every active track.

## 2. Target Android 16 (API 36)

Expo 53 still targets **35**. Raise `compileSdk` / `targetSdk` to **36** on the same next build as Billing 8.

Do not start that work until 1.1.9 is confirmed on the Pixel.
