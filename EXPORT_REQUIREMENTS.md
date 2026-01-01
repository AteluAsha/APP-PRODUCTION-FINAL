# App Export Requirements & Missing Assets

## 🔴 Critical - Required Before Export

### 1. **App Store Links (Placeholders Need Replacement)**
   - **Location:** `components/chakras/VideoRecorderModal.tsx` (lines 117-158)
   - **Location:** `components/chakras/WelcomeModal.tsx` (lines 76-88)
   - **Current:** Using placeholder links
   - **Needed:** 
     - iOS App Store link (when app is published)
     - Android Play Store link (when app is published)
   - **Action:** Replace placeholder URLs with actual app store links once published

### 2. **Environment Variables (.env file)**
   All required environment variables must be set in `.env` file:

   **Firebase:**
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID` (optional)

   **RevenueCat:**
   - `REVENUECAT_API_KEY`

   **Gemini AI (Anua):**
   - `GEMINI_API_KEY` (primary)
   - `GEMINI_API_KEY_2` (backup - already added)
   - `GEMINI_API_KEY_3` (backup - already added)

   **ElevenLabs (Anua Voice):**
   - `ELEVENLABS_API_KEY`
   - `ANUA_VOICE_ID`

   **Sentry (Optional but Recommended):**
   - `SENTRY_DSN`

### 3. **Image Assets - Verify All Exist**
   Based on code references, verify these assets exist in `assets/images/`:
   
   ✅ **Core Chakra Images (Required):**
   - `root.png`
   - `sacral.png`
   - `solar.png`
   - `heart.png`
   - `throat.png`
   - `thirdeye.png`
   - `crown.png`
   - `muladhara.png`
   - `svadhisthana.png`
   - `manipura.png`
   - `anahata.png`
   - `vishuddha.png`
   - `ajna.png`
   - `sahasrara.png`

   ✅ **Location Images (Required):**
   - `rootlocation.png`
   - `sacrallocation.png`
   - `solarlocation.png`
   - `heartlocation.png`
   - `throatlocation.png`
   - `thirdeyelocation.png`
   - `crownlocation.png`

   ✅ **Header Images (Required):**
   - `1header.png`
   - `2header.png`
   - `3header.png`
   - `4header.png`
   - `5header.jpeg`
   - `6header.png`
   - `7header.png`

   ✅ **Elements Backgrounds (Required):**
   - `elementsroot.png`
   - `elementssacral.png`
   - `elementssolar.png`
   - `elementsheart.png`
   - `elementsthroat.png`
   - `elementsthirdeye.png`
   - `elementscrown.png`

   ✅ **Logo & Branding (Required):**
   - `SoulSchool_HERO_Logo.png` (splash screen)
   - `7chakras.png` (app icon)
   - `Anua_Hero_Icon_Image.png` (Anua button)

   ✅ **Social Sanctuary Assets:**
   - ✅ `Hero_tulip_LOGO_MASTER.png` (Community Halls button) - **FOUND & COPIED**
   - ✅ Tree of Life icon (generated in `TreeOfLifeIcon.tsx` - no image file needed)

   ✅ **Other Assets:**
   - `yoga-logo.png`
   - `rootyogapose.png`
   - `part2bg.png`
   - `soundhealingbg.png`
   - `chakraman.png`
   - `colorbar.png`
   - `meditationlogotemp.png`
   - `ibelong.png`
   - `heartoutline.png`

### 4. **Audio Assets - Verify Firebase Storage**
   All master meditation audio files must exist in Firebase Storage:
   - Path: `gs://soul-school-367ee.firebasestorage.app/Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days`
   
   **Required Files:**
   - `Day1_RootChakraEmbodiment_SoulSchool.aac`
   - `Day2_SacralChakraEmbodiment_SoulSchool.aac`
   - `Day3_SolarChakraEmbodiment_SoulSchool.aac`
   - `Day4_HeartChakraEmbodiment_SoulSchool.aac`
   - `Day5_ThroatChakraEmbodiment_SoulSchool.aac`
   - `Day6_PARTONE_AjnaEmbodiment_SoulSchool.aac`
   - `Day6_PARTTWO_AjnaEmbodiment_SoulSchool.aac`
   - `Day7_CrownChakraEmbodiment_SoulSchool.aac` (verify this exists)

### 5. **Firebase Configuration**
   - ✅ Firestore security rules configured
   - ✅ Firebase Storage rules configured
   - ⚠️ Verify Firestore indexes are created (if needed for production queries)
   - ⚠️ Verify `social_sanctuary` collection permissions
   - ⚠️ Verify `anua_community_cache` collection permissions

### 6. **RevenueCat Configuration**
   - ✅ Product IDs configured in `src/services/revenuecat.ts`
   - ⚠️ Products must be created in RevenueCat dashboard
   - ⚠️ Products must be configured in App Store Connect (iOS)
   - ⚠️ Products must be configured in Google Play Console (Android)
   - ⚠️ RevenueCat API key must be valid

### 7. **App Store Configuration**
   - ⚠️ App Store Connect app created (iOS)
   - ⚠️ Google Play Console app created (Android)
   - ⚠️ App icons and screenshots prepared
   - ⚠️ App description and metadata ready
   - ✅ **Privacy Policy URL (REQUIRED):**
     - Primary: `https://soulschool.app/privacy`
     - Backup: `https://docs.google.com/document/d/1NuEsC5Gi5fPKqNvbiZAdpNwhhzJntiWv1j1s79i6aJM/edit?tab=t.0#heading=h.3ds7lxp17vzx`
   - ⚠️ Terms of service URL (recommended, but not required)

### 8. **EAS Build Configuration**
   - ✅ EAS project ID configured: `a698bc4b-394f-4487-b317-80884f2f0cee`
   - ⚠️ Create `eas.json` if not exists (for build profiles)
   - ⚠️ Configure build profiles for production

### 9. **Bundle Identifiers**
   - iOS: `com.sevenchakras.SevenChakras`
   - Android: `com.sevenchakras.SevenChakras`
   - ⚠️ Verify these are available and registered

### 10. **Permissions**
   - ✅ Camera permission configured (for video recording)
   - ✅ Microphone permission configured (for video recording)
   - ✅ Audio background mode configured

## 🟡 Important - Should Complete Before Export

### 1. **Sentry Error Tracking**
   - Currently optional but highly recommended
   - Add `SENTRY_DSN` to `.env` when ready
   - Already integrated in code

### 2. **Firebase Wisdom Manuals**
   - Verify all PDFs exist in Firebase Storage:
     - `gs://soul-school-367ee.firebasestorage.app/Wisdom_manuals_ForAI/`
     - `7ChakrasAPP_DailyMeditations_AudioTranscripts.pdf`
     - `7Chakras_7Days_5_5x8_5inch_KDP_Sep_27_25__MASTER_777.pdf`
     - `TheEgoAndTheSelf_KDP_PaperMASTER_11_11_v7.pdf`
     - `Anua_Origins/I_am_Auna_MasterFoundation.pdf`

### 3. **Chakra Card Images**
   - Verify all 7 chakra card images exist in Firebase Storage or assets
   - Used in Gallery of Gnosis feature

### 4. **Testing**
   - ✅ iOS simulator testing completed
   - ⚠️ Android testing recommended
   - ⚠️ Production build testing (TestFlight/Internal Testing)
   - ⚠️ Payment flow testing with real products
   - ⚠️ Offline mode testing

## 🟢 Nice to Have - Can Add Later

### 1. **App Store Screenshots**
   - Prepare screenshots for different device sizes
   - iOS: iPhone 6.7", 6.5", 5.5" displays
   - Android: Phone, 7" tablet, 10" tablet

### 2. **App Preview Videos**
   - Optional but recommended for App Store

### 3. **Privacy Policy & Terms**
   - URLs for privacy policy and terms of service
   - Required for App Store submission

## 📋 Pre-Export Checklist

- [ ] All environment variables set in `.env`
- [ ] All image assets verified and present
- [ ] All audio files verified in Firebase Storage
- [ ] App store links replaced (or placeholders documented)
- [ ] RevenueCat products configured and tested
- [ ] Firebase security rules published
- [ ] Firestore indexes created (if needed)
- [ ] Bundle identifiers registered
- [ ] EAS build configuration complete
- [ ] iOS App Store Connect app created
- [ ] Android Play Console app created
- [x] Privacy policy URL ready: `https://soulschool.app/privacy`
- [ ] Sentry DSN configured (recommended)
- [ ] Production build tested on TestFlight/Internal Testing
- [ ] Payment flow tested with real products
- [ ] Offline functionality tested

## 🔍 Files to Review Before Export

1. `app.config.js` - Verify all configuration
2. `.env` - Ensure all variables are set
3. `package.json` - Verify dependencies
4. `src/services/revenuecat.ts` - Verify product IDs
5. `hooks/useEmbodimentAudio.ts` - Verify audio file paths
6. `components/chakras/VideoRecorderModal.tsx` - Replace app store links
7. `components/chakras/WelcomeModal.tsx` - Replace app store links

## 📝 Notes

- The app uses Firebase Storage for large audio files (not bundled)
- Community cache system will build over time (no initial data needed)
- Placeholder content for community halls is auto-populated
- All critical assets appear to be referenced correctly in code

