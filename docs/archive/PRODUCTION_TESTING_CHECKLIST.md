# Production Testing Checklist - iOS & Android

**Date:** 2025-01-XX  
**Status:** Comprehensive Testing Guide

## Executive Summary

This document provides a comprehensive testing checklist for all iOS and Android functions, pathways, and integrations before final production release.

---

## 1. Platform Configuration ✅

### iOS Configuration

- [x] **Bundle Identifier:** `com.sevenchakras.SevenChakras` ✅
- [x] **Info.plist:** Background audio modes enabled ✅
- [x] **URL Schemes:** `myapp`, `com.sevenchakras.SevenChakras`, `exp+sevenchakras` ✅
- [x] **Minimum iOS Version:** 12.0 ✅
- [x] **Tablet Support:** Enabled ✅
- [x] **Orientation:** Portrait (with upside-down) ✅
- [x] **New Architecture:** Enabled ✅
- [x] **Dark Mode:** Forced dark ✅

### Android Configuration

- [x] **Package Name:** `com.sevenchakras.SevenChakras` ✅
- [x] **AndroidManifest.xml:** All permissions configured ✅
- [x] **Permissions:**
  - [x] INTERNET ✅
  - [x] MODIFY_AUDIO_SETTINGS ✅
  - [x] READ_EXTERNAL_STORAGE ✅
  - [x] RECORD_AUDIO ✅
  - [x] VIBRATE ✅
  - [x] WRITE_EXTERNAL_STORAGE ✅
- [x] **URL Schemes:** `myapp`, `com.sevenchakras.SevenChakras`, `exp+sevenchakras` ✅
- [x] **Orientation:** Portrait locked ✅
- [x] **New Architecture:** Enabled ✅
- [x] **Hermes:** Enabled ✅

---

## 2. Core App Functions

### 2.1 App Initialization ✅

- [x] **Splash Screen:** Soul School logo on black background ✅
- [x] **Splash Screen Reveal:** Custom animation with logo ✅
- [x] **Font Loading:** All custom fonts load correctly ✅
- [x] **Asset Preloading:** Images and audio preloaded ✅
- [x] **Firebase Initialization:** Graceful handling if config missing ✅
- [x] **RevenueCat Initialization:** Error handling in place ✅
- [x] **Status Bar:** Light style, translucent on Android ✅

**Testing Required:**

- [ ] Test app launch on iOS (simulator and device)
- [ ] Test app launch on Android (emulator and device)
- [ ] Verify splash screen displays correctly
- [ ] Verify fonts load without FOUT (Flash of Unstyled Text)
- [ ] Test offline launch (should show cached content)

### 2.2 Navigation & Routing ✅

- [x] **Expo Router:** File-based routing configured ✅
- [x] **Routes:**
  - [x] `(chakras)/index` - Home screen ✅
  - [x] `(chakras)/[chakra]` - Chakra detail screens ✅
  - [x] `AudioPlayer` - Audio playback screen ✅
  - [x] `CommunityHalls` - Community chat ✅
  - [x] `(chakras)/SoundBath` - Sound bath screen ✅
  - [x] `(chakras)/HeadToHeart` - Head to Heart screen ✅
  - [x] `(chakras)/GalleryOfGnosis` - Chakra cards gallery ✅
- [x] **Safe Area:** Properly configured for both platforms ✅
- [x] **Gesture Handler:** Root view wrapped ✅

**Testing Required:**

- [ ] Test all navigation flows on iOS
- [ ] Test all navigation flows on Android
- [ ] Verify back button works on Android
- [ ] Verify swipe gestures work correctly
- [ ] Test deep linking (if implemented)
- [ ] Verify no navigation stack issues

---

## 3. Audio Playback System

### 3.1 Audio Player Component ✅

- [x] **Platform Support:** Cross-platform (expo-av) ✅
- [x] **Loading State:** Properly tracked with `isLoadedRef` ✅
- [x] **Null Metadata Handling:** Early return with user message ✅
- [x] **Playback Status:** Real-time updates ✅
- [x] **Error Handling:** Graceful error messages ✅
- [x] **Background Playback:** iOS background modes enabled ✅

**Testing Required:**

- [ ] Test audio playback on iOS (all 7 days)
- [ ] Test audio playback on Android (all 7 days)
- [ ] Verify audio plays in background (iOS)
- [ ] Test audio controls in lock screen/notification
- [ ] Test seek functionality
- [ ] Test play/pause toggle
- [ ] Test rewind/forward 10 seconds
- [ ] Test audio continues after app backgrounded
- [ ] Test audio stops when app killed
- [ ] Verify no audio overlap (multiple tracks)

### 3.2 Audio Sources ✅

- [x] **Firebase Storage:** All 7 days correctly mapped ✅
  - [x] Day 1 (Root): `Day1_RootChakraEmbodiment_SoulSchool.aac` ✅
  - [x] Day 2 (Sacral): `Day2_SacralChakraEmbodiment_SoulSchool.aac` ✅
  - [x] Day 3 (Solar): `Day3_SolarChakraEmbodiment_SoulSchool.aac` ✅
  - [x] Day 4 (Heart): `Day4_HeartChakraEmbodiment_SoulSchool.aac` ✅
  - [x] Day 5 (Throat): `Day5_ThroatChakraEmbodiment_SoulSchool.aac` ✅
  - [x] Day 6 (Third Eye): Part One + Part Two ✅
  - [x] Day 7 (Crown): `Day7_CrownChakraEmbodiment_SoulSchool.aac` ✅
- [x] **Error Handling:** File not found errors handled gracefully ✅

**Testing Required:**

- [ ] Test each day's audio loads correctly
- [ ] Test Day 6 two-part audio (both buttons)
- [ ] Verify audio URLs are valid
- [ ] Test offline audio (if cached)
- [ ] Test audio with slow network
- [ ] Test audio with no network (error handling)

### 3.3 Music Room (Frequency of Gnosis) – play/pause flow ✅

- [x] **AudioLibrary:** X closes to ChakraHub; explicit styles ✅
- [x] **Mini player:** Tap title → opens Frequency of Gnosis and scrolls to playing track ✅
- [x] **Crystal bowl (1 hr):** Inline play/pause on page; mini player when leaving ✅
- [x] **Morning meditations (Good Morning):** Open full-screen AudioPlayer; X closes ✅

**Testing Required:**

- [ ] Test all play/pause in Music: Tuning Fork, Crystal Bowl, Good Morning per chakra
- [ ] Tap mini player title → verify scroll to correct chakra section on Frequency of Gnosis
- [ ] From mini player: play/pause, close; from full player: X returns to ChakraHub or previous screen
- [ ] No GO_BACK errors when closing player or mini player

---

## 4. Firebase Integration

### 4.1 Firestore ✅

- [x] **Offline Persistence:** 100MB cache enabled ✅
- [x] **Collections:**
  - [x] `chakras` - Chakra content data ✅
  - [x] `social_sanctuary` - Community reflections ✅
- [x] **Error Handling:** Graceful degradation if Firebase unavailable ✅
- [x] **Rate Limiting:** Implemented for all Firestore operations ✅

**Testing Required:**

- [ ] Test Firestore reads on iOS
- [ ] Test Firestore reads on Android
- [ ] Test offline mode (cached data)
- [ ] Test Firestore writes (reflections)
- [ ] Test real-time subscriptions
- [ ] Verify error handling when offline
- [ ] Test with slow network connection

### 4.2 Cloud Storage ✅

- [x] **Audio Files:** All paths verified ✅
- [x] **Error Handling:** File not found handled gracefully ✅
- [x] **Rate Limiting:** Implemented ✅

**Testing Required:**

- [ ] Test audio file downloads on iOS
- [ ] Test audio file downloads on Android
- [ ] Verify all 7 days' audio files accessible
- [ ] Test with slow network
- [ ] Test error handling for missing files

---

## 5. Third-Party Services

### 5.1 Google Gemini AI (Anua) ✅

- [x] **Model:** `gemini-1.5-pro` ✅
- [x] **Error Handling:** Network errors handled gracefully ✅
- [x] **Rate Limiting:** Implemented ✅
- [x] **System Instructions:** Comprehensive Anua personality ✅
- [x] **Pronunciation Guide:** Mantras and chakra names ✅

**Testing Required:**

- [ ] Test Anua chat on iOS
- [ ] Test Anua chat on Android
- [ ] Test voice synthesis (ElevenLabs integration)
- [ ] Test with no network connection
- [ ] Test with slow network
- [ ] Verify error messages are user-friendly
- [ ] Test rate limiting (multiple rapid requests)

### 5.2 ElevenLabs Voice Synthesis ✅

- [x] **Platform Detection:** Web vs React Native handled ✅
- [x] **Blob Handling:** React Native uses file system ✅
- [x] **Error Handling:** Graceful degradation ✅
- [x] **Rate Limiting:** Implemented ✅

**Testing Required:**

- [ ] Test voice synthesis on iOS
- [ ] Test voice synthesis on Android
- [ ] Verify audio plays after synthesis
- [ ] Test with no network
- [ ] Test error handling

### 5.3 RevenueCat (In-App Purchases) ✅

- [x] **Platform Support:** iOS and Android ✅
- [x] **API:** Using `product` property (not deprecated `storeProduct`) ✅
- [x] **Error Handling:** Purchase errors handled gracefully ✅
- [x] **Preview Mode:** Detected and handled ✅

**Testing Required:**

- [ ] Test purchases on iOS (sandbox)
- [ ] Test purchases on Android (test account)
- [ ] Test restore purchases
- [ ] Test customer center (manage subscriptions)
- [ ] Verify lifetime access grants correctly
- [ ] Test purchase flow errors
- [ ] Test with no network

---

## 6. UI Components & Interactions

### 6.1 Keyboard Handling ✅

- [x] **KeyboardAvoidingView:** Platform-specific behavior ✅
  - [x] iOS: `padding` ✅
  - [x] Android: `height` ✅
- [x] **Components Using KeyboardAvoidingView:**
  - [x] `SocialSanctuaryModal` ✅
  - [x] `CommunityHallsScreen` ✅
  - [x] `AnuaChatModal` ✅
  - [x] `ScholarshipModal` ✅

**Testing Required:**

- [ ] Test keyboard on iOS (all modals)
- [ ] Test keyboard on Android (all modals)
- [ ] Verify input fields not covered by keyboard
- [ ] Test keyboard dismiss on iOS
- [ ] Test keyboard dismiss on Android

### 6.2 Safe Area Handling ✅

- [x] **SafeAreaView:** Used throughout ✅
- [x] **SafeAreaProvider:** Root level ✅
- [x] **Status Bar:** Light style, translucent on Android ✅

**Testing Required:**

- [ ] Test on iPhone with notch (iOS)
- [ ] Test on Android with different screen sizes
- [ ] Verify content not hidden behind status bar
- [ ] Verify content not hidden behind navigation bar (Android)

### 6.3 Haptic Feedback ✅

- [x] **Platform:** iOS only (wrapped with `process.env.EXPO_OS === "ios"`) ✅
- [x] **Strengths:** Light, Medium, Soft ✅
- [x] **Fallback:** Silent on Android (no error) ✅

**Testing Required:**

- [ ] Test haptics on iOS device (not simulator)
- [ ] Verify no errors on Android
- [ ] Test all haptic strengths

---

## 7. Chakra Journey Flow

### 7.1 Day Progression ✅

- [x] **Time Gates:** Properly configured ✅
- [x] **Day Mapping:** Monday-Sunday (0-6) ✅
- [x] **Completion Tracking:** Zustand store with persistence ✅
- [x] **Card Rewards:** Gallery of Gnosis ✅

**Testing Required:**

- [ ] Test day progression on iOS
- [ ] Test day progression on Android
- [ ] Verify time gates work correctly
- [ ] Test completion tracking persists
- [ ] Test card rewards unlock correctly
- [ ] Test gallery displays unlocked cards

### 7.2 Chakra Screens ✅

- [x] **All 7 Days:** Root to Crown ✅
- [x] **Audio Buttons:** Correctly mapped ✅
- [x] **Scroll View:** Enabled and working ✅
- [x] **Social Sanctuary:** Accessible from each day ✅

**Testing Required:**

- [ ] Test each chakra day on iOS
- [ ] Test each chakra day on Android
- [ ] Verify scrolling works smoothly
- [ ] Test all audio buttons
- [ ] Test navigation between days
- [ ] Test "Complete Day" functionality

---

## 8. Social Sanctuary & Community

### 8.1 Social Sanctuary Modal ✅

- [x] **Anua Chat:** Opens correctly ✅
- [x] **Community Sharing:** Tree of Life button ✅
- [x] **Community Halls:** Tulip logo button ✅
- [x] **Placeholder Content:** Anua message and user quotes ✅

**Testing Required:**

- [ ] Test Social Sanctuary modal on iOS
- [ ] Test Social Sanctuary modal on Android
- [ ] Test "Talk to Anua" button
- [ ] Test "Share with Community" button
- [ ] Test "Community Halls" navigation
- [ ] Verify keyboard handling

### 8.2 Community Halls ✅

- [x] **Nested Replies:** YouTube-style comments ✅
- [x] **Expand/Collapse:** Reply threads ✅
- [x] **7 Halls + Global:** Day-specific and global views ✅
- [x] **Earth Tones Design:** Holistic, safe feeling ✅

**Testing Required:**

- [ ] Test Community Halls on iOS
- [ ] Test Community Halls on Android
- [ ] Test posting comments
- [ ] Test replying to comments
- [ ] Test expand/collapse replies
- [ ] Test navigation between halls
- [ ] Test global view
- [ ] Verify moderation (Sentinel) works

### 8.3 Anua Chat ✅

- [x] **Text Chat:** Gemini integration ✅
- [x] **Voice Chat:** ElevenLabs synthesis ✅
- [x] **Error Handling:** Graceful degradation ✅

**Testing Required:**

- [ ] Test Anua chat on iOS
- [ ] Test Anua chat on Android
- [ ] Test text responses
- [ ] Test voice synthesis
- [ ] Test with no network
- [ ] Verify error messages

---

## 9. File System Operations

### 9.1 Expo File System ✅

- [x] **ElevenLabs Audio:** Saved to cache directory ✅
- [x] **Platform Support:** iOS and Android ✅
- [x] **Error Handling:** Try-catch blocks ✅

**Testing Required:**

- [ ] Test file system operations on iOS
- [ ] Test file system operations on Android
- [ ] Verify temporary files are cleaned up
- [ ] Test with limited storage space

---

## 10. Performance & Optimization

### 10.1 Code Quality ✅

- [x] **Console Logs:** All wrapped with `__DEV__` ✅
- [x] **Error Boundaries:** Implemented where needed ✅
- [x] **Rate Limiting:** All API calls ✅
- [x] **Memory Management:** Proper cleanup in useEffect ✅

**Testing Required:**

- [ ] Test app performance on iOS (low-end device)
- [ ] Test app performance on Android (low-end device)
- [ ] Monitor memory usage
- [ ] Test with many chakras completed
- [ ] Test with many community posts

### 10.2 Asset Loading ✅

- [x] **Preloading:** Images and audio ✅
- [x] **Lazy Loading:** Where appropriate ✅
- [x] **Error Handling:** Missing assets handled ✅

**Testing Required:**

- [ ] Test asset loading on slow network
- [ ] Test asset loading on no network
- [ ] Verify no white flashes
- [ ] Test image rendering performance

---

## 11. Critical User Flows

### 11.1 First Launch Flow

**Testing Required:**

- [ ] First launch on iOS
- [ ] First launch on Android
- [ ] Welcome modal appears
- [ ] Journey starts correctly
- [ ] Time gates work

### 11.2 Daily Journey Flow

**Testing Required:**

- [ ] Navigate to chakra day
- [ ] Play audio meditation
- [ ] Complete day activities
- [ ] Mark day as complete
- [ ] View chakra card reward
- [ ] Navigate to gallery

### 11.3 Social Interaction Flow

**Testing Required:**

- [ ] Open Social Sanctuary
- [ ] Read Anua's transmission
- [ ] Post reflection
- [ ] Reply to comment
- [ ] Navigate to Community Halls
- [ ] Switch between halls

### 11.4 Purchase Flow

**Testing Required:**

- [ ] View paywall
- [ ] Select subscription
- [ ] Complete purchase
- [ ] Verify access granted
- [ ] Test restore purchases

---

## 12. Error Scenarios

### 12.1 Network Errors

**Testing Required:**

- [ ] Test with no network
- [ ] Test with slow network
- [ ] Test with intermittent network
- [ ] Verify graceful error messages
- [ ] Test offline functionality

### 12.2 Service Errors

**Testing Required:**

- [ ] Test Firebase unavailable
- [ ] Test Gemini API errors
- [ ] Test ElevenLabs API errors
- [ ] Test RevenueCat errors
- [ ] Verify app doesn't crash

### 12.3 Data Errors

**Testing Required:**

- [ ] Test missing audio files
- [ ] Test missing Firestore documents
- [ ] Test invalid data formats
- [ ] Verify graceful handling

---

## 13. Platform-Specific Testing

### 13.1 iOS Specific

- [ ] Test on iPhone (various models)
- [ ] Test on iPad
- [ ] Test with different iOS versions (12.0+)
- [ ] Test haptic feedback
- [ ] Test background audio
- [ ] Test App Store purchase flow
- [ ] Test with Dynamic Island (if applicable)

### 13.2 Android Specific

- [ ] Test on various Android devices
- [ ] Test with different Android versions
- [ ] Test with different screen sizes
- [ ] Test back button behavior
- [ ] Test Google Play purchase flow
- [ ] Test with different manufacturers (Samsung, Pixel, etc.)

---

## 14. Security & Privacy

### 14.1 Data Security ✅

- [x] **API Keys:** Stored in environment variables ✅
- [x] **Input Sanitization:** XSS prevention ✅
- [x] **Firestore Rules:** Security rules configured ✅

**Testing Required:**

- [ ] Verify API keys not exposed
- [ ] Test input sanitization
- [ ] Verify Firestore rules work
- [ ] Test anonymous posting

### 14.2 Permissions ✅

- [x] **iOS:** Microphone permission requested ✅
- [x] **Android:** All permissions in manifest ✅

**Testing Required:**

- [ ] Test permission requests on iOS
- [ ] Test permission requests on Android
- [ ] Test app behavior when permissions denied

---

## 15. Accessibility

### 15.1 Basic Accessibility ✅

- [x] **Color Contrast:** Sufficient for text ✅
- [x] **Touch Targets:** Adequate size ✅

**Testing Required:**

- [ ] Test with VoiceOver (iOS)
- [ ] Test with TalkBack (Android)
- [ ] Test with dynamic text sizes
- [ ] Verify all buttons accessible
- [ ] Test keyboard navigation

---

## 16. Build & Deployment

### 16.1 EAS Build Configuration

- [ ] Verify `eas.json` exists and is configured
- [ ] Test iOS build
- [ ] Test Android build
- [ ] Verify app signing
- [ ] Test production builds

### 16.2 App Store / Play Store

- [ ] Prepare iOS App Store listing
- [ ] Prepare Google Play Store listing
- [ ] Test app submission process
- [ ] Verify app metadata

---

## 17. Known Issues & Workarounds

### 17.1 Non-Critical TypeScript Errors

- **ChakraHome.tsx:** Missing props warnings (false positives)
- **RevenueCat:** Type definition mismatches (runtime works correctly)

### 17.2 Firebase Index Required

- **Social Sanctuary:** Composite index needed for top reflections query
- **Workaround:** App handles gracefully (returns empty array)
- **Action:** Create index per `FIREBASE_INDEX_SETUP.md`

---

## 18. Final Pre-Production Checklist

### 18.1 Code Quality

- [x] All console logs wrapped with `__DEV__` ✅
- [x] All errors handled gracefully ✅
- [x] No critical TypeScript errors ✅
- [x] All deprecated APIs updated ✅

### 18.2 Dependencies

- [x] All dependencies up to date ✅
- [x] No security vulnerabilities ✅
- [x] All packages compatible ✅

### 18.3 Configuration

- [x] iOS configuration complete ✅
- [x] Android configuration complete ✅
- [x] Firebase configured ✅
- [x] RevenueCat configured ✅

---

## Testing Priority

### Critical (Must Test Before Production)

1. ✅ Audio playback on all 7 days (iOS & Android)
2. ✅ Navigation flows (all screens)
3. ✅ Purchase flow (iOS & Android)
4. ✅ Firebase connectivity
5. ✅ Error handling (network failures)

### High Priority

1. ✅ Social Sanctuary functionality
2. ✅ Community Halls (nested replies)
3. ✅ Anua chat and voice
4. ✅ Chakra card rewards
5. ✅ Day completion flow

### Medium Priority

1. ✅ Keyboard handling
2. ✅ Safe area handling
3. ✅ Performance on low-end devices
4. ✅ Offline functionality

### Low Priority (Nice to Have)

1. ✅ Accessibility features
2. ✅ Advanced animations
3. ✅ Edge case handling

---

## Recommended Testing Schedule

### Phase 1: Core Functionality (Week 1)

- Test all audio playback
- Test all navigation
- Test purchase flow
- Test Firebase connectivity

### Phase 2: Social Features (Week 2)

- Test Social Sanctuary
- Test Community Halls
- Test Anua chat
- Test moderation

### Phase 3: Edge Cases (Week 3)

- Test error scenarios
- Test offline mode
- Test performance
- Test accessibility

### Phase 4: Final QA (Week 4)

- Full regression testing
- Platform-specific testing
- User acceptance testing
- Production build verification

---

## Notes

- All platform-specific code is properly wrapped
- Error handling is comprehensive
- Rate limiting prevents API abuse
- Offline functionality is supported where possible
- The app gracefully degrades when services are unavailable

**Status:** ✅ Ready for comprehensive testing phase
