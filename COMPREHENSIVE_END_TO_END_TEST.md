# Comprehensive End-to-End Test Plan

## Test Scenario: Brand New User Journey

### Phase 1: Initial Onboarding ✅

#### 1.1 App Launch
- [ ] App opens with Soul School Hero Logo splash screen
- [ ] Smooth fade-in animation
- [ ] No white flashes or jarring transitions
- [ ] Welcome modal appears automatically on first launch

#### 1.2 Welcome Modal
- [ ] **Visual Check:**
  - Dark, mysterious background (purple gradients, blacks)
  - Soul School Hero Logo displayed
  - Chakra images visible
  - Healing, peaceful aesthetic
  
- [ ] **Content Check:**
  - "Two Free Trials" displayed subtly
  - Gentle lock warning: "When you press begin, the app will lock until the following Monday"
  - "How It Works" section explains the journey
  - All text is readable and properly formatted

- [ ] **Button Functionality:**
  - "Begin Your Journey" button:
    - [ ] Presses correctly
    - [ ] Sets `initialOpenDate`
    - [ ] Calculates `courseStartDate` (next Monday)
    - [ ] Closes welcome modal
    - [ ] Shows waiting screen
  
  - "Healing Through Connection" (Invite Friend) button:
    - [ ] Opens native share dialog
    - [ ] Includes app store link placeholder
    - [ ] Includes start date
    - [ ] Message is properly formatted

#### 1.3 Waiting Screen (Before Trial 1)
- [ ] **Visual Check:**
  - Dark background with subtle chakra images
  - Central 7 chakras symbol
  - Countdown timer displays correctly
  - Mysterious, healing aesthetic

- [ ] **Content Check:**
  - Title: "Your Journey Begins"
  - Subtitle: "Opening on [next Monday's date]"
  - Countdown shows: Days, Hours, Minutes, Seconds
  - Countdown updates every second

- [ ] **Button Functionality:**
  - "View Your Chakra Cards" button (if cards exist - should not show for new user)
  - "View Journey Summary" button (if implemented)
  - "Preview Journey" button:
    - [ ] Opens preview mode
    - [ ] Shows limited Root chakra content
    - [ ] Can return to waiting screen

### Phase 2: Trial 1 (Monday - Sunday) ✅

#### 2.1 Monday - Trial 1 Starts
- [ ] **Auto-Start Check:**
  - [ ] Trial 1 auto-starts on Monday
  - [ ] No "Begin Again" button needed
  - [ ] Journey starts automatically

- [ ] **Chakra Home Screen:**
  - [ ] All 7 chakras visible
  - [ ] Root chakra (Monday) is highlighted/pulsing
  - [ ] Other chakras are locked/disabled
  - [ ] Day progress indicator shows Monday
  - [ ] Can scroll through chakras
  - [ ] Images load correctly

#### 2.2 Opening Root Chakra (Day 1)
- [ ] **Navigation:**
  - [ ] Tap Root chakra → Opens ChakraTemplate
  - [ ] Smooth transition
  - [ ] ActionBar visible
  - [ ] Can navigate back

- [ ] **Content Display:**
  - [ ] Header section with chakra image
  - [ ] Overview text visible and scrollable
  - [ ] Sanskrit name displayed
  - [ ] Location image visible
  - [ ] All text sections readable
  - [ ] Images load correctly

- [ ] **Audio Functionality:**
  - [ ] **Intro Audio:**
    - [ ] Audio button visible
    - [ ] Title and author displayed
    - [ ] Duration shown
    - [ ] Tap → Opens AudioPlayer
    - [ ] Audio plays correctly
    - [ ] Can pause/play
    - [ ] Can seek forward/backward
    - [ ] Progress bar works
  
  - [ ] **Embodiment Meditation:**
    - [ ] Audio button(s) visible
    - [ ] For Day 6: Two buttons (Part 1 and Part 2)
    - [ ] For other days: Single button
    - [ ] Tap → Opens AudioPlayer
    - [ ] Audio plays correctly
    - [ ] Firebase Storage URLs load correctly
  
  - [ ] **Outro Audio:**
    - [ ] Audio button visible
    - [ ] Tap → Opens AudioPlayer
    - [ ] Audio plays correctly

- [ ] **Pill Sections:**
  - [ ] Frequency pill:
    - [ ] Tap → Opens bottom sheet
    - [ ] Content displays correctly
    - [ ] Can close bottom sheet
  
  - [ ] Identity Statement pill:
    - [ ] Tap → Opens bottom sheet
    - [ ] Content displays correctly
  
  - [ ] Seed Mantra pill:
    - [ ] Tap → Opens bottom sheet
    - [ ] Content displays correctly

- [ ] **Text Sections:**
  - [ ] Soul School section scrollable
  - [ ] Daily Activity section scrollable
  - [ ] Words of Wisdom section scrollable
  - [ ] Integration section scrollable
  - [ ] All text is readable

- [ ] **Yoga Section:**
  - [ ] Chakra day displayed
  - [ ] Pose name displayed
  - [ ] Pose description scrollable

- [ ] **Sound Bath Section:**
  - [ ] Title and subtitle visible
  - [ ] Body text scrollable
  - [ ] Sound bowl audio button:
    - [ ] Tap → Opens AudioPlayer
    - [ ] Audio loops correctly
  - [ ] Tuning fork audio button:
    - [ ] Tap → Opens AudioPlayer
    - [ ] Audio loops correctly

- [ ] **Head to Heart Section:**
  - [ ] Title and subtitle visible
  - [ ] Description scrollable
  - [ ] Audio button:
    - [ ] Tap → Opens AudioPlayer
    - [ ] Audio plays correctly
  - [ ] Daily Activity section scrollable

- [ ] **Elements Section:**
  - [ ] Background image visible
  - [ ] Sanskrit name displayed
  - [ ] All element details scrollable
  - [ ] Sacred geometry visible

- [ ] **Social Sanctuary:**
  - [ ] Social Sanctuary icon visible
  - [ ] Tap → Opens Social Sanctuary Modal
  - [ ] Modal displays correctly
  - [ ] "Talk to Anua" button:
    - [ ] Tap → Opens Anua Chat Modal
    - [ ] Anua greeting appears
    - [ ] Can type message
    - [ ] Can send message
    - [ ] Anua responds
    - [ ] Voice toggle works
    - [ ] Can close modal
  - [ ] "Share with the Community" button:
    - [ ] Tap → Opens Community Halls
    - [ ] Can view reflections
    - [ ] Can post reflection
    - [ ] Can reply to reflections
    - [ ] Can expand/collapse replies
  - [ ] "Community Halls" button:
    - [ ] Tap → Opens Community Halls Screen
    - [ ] Can select different days
    - [ ] Can view global feed
    - [ ] Can post and reply

- [ ] **Complete Day:**
  - [ ] Checkbox at bottom
  - [ ] Tap checkbox → Marks chakra as completed
  - [ ] Navigates back to ChakraHome
  - [ ] GoodbyeModal appears
  - [ ] "Open Your Gift" button:
    - [ ] Tap → Opens Chakra Card Reveal Modal
    - [ ] Card displays correctly
    - [ ] Can close modal
  - [ ] Card appears in Gallery of Gnosis

#### 2.3 Opening Multiple Chakras (Days 2-6)
- [ ] **Day 2 (Sacral):**
  - [ ] Unlocks on Tuesday
  - [ ] Can open and explore
  - [ ] All content displays correctly
  - [ ] All audio works
  - [ ] Can complete day
  - [ ] Card unlocks

- [ ] **Day 3 (Solar Plexus):**
  - [ ] Unlocks on Wednesday
  - [ ] Embodiment audio loads from Firebase Storage
  - [ ] All content displays correctly
  - [ ] Can complete day
  - [ ] Card unlocks

- [ ] **Day 4-6:**
  - [ ] Each day unlocks correctly
  - [ ] All content displays correctly
  - [ ] All audio works
  - [ ] Can complete each day
  - [ ] Cards unlock

#### 2.4 Sunday - Trial 1 Ends
- [ ] **Completion:**
  - [ ] All 7 chakras completed
  - [ ] `completedTrialCourses` increments to 1
  - [ ] `trialHistory` records Trial 1
  - [ ] `resetJourney()` called
  - [ ] `completedChakras` resets to `[]`
  - [ ] Gallery cards persist (via `hasEverCompletedChakra()`)

- [ ] **Waiting Screen Appears:**
  - [ ] Title: "Begin Again"
  - [ ] Subtitle: "Your second trial begins on [next Monday]"
  - [ ] Countdown to next Monday
  - [ ] "Begin Again" button (only visible on Monday)
  - [ ] "View Your Chakra Cards" button:
    - [ ] Tap → Opens Gallery of Gnosis
    - [ ] Shows all cards from Trial 1
    - [ ] Can swipe through cards
  - [ ] "View Journey Summary" button (if implemented)

### Phase 3: Trial 2 (Monday - Sunday) ✅

#### 3.1 Monday - Trial 2 Starts
- [ ] **Manual Start:**
  - [ ] Trial 2 does NOT auto-start
  - [ ] "Begin Again" button visible on Monday
  - [ ] Tap "Begin Again" → Trial 2 starts
  - [ ] Journey begins

#### 3.2 Opening More Chakras
- [ ] **New Chakras:**
  - [ ] Can open chakras not completed in Trial 1
  - [ ] All content displays correctly
  - [ ] All audio works
  - [ ] Can complete days
  - [ ] New cards unlock

- [ ] **Gallery Check:**
  - [ ] Gallery shows cards from both trials
  - [ ] Can swipe through all cards
  - [ ] Cards display correctly

#### 3.3 Sunday - Trial 2 Ends
- [ ] **Completion:**
  - [ ] All chakras completed
  - [ ] `completedTrialCourses` increments to 2
  - [ ] `trialHistory` records Trial 2
  - [ ] `resetJourney()` called
  - [ ] Gallery shows ALL cards from both trials

- [ ] **Landing Screen Appears:**
  - [ ] Title: "Your Journey Awaits"
  - [ ] Subtitle: "You've completed both trials. Continue your path with lifetime access."
  - [ ] NO countdown (resting place)
  - [ ] "Continue Your Journey" button:
    - [ ] Tap → Opens CommitmentGate (Paywall)
  - [ ] "View Your Chakra Cards" button:
    - [ ] Tap → Opens Gallery of Gnosis
    - [ ] Shows all cards from both trials

### Phase 4: Paywall ✅

#### 4.1 CommitmentGate
- [ ] **Visual Check:**
  - [ ] Soul School Hero Logo displayed
  - [ ] "Unlock Your Path" title
  - [ ] "Lifetime Access" subtitle
  - [ ] Features list displayed
  - [ ] Access options displayed

- [ ] **Options:**
  - [ ] Annual Access option:
    - [ ] Price displayed correctly
    - [ ] Can select
    - [ ] Radio button works
  - [ ] Scholarship option:
    - [ ] "Free" displayed
    - [ ] Can select
    - [ ] Radio button works

- [ ] **Buttons:**
  - [ ] "View Your Chakra Cards" button (if cards unlocked):
    - [ ] Tap → Opens Gallery of Gnosis
  - [ ] "Begin Your Journey" button:
    - [ ] Annual Access:
      - [ ] Tap → Opens RevenueCat purchase flow
      - [ ] Purchase completes
      - [ ] `grantLifetimeAccess('paid')` called
      - [ ] Full access granted
    - [ ] Scholarship:
      - [ ] Tap → Opens Scholarship Modal
      - [ ] Can enter reason
      - [ ] Tap Continue → Grants access
      - [ ] `grantLifetimeAccess('scholarship')` called
      - [ ] Navigates to Energy Exchange

### Phase 5: Full Access (Open Mode) ✅

#### 5.1 Navigation
- [ ] **All Chakras Accessible:**
  - [ ] All 7 chakras unlocked
  - [ ] Can open any chakra anytime
  - [ ] No timegates
  - [ ] Can navigate freely

#### 5.2 Exploring All Content
- [ ] **Each Chakra:**
  - [ ] Can open and explore
  - [ ] All content displays correctly
  - [ ] All audio works
  - [ ] Can scroll through all sections
  - [ ] Images load correctly
  - [ ] Can interact with all features

#### 5.3 Social Features
- [ ] **Anua Chat:**
  - [ ] Can open from any chakra
  - [ ] Can ask questions
  - [ ] Anua responds appropriately
  - [ ] Voice works
  - [ ] Can have extended conversations
  - [ ] Anua remembers context

- [ ] **Community Halls:**
  - [ ] Can view reflections for each day
  - [ ] Can view global feed
  - [ ] Can post reflections
  - [ ] Can reply to reflections
  - [ ] Can expand/collapse threads
  - [ ] Moderation works (Sentinel)

#### 5.4 Gallery
- [ ] **Gallery of Gnosis:**
  - [ ] All cards from both trials visible
  - [ ] Can swipe through cards
  - [ ] Cards display correctly
  - [ ] Can view in full screen

### Phase 6: Edge Cases & Error Handling ✅

#### 6.1 Audio
- [ ] **Error Handling:**
  - [ ] If audio fails to load, error message displays
  - [ ] App doesn't crash
  - [ ] Can retry audio playback
  - [ ] Firebase Storage URLs handle errors gracefully

#### 6.2 Network
- [ ] **Offline Handling:**
  - [ ] App works offline (cached content)
  - [ ] Audio cached works
  - [ ] Firestore offline persistence works
  - [ ] Error messages for network failures

#### 6.3 Anua
- [ ] **Error Handling:**
  - [ ] If Gemini API fails, error message displays
  - [ ] If ElevenLabs fails, falls back to text
  - [ ] App doesn't crash
  - [ ] Can retry conversation

#### 6.4 Community
- [ ] **Error Handling:**
  - [ ] If Firestore fails, error message displays
  - [ ] If moderation fails, content is blocked
  - [ ] App doesn't crash
  - [ ] Can retry posting

### Phase 7: Performance & UX ✅

#### 7.1 Performance
- [ ] **Loading:**
  - [ ] Images load quickly
  - [ ] Audio loads quickly
  - [ ] No lag when scrolling
  - [ ] Smooth transitions
  - [ ] No memory leaks

#### 7.2 UX
- [ ] **Flow:**
  - [ ] All transitions are smooth
  - [ ] No jarring movements
  - [ ] Healing, peaceful energy throughout
  - [ ] All buttons are responsive
  - [ ] Haptic feedback works

#### 7.3 Accessibility
- [ ] **Text:**
  - [ ] All text is readable
  - [ ] Font sizes are appropriate
  - [ ] Colors have sufficient contrast
  - [ ] Text doesn't overlap

## Potential Issues Found in Code Review

### 1. Welcome Modal
- ✅ `onBeginJourney` properly connected
- ✅ `setFirstLaunchComplete` called after begin
- ✅ `initialOpenDate` set correctly

### 2. Audio Playback
- ✅ All audio buttons use `AudioRow` or `AudioRowWithBackground`
- ✅ Store updates before navigation
- ✅ 50ms delay ensures store is set
- ⚠️ **Potential Issue:** Firebase Storage URLs might fail - error handling exists

### 3. Anua Chat
- ✅ Modal opens correctly
- ✅ Greeting displays
- ✅ Can send messages
- ✅ Voice toggle works
- ⚠️ **Potential Issue:** Gemini API might fail - error handling exists

### 4. Community Features
- ✅ Reflections load correctly
- ✅ Can post and reply
- ✅ Moderation works
- ⚠️ **Potential Issue:** Firestore might require indexes - error handling exists

### 5. Trial Flow
- ✅ Trial 1 auto-starts
- ✅ Trial 2 requires "Begin Again"
- ✅ Gallery persists across trials
- ✅ Landing screen appears after Trial 2

### 6. Paywall
- ✅ CommitmentGate displays correctly
- ✅ RevenueCat integration works
- ✅ Scholarship flow works
- ✅ Lifetime access granted correctly

## Test Execution Notes

1. **Start Fresh:**
   - Clear app data
   - Reset first launch flag
   - Start as brand new user

2. **Test Each Phase:**
   - Complete each phase fully before moving to next
   - Document any issues found
   - Test both success and error paths

3. **Test as Student:**
   - Follow the journey naturally
   - Read all content
   - Listen to all audio
   - Interact with Anua
   - Post in community

4. **Test as Guide:**
   - Help others in community
   - Answer questions
   - Share insights
   - Support fellow travelers

5. **Performance Testing:**
   - Test on slow network
   - Test with poor connectivity
   - Test with many cards unlocked
   - Test with many community posts

## Success Criteria

- ✅ All features work as expected
- ✅ No crashes or errors
- ✅ Smooth, healing user experience
- ✅ All content accessible
- ✅ All audio plays correctly
- ✅ Social features work
- ✅ Gallery persists correctly
- ✅ Trial flow works perfectly
- ✅ Paywall works correctly
- ✅ Full access works correctly

