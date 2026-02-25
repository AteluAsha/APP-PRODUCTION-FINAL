# Final Restoration Checklist - Development Build Testing

## ✅ Completed Updates

### 1. Paywall Earth Tones

- ✅ Updated CommitmentGate with earth tone colors:
  - Sage greens (#A8C99A, #6B8E5A)
  - Warm earth tone (#D4A574)
  - Replaced blue/purple/orange gradients with earth tones

## 🔍 Pre-Build Verification Checklist

### Connection & Configuration

- [ ] Verify Firebase configuration (check `.env` or config files)
- [ ] Verify RevenueCat configuration
- [ ] Verify Sentry configuration (if using)
- [ ] Check all API keys are set correctly
- [ ] Verify deep linking configuration

### Audio System (CRITICAL)

- [x] ✅ Audio cleanup: AudioPlayer unloads on unmount (line 165-167)
- [x] ✅ Single audio store: useCurrentAudioStore ensures one source at a time
- [ ] **Test: Only one audio plays at a time** (critical - verify in testing)
- [ ] **Test: First 6 embodiment master meditation audios:**
  - Day 1 (Root): `Day1_RootChakraEmbodiment_SoulSchool.aac` ✅
  - Day 2 (Sacral): `Day2_SacralChakraEmbodiment_SoulSchool.aac` ✅
  - Day 3 (Solar Plexus): `Day3_SolarChakraEmbodiment_SoulSchool.aac` ✅
  - Day 4 (Heart): `Day4_HeartChakraEmbodiment_SoulSchool.aac` ✅
  - Day 5 (Throat): `Day5_ThroatChakraEmbodiment_SoulSchool.aac` ✅
  - Day 6 (Third Eye): `Day6_PARTONE_AjnaEmbodiment_SoulSchool.aac` + `Day6_PARTTWO_AjnaEmbodiment_SoulSchool.aac` ✅
  - Day 7 (Crown): `Day7_CrownChakraEmbodiment_SoulSchool.aac` ✅
- [ ] Test: Audio works in trials
- [ ] Test: Audio works post-paywall
- [ ] Test: Audio stops when navigating away from AudioPlayer
- [ ] Test: Audio stops when another audio starts (store reset ensures this)
- [ ] Test: Audio caching works properly

### Core Flow Testing

- [ ] Splash screen → Welcome → Waiting Room → ChakraHome
- [ ] Day 1-7 progression (one chakra per day)
- [ ] Goodbye Modal routing (trials → ChakraHome, post-paywall → ChakraHub)
- [ ] Waiting Screen buttons (Chakras 101, Anua)
- [ ] Post-paywall: Menu bar appears
- [ ] Post-paywall: ChakraHub accessible
- [ ] FloatingNavButtons positioning (trial vs post-paywall)

### Navigation

- [ ] No duplicate buttons or conflicting navigation
- [ ] Global FloatingNavButtons work correctly
- [ ] Menu bar only shows post-paywall
- [ ] All modal transitions smooth

### Payment Flow

- [ ] CommitmentGate displays correctly (earth tones)
- [ ] Payment processing works
- [ ] Scholarship path works
- [ ] AccessGrantedModal shows after payment
- [ ] Routing to ChakraHub after payment

## 🛠️ Recommended Terminal Commands for Testing

### 1. Check iOS Build Configuration

```bash
# Check EAS build configuration
cat eas.json

# Verify iOS project setup
cd ios && pod --version && cd ..
```

### 2. Check Environment Variables

```bash
# List all environment files (don't commit .env files!)
ls -la | grep env

# Verify Firebase config exists
grep -r "FIREBASE" app.config.js 2>/dev/null || echo "Check Firebase config"
```

### 3. Test Audio System

```bash
# Search for audio playback code
grep -r "Audio.Sound" --include="*.ts" --include="*.tsx" | head -20

# Check for audio unload/stop logic
grep -r "unloadAsync\|stopAsync" --include="*.ts" --include="*.tsx" | head -20
```

### 4. Pre-Build Clean

```bash
# Clean build artifacts
rm -rf node_modules/.cache
rm -rf ios/build
rm -rf android/build

# Clear Metro cache
npx expo start --clear
```

## 📝 Simple Adjustments to Lock It In

### 1. Audio Playback Safety (Critical)

- Ensure all audio components call `unloadAsync()` before playing new audio
- Add global audio manager if not exists
- Test thoroughly: multiple rapid audio clicks

### 2. Error Handling

- Add try-catch around critical flows
- Ensure errors don't crash the app
- Log errors appropriately

### 3. State Persistence

- Verify journey state persists correctly
- Test app restart/reload scenarios
- Ensure payment status persists

### 4. Performance

- Check for memory leaks in modals
- Ensure images are optimized
- Verify audio files aren't too large

## 🎯 Final Testing Protocol

### Phase 1: Development Build

1. Build iOS development build: `npx eas build --platform ios --profile simulator`
2. Install on simulator
3. Test core flow end-to-end
4. Test audio system thoroughly
5. Test payment flow

### Phase 2: Production Build Preparation

1. Update version numbers if needed
2. Verify all configs are production-ready
3. Test with production Firebase (if separate)
4. Test payment with sandbox accounts

### Phase 3: Final Checks

1. Review all console logs (remove debug logs if needed)
2. Check for any TODO comments
3. Verify no test/dev buttons visible
4. Test on physical device if possible

## 🔒 Critical Safety Checks

1. **Audio Overlap Prevention** - Must verify no two audios play simultaneously
2. **Payment Security** - Verify RevenueCat integration is secure
3. **State Management** - Ensure state persists correctly across app restarts
4. **Navigation Safety** - No navigation loops or stuck screens
5. **Memory Management** - Check for leaks in modals/audio players

## 📱 App Store Compliance

### Privacy Policy (REQUIRED)

- ✅ **In-App Links Added:**
  - CommitmentGate footer (paywall screen)
  - RevenueCatPaywall footer
- ✅ **Privacy Policy URL:** `https://soulschool.app/privacy`
- ⚠️ **Action Required:** Add privacy policy URL to App Store Connect metadata
  - Go to App Store Connect → Your App → App Privacy → Privacy Policy URL
  - Enter: `https://soulschool.app/privacy`

### App Store Connect Requirements

- [ ] Privacy Policy URL added in App Store Connect (REQUIRED)
- [ ] App description and metadata completed
- [ ] Screenshots prepared (required sizes for iOS)
- [ ] App icon uploaded
- [ ] Age rating completed
- [ ] Support URL (if applicable)
- [ ] Marketing URL (optional)

### Permissions & Info.plist

- ✅ Camera permission description (for video recording)
- ✅ Microphone permission description (for video recording)
- ✅ Audio background mode configured

## 📋 Git Preparation

Before pushing to GitHub:

- [ ] Review all changes
- [ ] Remove any temporary files
- [ ] Update version if needed
- [ ] Write clear commit message
- [ ] Ensure .env files are in .gitignore
- [ ] Verify sensitive data isn't committed

## 📱 App Store Compliance (COMPLETED)

### In-App Privacy Policy Links

- ✅ Added to CommitmentGate footer (paywall screen)
- ✅ Added to RevenueCatPaywall footer
- ✅ Opens in browser: `https://soulschool.app/privacy`
- ✅ Styled with earth tones

### App Store Connect (Action Required)

- ⚠️ **MUST ADD:** Privacy Policy URL in App Store Connect metadata
  - Location: App Store Connect → Your App → App Privacy → Privacy Policy URL
  - URL: `https://soulschool.app/privacy`
- [ ] Complete App Privacy details in App Store Connect
- [ ] Complete Age Rating questionnaire
- [ ] Prepare screenshots (all required sizes)

### Permissions (Verified)

- ✅ Camera permission description configured
- ✅ Microphone permission description configured
- ✅ Audio background mode configured
